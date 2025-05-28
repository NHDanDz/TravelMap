// app/api/trips/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// GET - Lấy chi tiết trip
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tripId = parseInt(id);    
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        days: {
          include: {
            itineraryItems: {
              include: {
                place: true
              },
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { dayNumber: 'asc' }
        },
        tags: {
          include: {
            tag: true
          }
        },
        city: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Transform data để match với frontend format
    const transformedTrip = {
      id: trip.id.toString(),
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate.toISOString().split('T')[0],
      endDate: trip.endDate.toISOString().split('T')[0],
      coverImage: trip.coverImageUrl || '/images/default-trip.jpg',
      numDays: Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      status: trip.status as 'draft' | 'planned' | 'completed',
      description: trip.description,
      days: trip.days.map(day => ({
        dayNumber: day.dayNumber,
        date: day.date.toISOString().split('T')[0],
        places: day.itineraryItems.map(item => ({
          id: item.place?.id.toString() || item.id.toString(),
          name: item.place?.name || '',
          type: getPlaceType(item.place?.categoryId),
          address: item.place?.address || '',
          latitude: item.place?.latitude?.toString() || '0',
          longitude: item.place?.longitude?.toString() || '0',
          image: item.place?.imageUrl || '/images/default-place.jpg',
          startTime: item.startTime ? item.startTime.toISOString().slice(11, 16) : undefined,
          endTime: item.endTime ? item.endTime.toISOString().slice(11, 16) : undefined,
          duration: item.durationMinutes,
          notes: item.notes,
          openingHours: item.place?.openingHours,
          rating: item.place?.rating ? parseFloat(item.place.rating.toString()) : undefined
        }))
      })),
      tags: trip.tags.map(tripTag => tripTag.tag.name),
      user: trip.user
    };

    return NextResponse.json(transformedTrip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Cập nhật trip
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const tripId = parseInt(params.id);
    const body = await request.json();
    const { days, ...tripData } = body;

    const result = await prisma.$transaction(async (tx) => {
      // Cập nhật thông tin trip
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          name: tripData.name,
          destination: tripData.destination,
          startDate: tripData.startDate ? new Date(tripData.startDate) : undefined,
          endDate: tripData.endDate ? new Date(tripData.endDate) : undefined,
          description: tripData.description,
          status: tripData.status,
          coverImageUrl: tripData.coverImage
        }
      });

      // Cập nhật days nếu có
      if (days) {
        // Xóa các days cũ
        await tx.itineraryItem.deleteMany({
          where: {
            tripDay: {
              tripId: tripId
            }
          }
        });
        await tx.tripDay.deleteMany({
          where: { tripId: tripId }
        });

        // Tạo lại days mới
        for (const dayData of days) {
          const tripDay = await tx.tripDay.create({
            data: {
              tripId: tripId,
              dayNumber: dayData.dayNumber,
              date: new Date(dayData.date),
              notes: dayData.notes
            }
          });

          // Tạo itinerary items
          if (dayData.places && dayData.places.length > 0) {
            for (let i = 0; i < dayData.places.length; i++) {
              const placeData = dayData.places[i];
              
              // Tìm hoặc tạo place
              let place = await tx.place.findFirst({
                where: {
                  name: placeData.name,
                  latitude: parseFloat(placeData.latitude),
                  longitude: parseFloat(placeData.longitude)
                }
              });

              if (!place) {
                place = await tx.place.create({
                  data: {
                    name: placeData.name,
                    address: placeData.address,
                    latitude: parseFloat(placeData.latitude),
                    longitude: parseFloat(placeData.longitude),
                    imageUrl: placeData.image,
                    openingHours: placeData.openingHours,
                    avgDurationMinutes: placeData.duration,
                    rating: placeData.rating
                  }
                });
              }

              // Tạo itinerary item
              await tx.itineraryItem.create({
                data: {
                  tripDayId: tripDay.id,
                  placeId: place.id,
                  startTime: placeData.startTime ? `${placeData.startTime}:00` : null,
                  endTime: placeData.endTime ? `${placeData.endTime}:00` : null,
                  durationMinutes: placeData.duration,
                  notes: placeData.notes,
                  orderIndex: i
                }
              });
            }
          }
        }
      }

      return updatedTrip;
    });

    return NextResponse.json({ success: true, trip: result });
  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Xóa trip
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const tripId = parseInt(params.id);

    await prisma.trip.delete({
      where: { id: tripId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function để map category ID sang type
function getPlaceType(categoryId: number | null | undefined): string {
  // Mapping dựa trên categories trong DB
  const categoryMap: Record<number, string> = {
    1: 'tourist_attraction',
    2: 'restaurant', 
    3: 'cafe',
    4: 'hotel',
    5: 'shopping'
  };
  
  return categoryMap[categoryId || 1] || 'tourist_attraction';
}