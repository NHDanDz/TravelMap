// app/api/landslide-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { landslides, alerts } from '@/app/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { and, between, gte, lte } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Định nghĩa kiểu dữ liệu 
interface Coordinates {
  lat: number;
  lng: number;
}

interface LandslideDetail {
  affectedArea: string;
  potentialImpact: string;
  lastUpdate: string;
}

interface HistoryItem {
  date: string;
  status: string;
  note: string;
}

interface LandslideData {
  id?: string;
  name: string;
  coordinates: Coordinates;
  detectedAt: string;
  status: 'high_risk' | 'active' | 'stabilized' | 'monitored' | 'remediated';
  details: LandslideDetail;
  history: HistoryItem[];
  note?: string;
  detectionResultId?: string;
  originalCoordinates?: any[];
  image?: string | null;
}

// Hàm kiểm tra tọa độ đã tồn tại trong database hay chưa
async function checkCoordinateExists(lat: number, lng: number, tolerance: number = 0.0001) {
  try {
    // Tính toán phạm vi tọa độ để tìm kiếm
    const minLat = lat - tolerance;
    const maxLat = lat + tolerance;
    const minLng = lng - tolerance;
    const maxLng = lng + tolerance;
    
    // Tìm kiếm trong database sử dụng phương pháp khác để tránh vấn đề kiểu dữ liệu
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
    
    return {
      exists: existingLandslides.length > 0,
      landslide: existingLandslides.length > 0 ? existingLandslides[0] : null
    };
  } catch (error) {
    console.error('Error checking coordinates in database:', error);
    // Trong trường hợp lỗi, coi như không tìm thấy để cho phép tiếp tục
    return { exists: false, landslide: null };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Lấy dữ liệu từ request
    const formData: LandslideData = await request.json();
    
    // Kiểm tra dữ liệu cần thiết
    if (!formData.name || !formData.coordinates) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ. Cần có tên và tọa độ.' },
        { status: 400 }
      );
    }
    
    // Kiểm tra xem tọa độ đã tồn tại trong database chưa
    const { exists, landslide: existingLandslide } = await checkCoordinateExists(
      formData.coordinates.lat,
      formData.coordinates.lng
    );
    
    // Nếu tọa độ đã tồn tại, trả về thông báo lỗi
    if (exists && existingLandslide) {
      return NextResponse.json(
        { 
          error: 'Tọa độ đã tồn tại trong hệ thống.', 
          duplicate: true,
          landslide: {
            id: existingLandslide.id,
            name: existingLandslide.name,
            lat: existingLandslide.lat,
            lng: existingLandslide.lng,
            status: existingLandslide.status,
            detectedAt: existingLandslide.first_detected_at
          }
        },
        { status: 409 } // Conflict status code
      );
    }
    
    // Tạo ID nếu chưa có
    const id = formData.id || `LS${Date.now().toString().slice(-6)}`;
    
    try {
      // Bắt đầu giao dịch dữ liệu
      // Thêm dữ liệu sạt lở vào database - tương thích với schema
      await db.insert(landslides).values({
        id: id,
        name: formData.name,
        lat: formData.coordinates.lat.toString(),
        lng: formData.coordinates.lng.toString(),
        first_detected_at: new Date(formData.detectedAt),
        status: formData.status,
        affected_area: formData.details.affectedArea,
        potential_impact: formData.details.potentialImpact,
        last_update: new Date(formData.details.lastUpdate),
        history: JSON.stringify(formData.history),
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Tạo cảnh báo khi xác nhận sạt lở
      await db.insert(alerts).values({
        type: 'info',
        title: 'Xác nhận điểm sạt lở',
        description: `Đã xác nhận điểm sạt lở tại: ${formData.name}`,
        date: new Date(),
        landslide_id: id,
        read: false,
        user_id: 'system', // Có thể thay đổi thành ID người dùng thực tế
        created_at: new Date()
      });
      
      // Trả về kết quả thành công
      return NextResponse.json({
        success: true,
        message: `Đã xác nhận và lưu điểm sạt lở: ${formData.name}`,
        id
      });
    } catch (dbError) {
      console.error('Lỗi database khi lưu điểm sạt lở:', dbError);
      return NextResponse.json(
        { error: 'Lỗi khi lưu dữ liệu vào cơ sở dữ liệu.' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Lỗi khi xử lý yêu cầu xác nhận điểm sạt lở:', error);
    
    return NextResponse.json(
      { error: 'Lỗi server khi xử lý yêu cầu.' },
      { status: 500 }
    );
  }
}

// GET endpoint để lấy danh sách điểm sạt lở đã xác nhận
export async function GET(request: NextRequest) {
  try {
    // Lấy dữ liệu từ database sử dụng Drizzle ORM
    const landslideRecords = await db.select().from(landslides);
    
    // Chuyển đổi dữ liệu để phù hợp với định dạng cần thiết
    const formattedLandslides = landslideRecords.map((record: any) => {
      let history: HistoryItem[] = [];
      try {
        history = JSON.parse(record.history || '[]');
      } catch (e) {
        console.error('Lỗi parse history JSON:', e);
      }
      
      return {
        id: record.id,
        name: record.name,
        coordinates: {
          lat: parseFloat(record.lat),
          lng: parseFloat(record.lng)
        },
        detectedAt: record.first_detected_at.toISOString(),
        status: record.status,
        details: {
          affectedArea: record.affected_area || '',
          potentialImpact: record.potential_impact || '',
          lastUpdate: record.last_update.toISOString()
        },
        history: history,
        createdAt: record.created_at.toISOString(),
        updatedAt: record.updated_at.toISOString()
      };
    });
    
    // Trả về kết quả
    return NextResponse.json(formattedLandslides);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách điểm sạt lở:', error);
    
    return NextResponse.json(
      { error: 'Lỗi server khi lấy dữ liệu.' },
      { status: 500 }
    );
  }
}