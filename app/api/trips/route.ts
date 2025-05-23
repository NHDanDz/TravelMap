import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Kiểm tra quyền truy cập
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Lấy các tham số lọc từ URL
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện lọc
    const where: any = {
      OR: [
        { userId },
        {
          collaborators: {
            some: {
              userId
            }
          }
        }
      ]
    };
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Thực hiện truy vấn với Prisma
    const trips = await prisma.trip.findMany({
      where,
      include: {
        city: true,
        _count: {
          select: {
            days: true
          }
        }
      },
      take: limit,
      skip,
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Đếm tổng số chuyến đi phù hợp với bộ lọc
    const total = await prisma.trip.count({ where });

    // Trả về kết quả
    return NextResponse.json({
      trips,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra quyền truy cập
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // Tạo chuyến đi mới
    const newTrip = await prisma.trip.create({
      data: {
        userId,
        name: body.name,
        destination: body.destination,
        startDate: body.startDate,
        endDate: body.endDate,
        description: body.description,
        coverImageUrl: body.coverImageUrl,
        status: body.status || 'draft',
        isPublic: body.isPublic || false,
        cityId: body.cityId
      }
    });
    
    // Tự động sinh các ngày trong chuyến đi
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    const days = [];
    
    let currentDate = new Date(startDate);
    let dayNumber = 1;
    
    while (currentDate <= endDate) {
      days.push({
        tripId: newTrip.id,
        dayNumber,
        date: new Date(currentDate)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
      dayNumber++;
    }
    
    if (days.length > 0) {
      await prisma.tripDay.createMany({
        data: days
      });
    }
    
    // Lấy chuyến đi đầy đủ với các ngày
    const completeTrip = await prisma.trip.findUnique({
      where: {
        id: newTrip.id
      },
      include: {
        days: true
      }
    });
    
    return NextResponse.json(completeTrip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}