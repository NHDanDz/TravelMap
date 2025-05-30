// app/api/admin/places/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả địa điểm cho admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const cityId = searchParams.get('cityId');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    // Tìm kiếm theo tên hoặc địa chỉ
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Lọc theo danh mục
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    
    // Lọc theo thành phố
    if (cityId) {
      where.cityId = parseInt(cityId);
    }

    const [places, totalCount] = await Promise.all([
      prisma.place.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          city: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              reviews: true,
              savedBy: true,
              itineraryItems: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.place.count({ where })
    ]);

    return NextResponse.json({
      places,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Tạo địa điểm mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      categoryId,
      cityId,
      address,
      description,
      latitude,
      longitude,
      imageUrl,
      openingHours,
      contactInfo,
      website,
      avgDurationMinutes,
      priceLevel
    } = body;

    // Validation
    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: name, latitude, longitude' },
        { status: 400 }
      );
    }

    // Kiểm tra tọa độ hợp lệ
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }

    // Kiểm tra địa điểm đã tồn tại chưa (dựa trên tên và tọa độ gần đúng)
    const existingPlace = await prisma.place.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        latitude: {
          gte: lat - 0.001, // Khoảng cách khoảng 100m
          lte: lat + 0.001
        },
        longitude: {
          gte: lng - 0.001,
          lte: lng + 0.001
        }
      }
    });

    if (existingPlace) {
      return NextResponse.json(
        { error: 'A place with similar name and location already exists' },
        { status: 409 }
      );
    }

    const place = await prisma.place.create({
      data: {
        name: name.trim(),
        categoryId: categoryId || null,
        cityId: cityId || null,
        address: address?.trim() || null,
        description: description?.trim() || null,
        latitude: lat,
        longitude: lng,
        imageUrl: imageUrl?.trim() || null,
        openingHours: openingHours?.trim() || null,
        contactInfo: contactInfo?.trim() || null,
        website: website?.trim() || null,
        avgDurationMinutes: avgDurationMinutes || null,
        priceLevel: priceLevel || null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        city: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      place
    });
  } catch (error: any) {
    console.error('Error creating place:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A place with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}