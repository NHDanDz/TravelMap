// app/api/admin/weather/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// GET - Lấy chi tiết dữ liệu thời tiết
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const weatherId = parseInt(id);

    if (isNaN(weatherId)) {
      return NextResponse.json(
        { error: 'Invalid weather data ID' },
        { status: 400 }
      );
    }

    const weatherData = await prisma.weatherData.findUnique({
      where: { id: weatherId },
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true,
            latitude: true,
            longitude: true
          }
        }
      }
    });

    if (!weatherData) {
      return NextResponse.json(
        { error: 'Weather data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật dữ liệu thời tiết
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const weatherId = parseInt(id);

    if (isNaN(weatherId)) {
      return NextResponse.json(
        { error: 'Invalid weather data ID' },
        { status: 400 }
      );
    }

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

    // Kiểm tra dữ liệu có tồn tại không
    const existingData = await prisma.weatherData.findUnique({
      where: { id: weatherId }
    });

    if (!existingData) {
      return NextResponse.json(
        { error: 'Weather data not found' },
        { status: 404 }
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

    // Kiểm tra trùng lặp (trừ chính nó)
    if (parseInt(cityId) !== existingData.cityId || new Date(date).getTime() !== existingData.date.getTime()) {
      const duplicateData = await prisma.weatherData.findUnique({
        where: {
          cityId_date: {
            cityId: parseInt(cityId),
            date: new Date(date)
          }
        }
      });

      if (duplicateData && duplicateData.id !== weatherId) {
        return NextResponse.json(
          { error: 'Weather data for this city and date already exists' },
          { status: 409 }
        );
      }
    }

    const updatedData = await prisma.weatherData.update({
      where: { id: weatherId },
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

    return NextResponse.json({
      success: true,
      data: updatedData
    });
  } catch (error: any) {
    console.error('Error updating weather data:', error);
    
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

// DELETE - Xóa dữ liệu thời tiết
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const weatherId = parseInt(id);

    if (isNaN(weatherId)) {
      return NextResponse.json(
        { error: 'Invalid weather data ID' },
        { status: 400 }
      );
    }

    // Kiểm tra dữ liệu có tồn tại không
    const existingData = await prisma.weatherData.findUnique({
      where: { id: weatherId }
    });

    if (!existingData) {
      return NextResponse.json(
        { error: 'Weather data not found' },
        { status: 404 }
      );
    }

    // Xóa dữ liệu thời tiết
    await prisma.weatherData.delete({
      where: { id: weatherId }
    });

    return NextResponse.json({
      success: true,
      message: 'Weather data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting weather data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}