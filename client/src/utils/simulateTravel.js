/**
 * Realistic travel route interpolation helper for NearFix live tracking simulation.
 * Interpolates 40 to 60 curved road-like coordinates between provider and customer locations.
 */

export function generateTravelWaypoints(startCoords, endCoords, numPoints = 50) {
  const points = [];
  const startLat = startCoords.lat || startCoords[1] || 30.7225;
  const startLng = startCoords.lng || startCoords[0] || 76.7562;
  const endLat = endCoords.lat || endCoords[1] || 30.7050;
  const endLng = endCoords.lng || endCoords[0] || 76.7110;

  // Midpoint with natural road curvature offset
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  const curveOffsetX = (Math.sin(startLat * 10) * 0.006);
  const curveOffsetY = (Math.cos(startLng * 10) * 0.005);
  const controlPoint = { lat: midLat + curveOffsetX, lng: midLng + curveOffsetY };

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic Bézier curve for realistic road path
    const lat = (1 - t) * (1 - t) * startLat + 2 * (1 - t) * t * controlPoint.lat + t * t * endLat;
    const lng = (1 - t) * (1 - t) * startLng + 2 * (1 - t) * t * controlPoint.lng + t * t * endLng;
    points.push([lat, lng]);
  }

  return points;
}

/**
 * Calculates straight/route distance between two coordinates in km
 */
export function calculateDistanceKm(coord1, coord2) {
  const lat1 = coord1.lat || coord1[0];
  const lon1 = coord1.lng || coord1[1];
  const lat2 = coord2.lat || coord2[0];
  const lon2 = coord2.lng || coord2[1];

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
