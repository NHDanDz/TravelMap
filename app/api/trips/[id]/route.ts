// app/api/trips/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CoordinateUtils } from '@/lib/utils/coordinateUtils';
import { z } from 'zod';

// Validation schemas
const updateTripSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  destination: z.string().min(1).max(100).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'planned', 'completed']).optional(),
  coverImage: z.string().url().optional(),
  days: z.array(z.object({
    dayNumber: z.number().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    notes: z.string().optional(),
    places: z.array(z.object({
      id: z.string().optional(),
      name: z.string().min(1),
      type: z.string().optional(),
      address: z.string().optional(),
      latitude: z.string(),
      longitude: z.string(),
      image: z.string().optional(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      duration: z.number().positive().optional(),
      notes: z.string().optional(),
      rating: z.number().min(0).max(5).optional(),
      openingHours: z.string().optional(),
      description: z.string().optional()
    }))
  })).optional()
});

const statusUpdateSchema = z.object({
  status: z.enum(['draft', 'planned', 'completed'])
});

interface Params {
  params: {
    id: string;
  };
}

// Type definitions
interface TransformedPlace {
  id: string;
  name: string;
  type: string;
  categoryId?: number | null;
  category?: any;
  address: string;
  latitude: string;
  longitude: string;
  image: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  openingHours?: string;
  rating?: number;
  description?: string;
  orderIndex: number;
  estimatedCost?: number;
  hasValidCoordinates: boolean;
}

interface TransformedDay {
  id: number;
  dayNumber: number;
  date: string;
  notes?: string;
  places: TransformedPlace[];
  totalPlaces: number;
  placesWithCoordinates: number;
  estimatedDistance?: number;
}

interface TransformedTrip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  numDays: number;
  status: 'draft' | 'planned' | 'completed';
  description?: string;
  days: TransformedDay[];
  tags: string[];
  user?: any;
  city?: any;
  totalPlaces: number;
  placesCount: number;
  placesWithCoordinates: number;
  coordinatesCoverage: number;
  totalDistance?: number;
  averageRating?: number;
}

// Utility functions
class TimeUtils {
  static formatTimeFromDB(timeValue: any): string | undefined {
    if (!timeValue) return undefined;
    
    try {
      if (timeValue instanceof Date) {
        return timeValue.toTimeString().slice(0, 5); // HH:MM
      }
      
      if (typeof timeValue === 'string') {
        if (timeValue.includes('T')) {
          return new Date(timeValue).toTimeString().slice(0, 5);
        }
        if (timeValue.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
          return timeValue.slice(0, 5);
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error formatting time:', error);
      return undefined;
    }
  }

  static createTimeForDB(timeString: string, date: string): Date | null {
    if (!timeString || !date) return null;
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
      }
      
      const dateTime = new Date(date);
      dateTime.setUTCHours(hours, minutes, 0, 0);
      
      return dateTime;
    } catch (error) {
      console.error('Error creating DateTime:', error);
      return null;
    }
  }
}

class PriceUtils {
  static estimateFromPriceLevel(priceLevel: string): number | undefined {
    const priceMap: Record<string, number> = {
      'cheap': 50000,
      'moderate': 200000,
      'expensive': 500000,
      '$': 50000,
      '$$': 150000,
      '$$$': 300000,
      '$$$$': 600000
    };
    
    return priceMap[priceLevel.toLowerCase()];
  }

  static getPriceLevelFromCategory(categoryName: string): string {
    const categoryPriceMap: Record<string, string> = {
      'street_food': 'cheap',
      'cafe': 'cheap',
      'restaurant': 'moderate',
      'tourist_attraction': 'moderate',
      'hotel': 'expensive',
      'resort': 'expensive'
    };
    
    return categoryPriceMap[categoryName.toLowerCase()] || 'moderate';
  }
}

// GET - Retrieve trip details with enhanced data
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tripId = parseInt(id);
    
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

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
                    city: true,
                    photos: {
                      where: { isPrimary: true },
                      take: 1
                    },
                    reviews: {
                      take: 3,
                      orderBy: { createdAt: 'desc' },
                      select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        user: {
                          select: { id: true, username: true, avatarUrl: true }
                        }
                      }
                    }
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

    // Transform and enhance trip data
    const transformedTrip = await transformTripData(trip);

    return NextResponse.json(transformedTrip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// PUT - Update trip with validation and coordinate handling
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tripId = parseInt(id);
    
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = updateTripSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { days, ...tripData } = validationResult.data;

    const result = await prisma.$transaction(async (tx) => {
      // Update basic trip information
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          ...(tripData.name && { name: tripData.name }),
          ...(tripData.destination && { destination: tripData.destination }),
          ...(tripData.startDate && { startDate: new Date(tripData.startDate) }),
          ...(tripData.endDate && { endDate: new Date(tripData.endDate) }),
          ...(tripData.description !== undefined && { description: tripData.description }),
          ...(tripData.status && { status: tripData.status }),
          ...(tripData.coverImage && { coverImageUrl: tripData.coverImage }),
          updatedAt: new Date()
        }
      });

      // Update days if provided
      if (days && days.length > 0) {
        // Delete existing itinerary items and days
        await tx.itineraryItem.deleteMany({
          where: {
            tripDay: { tripId: tripId }
          }
        });
        
        await tx.tripDay.deleteMany({
          where: { tripId: tripId }
        });

        // Create new days and places
        for (const dayData of days) {
          const tripDay = await tx.tripDay.create({
            data: {
              tripId: tripId,
              dayNumber: dayData.dayNumber,
              date: new Date(dayData.date),
              notes: dayData.notes
            }
          });

          // Process places for this day
          if (dayData.places && dayData.places.length > 0) {
            for (let i = 0; i < dayData.places.length; i++) {
              const placeData = dayData.places[i];
              
              // Validate coordinates
              const lat = parseFloat(placeData.latitude);
              const lng = parseFloat(placeData.longitude);
              
              if (!CoordinateUtils.isValidCoordinates(lat, lng)) {
                console.warn(`Invalid coordinates for place ${placeData.name}: ${lat}, ${lng}`);
                continue;
              }

              // Find or create place
              let place = await tx.place.findFirst({
                where: {
                  name: placeData.name,
                  latitude: { equals: lat },
                  longitude: { equals: lng }
                }
              });

              if (!place) {
                // Determine category ID based on type
                let categoryId: number | null = null;
                if (placeData.type) {
                  const category = await tx.category.findFirst({
                    where: {
                      name: {
                        contains: placeData.type,
                        mode: 'insensitive'
                      }
                    }
                  });
                  categoryId = category?.id || null;
                }

                place = await tx.place.create({
                  data: {
                    name: placeData.name,
                    address: placeData.address || '',
                    latitude: lat,
                    longitude: lng,
                    imageUrl: placeData.image || '/images/default-place.jpg',
                    openingHours: placeData.openingHours,
                    avgDurationMinutes: placeData.duration || 60,
                    rating: placeData.rating || null,
                    description: placeData.address,
                    categoryId: categoryId,
                    priceLevel: placeData.type ? PriceUtils.getPriceLevelFromCategory(placeData.type) : null
                  }
                });
              }

              // Create time objects for start and end times
              const startDateTime = placeData.startTime ? 
                TimeUtils.createTimeForDB(placeData.startTime, dayData.date) : null;
              const endDateTime = placeData.endTime ? 
                TimeUtils.createTimeForDB(placeData.endTime, dayData.date) : null;

              // Create itinerary item
              await tx.itineraryItem.create({
                data: {
                  tripDayId: tripDay.id,
                  placeId: place.id,
                  startTime: startDateTime,
                  endTime: endDateTime,
                  durationMinutes: placeData.duration || place.avgDurationMinutes || 60,
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

    // Fetch updated trip with all relations
    const updatedTripWithData = await prisma.trip.findUnique({
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
        tags: { include: { tag: true } },
        city: true,
        user: {
          select: { id: true, username: true, fullName: true }
        }
      }
    });

    if (!updatedTripWithData) {
      throw new Error('Failed to fetch updated trip data');
    }

    const transformedTrip = await transformTripData(updatedTripWithData);

    return NextResponse.json({ 
      success: true, 
      trip: transformedTrip,
      message: 'Trip updated successfully' 
    });

  } catch (error) {
    console.error('Error updating trip:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({ 
      error: 'Failed to update trip', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// PATCH - Update trip status only
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tripId = parseInt(id);
    
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate status update
    const validationResult = statusUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        status: status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      status: updatedTrip.status,
      message: 'Trip status updated successfully'
    });

  } catch (error) {
    console.error('Error updating trip status:', error);
    return NextResponse.json(
      { error: 'Failed to update trip status' },
      { status: 500 }
    );
  }
}

// DELETE - Remove trip
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tripId = parseInt(id);
    
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

    // Check if trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId }
    });

    if (!existingTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Delete trip (cascade deletes should handle related records)
    await prisma.trip.delete({
      where: { id: tripId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Trip deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}

// Helper function to transform trip data with enhanced information
async function transformTripData(trip: any): Promise<TransformedTrip> {
  const transformedDays: TransformedDay[] = [];
  let totalPlacesWithCoords = 0;
  let totalPlaces = 0;
  let totalRatings = 0;
  let ratingCount = 0;

  for (const day of trip.days) {
    const transformedPlaces: TransformedPlace[] = [];
    
    for (const item of day.itineraryItems) {
      const place = item.place;
      if (!place) continue;

      const hasValidCoords = CoordinateUtils.isValidCoordinates(
        parseFloat(place.latitude?.toString() || '0'),
        parseFloat(place.longitude?.toString() || '0')
      );

      if (hasValidCoords) totalPlacesWithCoords++;

      const transformedPlace: TransformedPlace = {
        id: place.id.toString(),
        name: place.name,
        type: place.category?.name?.toLowerCase() || 'tourist_attraction',
        categoryId: place.categoryId,
        category: place.category,
        address: place.address || '',
        latitude: place.latitude?.toString() || '0',
        longitude: place.longitude?.toString() || '0',
        image: place.imageUrl || place.photos?.[0]?.url || '/images/default-place.jpg',
        startTime: TimeUtils.formatTimeFromDB(item.startTime),
        endTime: TimeUtils.formatTimeFromDB(item.endTime),
        duration: item.durationMinutes || place.avgDurationMinutes,
        notes: item.notes,
        openingHours: place.openingHours,
        rating: place.rating ? parseFloat(place.rating.toString()) : undefined,
        description: place.description,
        orderIndex: item.orderIndex,
        estimatedCost: place.priceLevel ? PriceUtils.estimateFromPriceLevel(place.priceLevel) : undefined,
        hasValidCoordinates: hasValidCoords
      };

      if (transformedPlace.rating) {
        totalRatings += transformedPlace.rating;
        ratingCount++;
      }

      transformedPlaces.push(transformedPlace);
      totalPlaces++;
    }

    // Calculate distance for places with valid coordinates
    let dayDistance = 0;
    const placesWithCoords = transformedPlaces.filter(p => p.hasValidCoordinates);
    if (placesWithCoords.length >= 2) {
      dayDistance = CoordinateUtils.calculateTotalRouteDistance(
        placesWithCoords.map(p => ({
          id: p.id,
          name: p.name,
          latitude: p.latitude,
          longitude: p.longitude
        }))
      );
    }

    transformedDays.push({
      id: day.id,
      dayNumber: day.dayNumber,
      date: day.date.toISOString().split('T')[0],
      notes: day.notes,
      places: transformedPlaces,
      totalPlaces: transformedPlaces.length,
      placesWithCoordinates: placesWithCoords.length,
      estimatedDistance: dayDistance > 0 ? Math.round(dayDistance * 100) / 100 : undefined
    });
  }

  // Calculate total trip distance
  const totalDistance = transformedDays.reduce((sum, day) => sum + (day.estimatedDistance || 0), 0);
  
  // Calculate coordinate coverage percentage
  const coordinatesCoverage = totalPlaces > 0 ? Math.round((totalPlacesWithCoords / totalPlaces) * 100) : 0;

  // Calculate average rating
  const averageRating = ratingCount > 0 ? Math.round((totalRatings / ratingCount) * 10) / 10 : undefined;

  return {
    id: trip.id.toString(),
    name: trip.name,
    destination: trip.destination,
    startDate: trip.startDate.toISOString().split('T')[0],
    endDate: trip.endDate.toISOString().split('T')[0],
    coverImage: trip.coverImageUrl || '/images/default-trip.jpg',
    numDays: Math.ceil((trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    status: trip.status as 'draft' | 'planned' | 'completed',
    description: trip.description,
    days: transformedDays,
    tags: trip.tags.map((tripTag: any) => tripTag.tag.name),
    user: trip.user,
    city: trip.city,
    totalPlaces,
    placesCount: totalPlaces,
    placesWithCoordinates: totalPlacesWithCoords,
    coordinatesCoverage,
    totalDistance: totalDistance > 0 ? Math.round(totalDistance * 100) / 100 : undefined,
    averageRating
  };
}