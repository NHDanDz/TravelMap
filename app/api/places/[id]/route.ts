import { NextResponse } from 'next/server';
import { TripAdvisorService } from '@/services/tripAdvisorService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing place ID' },
        { status: 400 }
      );
    }

    console.log('Fetching place details for ID:', id);

    // Try to get place details from TripAdvisor
    let placeDetails = null;
    try {
      placeDetails = await TripAdvisorService.getPlaceDetails(id);
    } catch (error) {
      console.error('Error fetching from TripAdvisor:', error);
    }

    if (!placeDetails) {
      return NextResponse.json(
        { error: 'Place not found', id },
        { status: 404 }
      );
    }

    return NextResponse.json(placeDetails);
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch place details', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}