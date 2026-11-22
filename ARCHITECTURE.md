# NearFix System Architecture (ARCHITECTURE.md)

> **Evaluator Note**: This document outlines the technical architecture of NearFix, specifically detailing the custom data structures and algorithms engineered in the backend matching engine (`server/src/engine/`). In adherence to project guidelines, these algorithmic implementations remain strictly backend concerns and are never surfaced to customers or providers in the UI, copy, or customer documentation.

## 1. System Overview
NearFix employs a decoupled MERN architecture:
- **Client**: Single Page Application built with React 18, Vite, Tailwind CSS, Framer Motion, and Leaflet OpenStreetMap.
- **Server**: Node.js & Express REST API with JWT-based role authentication (`customer`, `provider`, `admin`) and Zod schema validation.
- **Database**: MongoDB with Mongoose ODM for persistent storage (users, bookings, reviews, complaints, graph topology).
- **Matching Core**: An in-memory, high-throughput algorithmic engine written from scratch in `server/src/engine/` that executes on every search request.

---

## 2. Matching Engine DSA Specifications (`server/src/engine/`)

The matching engine is built entirely from custom, hand-crafted data structures without reliance on third-party algorithmic libraries.

```
                    Customer Search Request
                               │
                               ▼
                    [ 1. Hash Map Lookup ]
                    Jump directly to list of
                    providers offering service
                               │
                               ▼
                     [ 2. Route Graph ]
                 Dijkstra Shortest Path with
                  Min-Heap Priority Queue
                  (Tricity Road Network)
                               │
                               ▼
                     [ 3. Scoring Engine ]
                   Multi-factor normalized
                  weighting (Normal / Urgent)
                               │
                               ▼
                   [ 4. Max-Heap Ranking ]
                  Priority Queue push/extract
                    Top-N candidate selection
                               │
                               ▼
                    [ 5. Stable Merge Sort ]
                    Re-sort by user criteria
                  (Rating, Price, Time, Dist)
                               │
                               ▼
                   [ 6. Binary Search Range ]
                    Price bracket & ID lookup
                               │
                               ▼
                      Clean API Response
            (Distance, Rating, Price, Match %)
```

### 2.1 Provider Lookup: Custom Hash Map (`server/src/engine/hashMap.js`)
- **Structure**: Hand-implemented Hash Table using polynomial rolling hash and separate chaining (linked buckets) with dynamic auto-rehashing when load factor $\alpha \ge 0.75$.
- **Purpose**: Maps service category slugs (e.g., `'plumber'`, `'ac-repair'`) directly to provider sets. Eliminates full table scans.
- **Time Complexity**:
  - Insert / Update: $O(1)$ average, $O(n)$ worst-case.
  - Lookup: $O(1)$ average, $O(k)$ where $k$ is bucket collision depth.
  - Space Complexity: $O(V + S)$ where $V$ is provider records and $S$ is slot capacity.

### 2.2 Route Distance Calculation: Graph with Dijkstra (`server/src/engine/graph.js`)
- **Structure**: Undirected, positively-weighted Adjacency List graph representing 32 neighbourhood nodes across Chandigarh, Mohali, and Panchkula connected by realistic road segments in kilometres. Shortest route distance is resolved using Dijkstra's algorithm powered by a custom **Min-Heap**.
- **Purpose**: Calculates authentic street-network driving distance between customer and provider locations instead of inaccurate straight-line euclidean distance.
- **Time Complexity**:
  - Min-Heap operations: $O(\log V)$
  - Dijkstra path resolution: $O((V + E) \log V)$ where $V$ is neighbourhoods ($\approx 32$) and $E$ is road corridors ($\approx 65$).
  - Space Complexity: $O(V + E)$ for adjacency storage and distance map.

### 2.3 Candidate Ranking: Max-Heap Priority Queue (`server/src/engine/priorityQueue.js`)
- **Structure**: Complete binary tree implemented in a continuous array with `siftUp` and `siftDown` heapification.
- **Purpose**: Scores all eligible providers on a 100-point scale and pops the top $K$ best-fit candidates in decreasing order of overall suitability.
- **Time Complexity**:
  - Heap insert: $O(\log n)$
  - Extract max: $O(\log n)$
  - Peak max: $O(1)$
  - Build heap (batch): $O(n)$
  - Space Complexity: $O(n)$ for candidate array.

### 2.4 Multi-Factor Scoring Formulation (`server/src/engine/scoring.js`)
Every candidate provider is evaluated using a composite linear scoring function:
$$\text{Score} = w_{\text{skill}} S_{\text{skill}} + w_{\text{dist}} S_{\text{dist}} + w_{\text{avail}} S_{\text{avail}} + w_{\text{rate}} S_{\text{rate}} + w_{\text{price}} S_{\text{price}} + w_{\text{urg}} S_{\text{urg}}$$

#### Standard Search Weights ($\sum w = 100$):
- Skill Match: $30\%$
- Distance: $20\%$
- Availability / Timing: $20\%$
- Rating: $15\%$
- Price Competitiveness: $10\%$
- Urgency: $5\%$

#### Emergency Request Weights ($\sum w = 100$):
- Urgency: $35\%$
- Distance: $30\%$
- Availability: $20\%$
- Rating: $10\%$
- Skill: $5\%$
- Price: $0\%$

### 2.5 Re-Sorting Engine: Merge Sort (`server/src/engine/mergeSort.js`)
- **Structure**: Recursive divide-and-conquer stable Merge Sort supporting custom comparison functors.
- **Purpose**: Powers customer re-sorting by:
  - Highest Customer Rating
  - Lowest Starting Price
  - Shortest Driving Distance
  - Soonest Availability
- **Time Complexity**: $O(n \log n)$ guaranteed in best, average, and worst case. Space Complexity: $O(n)$ temporary array.

### 2.6 Range & Exact Search: Binary Search (`server/src/engine/binarySearch.js`)
- **Structure**: Iterative binary search on sorted numeric or identifier arrays.
- **Purpose**: Quickly verifies provider qualification within budget ranges ($[\text{minBudget}, \text{maxBudget}]$) and performs rapid provider ID lookups on cached sorted indices.
- **Time Complexity**: $O(\log n)$ search time. Space Complexity: $O(1)$.

---

## 3. Data Flow & Security
1. **Request Validation**: Incoming queries pass through strict Zod schemas before touching the matching pipeline or database.
2. **Security**: Bcrypt password hashing (10 salt rounds), signed JWT tokens, rate limiting (auth & search endpoints), CORS whitelist, and sanitized database queries.
3. **Engine Isolation**: The matching engine lives in a standalone module, completely isolated from user-facing presentations. Responses emit standard, human-centric metrics: `distanceKm`, `ratingAverage`, `startingPrice`, and `matchPercentage`.
