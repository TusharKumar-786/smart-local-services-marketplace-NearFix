import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { TRICITY_AREAS, getAreaCoordinates as fallbackGetAreaCoordinates } from '../utils/tricityAreas';

let cachedAreas = null;

export function useAreas() {
  const [areas, setAreas] = useState(cachedAreas || TRICITY_AREAS);
  const [loading, setLoading] = useState(!cachedAreas);

  useEffect(() => {
    if (cachedAreas) return;
    let isMounted = true;
    api
      .get('/areas')
      .then((res) => {
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          cachedAreas = res.data;
          setAreas(res.data);
        }
      })
      .catch(() => {
        // Fallback to static tricity areas on any failure
        if (isMounted) {
          cachedAreas = TRICITY_AREAS;
          setAreas(TRICITY_AREAS);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getAreaCoordinates = (areaName) => {
    if (!areaName) return { lat: 30.7046, lng: 76.7179 };
    const areaList = areas && areas.length > 0 ? areas : TRICITY_AREAS;
    const found = areaList.find(
      (a) =>
        a.name.toLowerCase() === areaName.toLowerCase() ||
        areaName.toLowerCase().includes(a.name.toLowerCase()) ||
        a.name.toLowerCase().includes(areaName.toLowerCase())
    );
    if (found) {
      if (found.coordinates) {
        return { lat: found.coordinates.lat, lng: found.coordinates.lng };
      }
      if (found.lat && found.lng) {
        return { lat: found.lat, lng: found.lng };
      }
    }
    return fallbackGetAreaCoordinates(areaName);
  };

  return { areas, loading, getAreaCoordinates };
}
