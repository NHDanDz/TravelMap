// app/api/monitoring/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { monitoringAreas, landslides, alerts } from '@/app/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Cache for API responses to avoid duplicate requests
const responseCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute cache TTL

interface CheckMonitoringRequest {
  areaId: string;
  boundingBox: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Function to get cached response or process request
function getCachedOrProcess(cacheKey: string, processor: () => Promise<any>) {
  // Check if we have a cached response
  const cachedItem = responseCache.get(cacheKey);
  if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_TTL) {
    console.log('Sử dụng kết quả cache cho:', cacheKey);
    return cachedItem.data;
  }
  
  // Process the request
  return processor().then(result => {
    // Cache the response
    responseCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    });
    
    return result;
  });
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

export async function POST(request: NextRequest) {
  try {
    // Parse request
    const requestData: CheckMonitoringRequest = await request.json();
    
    // Validate input
    if (!requestData.areaId || !requestData.boundingBox) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ. Cần có areaId và boundingBox.' },
        { status: 400 }
      );
    }
    
    const { areaId, boundingBox } = requestData;
    
    // Create cache key
    const cacheKey = `monitoring-check:${areaId}:${JSON.stringify(boundingBox)}`;
    
    // Get cached response or process new request
    const processedResult = await getCachedOrProcess(cacheKey, async () => {
      try {
        console.log(`Xử lý mới cho khu vực: ${areaId}`);
        
        // Check if the monitoring area exists
        const area = await db
          .select()
          .from(monitoringAreas)
          .where(eq(monitoringAreas.id, areaId));
        
        if (area.length === 0) {
          return {
            error: 'Không tìm thấy khu vực giám sát.',
            status: 404
          };
        }
        
        // Find landslides within the bounding box
        const { north, south, east, west } = boundingBox;
        
        // Query database for landslides within the bounding box
        const landslidePoints = await db
          .select()
          .from(landslides)
          .where(
            sql`CAST(${landslides.lat} AS float) BETWEEN ${south} AND ${north} AND
                CAST(${landslides.lng} AS float) BETWEEN ${west} AND ${east}`
          );
        
        console.log(`Found ${landslidePoints.length} landslide points in monitoring area ${areaId}`);
        
        // Simulate detecting new landslides (for demo purposes)
        // In a real application, you would analyze satellite imagery or other data
        const detectedCount = Math.floor(Math.random() * 3); // Randomly detect 0-2 points
        const totalDetectedCount = landslidePoints.length + detectedCount;
        
        // Update the monitoring area's last checked time and detected points
        await db
          .update(monitoringAreas)
          .set({
            lastChecked: new Date(),
            detectedPoints: totalDetectedCount,
            // Update risk level based on detected points
            riskLevel: totalDetectedCount > 5 ? 'high' : totalDetectedCount > 0 ? 'medium' : 'low'
          })
          .where(eq(monitoringAreas.id, areaId));
        
        // Create an alert if new landslides are detected
        if (detectedCount > 0) {
          await db.insert(alerts).values({
            type: 'warning',
            title: 'Phát hiện sạt lở mới',
            description: `Phát hiện ${detectedCount} điểm sạt lở mới trong khu vực "${area[0].name}"`,
            date: new Date(),
            monitoringAreaId: areaId,
            read: false,
            userId: 'system',
            createdAt: new Date()
          });
        }
        
        // Return successful result
        return {
          success: true,
          areaId,
          lastChecked: new Date().toISOString(),
          detectedPoints: totalDetectedCount,
          newDetections: detectedCount
        };
        
      } catch (dbError) {
        console.error('Lỗi database khi kiểm tra khu vực:', dbError);
        return {
          error: 'Lỗi khi truy vấn cơ sở dữ liệu.',
          status: 500
        };
      }
    });
    
    // Check if the processed result contains an error
    if (processedResult.error) {
      return NextResponse.json(
        { error: processedResult.error },
        { status: processedResult.status || 500 }
      );
    }
    
    // Return the successful result
    return NextResponse.json(processedResult);
    
  } catch (error) {
    console.error('Lỗi khi xử lý yêu cầu kiểm tra khu vực:', error);
    
    return NextResponse.json(
      { error: 'Lỗi server khi xử lý yêu cầu.' },
      { status: 500 }
    );
  }
}