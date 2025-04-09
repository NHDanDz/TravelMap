// app/api/tripadvisor/search/route.ts (Updated)
import { NextResponse } from 'next/server';
import { TripAdvisorService } from '@/services/tripAdvisorService';
import { PlaceType } from '@/app/dashboard/Map/types';

export async function GET(request: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY;
    if (!apiKey) {
      console.error('Missing TripAdvisor API key');
      return NextResponse.json(
        { error: 'Missing TripAdvisor API key in environment variables' },
        { status: 500 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const typeParam = searchParams.get('type');
    const radiusParam = searchParams.get('radius');
    const languageParam = searchParams.get('language') || 'vi';

    // Validate required parameters
    if (!latParam || !lngParam || !typeParam) {
      console.error('Missing required parameters:', { lat: latParam, lng: lngParam, type: typeParam });
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          params: { lat: !!latParam, lng: !!lngParam, type: !!typeParam }
        },
        { status: 400 }
      );
    }

    // Parse parameters
    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lngParam);
    const type = typeParam as PlaceType;
    const radius = radiusParam ? parseFloat(radiusParam) / 1000 : 3; // Convert meters to km

    console.log('TripAdvisor search request:', { latitude, longitude, type, radius, language: languageParam });

    // Print environment variable details (don't log the full key)
    console.log('API Key (first 4 chars):', apiKey.substring(0, 4) + '****');

    // Call TripAdvisor service
    const places = await TripAdvisorService.searchPlaces({
      latitude,
      longitude,
      type,
      radius,
      language: languageParam
    });

    console.log(`Found ${places.length} places from TripAdvisor`);
    return NextResponse.json(places);
  } catch (error) {
    console.error('API Error:', error);
    
    // Fallback to mock service
    try {
      console.log('Falling back to mock service...');
      
      // Import mock service dynamically
      const { MockPlacesService } = await import('@/app/dashboard/Map/components/MockPlacesService');
      
      // Get parameters again
      const { searchParams } = new URL(request.url);
      const latParam = searchParams.get('lat');
      const lngParam = searchParams.get('lng');
      const typeParam = searchParams.get('type') as PlaceType;
      const radiusParam = searchParams.get('radius');
      
      if (!latParam || !lngParam || !typeParam) {
        throw new Error("Missing required parameters");
      }
      
      const latitude = parseFloat(latParam);
      const longitude = parseFloat(lngParam);
      const radius = radiusParam ? parseInt(radiusParam) : 1000;
      
      const mockPlaces = await MockPlacesService.searchPlaces(
        latitude,
        longitude,
        typeParam,
        radius
      );
      
      console.log(`Generated ${mockPlaces.length} mock places as fallback`);
      
      // Return mock data with a special header to indicate it's mock data
      return NextResponse.json(mockPlaces, {
        headers: {
          'X-Data-Source': 'mock',
        }
      });
    } catch (mockError) {
      console.error('Mock service also failed:', mockError);
      
      // If everything fails, return the original error
      return NextResponse.json(
        { 
          error: 'Failed to fetch places', 
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  }
}