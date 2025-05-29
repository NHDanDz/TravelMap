// app/api/account/saved-places/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const where: any = {
      userId: parseInt(userId)
    };

    if (category && category !== 'Tất cả') {
      where.place = {
        category: {
          name: category
        }
      };
    }

    const savedPlaces = await prisma.savedPlace.findMany({
      where,
      include: {
        place: {
          include: {
            category: true,
            city: true,
            photos: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const total = await prisma.savedPlace.count({ where });

    // Format dữ liệu trả về với optional chaining
    const formattedPlaces = savedPlaces
      .filter(saved => saved.place !== null) // Filter out entries where place is null
      .map(saved => ({
        id: saved.place?.id ?? 0,
        name: saved.place?.name ?? 'Unknown Place',
        type: saved.place?.category?.name ?? 'unknown',
        address: saved.place?.address ?? '',
        rating: saved.place?.rating ? parseFloat(saved.place.rating.toString()) : 0,
        image: saved.place?.photos?.[0]?.url ?? saved.place?.imageUrl ?? '/images/place-default.jpg',
        savedAt: saved.createdAt,
        notes: saved.notes
      }));

    return NextResponse.json({
      places: formattedPlaces,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching saved places:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save a place
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, placeId, notes } = body;

    if (!userId || !placeId) {
      return NextResponse.json({ error: 'User ID and Place ID are required' }, { status: 400 });
    }

    const savedPlace = await prisma.savedPlace.create({
      data: {
        userId: parseInt(userId),
        placeId: parseInt(placeId),
        notes
      }
    });

    return NextResponse.json({ success: true, savedPlace });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Place already saved' }, { status: 409 });
    }
    console.error('Error saving place:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a saved place
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const placeId = searchParams.get('placeId');

    if (!userId || !placeId) {
      return NextResponse.json({ error: 'User ID and Place ID are required' }, { status: 400 });
    }

    await prisma.savedPlace.delete({
      where: {
        userId_placeId: {
          userId: parseInt(userId),
          placeId: parseInt(placeId)
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing saved place:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}