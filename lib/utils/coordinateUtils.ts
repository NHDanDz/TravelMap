// lib/utils/coordinateUtils.ts

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  address?: string;
  type?: string;
}

export class CoordinateUtils {
  /**
   * Validate if coordinates are valid
   */
  static isValidCoordinates(lat: number | string, lng: number | string): boolean {
    const latitude = typeof lat === 'string' ? parseFloat(lat) : lat;
    const longitude = typeof lng === 'string' ? parseFloat(lng) : lng;
    
    return !isNaN(latitude) && 
           !isNaN(longitude) && 
           latitude >= -90 && 
           latitude <= 90 && 
           longitude >= -180 && 
           longitude <= 180 &&
           latitude !== 0 && 
           longitude !== 0;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLng = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate the center point of multiple coordinates
   */
  static calculateCenter(coordinates: Coordinates[]): Coordinates {
    if (coordinates.length === 0) {
      return { latitude: 0, longitude: 0 };
    }

    if (coordinates.length === 1) {
      return coordinates[0];
    }

    let totalLat = 0;
    let totalLng = 0;
    
    coordinates.forEach(coord => {
      totalLat += coord.latitude;
      totalLng += coord.longitude;
    });

    return {
      latitude: totalLat / coordinates.length,
      longitude: totalLng / coordinates.length
    };
  }

  /**
   * Calculate bounding box for coordinates
   */
  static calculateBounds(coordinates: Coordinates[]): {
    southwest: Coordinates;
    northeast: Coordinates;
  } | null {
    if (coordinates.length === 0) return null;

    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach(coord => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    return {
      southwest: { latitude: minLat, longitude: minLng },
      northeast: { latitude: maxLat, longitude: maxLng }
    };
  }

  /**
   * Filter places that have valid coordinates
   */
  static filterPlacesWithValidCoordinates(places: Place[]): Place[] {
    return places.filter(place => 
      this.isValidCoordinates(place.latitude, place.longitude)
    );
  }

  /**
   * Sort places by distance from a reference point
   */
  static sortPlacesByDistance(
    places: Place[], 
    referencePoint: Coordinates
  ): Place[] {
    return places
      .filter(place => this.isValidCoordinates(place.latitude, place.longitude))
      .map(place => ({
        ...place,
        distanceFromReference: this.calculateDistance(
          referencePoint,
          {
            latitude: parseFloat(place.latitude),
            longitude: parseFloat(place.longitude)
          }
        )
      }))
      .sort((a, b) => (a.distanceFromReference || 0) - (b.distanceFromReference || 0))
      .map(({ distanceFromReference, ...place }) => place);
  }

  /**
   * Get places within a certain radius from a point
   */
  static getPlacesWithinRadius(
    places: Place[],
    center: Coordinates,
    radiusKm: number
  ): Place[] {
    return places.filter(place => {
      if (!this.isValidCoordinates(place.latitude, place.longitude)) {
        return false;
      }

      const distance = this.calculateDistance(
        center,
        {
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude)
        }
      );

      return distance <= radiusKm;
    });
  }

  /**
   * Optimize route order using nearest neighbor algorithm
   */
  static optimizeRouteOrder(places: Place[], startIndex = 0): Place[] {
    const validPlaces = this.filterPlacesWithValidCoordinates(places);
    
    if (validPlaces.length <= 2) return validPlaces;

    const coordinates = validPlaces.map(place => ({
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude)
    }));

    // Calculate distance matrix
    const distances: number[][] = [];
    for (let i = 0; i < coordinates.length; i++) {
      distances[i] = [];
      for (let j = 0; j < coordinates.length; j++) {
        if (i === j) {
          distances[i][j] = 0;
        } else {
          distances[i][j] = this.calculateDistance(coordinates[i], coordinates[j]);
        }
      }
    }

    // Nearest neighbor algorithm
    const visited = new Set<number>();
    const route = [startIndex];
    visited.add(startIndex);

    let current = startIndex;
    while (visited.size < validPlaces.length) {
      let nearest = -1;
      let minDistance = Infinity;

      for (let i = 0; i < validPlaces.length; i++) {
        if (!visited.has(i) && distances[current][i] < minDistance) {
          minDistance = distances[current][i];
          nearest = i;
        }
      }

      if (nearest !== -1) {
        route.push(nearest);
        visited.add(nearest);
        current = nearest;
      }
    }

    return route.map(index => validPlaces[index]);
  }

  /**
   * Calculate total route distance
   */
  static calculateTotalRouteDistance(places: Place[]): number {
    const validPlaces = this.filterPlacesWithValidCoordinates(places);
    
    if (validPlaces.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < validPlaces.length - 1; i++) {
      const coord1 = {
        latitude: parseFloat(validPlaces[i].latitude),
        longitude: parseFloat(validPlaces[i].longitude)
      };
      const coord2 = {
        latitude: parseFloat(validPlaces[i + 1].latitude),
        longitude: parseFloat(validPlaces[i + 1].longitude)
      };
      
      totalDistance += this.calculateDistance(coord1, coord2);
    }

    return totalDistance;
  }

  /**
   * Format distance for display
   */
  static formatDistance(kilometers: number): string {
    if (kilometers < 1) {
      return `${Math.round(kilometers * 1000)} m`;
    } else if (kilometers < 10) {
      return `${kilometers.toFixed(1)} km`;
    } else {
      return `${Math.round(kilometers)} km`;
    }
  }

  /**
   * Geocode address to coordinates (requires external API)
   */
  static async geocodeAddress(address: string, apiKey: string): Promise<Coordinates | null> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${apiKey}&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        return { latitude, longitude };
      }
      
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  static async reverseGeocode(coordinates: Coordinates, apiKey: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates.longitude},${coordinates.latitude}.json?access_token=${apiKey}&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Validate and fix place coordinates
   */
  static async validateAndFixPlaceCoordinates(
    place: Place, 
    apiKey?: string
  ): Promise<Place> {
    // If coordinates are valid, return as is
    if (this.isValidCoordinates(place.latitude, place.longitude)) {
      return place;
    }

    // If we have an API key and address, try geocoding
    if (apiKey && place.address) {
      const coordinates = await this.geocodeAddress(place.address, apiKey);
      if (coordinates) {
        return {
          ...place,
          latitude: coordinates.latitude.toString(),
          longitude: coordinates.longitude.toString()
        };
      }
    }

    // Return original place if we can't fix coordinates
    console.warn(`Cannot validate coordinates for place: ${place.name}`);
    return place;
  }

  /**
   * Generate Mapbox static map URL for a route
   */
  static generateStaticMapUrl(
    places: Place[],
    options: {
      width?: number;
      height?: number;
      style?: string;
      accessToken: string;
    }
  ): string {
    const { width = 600, height = 400, style = 'streets-v12', accessToken } = options;
    
    const validPlaces = this.filterPlacesWithValidCoordinates(places);
    if (validPlaces.length === 0) return '';

    // Create markers for each place
    const markers = validPlaces.map((place, index) => 
      `pin-s-${index + 1}+ff0000(${place.longitude},${place.latitude})`
    ).join(',');

    // Calculate auto-fit bounds
    const coordinates = validPlaces.map(place => ({
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude)
    }));
    
    const bounds = this.calculateBounds(coordinates);
    const center = this.calculateCenter(coordinates);

    return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${markers}/auto/${width}x${height}?access_token=${accessToken}`;
  }
}

export default CoordinateUtils;