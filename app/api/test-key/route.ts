import { NextResponse } from 'next/server';

export async function GET() {
  // Kiểm tra xem API key có tồn tại không
  const apiKey = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY;
  
  // Không trả về API key đầy đủ vì lý do bảo mật
  return NextResponse.json({
    exists: !!apiKey && apiKey.length > 0,
    timestamp: new Date().toISOString()
  });
}