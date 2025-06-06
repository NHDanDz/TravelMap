// app/api/admin/cities/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// GET - Lấy chi tiết thành phố
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const cityId = parseInt(id);

    if (isNaN(cityId)) {
      return NextResponse.json(
        { error: 'Invalid city ID' },
        { status: 400 }
      );
    }

    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        places: {
          select: {
            id: true,
            name: true,
            address: true,
            rating: true,
            imageUrl: true,
            category: {
              select: {
                name: true
              }
            }
          },
          take: 10,
          orderBy: { rating: 'desc' }
        },
        trips: {
          select: {
            id: true,
            name: true,
            destination: true,
            startDate: true,
            endDate: true,
            user: {
              select: {
                username: true
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        weatherData: {
          select: {
            date: true,
            temperatureHigh: true,
            temperatureLow: true,
            condition: true
          },
          take: 7,
          orderBy: { date: 'desc' }
        },
        _count: {
          select: {
            places: true,
            trips: true,
            weatherData: true
          }
        }
      }
    });
    console.log('City details:', city);
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(city);
  } catch (error) {
    console.error('Error fetching city:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật thành phố
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const cityId = parseInt(id);

    if (isNaN(cityId)) {
      return NextResponse.json(
        { error: 'Invalid city ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      country,
      description,
      imageUrl,
      latitude,
      longitude
    } = body;

    // Validation
    if (!name || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: name, country' },
        { status: 400 }
      );
    }

    // Kiểm tra tọa độ hợp lệ nếu có
    let lat = null;
    let lng = null;
    if (latitude !== null && longitude !== null && latitude !== '' && longitude !== '') {
      lat = parseFloat(latitude);
      lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return NextResponse.json(
          { error: 'Invalid latitude or longitude' },
          { status: 400 }
        );
      }
    }

    // Kiểm tra thành phố có tồn tại không
    const existingCity = await prisma.city.findUnique({
      where: { id: cityId }
    });

    if (!existingCity) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Kiểm tra trùng lặp (trừ chính nó)
    const duplicateCity = await prisma.city.findFirst({
      where: {
        id: { not: cityId },
        name: { equals: name.trim(), mode: 'insensitive' },
        country: { equals: country.trim(), mode: 'insensitive' }
      }
    });

    if (duplicateCity) {
      return NextResponse.json(
        { error: 'A city with this name already exists in this country' },
        { status: 409 }
      );
    }

    const updatedCity = await prisma.city.update({
      where: { id: cityId },
      data: {
        name: name.trim(),
        country: country.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        latitude: lat,
        longitude: lng
      },
      include: {
        _count: {
          select: {
            places: true,
            trips: true,
            weatherData: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      city: updatedCity
    });
  } catch (error: any) {
    console.error('Error updating city:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A city with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa thành phố
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const cityId = parseInt(id);

    if (isNaN(cityId)) {
      return NextResponse.json(
        { error: 'Invalid city ID' },
        { status: 400 }
      );
    }

    // Kiểm tra thành phố có tồn tại không
    const existingCity = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        _count: {
          select: {
            places: true,
            trips: true,
            weatherData: true
          }
        }
      }
    });

    if (!existingCity) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Kiểm tra xem có dữ liệu liên quan không
    const hasRelatedData = existingCity._count.places > 0 || 
                          existingCity._count.trips > 0 || 
                          existingCity._count.weatherData > 0;

    if (hasRelatedData) {
      console.warn(`Deleting city ${cityId} with related data:`, existingCity._count);
    }

    // Xóa thành phố (cascade delete sẽ xử lý các bản ghi liên quan)
    await prisma.city.delete({
      where: { id: cityId }
    });

    return NextResponse.json({
      success: true,
      message: 'City deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting city:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete city because it is referenced by other records' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}