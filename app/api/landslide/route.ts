// app/api/landslide/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Cache for recent API responses to avoid duplicate requests
const responseCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

// Function to get cached response or fetch new one
async function getCachedOrFetch(url: string, options: RequestInit) {
  const cacheKey = `${url}:${JSON.stringify(options.body)}`;
  
  // Check if we have a cached response
  const cachedItem = responseCache.get(cacheKey);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_TTL) {
    console.log('Using cached response for:', url);
    return cachedItem.data;
  }
  
  // Fetch fresh data
  console.log('Fetching fresh data from:', url);
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  responseCache.set(cacheKey, {
    timestamp: Date.now(),
    data
  });
  
  return data;
}

// Clean up expired cache items periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      responseCache.delete(key);
    }
  }
}, 60000); // Check every minute

// API proxy to handle requests between client and ngrok, avoiding CORS issues
export async function POST(request: NextRequest) {
  try {
    // Get data from request
    const requestData = await request.json();
    
    // Get ngrok URL from environment variable
    const ngrokUrl = process.env.NEXT_PUBLIC_COORDINATES_SERVER_URL || 'https://f6c3-27-72-102-101.ngrok-free.app/api/landslide';
    
    // Forward request to ngrok
    const data = await getCachedOrFetch(ngrokUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || "10102003"}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(requestData),
    });
    
    // Return response from ngrok
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to ngrok:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}

// GET endpoint for status checking
export async function GET(request: NextRequest) {
  try {
    // Get landslide_id from URL
    const url = new URL(request.url);
    const landslideId = url.searchParams.get('id');
    
    if (!landslideId) {
      return NextResponse.json(
        { error: 'Missing ID parameter' },
        { status: 400 }
      );
    }
    
    // Get ngrok URL from environment variable
    const ngrokBaseUrl = process.env.NEXT_PUBLIC_COORDINATES_SERVER_URL ;
    const ngrokUrl = `${ngrokBaseUrl}/${landslideId}`;
    
    // Use cache for GET requests to prevent redundant calls
    const data = await getCachedOrFetch(ngrokUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY || "10102003"}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    // Return response from ngrok
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying request to ngrok:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}