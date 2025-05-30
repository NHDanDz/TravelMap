// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// GET - Lấy chi tiết người dùng
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,  
        trips: {
          select: {
            id: true,
            name: true,
            destination: true,
            startDate: true,
            endDate: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            place: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        savedPlaces: {
          select: {
            id: true,
            createdAt: true,
            place: {
              select: {
                name: true,
                address: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            trips: true,
            reviews: true,
            savedPlaces: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Tính toán thống kê đánh giá
    const reviewStats = await prisma.review.aggregate({
      where: {
        userId: userId,
        status: 'APPROVED'
      },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });

    const userWithStats = {
      ...user,
      stats: {
        avgRating: reviewStats._avg.rating || 0,
        totalRatings: reviewStats._count.rating || 0
      }
    };

    return NextResponse.json(userWithStats);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
