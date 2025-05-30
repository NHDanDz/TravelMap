// app/api/admin/places/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// GET - Lấy chi tiết địa điểm
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const placeId = parseInt(id);

    if (isNaN(placeId)) {
      return NextResponse.json(
        { error: 'Invalid place ID' },
        { status: 400 }
      );
    }

    const place = await prisma.place.findUnique({
      where: { id: placeId },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        city: {
          select: {
            id: true,
            name: true,
            country: true
          }
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            visitDate: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        photos: {
          select: {
            id: true,
            url: true,
            caption: true,
            isPrimary: true
          }
        },
        _count: {
          select: {
            reviews: true,
            savedBy: true,
            itineraryItems: true
          }
        }
      }
    });

    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(place);
  } catch (error) {
    console.error('Error fetching place:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật địa điểm
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const placeId = parseInt(id);

    if (isNaN(placeId)) {
      return NextResponse.json(
        { error: 'Invalid place ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      categoryId,
      cityId,
      address,
      description,
      latitude,
      longitude,
      imageUrl,
      openingHours,
      contactInfo,
      website,
      avgDurationMinutes,
      priceLevel
    } = body;

    // Validation
    if (!name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, latitude, longitude' },
        { status: 400 }
      );
    }

    // Kiểm tra tọa độ hợp lệ
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }

    // Kiểm tra địa điểm có tồn tại không
    const existingPlace = await prisma.place.findUnique({
      where: { id: placeId }
    });

    if (!existingPlace) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    // Kiểm tra trùng lặp (trừ chính nó)
    if (name !== existingPlace.name || lat !== existingPlace.latitude.toNumber() || lng !== existingPlace.longitude.toNumber()) {
      const duplicatePlace = await prisma.place.findFirst({
        where: {
          id: { not: placeId },
          name: { equals: name, mode: 'insensitive' },
          latitude: {
            gte: lat - 0.001,
            lte: lat + 0.001
          },
          longitude: {
            gte: lng - 0.001,
            lte: lng + 0.001
          }
        }
      });

      if (duplicatePlace) {
        return NextResponse.json(
          { error: 'A place with similar name and location already exists' },
          { status: 409 }
        );
      }
    }

    const updatedPlace = await prisma.place.update({
      where: { id: placeId },
      data: {
        name: name.trim(),
        categoryId: categoryId || null,
        cityId: cityId || null,
        address: address?.trim() || null,
        description: description?.trim() || null,
        latitude: lat,
        longitude: lng,
        imageUrl: imageUrl?.trim() || null,
        openingHours: openingHours?.trim() || null,
        contactInfo: contactInfo?.trim() || null,
        website: website?.trim() || null,
        avgDurationMinutes: avgDurationMinutes || null,
        priceLevel: priceLevel || null,
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        city: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      place: updatedPlace
    });
  } catch (error: any) {
    console.error('Error updating place:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A place with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa địa điểm
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const placeId = parseInt(id);

    if (isNaN(placeId)) {
      return NextResponse.json(
        { error: 'Invalid place ID' },
        { status: 400 }
      );
    }

    // Kiểm tra địa điểm có tồn tại không
    const existingPlace = await prisma.place.findUnique({
      where: { id: placeId },
      include: {
        _count: {
          select: {
            reviews: true,
            savedBy: true,
            itineraryItems: true
          }
        }
      }
    });

    if (!existingPlace) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    // Kiểm tra xem có dữ liệu liên quan không
    const hasRelatedData = existingPlace._count.reviews > 0 || 
                          existingPlace._count.savedBy > 0 || 
                          existingPlace._count.itineraryItems > 0;

    if (hasRelatedData) {
      // Có thể cho phép xóa hoặc không tùy thuộc vào business logic
      // Ở đây tôi sẽ cho phép xóa và cascade delete sẽ xử lý
      console.warn(`Deleting place ${placeId} with related data:`, existingPlace._count);
    }

    // Xóa địa điểm (cascade delete sẽ xử lý các bản ghi liên quan)
    await prisma.place.delete({
      where: { id: placeId }
    });

    return NextResponse.json({
      success: true,
      message: 'Place deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting place:', error);
    
    // Handle foreign key constraint errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete place because it is referenced by other records' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}