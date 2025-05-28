import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params before using
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    // Kiểm tra ID hợp lệ
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Lấy thông tin chi tiết địa điểm
    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        category: true,
        city: true,
        photos: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        nearbyFromPlaces: {
          include: {
            nearbyPlace: {
              include: {
                category: true,
                photos: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          },
          take: 5
        }
      }
    });

    // Nếu không tìm thấy
    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(place);
  } catch (error) {
    console.error(`Error fetching place:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params before using
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    // Kiểm tra ID hợp lệ
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Cập nhật thông tin địa điểm
    const updatedPlace = await prisma.place.update({
      where: { id },
      data: {
        name: body.name,
        address: body.address,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl,
        openingHours: body.openingHours,
        contactInfo: body.contactInfo,
        website: body.website,
        avgDurationMinutes: body.avgDurationMinutes,
        priceLevel: body.priceLevel,
        categoryId: body.categoryId,
        cityId: body.cityId
      }
    });

    return NextResponse.json(updatedPlace);
  } catch (error) {
    console.error(`Error updating place:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params before using
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    // Kiểm tra ID hợp lệ
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Xóa địa điểm
    await prisma.place.delete({
      where: { id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting place:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}