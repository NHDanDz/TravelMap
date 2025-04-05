// app/api/places/[id]/route.ts
import { NextResponse } from 'next/server';
import { FoursquareService } from '@/services/foursquareService';

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

    console.log('Fetching details for place:', id);

    const placeDetails = await FoursquareService.getPlaceDetails(id);
    
    if (!placeDetails) {
      return NextResponse.json(
        { error: 'Place not found', id },
        { status: 404 }
      );
    }

    return NextResponse.json(placeDetails);
  } catch (error) {
    console.error('API Error:', error);
    
    // Trả về lỗi có định dạng JSON hợp lệ
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