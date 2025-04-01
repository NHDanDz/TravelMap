// app/api/landslide-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { landslides, alerts } from '@/app/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

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
  status: 'high_risk' | 'active' | 'stabilized' | 'monitored';
  details: LandslideDetail;
  history: HistoryItem[];
  note?: string;
  detectionResultId?: string;
  originalCoordinates?: any[];
  image?: string | null;
}

// Định nghĩa interface cho record từ bảng landslides
interface LandslideRecord {
  id: string;
  name: string;
  lat: string;
  lng: string;
  detectedAt: Date;
  status: 'high_risk' | 'active' | 'stabilized' | 'monitored';
  affectedArea: string | null;
  potentialImpact: string | null;
  lastUpdate: Date;
  history: string | null;
  createdAt: Date;
  updatedAt: Date;
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
        detectedAt: new Date(formData.detectedAt),
        status: formData.status,
        affectedArea: formData.details.affectedArea,
        potentialImpact: formData.details.potentialImpact,
        lastUpdate: new Date(formData.details.lastUpdate),
        history: JSON.stringify(formData.history),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Tạo cảnh báo khi xác nhận sạt lở
      await db.insert(alerts).values({
        type: 'info',
        title: 'Xác nhận điểm sạt lở',
        description: `Đã xác nhận điểm sạt lở tại: ${formData.name}`,
        date: new Date(),
        landslideId: id,
        read: false,
        userId: 'system', // Có thể thay đổi thành ID người dùng thực tế
        createdAt: new Date()
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
    const formattedLandslides = landslideRecords.map((record: LandslideRecord) => {
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
        detectedAt: record.detectedAt.toISOString(),
        status: record.status,
        details: {
          affectedArea: record.affectedArea || '',
          potentialImpact: record.potentialImpact || '',
          lastUpdate: record.lastUpdate.toISOString()
        },
        history: history,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString()
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