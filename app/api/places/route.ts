import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Lấy các tham số lọc từ URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
     // Xây dựng điều kiện lọc
    const where: any = {};
    
    if (category) {
      where.category = {
        name: {
          equals: category
        }
      };
    }
    
    if (city) {
      where.city = {
        name: {
          equals: city
        }
      };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Thực hiện truy vấn với Prisma
    const places = await prisma.place.findMany({
      where,
      include: {
        category: true,
        city: true,
        photos: {
          where: { isPrimary: true },
          take: 1
        },
      },
      take: limit,
      skip,
      orderBy: {
        rating: 'desc'
      }
    });

    // Đếm tổng số địa điểm phù hợp với bộ lọc
    const total = await prisma.place.count({ where });

    // Trả về kết quả
    return NextResponse.json({
      places,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Tạo địa điểm mới
    const newPlace = await prisma.place.create({
      data: {
        name: body.name,
        address: body.address,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl,
        openingHours: body.openingHours,
        contactInfo: body.contactInfo,
        website: body.website,
        avgDurationMinutes: body.avgDurationMinutes,
        priceLevel: body.priceLevel,
        categoryId: body.categoryId,
        cityId: body.cityId
      }
    });
    
    return NextResponse.json(newPlace, { status: 201 });
  } catch (error) {
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}