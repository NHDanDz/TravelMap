// app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả đánh giá cho admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
     
    // Lọc theo đánh giá
    if (rating) {
      where.rating = parseInt(rating);
    }
    
    // Tìm kiếm
    if (search) {
      where.OR = [
        {
          place: {
            name: { contains: search, mode: 'insensitive' }
          }
        },
        {
          user: {
            username: { contains: search, mode: 'insensitive' }
          }
        },
        {
          comment: { contains: search, mode: 'insensitive' }
        }
      ];
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          place: {
            select: {
              id: true,
              name: true,
              address: true,
              city: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where })
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}