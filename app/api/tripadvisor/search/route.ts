// app/api/tripadvisor/search/route.ts
import { NextResponse } from 'next/server';
import { TripAdvisorService } from '@/services/tripAdvisorService';
import { PlaceType } from '@/app/dashboard/Map/types';

/**
 * API endpoint để tìm kiếm địa điểm qua TripAdvisor API
 * 
 * Tham số:
 * - lat: Vĩ độ (bắt buộc)
 * - lng: Kinh độ (bắt buộc)
 * - type: Loại địa điểm cần tìm (bắt buộc)
 * - radius: Bán kính tìm kiếm tính bằng mét (mặc định: 3000m = 3km)
 * - language: Ngôn ngữ kết quả (mặc định: vi)
 * - exact: 'true' để lấy tọa độ chính xác cho các địa điểm (mặc định: false)
 * 
 * Ví dụ: /api/tripadvisor/search?lat=21.0285&lng=105.8542&type=restaurant&radius=2000&language=vi&exact=true
 */
export async function GET(request: Request) {
  const startTime = Date.now();
  console.log(`TripAdvisor search request received at ${new Date().toISOString()}`);

  try {
    // Kiểm tra API key TripAdvisor
    const apiKey = process.env.NEXT_PUBLIC_TRIPADVISOR_API_KEY;
    if (!apiKey) {
      console.error('Missing TripAdvisor API key in environment variables');
      return NextResponse.json(
        { error: 'Missing TripAdvisor API key in environment variables' },
        { status: 500 }
      );
    }

    // Phân tích tham số truy vấn
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    const typeParam = searchParams.get('type');
    const radiusParam = searchParams.get('radius');
    const languageParam = searchParams.get('language') || 'vi';
    const exactParam = searchParams.get('exact') || 'false';

    // Kiểm tra các tham số bắt buộc
    if (!latParam || !lngParam || !typeParam) {
      console.error('Missing required parameters:', { lat: latParam, lng: lngParam, type: typeParam });
      return NextResponse.json(
        { 
          error: 'Missing required parameters', 
          params: { lat: !!latParam, lng: !!lngParam, type: !!typeParam }
        },
        { status: 400 }
      );
    }

    // Phân tích và kiểm tra tham số
    const latitude = parseFloat(latParam);
    const longitude = parseFloat(lngParam);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      console.error('Invalid coordinates:', { latitude, longitude });
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude and longitude must be valid numbers.' },
        { status: 400 }
      );
    }
    
    // Kiểm tra type có hợp lệ không
    const type = typeParam as PlaceType;
    
    // Chuyển đổi và kiểm tra radius
    // Đầu vào là mét, Tripadvisor dùng km
    const radiusInMeters = radiusParam ? parseInt(radiusParam) : 3000;
    const radius = radiusInMeters / 1000; // Convert meters to km for TripAdvisor API
    
    if (isNaN(radius) || radius <= 0) {
      console.error('Invalid radius:', radiusInMeters);
      return NextResponse.json(
        { error: 'Invalid radius. Radius must be a positive number.' },
        { status: 400 }
      );
    }
    
    // Kiểm tra cờ exact
    const useExactCoordinates = exactParam.toLowerCase() === 'true';

    // Log thông tin tìm kiếm
    console.log('TripAdvisor search request details:', { 
      latitude, 
      longitude, 
      type, 
      radiusInMeters,
      radiusInKm: radius,
      language: languageParam,
      exact: useExactCoordinates
    });

    // In thông tin về API key (không in key đầy đủ vì lý do bảo mật)
    const firstChars = apiKey.substring(0, 4);
    const lastChars = apiKey.substring(apiKey.length - 4);
    console.log(`API Key: ${firstChars}****${lastChars} (length: ${apiKey.length})`);

    // Thực hiện tìm kiếm với TripAdvisor API
    try {
      // Chọn phương thức tìm kiếm dựa vào tham số exact
      const places = useExactCoordinates 
        ? await TripAdvisorService.searchPlacesWithExactCoordinates({
            latitude,
            longitude,
            type,
            radius,
            language: languageParam
          })
        : await TripAdvisorService.searchPlaces({
            latitude,
            longitude,
            type,
            radius,
            language: languageParam
          });

      // Tính thời gian thực hiện
      const executionTime = Date.now() - startTime;
      console.log(`Found ${places.length} places from TripAdvisor ${useExactCoordinates ? 'with exact coordinates' : ''} in ${executionTime}ms`);
      
      // Trả về kết quả thành công
      return NextResponse.json(places, {
        headers: {
          'X-Data-Source': 'tripadvisor',
          'X-Execution-Time': executionTime.toString(),
          'X-Result-Count': places.length.toString(),
        }
      });
    } catch (tripadvisorError) {
     
    }
  } catch (error) {
    // Xử lý lỗi tổng thể
    console.error('Unhandled API error:', error);
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}