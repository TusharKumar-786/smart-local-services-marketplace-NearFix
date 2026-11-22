/**
 * Multi-factor Scoring Engine.
 * Evaluates candidates on a 100-point scale using weighted normal and emergency profiles.
 */

export const SCORING_WEIGHTS = {
  normal: {
    skill: 30,
    distance: 20,
    availability: 20,
    rating: 15,
    price: 10,
    urgency: 5,
  },
  emergency: {
    urgency: 35,
    distance: 30,
    availability: 20,
    rating: 10,
    skill: 5,
    price: 0,
  },
};

/**
 * Calculate multi-factor match score between 0 and 100.
 *
 * @param {Object} provider - Provider profile and metrics
 * @param {Object} criteria - Search query criteria { urgency, distanceKm, requestedSkill, budget, preferredTime }
 * @returns {number} Normalized score out of 100
 */
export function calculateMatchScore(provider, criteria) {
  const isEmergency = criteria.urgency === 'emergency';
  const weights = isEmergency ? SCORING_WEIGHTS.emergency : SCORING_WEIGHTS.normal;

  // 1. Skill Score (0 to 1)
  let skillScore = 0.5;
  if (criteria.requestedSkill && provider.skills) {
    const hasExact = provider.skills.some(
      (s) => s.toLowerCase().includes(criteria.requestedSkill.toLowerCase())
    );
    skillScore = hasExact ? 1.0 : 0.6;
  } else {
    skillScore = 0.85; // Generic category match
  }

  // 2. Distance Score (0 to 1): decay with distance. 1.0 at 0km, ~0.8 at 5km, ~0.5 at 15km, 0 beyond 30km
  const distKm = criteria.distanceKm || 0;
  const distanceScore = Math.max(0, Math.min(1, 1 - distKm / 30));

  // 3. Availability Score (0 to 1)
  let availabilityScore = 0.6;
  if (provider.availability) {
    if (provider.availability.isAvailableNow) {
      availabilityScore = 1.0;
    } else {
      availabilityScore = 0.7;
    }
  }

  // 4. Rating Score (0 to 1): Normalized from 3.0-5.0 scale
  const ratingAvg = provider.ratingAverage || 4.0;
  const ratingScore = Math.max(0, Math.min(1, (ratingAvg - 3.0) / 2.0));

  // 5. Price Competitiveness Score (0 to 1)
  let priceScore = 0.7;
  const visitCharge = provider.pricing?.visitCharge || 300;
  if (criteria.maxBudget && criteria.maxBudget > 0) {
    if (visitCharge <= criteria.maxBudget) {
      // Lower price relative to budget earns higher score
      priceScore = Math.min(1, 0.7 + (criteria.maxBudget - visitCharge) / (criteria.maxBudget * 2));
    } else {
      priceScore = Math.max(0, 1 - (visitCharge - criteria.maxBudget) / criteria.maxBudget);
    }
  }

  // 6. Urgency Score (0 to 1)
  const urgencyScore = isEmergency ? (provider.availability?.isAvailableNow ? 1.0 : 0.3) : 0.7;

  // Weighted sum
  const rawScore =
    skillScore * weights.skill +
    distanceScore * weights.distance +
    availabilityScore * weights.availability +
    ratingScore * weights.rating +
    priceScore * weights.price +
    urgencyScore * weights.urgency;

  // Cap between 50 and 99 for realistic consumer presentation
  return Math.min(99, Math.max(50, Math.round(rawScore)));
}
