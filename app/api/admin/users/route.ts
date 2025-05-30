// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả người dùng cho admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    // Tìm kiếm theo username, email, fullName
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Lọc theo trạng thái
    if (status === 'active') {
      where.isActive = { not: false };
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,  
          _count: {
            select: {
              trips: true,
              reviews: true,
              savedPlaces: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Tính toán thống kê đánh giá cho mỗi user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const reviewStats = await prisma.review.aggregate({
          where: {
            userId: user.id
         },
          _avg: {
            rating: true
          },
          _count: {
            rating: true
          }
        });

        return {
          ...user,
          stats: {
            avgRating: reviewStats._avg.rating || 0,
            totalRatings: reviewStats._count.rating || 0
          }
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}