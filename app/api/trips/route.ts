// app/api/trips/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function để parse time string
function parseTimeString(timeStr: string, dayDate: string): string | null {
  if (!timeStr) return null;

  // Chuẩn hóa dayDate thành định dạng YYYY-MM-DD
  const normalizedDate = new Date(dayDate).toISOString().split('T')[0];

  // Nếu đã là format ISO-8601 hợp lệ
  if (timeStr.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+07:00$/)) {
    return timeStr;
  }

  // Nếu là format HH:MM hoặc HH:MM:SS
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) {
    const time = timeStr.includes(':') && timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr;
    return `${normalizedDate}T${time}+07:00`;
  }

  // Convert text time to HH:MM:SS
  const lowerTime = timeStr.toLowerCase();
  let time: string;

  if (lowerTime.includes('morning') || lowerTime.includes('sáng')) {
    time = '09:00:00';
  } else if (lowerTime.includes('afternoon') || lowerTime.includes('chiều')) {
    time = '14:00:00';
  } else if (lowerTime.includes('evening') || lowerTime.includes('tối')) {
    time = '18:00:00';
  } else if (lowerTime.includes('night') || lowerTime.includes('đêm')) {
    time = '20:00:00';
  } else {
    // Try to extract numbers from string
    const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
      } else {
        time = '09:00:00'; // Fallback
      }
    } else {
      time = '09:00:00'; // Fallback
    }
  }

  return `${normalizedDate}T${time}+07:00`;
}

// Helper function để tìm hoặc tạo city
async function findOrCreateCity(destination: string, tx: any) {
  // Tìm city theo tên (không phân biệt hoa thường)
  let city = await tx.city.findFirst({
    where: {
      name: {
        equals: destination,
        mode: 'insensitive'
      }
    }
  });

  // Nếu không tìm thấy, tạo city mới
  if (!city) {
    // Tách destination thành city và country nếu có format "City, Country"
    const parts = destination.split(',').map(part => part.trim());
    const cityName = parts[0];
    const country = parts.length > 1 ? parts[1] : 'Vietnam'; // Default country

    city = await tx.city.create({
      data: {
        name: cityName,
        country: country,
        description: `Auto-created city for ${destination}`,
        // Có thể thêm logic để lấy tọa độ từ geocoding API
        latitude: null,
        longitude: null,
        imageUrl: null
      }
    });
  }

  return city;
}

// GET - Lấy danh sách trips
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const where: any = {
      userId: parseInt(userId)
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const trips = await prisma.trip.findMany({
      where,
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
        city: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data để match với frontend format
    const transformedTrips = trips.map(trip => ({
      id: trip.id.toString(),
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate.toISOString().split('T')[0],
      endDate: trip.endDate.toISOString().split('T')[0],
      coverImage: trip.coverImageUrl || '/images/default-trip.jpg',
      numDays: Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      placesCount: trip.days.reduce((total, day) => total + day.itineraryItems.length, 0),
      status: trip.status as 'draft' | 'planned' | 'completed',
      description: trip.description,
      createdBy: 'manual' as const,
      tags: trip.tags.map(tripTag => tripTag.tag.name),
      estimatedBudget: undefined,
      travelCompanions: 1,
      city: trip.city
    }));

    return NextResponse.json(transformedTrips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Tạo trip mới với city management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      destination,
      startDate,
      endDate,
      description,
      userId,
      status = 'draft',
      days = []
    } = body;

    if (!name || !destination || !startDate || !endDate || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Tạo trip với transaction
    const result = await prisma.$transaction(async (tx) => {
      // Tìm hoặc tạo city dựa trên destination
      const city = await findOrCreateCity(destination, tx);
      const finalCityId = city.id;

      // Tạo trip
      const trip = await tx.trip.create({
        data: {
          name,
          destination,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          description,
          userId: parseInt(userId),
          status,
          cityId: finalCityId,
          coverImageUrl: '/images/default-trip.jpg'
        },
        include: {
          city: true // Include city trong response
        }
      });

      // Tạo days và itinerary items nếu có
      if (days && days.length > 0) {
        for (const dayData of days) {
          const tripDay = await tx.tripDay.create({
            data: {
              tripId: trip.id,
              dayNumber: dayData.dayNumber,
              date: new Date(dayData.date),
              notes: dayData.notes
            }
          });

          // Tạo places và itinerary items
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
                    cityId: finalCityId, // Link place to the city
                    imageUrl: placeData.image,
                    openingHours: placeData.openingHours,
                    avgDurationMinutes: placeData.duration,
                    rating: placeData.rating ? parseFloat(placeData.rating.toString()) : null
                  }
                });
              }

              // Tạo itinerary item
              await tx.itineraryItem.create({
                data: {
                  tripDayId: tripDay.id,
                  placeId: place.id,
                  startTime: placeData.startTime ? parseTimeString(placeData.startTime, dayData.date) : null,
                  endTime: placeData.endTime ? parseTimeString(placeData.endTime, dayData.date) : null,
                  durationMinutes: placeData.duration,
                  notes: placeData.notes,
                  orderIndex: i
                }
              });
            }
          }
        }
      }

      return trip;
    });

    return NextResponse.json({ 
      success: true,
      tripId: result.id.toString(),
      trip: {
        id: result.id.toString(),
        name: result.name,
        destination: result.destination,
        startDate: result.startDate.toISOString().split('T')[0],
        endDate: result.endDate.toISOString().split('T')[0],
        status: result.status,
        description: result.description,
        coverImageUrl: result.coverImageUrl,
        cityId: result.cityId,
        city: result.city,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}