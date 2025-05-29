// app/api/account/route.ts - API để lấy thông tin tài khoản
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Lấy thông tin user với các thống kê
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            savedPlaces: true,
            trips: {
              where: { status: 'completed' }
            },
            reviews: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Format dữ liệu trả về
    const userData = {
      id: user.id,
      name: user.fullName || user.username,
      email: user.email,
      username: user.username,
      avatar: user.avatarUrl || '/images/human-4.jpg',
      joinDate: user.createdAt,
      savedPlaces: user._count.savedPlaces,
      completedTrips: user._count.trips,
      reviewsCount: user._count.reviews
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fullName, email, username, avatarUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        fullName,
        email,
        username,
        avatarUrl,
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Error updating user account:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json({ error: `${field} already exists` }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
