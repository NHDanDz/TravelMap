// app/api/admin/weather/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function để lấy ngày theo Vietnam timezone
function getVietnamDate(date?: Date): Date {
  const sourceDate = date || new Date();
  return new Date(sourceDate.getTime() + (7 * 60 * 60 * 1000));
}

// Helper function để tạo date range theo Vietnam timezone
function getDateRange(range: string) {
  const vietnamNow = getVietnamDate();
  console.log(`🔍 Creating date range for: ${range}`);
  console.log(`📅 Vietnam current time: ${vietnamNow.toISOString()}`);
  
  let startDate: Date;
  let endDate: Date | undefined;
  
  switch (range) {
    case 'today':
      // Tạo đúng ngày hôm nay theo Vietnam timezone
      const todayStart = new Date(Date.UTC(vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth(), vietnamNow.getUTCDate()));
      const todayEnd = new Date(Date.UTC(vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth(), vietnamNow.getUTCDate() + 1));
      
      console.log(`📅 Vietnam today start: ${todayStart.toISOString()}`);
      console.log(`📅 Vietnam today end: ${todayEnd.toISOString()}`);
      
      return {
        gte: todayStart,
        lt: todayEnd
      };
      
    case 'week':
      // 7 ngày qua từ hôm nay
      const weekAgo = new Date(vietnamNow.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = new Date(Date.UTC(weekAgo.getUTCFullYear(), weekAgo.getUTCMonth(), weekAgo.getUTCDate()));
      
      console.log(`📅 Week start: ${startDate.toISOString()}`);
      
      return {
        gte: startDate
      };
      
    case 'month':
      // Từ đầu tháng hiện tại
      startDate = new Date(Date.UTC(vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth(), 1));
      
      console.log(`📅 Month start: ${startDate.toISOString()}`);
      
      return {
        gte: startDate
      };
      
    case 'year':
      // Từ đầu năm hiện tại
      startDate = new Date(Date.UTC(vietnamNow.getUTCFullYear(), 0, 1));
      
      console.log(`📅 Year start: ${startDate.toISOString()}`);
      
      return {
        gte: startDate
      };
      
    default:
      return undefined;
  }
}

// GET - Lấy danh sách dữ liệu thời tiết
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const cityId = searchParams.get('cityId');
    const condition = searchParams.get('condition');
    const dateRange = searchParams.get('dateRange');
    const sortBy = searchParams.get('sortBy') || 'date';
    
    console.log(`🌐 API Request - dateRange: ${dateRange}, cityId: ${cityId}, condition: ${condition}`);
    
    const skip = (page - 1) * limit;
    const where: any = {};
    
    // Lọc theo thành phố
    if (cityId && cityId !== '') {
      where.cityId = parseInt(cityId);
    }
    
    // Lọc theo tình trạng thời tiết
    if (condition && condition !== '') {
      where.condition = condition;
    }
    
    // Lọc theo thời gian
    if (dateRange && dateRange !== 'all') {
      const dateFilter = getDateRange(dateRange);
      if (dateFilter) {
        where.date = dateFilter;
        console.log(`📊 Date filter applied:`, dateFilter);
      }
    }

    // Xử lý sắp xếp
    let orderBy: any = { date: 'desc' }; // Mặc định sắp xếp theo ngày mới nhất
    
    switch (sortBy) {
      case 'city':
        orderBy = { city: { name: 'asc' } };
        break;
      case 'temp_high':
        orderBy = { temperatureHigh: 'desc' };
        break;
      case 'temp_low':
        orderBy = { temperatureLow: 'desc' };
        break;
      case 'condition':
        orderBy = { condition: 'asc' };
        break;
      case 'date':
      default:
        orderBy = { date: 'desc' };
        break;
    }

    console.log(`🔍 Final where clause:`, JSON.stringify(where, null, 2));

    const [weatherData, totalCount] = await Promise.all([
      prisma.weatherData.findMany({
        where,
        include: {
          city: {
            select: {
              id: true,
              name: true,
              country: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.weatherData.count({ where })
    ]);

    console.log(`📊 Query result: Found ${weatherData.length} records out of ${totalCount} total`);
    
    if (weatherData.length > 0) {
      console.log(`📅 Sample dates from results:`);
      weatherData.slice(0, 3).forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.city?.name}: ${item.date.toISOString()} (VN: ${getVietnamDate(item.date).toISOString().split('T')[0]})`);
      });
    }

    return NextResponse.json({
      data: weatherData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Tạo dữ liệu thời tiết mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cityId,
      date,
      temperatureHigh,
      temperatureLow,
      condition,
      precipitationChance,
      humidity,
      windSpeed
    } = body;

    console.log(`📝 Creating weather data:`, { cityId, date, temperatureHigh, temperatureLow, condition });

    // Validation
    if (!cityId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: cityId, date' },
        { status: 400 }
      );
    }

    // Kiểm tra ngày không được trong tương lai (theo Vietnam timezone)
    const inputDate = new Date(date);
    const vietnamToday = getVietnamDate();
    vietnamToday.setHours(23, 59, 59, 999);
    
    console.log(`📅 Input date: ${inputDate.toISOString()}`);
    console.log(`📅 Vietnam today end: ${vietnamToday.toISOString()}`);
    
    if (inputDate > vietnamToday) {
      return NextResponse.json(
        { error: 'Date cannot be in the future' },
        { status: 400 }
      );
    }

    // Kiểm tra thành phố có tồn tại không
    const city = await prisma.city.findUnique({
      where: { id: parseInt(cityId) }
    });

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Kiểm tra dữ liệu đã tồn tại chưa (unique constraint)
    const existingData = await prisma.weatherData.findUnique({
      where: {
        cityId_date: {
          cityId: parseInt(cityId),
          date: new Date(date)
        }
      }
    });

    if (existingData) {
      return NextResponse.json(
        { error: 'Weather data for this city and date already exists' },
        { status: 409 }
      );
    }

    // Validation cho nhiệt độ
    if (temperatureHigh !== null && temperatureLow !== null) {
      if (parseFloat(temperatureHigh) < parseFloat(temperatureLow)) {
        return NextResponse.json(
          { error: 'High temperature cannot be lower than low temperature' },
          { status: 400 }
        );
      }
    }

    const weatherData = await prisma.weatherData.create({
      data: {
        cityId: parseInt(cityId),
        date: new Date(date),
        temperatureHigh: temperatureHigh ? parseFloat(temperatureHigh) : null,
        temperatureLow: temperatureLow ? parseFloat(temperatureLow) : null,
        condition: condition || null,
        precipitationChance: precipitationChance ? parseFloat(precipitationChance) : null 
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true
          }
        }
      }
    });

    console.log(`✅ Created weather data with ID: ${weatherData.id}`);

    return NextResponse.json({
      success: true,
      data: weatherData
    });
  } catch (error: any) {
    console.error('❌ Error creating weather data:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Weather data for this city and date already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật dữ liệu thời tiết
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Weather data ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      temperatureHigh,
      temperatureLow,
      condition,
      precipitationChance,
      humidity,
      windSpeed
    } = body;

    console.log(`📝 Updating weather data ID: ${id}`);

    // Kiểm tra weather data có tồn tại không
    const existingData = await prisma.weatherData.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingData) {
      return NextResponse.json(
        { error: 'Weather data not found' },
        { status: 404 }
      );
    }

    // Validation cho nhiệt độ
    if (temperatureHigh !== null && temperatureLow !== null) {
      if (parseFloat(temperatureHigh) < parseFloat(temperatureLow)) {
        return NextResponse.json(
          { error: 'High temperature cannot be lower than low temperature' },
          { status: 400 }
        );
      }
    }

    const updatedWeatherData = await prisma.weatherData.update({
      where: { id: parseInt(id) },
      data: {
        temperatureHigh: temperatureHigh ? parseFloat(temperatureHigh) : null,
        temperatureLow: temperatureLow ? parseFloat(temperatureLow) : null,
        condition: condition || null,
        precipitationChance: precipitationChance ? parseFloat(precipitationChance) : null
      },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true
          }
        }
      }
    });

    console.log(`✅ Updated weather data ID: ${id}`);

    return NextResponse.json({
      success: true,
      data: updatedWeatherData
    });
  } catch (error: any) {
    console.error('❌ Error updating weather data:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa dữ liệu thời tiết
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Weather data ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting weather data ID: ${id}`);

    // Kiểm tra weather data có tồn tại không
    const existingData = await prisma.weatherData.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingData) {
      return NextResponse.json(
        { error: 'Weather data not found' },
        { status: 404 }
      );
    }

    await prisma.weatherData.delete({
      where: { id: parseInt(id) }
    });

    console.log(`✅ Deleted weather data ID: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Weather data deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting weather data:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}