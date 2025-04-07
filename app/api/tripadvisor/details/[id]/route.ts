import { NextResponse } from 'next/server';
import { TripadvisorService } from '@/services/tripAdvisorService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing place ID' },
        { status: 400 }
      );
    }

    console.log('Fetching details for TripAdvisor place:', id);

    const placeDetails = await TripadvisorService.getPlaceDetails(id);
    
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
        error: 'Failed to fetch place details from TripAdvisor', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}