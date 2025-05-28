import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing place ID' },
        { status: 400 }
      );
    }

    console.log('Fetching photos for TripAdvisor place:', id);

    // Get the API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing TripAdvisor API key' },
        { status: 500 }
      );
    }

    // Build the URL for the TripAdvisor API
    const url = `https://api.content.tripadvisor.com/api/v1/location/${id}/photos?key=${apiKey}&language=vi`;
    
    // Make the request to the TripAdvisor API
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TripAdvisor API error:', response.status, errorText);
      return NextResponse.json(
        { error: `TripAdvisor API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch place photos from TripAdvisor', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}