import { NextResponse } from 'next/server';
import { PlaceType } from '@/app/dashboard/Map/types';
// Import the existing service instance without creating a naming conflict
import { TripadvisorService as TripAdvisorAPI } from '@/services/tripAdvisorService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'check';
    
    // Check if API key exists
    if (action === 'check') {
      const apiKey = process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY;
      return NextResponse.json({
        exists: !!apiKey && apiKey.length > 0,
        timestamp: new Date().toISOString()
      });
    }
    
    // Search for places
    if (action === 'search') {
      const lat = searchParams.get('lat');
      const lng = searchParams.get('lng');
      const type = searchParams.get('type') as PlaceType;
      const radius = searchParams.get('radius');
      
      if (!lat || !lng || !type) {
        return NextResponse.json(
          { error: 'Missing required search parameters (lat, lng, type)' },
          { status: 400 }
        );
      }
      
      const results = await TripAdvisorAPI.searchPlaces({
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        type: type,
        radius: radius ? parseFloat(radius) : 3
      });
      
      return NextResponse.json(results);
    }
    
    // Get place details
    if (action === 'details') {
      const id = searchParams.get('id');
      
      if (!id) {
        return NextResponse.json(
          { error: 'Missing place ID parameter' },
          { status: 400 }
        );
      }
      
      const details = await TripAdvisorAPI.getPlaceDetails(id);
      return NextResponse.json(details);
    }
    
    return NextResponse.json(
      { error: 'Invalid action. Use "check", "search", or "details"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('TripAdvisor test API error:', error);
    return NextResponse.json(
      { 
        error: 'TripAdvisor API test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}