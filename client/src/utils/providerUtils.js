export function isProviderAvailable(p) {
  if (!p) return false;
  if (p.availability && typeof p.availability.isAvailableNow === 'boolean') {
    return p.availability.isAvailableNow;
  }
  if (typeof p.isAvailableNow === 'boolean') {
    return p.isAvailableNow;
  }
  return true;
}

export function isDefaultCoordinates(coords) {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) return true;
  const [lng, lat] = coords;
  return Math.abs(lng - 76.7794) < 0.0001 && Math.abs(lat - 30.7333) < 0.0001;
}
