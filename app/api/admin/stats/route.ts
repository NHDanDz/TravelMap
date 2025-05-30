// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define interfaces for type safety
interface RecentActivity {
  id: string;
  type: 'user_registered' | 'place_added' | 'review_added' | 'trip_created';
  description: string;
  timestamp: string;
  user?: string;
}

interface AdminStats {
  totalPlaces: number;
  totalCities: number;
  totalUsers: number;
  totalTrips: number;
  totalReviews: number;
  avgRating: number;
  newUsersThisMonth: number;
  newPlacesThisMonth: number;
  recentActivities: RecentActivity[];
}

export async function GET(request: NextRequest) {
  try {
    // Thống kê tổng quan
    const [
      totalPlaces,
      totalCities,
      totalUsers,
      totalTrips,
      totalReviews,
      avgRatingResult,
      newUsersThisMonth,
      newPlacesThisMonth,
      recentUsers,
      recentPlaces,
      recentReviews,
      recentTrips
    ] = await Promise.all([
      // Tổng số địa điểm
      prisma.place.count(),
      
      // Tổng số thành phố
      prisma.city.count(),
      
      // Tổng số người dùng
      prisma.user.count(),
      
      // Tổng số chuyến đi
      prisma.trip.count(),
      
      // Tổng số đánh giá
      prisma.review.count(),
      
      // Điểm đánh giá trung bình
      prisma.review.aggregate({
        _avg: {
          rating: true
        }
      }),
      
      // Người dùng mới trong tháng
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Địa điểm mới trong tháng
      prisma.place.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Người dùng đăng ký gần đây
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      
      // Địa điểm được thêm gần đây
      prisma.place.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      
      // Đánh giá gần đây
      prisma.review.findMany({
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              username: true
            }
          },
          place: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      }),
      
      // Chuyến đi được tạo gần đây
      prisma.trip.findMany({
        select: {
          id: true,
          name: true,
          destination: true,
          createdAt: true,
          user: {
            select: {
              username: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      })
    ]);

    // Tạo danh sách hoạt động gần đây với type annotation
    const recentActivities: RecentActivity[] = [];
    
    // Thêm người dùng mới
    recentUsers.forEach(user => {
      recentActivities.push({
        id: `user_${user.id}`,
        type: 'user_registered',
        description: `Người dùng mới đăng ký: ${user.email}`,
        timestamp: user.createdAt?.toISOString() || new Date().toISOString(),
        user: user.username || undefined
      });
    });
    
    // Thêm địa điểm mới
    recentPlaces.forEach(place => {
      recentActivities.push({
        id: `place_${place.id}`,
        type: 'place_added',
        description: `Địa điểm mới được thêm: ${place.name}`,
        timestamp: place.createdAt?.toISOString() || new Date().toISOString()
      });
    });
    
    // Thêm đánh giá mới
    recentReviews.forEach(review => {
      recentActivities.push({
        id: `review_${review.id}`,
        type: 'review_added',
        description: `Đánh giá mới cho ${review.place?.name || 'địa điểm'}`,
        timestamp: review.createdAt?.toISOString() || new Date().toISOString(),
        user: review.user?.username || undefined
      });
    });
    
    // Thêm chuyến đi mới
    recentTrips.forEach(trip => {
      recentActivities.push({
        id: `trip_${trip.id}`,
        type: 'trip_created',
        description: `Chuyến đi mới: ${trip.name}`,
        timestamp: trip.createdAt?.toISOString() || new Date().toISOString(),
        user: trip.user?.username || undefined
      });
    });
    
    // Sắp xếp hoạt động theo thời gian
    recentActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const stats: AdminStats = {
      totalPlaces,
      totalCities,
      totalUsers,
      totalTrips,
      totalReviews,
      avgRating: avgRatingResult._avg.rating || 0,
      newUsersThisMonth,
      newPlacesThisMonth,
      recentActivities: recentActivities.slice(0, 10) // Chỉ lấy 10 hoạt động gần nhất
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}