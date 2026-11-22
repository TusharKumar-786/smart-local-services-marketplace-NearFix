import test from 'node:test';
import assert from 'node:assert/strict';

import { ServiceHashMap } from '../src/engine/hashMap.js';
import { AreaGraph } from '../src/engine/graph.js';
import { MaxHeapPriorityQueue } from '../src/engine/priorityQueue.js';
import { mergeSort } from '../src/engine/mergeSort.js';
import { binarySearch, binarySearchRange } from '../src/engine/binarySearch.js';
import { calculateMatchScore } from '../src/engine/scoring.js';
import { MatchingPipeline } from '../src/engine/pipeline.js';

test('1. ServiceHashMap: insert, update, collision, and delete', () => {
  const map = new ServiceHashMap(4);
  map.set('plumber', [{ id: 1, name: 'Ravi' }]);
  map.set('electrician', [{ id: 2, name: 'Rajesh' }]);
  map.set('ac-repair', [{ id: 3, name: 'Aman' }]);

  assert.equal(map.has('plumber'), true);
  assert.equal(map.get('plumber').length, 1);
  assert.equal(map.get('plumber')[0].name, 'Ravi');

  // Update
  map.set('plumber', [{ id: 1, name: 'Ravi' }, { id: 4, name: 'Amit' }]);
  assert.equal(map.get('plumber').length, 2);

  // Remove
  assert.equal(map.remove('electrician'), true);
  assert.equal(map.has('electrician'), false);
  assert.equal(map.get('electrician'), null);
});

test('2. AreaGraph & Dijkstra: shortest path on known weighted network', () => {
  const graph = new AreaGraph();
  // Construct small test network: A - 2 - B - 3 - C; A - 6 - C
  graph.addEdge('Sector 17', 'Sector 22', 2.5);
  graph.addEdge('Sector 22', 'Sector 35', 3.0);
  graph.addEdge('Sector 17', 'Sector 35', 8.0);
  graph.addEdge('Sector 35', 'Phase 7 Mohali', 4.0);

  const route = graph.findShortestPath('Sector 17', 'Phase 7 Mohali');
  // Expected shortest: Sector 17 -> Sector 22 -> Sector 35 -> Phase 7 Mohali = 2.5 + 3.0 + 4.0 = 9.5 km
  assert.equal(route.distance, 9.5);
  assert.deepEqual(route.path, ['Sector 17', 'Sector 22', 'Sector 35', 'Phase 7 Mohali']);

  // Disconnected query
  graph.addNode('Isolated Node');
  const disconn = graph.findShortestPath('Sector 17', 'Isolated Node');
  assert.equal(disconn.distance, Infinity);
});

test('3. MaxHeapPriorityQueue: ordering, peek, and extraction', () => {
  const pq = new MaxHeapPriorityQueue();
  pq.push({ id: 'P1' }, 72);
  pq.push({ id: 'P2' }, 95);
  pq.push({ id: 'P3' }, 84);
  pq.push({ id: 'P4' }, 61);

  assert.equal(pq.size(), 4);
  assert.equal(pq.peek().score, 95);

  const top2 = pq.extractTopN(2);
  assert.equal(top2.length, 2);
  assert.equal(top2[0].score, 95);
  assert.equal(top2[0].item.id, 'P2');
  assert.equal(top2[1].score, 84);
  assert.equal(top2[1].item.id, 'P3');
});

test('4. MergeSort: stability and custom comparators', () => {
  const items = [
    { name: 'A', price: 500, rating: 4.8 },
    { name: 'B', price: 300, rating: 4.2 },
    { name: 'C', price: 800, rating: 4.9 },
    { name: 'D', price: 300, rating: 4.6 },
  ];

  // Sort ascending by price
  const byPrice = mergeSort(items, (a, b) => a.price - b.price);
  assert.equal(byPrice[0].price, 300);
  assert.equal(byPrice[1].price, 300);
  assert.equal(byPrice[3].price, 800);

  // Sort descending by rating
  const byRating = mergeSort(items, (a, b) => b.rating - a.rating);
  assert.equal(byRating[0].rating, 4.9);
  assert.equal(byRating[0].name, 'C');
});

test('5. BinarySearch & BinarySearchRange: exact and range lookups', () => {
  const sorted = [100, 250, 300, 450, 500, 750, 900];

  assert.equal(binarySearch(sorted, 300), 2);
  assert.equal(binarySearch(sorted, 400), -1);

  const range = binarySearchRange(sorted, 250, 500);
  assert.deepEqual(range, [250, 300, 450, 500]);
});

test('6. calculateMatchScore: normal vs emergency weighting response', () => {
  const provider = {
    skills: ['Leak repair', 'Drain cleaning'],
    availability: { isAvailableNow: true },
    ratingAverage: 4.9,
    pricing: { visitCharge: 350 },
  };

  const normalScore = calculateMatchScore(provider, {
    urgency: 'normal',
    distanceKm: 2.0,
    requestedSkill: 'Leak repair',
    maxBudget: 500,
  });

  const emergencyScore = calculateMatchScore(provider, {
    urgency: 'emergency',
    distanceKm: 1.5,
    requestedSkill: 'Leak repair',
    maxBudget: 500,
  });

  assert.ok(normalScore >= 80, `Expected normal score >= 80, got ${normalScore}`);
  assert.ok(emergencyScore >= 85, `Expected emergency score >= 85, got ${emergencyScore}`);
});

test('7. MatchingPipeline: complete end-to-end execution', () => {
  const graph = new AreaGraph();
  graph.addEdge('Sector 70 Mohali', 'Phase 5 Mohali', 3.0);
  graph.addEdge('Phase 5 Mohali', 'Sector 35 Chandigarh', 5.0);

  const pipeline = new MatchingPipeline(graph);

  const dummyProviders = [
    {
      _id: 'p1',
      name: 'Manpreet Singh',
      categories: ['plumber'],
      serviceAreas: ['Sector 70 Mohali'],
      verificationStatus: 'verified',
      ratingAverage: 4.8,
      pricing: { visitCharge: 300 },
      availability: { isAvailableNow: true },
    },
    {
      _id: 'p2',
      name: 'Rakesh Verma',
      categories: ['plumber'],
      serviceAreas: ['Sector 35 Chandigarh'],
      verificationStatus: 'verified',
      ratingAverage: 4.3,
      pricing: { visitCharge: 450 },
      availability: { isAvailableNow: false },
    },
    {
      _id: 'p3',
      name: 'Unverified Pro',
      categories: ['plumber'],
      serviceAreas: ['Sector 70 Mohali'],
      verificationStatus: 'pending',
    },
  ];

  pipeline.populateProviders(dummyProviders);

  const results = pipeline.search({
    serviceCategory: 'plumber',
    customerArea: 'Sector 70 Mohali',
    urgency: 'normal',
    budgetMax: 500,
  });

  // Only verified providers returned
  assert.equal(results.total, 2);
  // Best match should be p1 (closer, higher rating, available now)
  assert.equal(results.providers[0]._id, 'p1');
  assert.ok(results.providers[0].matchPercentage > results.providers[1].matchPercentage);
});
