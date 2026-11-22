/**
 * Stable Merge Sort with custom comparator.
 * Guarantees O(n log n) sorting for customer re-sort criteria.
 *
 * @param {Array} arr - Array to sort
 * @param {Function} comparator - (a, b) => negative if a < b, 0 if equal, positive if a > b
 * @returns {Array} New sorted array
 */
export function mergeSort(arr, comparator = (a, b) => a - b) {
  if (!Array.isArray(arr) || arr.length <= 1) {
    return arr ? [...arr] : [];
  }

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), comparator);
  const right = mergeSort(arr.slice(mid), comparator);

  return merge(left, right, comparator);
}

function merge(left, right, comparator) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    // <= 0 ensures stability (preserving original relative order on equal keys)
    if (comparator(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  while (i < left.length) {
    result.push(left[i]);
    i++;
  }

  while (j < right.length) {
    result.push(right[j]);
    j++;
  }

  return result;
}
