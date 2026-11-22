/**
 * Binary Search routines for exact key lookups and budget range filters on sorted arrays.
 */

/**
 * Standard binary search for an exact numeric or string key.
 * @param {Array} sortedArr - Pre-sorted array
 * @param {*} target - Target value
 * @param {Function} keyExtractor - Optional function to extract key from element
 * @returns {number} Index of target or -1 if not found
 */
export function binarySearch(sortedArr, target, keyExtractor = (x) => x) {
  let low = 0;
  let high = sortedArr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = keyExtractor(sortedArr[mid]);

    if (midVal === target) {
      return mid;
    } else if (midVal < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

/**
 * Find lower bound (first index where key >= target) in a sorted array.
 */
export function lowerBound(sortedArr, target, keyExtractor = (x) => x) {
  let low = 0;
  let high = sortedArr.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (keyExtractor(sortedArr[mid]) >= target) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}

/**
 * Find upper bound (first index where key > target) in a sorted array.
 */
export function upperBound(sortedArr, target, keyExtractor = (x) => x) {
  let low = 0;
  let high = sortedArr.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (keyExtractor(sortedArr[mid]) > target) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}

/**
 * Binary search range filter: extracts all elements with keys in [minVal, maxVal].
 */
export function binarySearchRange(sortedArr, minVal, maxVal, keyExtractor = (x) => x) {
  const start = lowerBound(sortedArr, minVal, keyExtractor);
  const end = upperBound(sortedArr, maxVal, keyExtractor);
  return sortedArr.slice(start, end);
}
