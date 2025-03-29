// app/api/coordinates/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Phân tích dữ liệu từ request
    const data = await request.json();
    
    // Kiểm tra dữ liệu đầu vào
    if (!data.latitude || !data.longitude || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Coordinates received:', data);

    // Gửi dữ liệu đến server chính thông qua ngrok
    const serverUrl = process.env.COORDINATES_SERVER_URL || 'https://your-ngrok-url.ngrok.io/api/coordinates';

    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_KEY || 'your-api-key'}`
      },
      body: JSON.stringify({
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp
      })
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();

    return NextResponse.json({ 
      success: true, 
      message: 'Coordinates forwarded to main server',
      result 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process coordinates', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}