// app/api/admin/reviews/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalReviews, 
      avgRatingResult,
      thisMonthReviews
    ] = await Promise.all([
      // Tổng số đánh giá
      prisma.review.count(),
       
      // Điểm đánh giá trung bình
      prisma.review.aggregate({
        _avg: {
          rating: true
        }
      }),
      
      // Đánh giá tháng này
      prisma.review.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      })
    ]);

    const stats = {
      total: totalReviews, 
      avgRating: avgRatingResult._avg.rating || 0,
      thisMonth: thisMonthReviews
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
