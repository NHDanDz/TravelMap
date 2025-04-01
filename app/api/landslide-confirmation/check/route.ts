// app/api/landslide-confirmation/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { landslides } from '@/app/lib/db/schema';
import { and, gte, lte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

interface CheckCoordinatesRequest {
  lat: number;
  lng: number;
  tolerance?: number; // Độ dung sai (độ) để kiểm tra các điểm gần nhau
}

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const requestData: CheckCoordinatesRequest = await request.json();
    
    // Validate input
    if (requestData.lat === undefined || requestData.lng === undefined) {
      return NextResponse.json(
        { error: 'Thiếu dữ liệu tọa độ (lat/lng)' },
        { status: 400 }
      );
    }
    
    // Lấy tọa độ cần kiểm tra
    const { lat, lng, tolerance = 0.0001 } = requestData; // Mặc định dung sai khoảng 10m
    
    // Tính toán phạm vi tọa độ để tìm kiếm
    const minLat = lat - tolerance;
    const maxLat = lat + tolerance;
    const minLng = lng - tolerance;
    const maxLng = lng + tolerance;
    
    try {
      // Query database for landslides with similar coordinates using SQL cast
      const existingLandslides = await db
        .select()
        .from(landslides)
        .where(
          and(
            gte(sql`CAST(${landslides.lat} AS float)`, minLat),
            lte(sql`CAST(${landslides.lat} AS float)`, maxLat),
            gte(sql`CAST(${landslides.lng} AS float)`, minLng),
            lte(sql`CAST(${landslides.lng} AS float)`, maxLng)
          )
        );
      
      // Check if we found any existing landslides
      if (existingLandslides.length > 0) {
        // Return the first matching landslide
        const existingLandslide = existingLandslides[0];
        
        return NextResponse.json({
          exists: true,
          landslide: {
            id: existingLandslide.id,
            name: existingLandslide.name,
            lat: parseFloat(existingLandslide.lat),
            lng: parseFloat(existingLandslide.lng),
            status: existingLandslide.status,
            detectedAt: existingLandslide.first_detected_at
          }
        });
      }
      
      // No matching landslides found
      return NextResponse.json({ exists: false });
      
    } catch (dbError) {
      console.error('Database error when checking coordinates:', dbError);
      
      // If database is not available or error occurs, return false to allow form submission
      return NextResponse.json(
        { 
          exists: false, 
          warning: 'Không thể kết nối đến cơ sở dữ liệu để kiểm tra tọa độ' 
        }
      );
    }
    
  } catch (error) {
    console.error('Error while checking coordinates:', error);
    
    return NextResponse.json(
      { error: 'Lỗi server khi kiểm tra tọa độ.' },
      { status: 500 }
    );
  }
}