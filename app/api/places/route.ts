// app/api/places/route.ts
import { NextResponse } from 'next/server';
import { Place, PlaceType } from '@/app/dashboard/Map/types';
import { FoursquareService } from '@/services/foursquareService';

export async function GET(request: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY;
    if (!apiKey) {
      console.error('Missing Foursquare API key');
      return NextResponse.json(
        { error: 'Missing Foursquare API key in environment variables' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const type = searchParams.get('type');
    const radius = searchParams.get('radius');

    if (!lat || !lng || !type || !radius) {
      console.error('Missing required parameters:', { lat, lng, type, radius });
      return NextResponse.json(
        { error: 'Missing required parameters', params: { lat: !!lat, lng: !!lng, type: !!type, radius: !!radius } },
        { status: 400 }
      );
    }

    console.log('Search request:', { lat, lng, type, radius });

    // Validate type parameter against PlaceType
    const validTypes: PlaceType[] = [
      'restaurant', 'fast_food', 'cafe', 'bar', 'food_court', 'street_food',
      'hotel', 'hostel', 'apartment', 'guest_house',
      'tourist_attraction', 'museum', 'temple', 'historic', 'viewpoint',
      'entertainment', 'cinema', 'karaoke',
      'mall', 'supermarket', 'market',
      'hospital', 'pharmacy'
    ];

    if (!validTypes.includes(type as PlaceType)) {
      console.error('Invalid place type:', type);
      return NextResponse.json(
        { error: 'Invalid place type', validTypes },
        { status: 400 }
      );
    }

    const places = await FoursquareService.searchPlaces(
      parseFloat(lat),
      parseFloat(lng),
      type as PlaceType,
      parseInt(radius)
    );

    console.log(`Found ${places.length} places from Foursquare`);
    return NextResponse.json(places);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch places', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        env: {
          hasApiKey: !!process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY
        }
      },
      { status: 500 }
    );
  }
}