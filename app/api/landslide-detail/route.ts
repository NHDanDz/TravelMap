// app/api/landslide-detail/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { landslides } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';

// Fallback data for when database access fails
const fallbackLandslide = {
  id: 'fallback-id',
  name: 'Fallback Landslide Data',
  coordinates: {
    lat: 21.0285,
    lng: 105.8542
  },
  detectedAt: new Date().toISOString(),
  status: 'high_risk',
  details: {
    affectedArea: '25 km²',
    potentialImpact: 'Unknown',
    lastUpdate: new Date().toISOString()
  },
  history: [
    {
      date: new Date().toISOString().split('T')[0],
      status: 'detected',
      note: 'Initial detection'
    }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Function to safely access properties that might be null/undefined
const safeGet = (obj: any, path: string, defaultValue: any = '') => {
  try {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) return defaultValue;
      current = current[part];
    }
    
    return current === null || current === undefined ? defaultValue : current;
  } catch (e) {
    return defaultValue;
  }
};

// GET endpoint để lấy chi tiết 1 điểm sạt lở theo ID
export async function GET(request: NextRequest) {
  try {
    // Lấy ID từ query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Thiếu tham số ID' },
        { status: 400 }
      );
    }
    
    // Log the request for debugging
    console.log(`Getting landslide details for ID: ${id}`);
    
    try {
      // Lấy dữ liệu từ database với error handling
      const landslideRecord = await db
        .select()
        .from(landslides)
        .where(eq(landslides.id, id));
      
      console.log('Query result:', landslideRecord);
      
      // Nếu không tìm thấy dữ liệu
      if (!landslideRecord || landslideRecord.length === 0) {
        console.log(`No landslide found with ID: ${id}`);
        return NextResponse.json(
          { error: 'Không tìm thấy điểm sạt lở với ID đã cung cấp' },
          { status: 404 }
        );
      }
      
      const record = landslideRecord[0];
      console.log('Raw record:', record);
      
      // Xử lý trường lịch sử
      let history = [];
      try {
        const historyStr = safeGet(record, 'history', '[]');
        history = typeof historyStr === 'string' ? JSON.parse(historyStr) : (Array.isArray(historyStr) ? historyStr : []);
      } catch (e) {
        console.error('Lỗi khi parse lịch sử JSON:', e);
        history = [];
      }
      
      // Handle various column name possibilities
      const detectedAt = safeGet(record, 'first_detected_at') || 
                         safeGet(record, 'detectedAt') || 
                         safeGet(record, 'detected_at') || 
                         new Date();
                         
      const lastUpdate = safeGet(record, 'last_update') || 
                         safeGet(record, 'lastUpdate') || 
                         new Date();
                         
      const createdAt = safeGet(record, 'created_at') || 
                        safeGet(record, 'createdAt') || 
                        new Date();
                        
      const updatedAt = safeGet(record, 'updated_at') || 
                        safeGet(record, 'updatedAt') || 
                        new Date();
      
      // Định dạng dữ liệu phản hồi
      const formattedLandslide = {
        id: safeGet(record, 'id'),
        name: safeGet(record, 'name'),
        coordinates: {
          lat: parseFloat(safeGet(record, 'lat', '0')),
          lng: parseFloat(safeGet(record, 'lng', '0'))
        },
        detectedAt: detectedAt instanceof Date ? detectedAt.toISOString() : new Date(detectedAt).toISOString(),
        status: safeGet(record, 'status', 'unknown'),
        details: {
          affectedArea: safeGet(record, 'affected_area') || safeGet(record, 'affectedArea', ''),
          potentialImpact: safeGet(record, 'potential_impact') || safeGet(record, 'potentialImpact', ''),
          lastUpdate: lastUpdate instanceof Date ? lastUpdate.toISOString() : new Date(lastUpdate).toISOString()
        },
        history: history,
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString(),
        updatedAt: updatedAt instanceof Date ? updatedAt.toISOString() : new Date(updatedAt).toISOString()
      };
      
      // Trả về kết quả
      return NextResponse.json(formattedLandslide);
    
    } catch (dbError) {
      console.error('Database error when getting landslide details:', dbError);
      
      // Return fallback data with the requested ID
      const fallbackWithId = {
        ...fallbackLandslide,
        id: id
      };
      
      return NextResponse.json(fallbackWithId);
    }
    
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết điểm sạt lở:', error);
    
    // Return fallback data in case of any error
    return NextResponse.json(fallbackLandslide);
  }
}