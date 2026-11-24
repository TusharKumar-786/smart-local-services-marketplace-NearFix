import { ServiceHashMap } from './hashMap.js';
import { AreaGraph } from './graph.js';
import { MaxHeapPriorityQueue } from './priorityQueue.js';
import { mergeSort } from './mergeSort.js';
import { calculateMatchScore } from './scoring.js';

export class MatchingPipeline {
  constructor(areaGraph = null) {
    this.providerMap = new ServiceHashMap(); // serviceSlug -> Provider[]
    this.areaGraph = areaGraph || new AreaGraph();
  }

  setAreaGraph(graph) {
    this.areaGraph = graph;
  }

  /**
   * Rebuild or seed provider lookup hash map.
   */
  populateProviders(providersList) {
    this.providerMap.clear();

    const categoryBuckets = new Map();
    for (const p of providersList) {
      if (!p.categories) continue;
      // Filter out unverified or blocked providers from initial cache
      if (p.verificationStatus && p.verificationStatus !== 'verified') continue;
      if (p.status === 'blocked') continue;

      for (const cat of p.categories) {
        const slug = typeof cat === 'string' ? cat : cat.slug;
        if (!categoryBuckets.has(slug)) {
          categoryBuckets.set(slug, []);
        }
        categoryBuckets.get(slug).push(p);
      }
    }

    for (const [slug, list] of categoryBuckets.entries()) {
      this.providerMap.set(slug, list);
    }
  }

  /**
   * Update or insert a provider into the in-memory hash map.
   * If category changes, removes provider from old category buckets.
   * If unverified or blocked, provider is removed from all categories.
   */
  updateProvider(provider) {
    if (!provider) return;
    const providerId = String(provider._id || provider.id);

    // 1. Remove provider from all existing category buckets
    const allCategories = this.providerMap.keys();
    for (const catKey of allCategories) {
      const currentList = this.providerMap.get(catKey) || [];
      const filtered = currentList.filter(
        (p) => String(p._id || p.id) !== providerId
      );
      this.providerMap.set(catKey, filtered);
    }

    // 2. If provider is verified and active, insert into current category buckets
    if (provider.verificationStatus === 'verified' && provider.status !== 'blocked' && provider.categories) {
      for (const cat of provider.categories) {
        const slug = typeof cat === 'string' ? cat : cat.slug;
        const currentList = this.providerMap.get(slug) || [];
        currentList.push(provider);
        this.providerMap.set(slug, currentList);
      }
    }
  }

  /**
   * Execute matching pipeline:
   * 1. Hash map category lookup
   * 2. Eligibility filtering
   * 3. Graph shortest route distance via Dijkstra
   * 4. Multi-factor scoring
   * 5. Max-heap ranking
   * 6. Merge sort re-ordering if requested
   */
  search(params) {
    const {
      serviceCategory,
      customerArea,
      customerCoords,
      urgency = 'normal',
      budgetMax,
      skill,
      sortBy = 'best_match',
      limit = 20,
    } = params;

    // 1. Hash Map lookup: O(1)
    const candidates = this.providerMap.get(serviceCategory) || [];
    if (candidates.length === 0) {
      return { providers: [], total: 0 };
    }

    // Determine customer anchor node
    let customerNode = customerArea;
    if (!customerNode && customerCoords && this.areaGraph) {
      customerNode = this.areaGraph.findNearestNode(customerCoords.lat, customerCoords.lng);
    }

    // 2 & 3. Filtering and Graph Route Distance calculation
    const scoredCandidates = [];
    const maxHeap = new MaxHeapPriorityQueue();

    for (const provider of candidates) {
      // Filter out unverified or blocked
      if (provider.verificationStatus && provider.verificationStatus !== 'verified') continue;
      if (provider.status === 'blocked') continue;

      // Distance calculation via Dijkstra
      let distanceKm = 3.5; // realistic fallback default
      const providerNode = provider.serviceAreas?.[0] || provider.primaryArea;

      if (customerNode && providerNode && this.areaGraph) {
        const route = this.areaGraph.findShortestPath(customerNode, providerNode);
        if (route.distance !== Infinity) {
          distanceKm = route.distance;
        }
      }

      // Budget filter if specified
      const visitCharge = provider.pricing?.visitCharge || 300;
      if (budgetMax && visitCharge > budgetMax * 1.5) {
        continue;
      }

      // 4. Multi-factor scoring
      const score = calculateMatchScore(provider, {
        urgency,
        distanceKm,
        requestedSkill: skill,
        maxBudget: budgetMax,
      });

      // Compute ETA based on distance and urgency speed (~25 km/h standard, 37.5 km/h emergency, min 5 min)
      const travelSpeed = urgency === 'emergency' ? 37.5 : 25;
      const etaMinutes = Math.max(5, Math.round((distanceKm / travelSpeed) * 60));

      const providerResult = {
        ...provider,
        distanceKm,
        etaMinutes,
        matchPercentage: score,
        startingPrice: visitCharge,
        ratingAverage: provider.ratingAverage != null ? provider.ratingAverage : null,
        ratingCount: provider.ratingCount != null ? provider.ratingCount : 0,
      };

      // 5. Max-heap push
      maxHeap.push(providerResult, score);
    }

    // Pop top candidates
    const topCandidates = maxHeap.extractTopN(limit).map((entry) => entry.item);

    // 6. Stable Merge Sort if non-default sort requested
    let finalResults = topCandidates;
    if (sortBy === 'rating') {
      finalResults = mergeSort(topCandidates, (a, b) => b.ratingAverage - a.ratingAverage);
    } else if (sortBy === 'price_asc') {
      finalResults = mergeSort(topCandidates, (a, b) => a.startingPrice - b.startingPrice);
    } else if (sortBy === 'distance') {
      finalResults = mergeSort(topCandidates, (a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'availability') {
      finalResults = mergeSort(topCandidates, (a, b) => {
        const aNow = a.availability?.isAvailableNow ? 1 : 0;
        const bNow = b.availability?.isAvailableNow ? 1 : 0;
        return bNow - aNow;
      });
    }

    return {
      providers: finalResults,
      total: finalResults.length,
    };
  }
}
