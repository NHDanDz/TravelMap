
// app/api/admin/reviews/[id]/moderate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// POST - Kiểm duyệt đánh giá (approve/reject)
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const reviewId = parseInt(id);

    if (isNaN(reviewId)) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, moderatorNote } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Kiểm tra đánh giá có tồn tại không
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Cập nhật trạng thái đánh giá
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: action === 'APPROVED' ? 'APPROVED' : 'REJECTED', 
        updatedAt: new Date()
      },
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
            name: true
          }
        }
      }
    });

    // Nếu đánh giá được duyệt, cập nhật lại rating trung bình của địa điểm
    if (action === 'approve') {
      await updatePlaceAverageRating(existingReview.placeId);
    }

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: `Review ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error moderating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function để cập nhật rating trung bình của địa điểm
async function updatePlaceAverageRating(placeId: number | null) {
  if (!placeId) return;

  try {
    // Tính toán rating trung bình từ các đánh giá đã được duyệt
    const avgRating = await prisma.review.aggregate({
      where: {
        placeId: placeId,
        status: 'APPROVED'
      },
      _avg: {
        rating: true
      }
    });

    // Cập nhật rating của địa điểm
    await prisma.place.update({
      where: { id: placeId },
      data: {
        rating: avgRating._avg.rating || null
      }
    });
  } catch (error) {
    console.error('Error updating place average rating:', error);
  }
}