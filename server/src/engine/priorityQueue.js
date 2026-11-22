/**
 * Max-Heap Priority Queue for ranking candidates by match score.
 * Extracts the highest scoring providers in O(log n) time.
 */
export class MaxHeapPriorityQueue {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  push(item, score) {
    this.heap.push({ item, score });
    this._siftUp(this.heap.length - 1);
  }

  pop() {
    if (this.isEmpty()) return null;
    const max = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._siftDown(0);
    }
    return max;
  }

  peek() {
    return this.isEmpty() ? null : this.heap[0];
  }

  /**
   * Build heap in O(n) from an existing array of { item, score }
   */
  buildHeap(elements) {
    this.heap = [...elements];
    const startIdx = Math.floor(this.heap.length / 2) - 1;
    for (let i = startIdx; i >= 0; i--) {
      this._siftDown(i);
    }
  }

  /**
   * Extract top N elements in descending order of score.
   */
  extractTopN(n) {
    const results = [];
    const count = Math.min(n, this.heap.length);
    for (let i = 0; i < count; i++) {
      const top = this.pop();
      if (top) results.push(top);
    }
    return results;
  }

  _siftUp(idx) {
    let current = idx;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.heap[current].score > this.heap[parent].score) {
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
      let largest = current;

      if (left < length && this.heap[left].score > this.heap[largest].score) {
        largest = left;
      }
      if (right < length && this.heap[right].score > this.heap[largest].score) {
        largest = right;
      }
      if (largest !== current) {
        [this.heap[current], this.heap[largest]] = [this.heap[largest], this.heap[current]];
        current = largest;
      } else {
        break;
      }
    }
  }
}
