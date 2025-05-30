// app/api/admin/cities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả thành phố cho admin
export async function GET(request: NextRequest) {
  try {
    const cities = await prisma.city.findMany({
      include: {
        _count: {
          select: {
            places: true,
            trips: true,
            weatherData: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Tạo thành phố mới
export async function POST(request: NextRequest) {
  try {
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
    if (latitude !== null && longitude !== null) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return NextResponse.json(
          { error: 'Invalid latitude or longitude' },
          { status: 400 }
        );
      }
    }

    // Kiểm tra thành phố đã tồn tại chưa
    const existingCity = await prisma.city.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        country: { equals: country.trim(), mode: 'insensitive' }
      }
    });

    if (existingCity) {
      return NextResponse.json(
        { error: 'A city with this name already exists in this country' },
        { status: 409 }
      );
    }

    const city = await prisma.city.create({
      data: {
        name: name.trim(),
        country: country.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
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
      city
    });
  } catch (error: any) {
    console.error('Error creating city:', error);
    
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
