import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck } from 'lucide-react';
import { createCustomerIcon, createProviderIcon } from '../../utils/mapIcons';
import { useAreas } from '../../hooks/useAreas';
import { isProviderAvailable, isDefaultCoordinates } from '../../utils/providerUtils';
import { formatIndianCurrency, formatRating, formatCategoryName } from '../../utils/formatters';

// Helper component to auto-fit bounds
function AutoBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

export const SearchMapView = ({ providers = [], customerArea, urgency, service }) => {
  const { getAreaCoordinates } = useAreas();
  const customerCoords = getAreaCoordinates(customerArea);
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  // Generate coordinates for all providers
  const markers = providers.map((p, idx) => {
    let lat, lng;
    const hasExplicitCoords =
      p.location?.coordinates &&
      p.location.coordinates.length === 2 &&
      !isDefaultCoordinates(p.location.coordinates);

    if (hasExplicitCoords) {
      lng = p.location.coordinates[0];
      lat = p.location.coordinates[1];
    } else {
      // Fall back to first service area's coordinates with small deterministic jitter
      const primaryArea = p.serviceAreas?.[0] || p.primaryArea || customerArea;
      const areaCoord = getAreaCoordinates(primaryArea);
      const jitterLat = ((idx % 5) - 2) * 0.0035;
      const jitterLng = (((idx * 3) % 5) - 2) * 0.0035;
      lat = areaCoord.lat + jitterLat;
      lng = areaCoord.lng + jitterLng;
    }

    return {
      provider: p,
      position: [lat, lng],
    };
  });

  // Calculate all coordinates for bounds fitting
  const allPoints = [
    [customerCoords.lat, customerCoords.lng],
    ...markers.map((m) => m.position),
  ];

  const availableCount = providers.filter(isProviderAvailable).length;
  const offlineCount = providers.length - availableCount;

  // Active marker to draw distance line to
  const activeMarker =
    markers.find((m) => String(m.provider._id || m.provider.id) === String(selectedProviderId)) ||
    markers[0];

  return (
    <div className="bg-surface rounded-2xl border border-sand overflow-hidden shadow-soft-sm">
      <div className="p-4 bg-tint/60 border-b border-sand flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-ink">
            <span className="w-3 h-3 rounded-full bg-primary inline-block"></span> Your Location ({customerArea})
          </span>
          <span className="flex items-center gap-1.5 font-bold text-success">
            <span className="w-3 h-3 rounded-full bg-success inline-block"></span> Available Now ({availableCount})
          </span>
          <span className="flex items-center gap-1.5 font-bold text-muted">
            <span className="w-3 h-3 rounded-full bg-muted inline-block"></span> Offline / Busy ({offlineCount})
          </span>
        </div>
        <div className="flex items-center gap-3">
          {activeMarker && (
            <span className="text-primary font-bold hidden sm:inline-block">
              Route to {activeMarker.provider.name || 'Technician'}: {activeMarker.provider.distanceKm || 2.4} km (~{activeMarker.provider.etaMinutes || 6} min)
            </span>
          )}
          <span className="text-muted font-medium">Click any pin to inspect & view route</span>
        </div>
      </div>

      <div className="h-[520px] w-full relative">
        <MapContainer
          center={[customerCoords.lat, customerCoords.lng]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <AutoBounds bounds={allPoints} />

          {/* Direct distance / route line between customer and active provider */}
          {activeMarker && (
            <Polyline
              positions={[
                [customerCoords.lat, customerCoords.lng],
                activeMarker.position,
              ]}
              pathOptions={{
                color: '#0F5C63',
                weight: 3,
                dashArray: '6, 8',
                opacity: 0.85,
              }}
            />
          )}

          {/* Customer marker */}
          <Marker
            position={[customerCoords.lat, customerCoords.lng]}
            icon={createCustomerIcon(customerArea)}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <span className="font-bold text-primary block">Your Selected Location</span>
                <span className="text-ink">{customerArea}</span>
              </div>
            </Popup>
          </Marker>

          {/* Provider markers */}
          {markers.map(({ provider: p, position }) => {
            const providerId = p._id || p.id;
            const providerName = p.name || p.user?.name || 'Local Technician';
            const avatar =
              p.user?.avatar ||
              p.photos?.[0] ||
              `https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200&q=80`;
            const isAvailable = isProviderAvailable(p);
            const isNew = p.ratingAverage == null || p.ratingCount === 0;

            return (
              <Marker
                key={providerId}
                position={position}
                icon={createProviderIcon(isAvailable, urgency === 'emergency')}
                eventHandlers={{
                  click: () => setSelectedProviderId(providerId),
                }}
              >
                <Popup className="nearfix-custom-popup">
                  <div className="w-56 p-1 space-y-3 font-sans">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={avatar}
                        alt={providerName}
                        className="w-11 h-11 rounded-full object-cover border border-sand"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-sm text-ink truncate block">
                            {providerName}
                          </span>
                          <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" />
                        </div>
                        <span className="text-[11px] text-muted block truncate">
                          {formatCategoryName(p.category || p.categories?.[0] || service)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1.5 border-y border-sand/60">
                      {isNew ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent">
                          New
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-ink">
                          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                          {formatRating(p.ratingAverage)}
                        </span>
                      )}
                      {isAvailable ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-emerald-800 bg-emerald-100">
                          Available
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-muted bg-sand/60">
                          Offline
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-tint text-primary">
                        {p.matchPercentage || 92}% match
                      </span>
                    </div>

                    <div className="text-[11px] text-ink font-semibold flex items-center justify-between bg-sand/20 px-2 py-1 rounded-md">
                      <span>{p.distanceKm || '2.4'} km away</span>
                      <span>•</span>
                      <span>arrives in ~{p.etaMinutes || 6} min</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-muted block">Visit Charge</span>
                        <span className="text-xs font-bold text-ink">
                          {formatIndianCurrency(p.startingPrice || p.pricing?.visitCharge || 349)}
                        </span>
                      </div>
                      <Link
                        to={`/book/${providerId}?service=${service || p.categories?.[0] || 'plumber'}&urgency=${urgency || 'normal'}`}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg transition-all"
                      >
                        Book Visit
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
