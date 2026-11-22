/**
 * Custom Hash Map with Polynomial Rolling Hash and Separate Chaining.
 * Maps service category slugs directly to lists of registered providers.
 */
class HashNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}

export class ServiceHashMap {
  constructor(capacity = 32) {
    this.capacity = capacity;
    this.size = 0;
    this.buckets = new Array(capacity).fill(null);
    this.loadFactorThreshold = 0.75;
  }

  _hash(key) {
    let hash = 0;
    const prime = 31;
    const keyStr = String(key);
    for (let i = 0; i < keyStr.length; i++) {
      hash = (hash * prime + keyStr.charCodeAt(i)) % this.capacity;
    }
    return Math.abs(hash);
  }

  _rehash() {
    const oldBuckets = this.buckets;
    this.capacity *= 2;
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;

    for (const head of oldBuckets) {
      let current = head;
      while (current) {
        this.set(current.key, current.value);
        current = current.next;
      }
    }
  }

  set(key, value) {
    if (this.size / this.capacity >= this.loadFactorThreshold) {
      this._rehash();
    }

    const index = this._hash(key);
    let head = this.buckets[index];

    // If key exists, update value
    let current = head;
    while (current) {
      if (current.key === key) {
        current.value = value;
        return;
      }
      current = current.next;
    }

    // Insert new node at head of chain
    const newNode = new HashNode(key, value);
    newNode.next = head;
    this.buckets[index] = newNode;
    this.size++;
  }

  get(key) {
    const index = this._hash(key);
    let current = this.buckets[index];
    while (current) {
      if (current.key === key) {
        return current.value;
      }
      current = current.next;
    }
    return null;
  }

  has(key) {
    return this.get(key) !== null;
  }

  remove(key) {
    const index = this._hash(key);
    let current = this.buckets[index];
    let prev = null;

    while (current) {
      if (current.key === key) {
        if (prev) {
          prev.next = current.next;
        } else {
          this.buckets[index] = current.next;
        }
        this.size--;
        return true;
      }
      prev = current;
      current = current.next;
    }
    return false;
  }

  clear() {
    this.buckets = new Array(this.capacity).fill(null);
    this.size = 0;
  }

  keys() {
    const result = [];
    for (const head of this.buckets) {
      let current = head;
      while (current) {
        result.push(current.key);
        current = current.next;
      }
    }
    return result;
  }
}
