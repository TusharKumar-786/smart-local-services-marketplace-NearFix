import React from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import { MapPin, Radio, ShieldCheck } from 'lucide-react';
import { createProviderIcon } from '../../utils/mapIcons';
import { getAreaCoordinates } from '../../utils/tricityAreas';

export const ProviderMiniMap = ({ provider }) => {
  if (!provider) return null;

  const primaryArea = provider.serviceAreas?.[0] || 'Phase 7, Mohali';
  let coords;
  if (provider.location?.coordinates && provider.location.coordinates.length === 2) {
    coords = { lat: provider.location.coordinates[1], lng: provider.location.coordinates[0] };
  } else {
    coords = getAreaCoordinates(primaryArea);
  }

  const isAvailable = provider.isAvailableNow !== false;

  return (
    <div className="bg-surface rounded-2xl border border-sand p-5 space-y-4 shadow-soft-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
            Service Coverage Map
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-success animate-pulse' : 'bg-muted'}`} />
          <span className={`text-[11px] font-bold ${isAvailable ? 'text-success' : 'text-muted'}`}>
            {isAvailable ? 'Live & On-Duty' : 'Currently Offline'}
          </span>
        </div>
      </div>

      <div className="h-48 w-full rounded-xl overflow-hidden border border-sand relative">
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={false}
          dragging={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[coords.lat, coords.lng]} icon={createProviderIcon(isAvailable)} />
          <Circle
            center={[coords.lat, coords.lng]}
            radius={7000}
            pathOptions={{
              color: '#0F5C63',
              fillColor: '#0F5C63',
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />
        </MapContainer>

        <div className="absolute bottom-2 left-2 right-2 bg-surface/90 backdrop-blur px-2.5 py-1.5 rounded-lg border border-sand text-[11px] flex items-center justify-between z-[1000] shadow-sm">
          <span className="font-semibold text-ink truncate">Base: {primaryArea}</span>
          <span className="text-primary font-bold shrink-0">~7 km radius</span>
        </div>
      </div>

      <p className="text-[11px] text-muted leading-relaxed">
        Dispatches from {primaryArea}. Typical arrival time across surrounding Tricity sectors is 25 to 45 minutes for standard calls, and under 25 minutes for emergency requests.
      </p>
    </div>
  );
};
