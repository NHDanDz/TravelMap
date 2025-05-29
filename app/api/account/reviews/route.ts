// app/api/account/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { userId: parseInt(userId) },
      include: {
        place: {
          include: {
            category: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.review.count({ 
      where: { userId: parseInt(userId) } 
    });

    // Format dữ liệu trả về
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      placeName: review.place?.name || 'Unknown Place',
      placeType: review.place?.category?.name || 'unknown',
      rating: review.rating,
      content: review.comment,
      date: review.createdAt,
      likes: 0, // Có thể thêm bảng likes sau
      visitDate: review.visitDate
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, placeId, rating, comment, visitDate } = body;

    if (!userId || !placeId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: parseInt(userId),
        placeId: parseInt(placeId),
        rating: parseInt(rating),
        comment,
        visitDate: visitDate ? new Date(visitDate) : null
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, rating, comment } = body;

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const updatedReview = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        rating: rating ? parseInt(rating) : undefined,
        comment,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    await prisma.review.delete({
      where: { id: parseInt(reviewId) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
