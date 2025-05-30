// app/api/admin/users/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, 
      newUsersThisMonth,
      totalTrips,
      totalReviews
    ] = await Promise.all([
      // Tổng số người dùng
      prisma.user.count(), 
      // Người dùng mới tháng này
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      
      // Tổng số chuyến đi
      prisma.trip.count(),
      
      // Tổng số đánh giá
      prisma.review.count()
    ]);

    const stats = {
      total: totalUsers, 
      newThisMonth: newUsersThisMonth,
      totalTrips,
      totalReviews
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
