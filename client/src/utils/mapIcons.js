import L from 'leaflet';

/**
 * Creates custom SVG Leaflet DivIcon instances for NearFix map visualizations.
 */

export function createCustomerIcon(label = 'Your Location') {
  return L.divIcon({
    className: 'nearfix-customer-pin',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: rgba(15, 92, 99, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #0F5C63; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

export function createProviderIcon(isAvailable = true, isEmergency = false) {
  const pinColor = isEmergency ? '#D8402F' : (isAvailable ? '#2E8B57' : '#5B6B70');
  const ringColor = isEmergency ? 'rgba(216, 64, 47, 0.3)' : (isAvailable ? 'rgba(46, 139, 87, 0.25)' : 'transparent');

  return L.divIcon({
    className: 'nearfix-provider-pin',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        ${isAvailable ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${ringColor}; animation: pulse 2s infinite;"></div>` : ''}
        <div style="width: 26px; height: 26px; border-radius: 50%; background: ${pinColor}; border: 2.5px solid #FFFFFF; box-shadow: 0 3px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

export function createMovingTechnicianIcon() {
  return L.divIcon({
    className: 'nearfix-travel-pin',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: rgba(242, 163, 44, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #0F5C63; border: 3px solid #F2A32C; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F2A32C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}
