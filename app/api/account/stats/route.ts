// app/api/account/stats/route.ts - API để lấy thống kê chi tiết
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Lấy thống kê chi tiết
    const stats = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        createdAt: true,
        _count: {
          select: {
            savedPlaces: true,
            reviews: true,
            trips: true
          }
        },
        trips: {
          where: { status: 'completed' },
          select: { id: true }
        },
        reviews: {
          select: { 
            rating: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        savedPlaces: {
          include: {
            place: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!stats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Tính toán thống kê bổ sung
    const totalReviews = stats._count.reviews;
    const averageRating = totalReviews > 0 
      ? stats.reviews.reduce((sum, review) => sum + review.rating, 0) / Math.min(totalReviews, stats.reviews.length)
      : 0;

    // Phân loại địa điểm đã lưu theo category 
   const savedPlacesByCategory = stats.savedPlaces.reduce((acc: any, saved) => {
      // Fix: Check if saved.place exists before accessing it
      const category = saved.place?.category?.name || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    // Tính thời gian thành viên (tính bằng tháng)
    const createdAtDate = stats.createdAt ? new Date(stats.createdAt) : new Date();
    const membershipMonths = Math.floor(
      (new Date().getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    // Xác định achievements
    const achievements = {
      explorer: stats._count.savedPlaces >= 20,
      reviewer: stats._count.reviews >= 50,
      traveler: stats.trips.length >= 5,
      veteran: membershipMonths >= 12
    };

    const formattedStats = {
      totalSavedPlaces: stats._count.savedPlaces,
      totalReviews: totalReviews,
      totalTrips: stats._count.trips,
      completedTrips: stats.trips.length,
      averageRating: Math.round(averageRating * 10) / 10,
      membershipMonths,
      savedPlacesByCategory,
      achievements,
      recentReviews: stats.reviews.map(review => ({
        rating: review.rating,
        date: review.createdAt
      }))
    };

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
