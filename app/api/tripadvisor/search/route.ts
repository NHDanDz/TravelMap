import { NextResponse } from 'next/server';
import { TripadvisorService } from '@/services/tripAdvisorService';
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

    const { searchParams } = new URL(request.url);
    const latLong = searchParams.get('latLong');
    const category = searchParams.get('category');
    const radius = searchParams.get('radius');
    const language = searchParams.get('language') || 'vi';

    if (!latLong || !category) {
      console.error('Missing required parameters:', { latLong, category });
      return NextResponse.json(
        { error: 'Missing required parameters', params: { latLong: !!latLong, category: !!category } },
        { status: 400 }
      );
    }

    console.log('TripAdvisor search request:', { latLong, category, radius, language });

    // Parse the latLong parameter
    const [lat, lng] = latLong.split(',').map(coord => parseFloat(coord.trim()));
    
    // Convert radius to number (default to 3km if not provided)
    const radiusValue = radius ? parseFloat(radius) : 3;
    
    // Map the category to a PlaceType
    const placeType = mapCategoryToPlaceType(category);

    // Call searchPlaces with the correct parameter structure
    const places = await TripadvisorService.searchPlaces({
      latitude: lat,
      longitude: lng,
      type: placeType,
      radius: radiusValue
    });

    console.log(`Found ${places.length} places from TripAdvisor`);
    return NextResponse.json(places);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch places from TripAdvisor', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        env: {
          hasApiKey: !!process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY
        }
      },
      { status: 500 }
    );
  }
}

// Helper function to map TripAdvisor category to PlaceType
function mapCategoryToPlaceType(category: string): PlaceType {
  switch(category.toLowerCase()) {
    case 'restaurants':
      return 'restaurant';
    case 'hotels':
      return 'hotel';
    case 'attractions':
      return 'tourist_attraction';
    case 'shopping':
      return 'mall';
    default:
      return 'restaurant';
  }
}