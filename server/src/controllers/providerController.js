import { ProviderProfile } from '../models/ProviderProfile.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';

let matchingPipelineInstance = null;

export const setMatchingPipeline = (pipeline) => {
  matchingPipelineInstance = pipeline;
};

export const getMatchingPipeline = () => {
  return matchingPipelineInstance;
};

export const searchProviders = async (req, res) => {
  try {
    const {
      service,
      area,
      lat,
      lng,
      urgency = 'normal',
      budget,
      skill,
      sort = 'best_match',
      limit = 20,
    } = req.query;

    if (!service) {
      return res.status(400).json({ message: 'Service category is required' });
    }

    if (matchingPipelineInstance) {
      const searchCoords = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;
      const results = matchingPipelineInstance.search({
        serviceCategory: service.toLowerCase(),
        customerArea: area,
        customerCoords: searchCoords,
        urgency,
        budgetMax: budget ? parseFloat(budget) : undefined,
        skill,
        sortBy: sort,
        limit: parseInt(limit, 10),
      });

      return res.json(results);
    }

    // Fallback direct DB query if pipeline instance is warming up
    const query = {
      categories: service.toLowerCase(),
      verificationStatus: 'verified',
    };

    const providers = await ProviderProfile.find(query)
      .populate('user', 'name phone avatar neighbourhood')
      .limit(parseInt(limit, 10));

    const formatted = providers.map((p) => ({
      _id: p._id,
      name: p.user?.name || 'Local Technician',
      headline: p.headline,
      bio: p.bio,
      categories: p.categories,
      skills: p.skills,
      ratingAverage: p.ratingAverage,
      ratingCount: p.ratingCount,
      startingPrice: p.pricing?.visitCharge || 350,
      hourlyRate: p.pricing?.hourlyRate || 250,
      distanceKm: 2.4,
      matchPercentage: 92,
      availability: p.availability,
      serviceAreas: p.serviceAreas,
    }));

    return res.json({ providers: formatted, total: formatted.length });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Search execution failed' });
  }
};

export const getProviderById = async (req, res) => {
  try {
    const { id } = req.params;
    const provider = await ProviderProfile.findById(id).populate(
      'user',
      'name phone email avatar neighbourhood'
    );
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const reviews = await Review.find({ provider: id })
      .populate('customer', 'name avatar neighbourhood')
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({ provider, reviews });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve provider profile' });
  }
};

export const updateOwnProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const {
      headline,
      bio,
      categories,
      skills,
      pricing,
      serviceAreas,
      experienceYears,
      availability,
    } = req.body;

    if (headline) profile.headline = headline;
    if (bio) profile.bio = bio;
    if (categories) profile.categories = categories;
    if (skills) profile.skills = skills;
    if (pricing) profile.pricing = { ...profile.pricing, ...pricing };
    if (serviceAreas) profile.serviceAreas = serviceAreas;
    if (experienceYears) profile.experienceYears = experienceYears;
    if (availability) profile.availability = { ...profile.availability, ...availability };

    await profile.save();

    // Refresh in-memory pipeline cache
    if (matchingPipelineInstance) {
      matchingPipelineInstance.updateProvider(profile.toObject());
    }

    return res.json({ message: 'Provider profile updated', profile });
  } catch (error) {
    return res.status(500).json({ message: 'Profile update failed' });
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    profile.availability.isAvailableNow = !profile.availability.isAvailableNow;
    await profile.save();

    if (matchingPipelineInstance) {
      matchingPipelineInstance.updateProvider(profile.toObject());
    }

    return res.json({
      message: `Availability updated to ${profile.availability.isAvailableNow ? 'Active' : 'Offline'}`,
      isAvailableNow: profile.availability.isAvailableNow,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Availability update failed' });
  }
};
