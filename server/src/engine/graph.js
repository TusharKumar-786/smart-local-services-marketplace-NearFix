/**
 * Min-Heap Priority Queue used specifically for Dijkstra shortest path calculations.
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  push(node, priority) {
    this.heap.push({ node, priority });
    this._siftUp(this.heap.length - 1);
  }

  pop() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._siftDown(0);
    }
    return min;
  }

  _siftUp(idx) {
    let current = idx;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.heap[current].priority < this.heap[parent].priority) {
        [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
        current = parent;
      } else {
        break;
      }
    }
  }

  _siftDown(idx) {
    let current = idx;
    const length = this.heap.length;
    while (true) {
      const left = 2 * current + 1;
      const right = 2 * current + 2;
      let smallest = current;

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest !== current) {
        [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
        current = smallest;
      } else {
        break;
      }
    }
  }
}

/**
 * Area Route Graph with Dijkstra Shortest Path.
 * Neighbourhoods are nodes, road segments are weighted edges (in km).
 */
export class AreaGraph {
  constructor() {
    this.adjacencyList = new Map();
    this.nodeCoordinates = new Map(); // name -> { lat, lng }
  }

  addNode(name, coordinates = null) {
    if (!this.adjacencyList.has(name)) {
      this.adjacencyList.set(name, []);
    }
    if (coordinates) {
      this.nodeCoordinates.set(name, coordinates);
    }
  }

  addEdge(u, v, weightKm) {
    this.addNode(u);
    this.addNode(v);
    this.adjacencyList.get(u).push({ to: v, weight: weightKm });
    this.adjacencyList.get(v).push({ to: u, weight: weightKm });
  }

  getNodeCount() {
    return this.adjacencyList.size;
  }

  /**
   * Snap geographic lat/lng to the nearest graph node using Euclidean/Haversine approximation.
   */
  findNearestNode(lat, lng) {
    if (this.nodeCoordinates.size === 0) return null;
    let closestNode = null;
    let minDistance = Infinity;

    for (const [nodeName, coords] of this.nodeCoordinates.entries()) {
      const dLat = coords.lat - lat;
      const dLng = coords.lng - lng;
      // Approximation for local metropolitan scales
      const distSq = dLat * dLat + dLng * dLng;
      if (distSq < minDistance) {
        minDistance = distSq;
        closestNode = nodeName;
      }
    }
    return closestNode;
  }

  /**
   * Dijkstra shortest path from startNode to targetNode.
   * Returns distance in km and the path array.
   */
  findShortestPath(startNode, targetNode) {
    if (!this.adjacencyList.has(startNode) || !this.adjacencyList.has(targetNode)) {
      return { distance: Infinity, path: [] };
    }

    if (startNode === targetNode) {
      return { distance: 0, path: [startNode] };
    }

    const distances = new Map();
    const previous = new Map();
    const minHeap = new MinHeap();

    for (const node of this.adjacencyList.keys()) {
      distances.set(node, Infinity);
      previous.set(node, null);
    }

    distances.set(startNode, 0);
    minHeap.push(startNode, 0);

    const visited = new Set();

    while (!minHeap.isEmpty()) {
      const { node: current, priority: currentDist } = minHeap.pop();

      if (visited.has(current)) continue;
      visited.add(current);

      if (current === targetNode) break;

      const neighbors = this.adjacencyList.get(current) || [];
      for (const { to: neighbor, weight } of neighbors) {
        if (visited.has(neighbor)) continue;

        const candidateDist = currentDist + weight;
        if (candidateDist < distances.get(neighbor)) {
          distances.set(neighbor, candidateDist);
          previous.set(neighbor, current);
          minHeap.push(neighbor, candidateDist);
        }
      }
    }

    const totalDist = distances.get(targetNode);
    if (totalDist === Infinity) {
      return { distance: Infinity, path: [] };
    }

    // Reconstruct path
    const path = [];
    let curr = targetNode;
    while (curr) {
      path.unshift(curr);
      curr = previous.get(curr);
    }

    return { distance: Math.round(totalDist * 10) / 10, path };
  }
}
