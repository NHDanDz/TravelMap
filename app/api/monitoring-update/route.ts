// app/api/monitoring-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { monitoringAreas, alerts } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';

interface UpdateMonitoringRequest {
  id: string;
  status?: 'active' | 'paused';
  name?: string;
  monitorFrequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  riskLevel?: 'low' | 'medium' | 'high';
  autoVerify?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request data
    const data: UpdateMonitoringRequest = await request.json();
    
    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { error: 'Thiếu ID khu vực theo dõi' },
        { status: 400 }
      );
    }
    
    console.log(`Updating monitoring area ${data.id}:`, data);
    
    // Check if the area exists
    const existingArea = await db
      .select()
      .from(monitoringAreas)
      .where(eq(monitoringAreas.id, data.id));
    
    if (existingArea.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy khu vực theo dõi' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (data.status !== undefined) updateData.status = data.status;
    if (data.name) updateData.name = data.name;
    if (data.monitorFrequency) updateData.monitorFrequency = data.monitorFrequency;
    if (data.riskLevel) updateData.riskLevel = data.riskLevel;
    if (data.autoVerify !== undefined) updateData.autoVerify = data.autoVerify;
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    // Update the monitoring area
    await db
      .update(monitoringAreas)
      .set(updateData)
      .where(eq(monitoringAreas.id, data.id));
    
    // Create an alert for status changes
    if (data.status !== undefined) {
      await db.insert(alerts).values({
        type: 'info',
        title: data.status === 'active' ? 'Kích hoạt theo dõi' : 'Tạm dừng theo dõi',
        description: `Khu vực ${existingArea[0].name} đã ${data.status === 'active' ? 'được kích hoạt' : 'tạm dừng'} theo dõi`,
        date: new Date(),
        monitoringAreaId: data.id,
        read: false,
        userId: 'system',
        createdAt: new Date()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Đã cập nhật khu vực theo dõi thành công'
    });
    
  } catch (error) {
    console.error('Error updating monitoring area:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi cập nhật khu vực theo dõi' },
      { status: 500 }
    );
  }
}