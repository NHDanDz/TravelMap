// app/api/admin/weather/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách dữ liệu thời tiết
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const cityId = searchParams.get('cityId');
    const condition = searchParams.get('condition');
    const dateRange = searchParams.get('dateRange');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    // Lọc theo thành phố
    if (cityId) {
      where.cityId = parseInt(cityId);
    }
    
    // Lọc theo tình trạng thời tiết
    if (condition) {
      where.condition = condition;
    }
    
    // Lọc theo thời gian
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      where.date = {
        gte: startDate
      };
    }

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
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.weatherData.count({ where })
    ]);

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
    console.error('Error fetching weather data:', error);
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

    // Validation
    if (!cityId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: cityId, date' },
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

    const weatherData = await prisma.weatherData.create({
      data: {
        cityId: parseInt(cityId),
        date: new Date(date),
        temperatureHigh: temperatureHigh ? parseFloat(temperatureHigh) : null,
        temperatureLow: temperatureLow ? parseFloat(temperatureLow) : null,
        condition: condition || null,
        precipitationChance: precipitationChance ? parseFloat(precipitationChance) : null,
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

    return NextResponse.json({
      success: true,
      data: weatherData
    });
  } catch (error: any) {
    console.error('Error creating weather data:', error);
    
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