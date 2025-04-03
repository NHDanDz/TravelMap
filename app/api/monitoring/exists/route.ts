// app/api/monitoring/exists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { monitoringAreas } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';

interface CheckExistsRequest {
  landslideId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const requestData: CheckExistsRequest = await request.json();
    
    // Validate input
    if (!requestData.landslideId) {
      return NextResponse.json(
        { error: 'Thiếu landslideId' },
        { status: 400 }
      );
    }
    
    // Check if area with same landslideId exists
    const existingArea = await db
      .select()
      .from(monitoringAreas)
      .where(eq(monitoringAreas.landslideId, requestData.landslideId));
    
    if (existingArea.length > 0) {
      return NextResponse.json({
        exists: true,
        area: existingArea[0]
      });
    }
    
    // No matching area found
    return NextResponse.json({ exists: false });
    
  } catch (error) {
    console.error('Error checking monitoring area existence:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi kiểm tra khu vực theo dõi.' },
      { status: 500 }
    );
  }
}