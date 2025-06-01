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
                place: {
                  include: {
                    category: true,
                    city: true
                  }
                }
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
        id: day.id,
        dayNumber: day.dayNumber,
        date: day.date.toISOString().split('T')[0],
        notes: day.notes,
        places: day.itineraryItems.map(item => ({
          id: item.place?.id.toString() || item.id.toString(),
          name: item.place?.name || '',
          type: item.place?.category?.name || 'other',
          categoryId: item.place?.categoryId,
          category: item.place?.category,
          address: item.place?.address || '',
          latitude: item.place?.latitude?.toString() || '0',
          longitude: item.place?.longitude?.toString() || '0',
          image: item.place?.imageUrl || '/images/default-place.jpg',
          startTime: item.startTime ? formatTimeFromDB(item.startTime) : undefined,
          endTime: item.endTime ? formatTimeFromDB(item.endTime) : undefined,
          duration: item.durationMinutes,
          notes: item.notes,
          openingHours: item.place?.openingHours,
          rating: item.place?.rating ? parseFloat(item.place.rating.toString()) : undefined,
          description: item.place?.description,
          orderIndex: item.orderIndex,
          estimatedCost: item.place?.priceLevel ? getPriceEstimate(item.place.priceLevel) : undefined
        }))
      })),
      tags: trip.tags.map(tripTag => tripTag.tag.name),
      user: trip.user,
      city: trip.city,
      totalPlaces: trip.days.reduce((total, day) => total + day.itineraryItems.length, 0),
      placesCount: trip.days.reduce((total, day) => total + day.itineraryItems.length, 0)
    };

    return NextResponse.json(transformedTrip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function để format time từ database
function formatTimeFromDB(timeValue: any): string | undefined {
  if (!timeValue) return undefined;
  
  try {
    // Nếu là Date object
    if (timeValue instanceof Date) {
      return timeValue.toISOString().slice(11, 16); // HH:MM
    }
    
    // Nếu là string có format time
    if (typeof timeValue === 'string') {
      // Nếu là ISO string
      if (timeValue.includes('T')) {
        return new Date(timeValue).toISOString().slice(11, 16);
      }
      // Nếu đã là format HH:MM hoặc HH:MM:SS
      if (timeValue.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
        return timeValue.slice(0, 5); // Lấy HH:MM
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error formatting time:', error);
    return undefined;
  }
}

// Helper function để convert time string to DateTime for database
function formatTimeForDB(timeString: string, date: string): Date | null {
  if (!timeString || !date) return null;
  
  try {
    // Tạo DateTime object từ date và time
    const dateTime = new Date(`${date}T${timeString}:00.000Z`);
    
    // Kiểm tra xem date có valid không
    if (isNaN(dateTime.getTime())) {
      console.error('Invalid date created:', `${date}T${timeString}:00.000Z`);
      return null;
    }
    
    return dateTime;
  } catch (error) {
    console.error('Error creating DateTime:', error);
    return null;
  }
}

// Alternative approach - store as separate date and time
function formatTimeForDBAlternative(timeString: string, baseDate: Date): Date | null {
  if (!timeString) return null;
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const dateTime = new Date(baseDate);
    dateTime.setHours(hours, minutes, 0, 0);
    
    return dateTime;
  } catch (error) {
    console.error('Error creating DateTime from time:', error);
    return null;
  }
}

// Helper function để estimate giá từ price level
function getPriceEstimate(priceLevel: string): number | undefined {
  const priceMap: { [key: string]: number } = {
    'cheap': 50000,
    'moderate': 200000,
    'expensive': 500000
  };
  
  return priceMap[priceLevel.toLowerCase()] || undefined;
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

              // Prepare startTime and endTime as DateTime objects
              const dayDate = new Date(dayData.date);
              const startDateTime = placeData.startTime ? 
                formatTimeForDBAlternative(placeData.startTime, dayDate) : null;
              const endDateTime = placeData.endTime ? 
                formatTimeForDBAlternative(placeData.endTime, dayDate) : null;

              // Log để debug
              console.log('Creating itinerary item:', {
                tripDayId: tripDay.id,
                placeId: place.id,
                startTime: startDateTime?.toISOString(),
                endTime: endDateTime?.toISOString(),
                originalStartTime: placeData.startTime,
                originalEndTime: placeData.endTime,
                dayDate: dayData.date
              });

              // Tạo itinerary item
              await tx.itineraryItem.create({
                data: {
                  tripDayId: tripDay.id,
                  placeId: place.id,
                  startTime: startDateTime,
                  endTime: endDateTime,
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
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: errorMessage 
    }, { status: 500 });
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
  const categoryMap: Record<number, string> = {
    1: 'tourist_attraction',
    2: 'restaurant', 
    3: 'cafe',
    4: 'hotel',
    5: 'shopping'
  };
  
  return categoryMap[categoryId || 1] || 'tourist_attraction';
}