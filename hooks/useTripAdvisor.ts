// hooks/useTripAdvisor.ts (continued)
import { useState, useEffect, useCallback } from 'react';
import { Place, Coordinates } from '@/types/map';
import { TripAdvisorService } from '@/services/tripAdvisorService';

interface TripAdvisorCache {
  [key: string]: {
    data: Place | Place[];
    timestamp: number;
  };
}

interface UseTripAdvisorOptions {
  cacheExpiry?: number; // In milliseconds
  enableRealtime?: boolean; // Whether to enable real-time updates
}

export function useTripAdvisor(options: UseTripAdvisorOptions = {}) {
  const { 
    cacheExpiry = 5 * 60 * 1000, // Default 5 minutes
    enableRealtime = false 
  } = options;

  const [cache, setCache] = useState<TripAdvisorCache>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Generate cache key
  const getCacheKey = (location: Coordinates, type: string, radius: number) => {
    return `${location.lat},${location.lng}-${type}-${radius}`;
  };

  // Check if cache is valid
  const isCacheValid = (timestamp: number) => {
    return Date.now() - timestamp < cacheExpiry;
  };

  // Fetch places from TripAdvisor
  const fetchPlaces = useCallback(async (
    location: Coordinates,
    type: string,
    radius: number,
    forceRefresh = false
  ) => {
    const cacheKey = getCacheKey(location, type, radius);
    const cachedData = cache[cacheKey];

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data as Place[];
    }

    setLoading(true);
    setError(null);

    try {
      const places = await TripAdvisorService.searchPlaces(location, type, radius);
      
      // Update cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: places,
          timestamp: Date.now()
        }
      }));

      setLastUpdate(new Date());
      return places;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching TripAdvisor data';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [cache, cacheExpiry]);

  // Fetch place details
  const fetchPlaceDetails = useCallback(async (
    locationId: string,
    forceRefresh = false
  ) => {
    const cacheKey = `details-${locationId}`;
    const cachedData = cache[cacheKey];

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && cachedData && isCacheValid(cachedData.timestamp)) {
      return cachedData.data as Place;
    }

    setLoading(true);
    setError(null);

    try {
      const details = await TripAdvisorService.getPlaceDetails(locationId);
      
      if (!details) {
        throw new Error('Place details not found');
      }

      // Update cache
      setCache(prev => ({
        ...prev,
        [cacheKey]: {
          data: details,
          timestamp: Date.now()
        }
      }));

      setLastUpdate(new Date());
      return details;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching place details';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [cache, cacheExpiry]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache({});
    setLastUpdate(new Date());
  }, []);

  // Clear specific cache entry
  const clearCacheEntry = useCallback((key: string) => {
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });
    setLastUpdate(new Date());
  }, []);

  // Auto refresh cache if enableRealtime is true
  useEffect(() => {
    if (!enableRealtime) return;

    const interval = setInterval(() => {
      Object.entries(cache).forEach(([key, value]) => {
        if (!isCacheValid(value.timestamp)) {
          delete cache[key];
        }
      });
      setCache({ ...cache });
    }, cacheExpiry / 2); // Check every half expiry time

    return () => clearInterval(interval);
  }, [cache, cacheExpiry, enableRealtime]);

  return {
    fetchPlaces,
    fetchPlaceDetails,
    clearCache,
    clearCacheEntry,
    loading,
    error,
    lastUpdate,
    getCacheKey
  };
}

// Custom hook for combining OpenStreetMap and TripAdvisor data
export function useCombinedPlaces() {
  const tripAdvisor = useTripAdvisor();
  const [combinedPlaces, setCombinedPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCombinedPlaces = useCallback(async (
    location: Coordinates,
    type: string,
    radius: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch data from both sources in parallel
      const [osmPlaces, taPlaces] = await Promise.all([
        fetch(`/api/places/osm?lat=${location.lat}&lng=${location.lng}&type=${type}&radius=${radius}`)
          .then(res => res.json()),
        tripAdvisor.fetchPlaces(location, type, radius)
      ]);

      // Merge and deduplicate places
      const mergedPlaces = mergePlaces(osmPlaces, taPlaces);
      setCombinedPlaces(mergedPlaces);
      return mergedPlaces;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching places';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [tripAdvisor]);

  return {
    combinedPlaces,
    fetchCombinedPlaces,
    loading: loading || tripAdvisor.loading,
    error: error || tripAdvisor.error,
    tripAdvisor
  };
}

// Helper function to merge places from different sources
function mergePlaces(osmPlaces: Place[], taPlaces: Place[]): Place[] {
  const mergedMap = new Map<string, Place>();

  // Add OpenStreetMap places
  osmPlaces.forEach(place => {
    const key = `${place.latitude},${place.longitude}`;
    place.source = 'osm';
    mergedMap.set(key, place);
  });

  // Merge TripAdvisor places
  taPlaces.forEach(taPlace => {
    const key = `${taPlace.latitude},${taPlace.longitude}`;
    const existingPlace = mergedMap.get(key);

    if (existingPlace) {
      // Merge data, preferring TripAdvisor data for certain fields
      mergedMap.set(key, {
        ...existingPlace,
        ...taPlace,
        source: 'merged',
        rating: taPlace.rating || existingPlace.rating,
        photo: taPlace.photo || existingPlace.photo,
        details: {
          ...existingPlace.details,
          ...taPlace.details
        }
      });
    } else {
      taPlace.source = 'tripadvisor';
      mergedMap.set(key, taPlace);
    }
  });

  return Array.from(mergedMap.values());
}