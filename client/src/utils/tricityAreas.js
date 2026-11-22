/**
 * Tricity Neighbourhoods & Geographical Coordinates
 * Chandigarh, Mohali, and Panchkula node locations
 */
export const TRICITY_AREAS = [
  // Chandigarh
  { name: 'Sector 17, Chandigarh', region: 'Chandigarh', lat: 30.7415, lng: 76.7794 },
  { name: 'Sector 22, Chandigarh', region: 'Chandigarh', lat: 30.7329, lng: 76.7701 },
  { name: 'Sector 35, Chandigarh', region: 'Chandigarh', lat: 30.7225, lng: 76.7562 },
  { name: 'Sector 43, Chandigarh', region: 'Chandigarh', lat: 30.7142, lng: 76.7431 },
  { name: 'Sector 8, Chandigarh', region: 'Chandigarh', lat: 30.7456, lng: 76.7952 },
  { name: 'Sector 15, Chandigarh', region: 'Chandigarh', lat: 30.7521, lng: 76.7684 },
  { name: 'Sector 26, Chandigarh', region: 'Chandigarh', lat: 30.7291, lng: 76.8112 },
  { name: 'Sector 34, Chandigarh', region: 'Chandigarh', lat: 30.7214, lng: 76.7711 },
  { name: 'Sector 46, Chandigarh', region: 'Chandigarh', lat: 30.7021, lng: 76.7645 },
  { name: 'Sector 20, Chandigarh', region: 'Chandigarh', lat: 30.7210, lng: 76.7865 },
  { name: 'Sector 38, Chandigarh', region: 'Chandigarh', lat: 30.7432, lng: 76.7410 },
  { name: 'Mani Majra, Chandigarh', region: 'Chandigarh', lat: 30.7231, lng: 76.8456 },

  // Mohali
  { name: 'Phase 3B2, Mohali', region: 'Mohali', lat: 30.7112, lng: 76.7210 },
  { name: 'Phase 5, Mohali', region: 'Mohali', lat: 30.7198, lng: 76.7154 },
  { name: 'Phase 7, Mohali', region: 'Mohali', lat: 30.7046, lng: 76.7179 },
  { name: 'Sector 70, Mohali', region: 'Mohali', lat: 30.6975, lng: 76.7088 },
  { name: 'Sector 68, Mohali', region: 'Mohali', lat: 30.6865, lng: 76.7234 },
  { name: 'Sector 62, Mohali', region: 'Mohali', lat: 30.6951, lng: 76.7321 },
  { name: 'Phase 1, Mohali', region: 'Mohali', lat: 30.7321, lng: 76.7123 },
  { name: 'Sector 71, Mohali', region: 'Mohali', lat: 30.7024, lng: 76.6998 },
  { name: 'Sector 82, Mohali', region: 'Mohali', lat: 30.6654, lng: 76.7412 },
  { name: 'Sector 67, Mohali', region: 'Mohali', lat: 30.6812, lng: 76.7365 },
  { name: 'Airport Road, Mohali', region: 'Mohali', lat: 30.6587, lng: 76.7621 },
  { name: 'Kharar Road, Mohali', region: 'Mohali', lat: 30.7412, lng: 76.6854 },

  // Panchkula
  { name: 'Sector 4, Panchkula', region: 'Panchkula', lat: 30.6954, lng: 76.8521 },
  { name: 'Sector 7, Panchkula', region: 'Panchkula', lat: 30.6898, lng: 76.8612 },
  { name: 'Sector 20, Panchkula', region: 'Panchkula', lat: 30.6721, lng: 76.8432 },
  { name: 'Sector 14, Panchkula', region: 'Panchkula', lat: 30.6845, lng: 76.8512 },
  { name: 'Sector 21, Panchkula', region: 'Panchkula', lat: 30.6687, lng: 76.8523 },
  { name: 'Sector 10, Panchkula', region: 'Panchkula', lat: 30.6912, lng: 76.8412 },
  { name: 'MDC Sector 5, Panchkula', region: 'Panchkula', lat: 30.7187, lng: 76.8421 },
  { name: 'Pinjore Road, Panchkula', region: 'Panchkula', lat: 30.7254, lng: 76.8795 },
];

export function getAreaCoordinates(areaName) {
  if (!areaName) return { lat: 30.7046, lng: 76.7179 }; // default Mohali Phase 7
  const found = TRICITY_AREAS.find(
    (a) => a.name.toLowerCase() === areaName.toLowerCase() ||
           areaName.toLowerCase().includes(a.name.toLowerCase()) ||
           a.name.toLowerCase().includes(areaName.toLowerCase())
  );
  return found ? { lat: found.lat, lng: found.lng } : { lat: 30.7046, lng: 76.7179 };
}
