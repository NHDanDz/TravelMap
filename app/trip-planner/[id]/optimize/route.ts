// app/api/trips/[id]/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Traveling Salesman Problem solver (simplified)
function solveTSP(places: any[], startIndex = 0): number[] {
  if (places.length <= 2) return places.map((_, i) => i);
  
  // Calculate distance matrix
  const distances: number[][] = [];
  for (let i = 0; i < places.length; i++) {
    distances[i] = [];
    for (let j = 0; j < places.length; j++) {
      if (i === j) {
        distances[i][j] = 0;
      } else {
        distances[i][j] = calculateDistance(
          parseFloat(places[i].latitude),
          parseFloat(places[i].longitude),
          parseFloat(places[j].latitude),
          parseFloat(places[j].longitude)
        );
      }
    }
  }
  
  // Simple nearest neighbor algorithm
  const visited = new Set<number>();
  const route = [startIndex];
  visited.add(startIndex);
  
  let current = startIndex;
  while (visited.size < places.length) {
    let nearest = -1;
    let minDistance = Infinity;
    
    for (let i = 0; i < places.length; i++) {
      if (!visited.has(i) && distances[current][i] < minDistance) {
        minDistance = distances[current][i];
        nearest = i;
      }
    }
    
    if (nearest !== -1) {
      route.push(nearest);
      visited.add(nearest);
      current = nearest;
    }
  }
  
  return route;
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Time-based optimization
function optimizeTimeSlots(places: any[], startTime = '09:00', bufferMinutes = 30): any[] {
  const result = [...places];
  let currentTime = parseTime(startTime);
  
  result.forEach((place, index) => {
    const duration = place.duration || place.avgDurationMinutes || 60;
    const startTimeStr = formatTime(currentTime);
    const endTime = new Date(currentTime.getTime() + duration * 60000);
    const endTimeStr = formatTime(endTime);
    
    result[index] = {
      ...place,
      startTime: startTimeStr,
      endTime: endTimeStr,
      duration
    };
    
    // Add buffer time for travel
    currentTime = new Date(endTime.getTime() + bufferMinutes * 60000);
  });
  
  return result;
}

function parseTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = parseInt(params.id);
    const body = await request.json();
    const { dayNumber, optimizationType = 'distance', preferences = {} } = body;
    
    if (isNaN(tripId)) {
      return NextResponse.json(
        { error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    // Get trip day with places - FIXED: Added category include
    const tripDay = await prisma.tripDay.findFirst({
      where: {
        tripId: tripId,
        dayNumber: dayNumber
      },
      include: {
        itineraryItems: {
          include: {
            place: {
              include: {
                category: true // FIXED: Added category relation
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!tripDay || !tripDay.itineraryItems.length) {
      return NextResponse.json(
        { error: 'No places found for optimization' },
        { status: 404 }
      );
    }

    // Extract places data
    const places = tripDay.itineraryItems.map(item => ({
      id: item.id,
      placeId: item.placeId,
      place: item.place,
      latitude: item.place?.latitude?.toString() || '0',
      longitude: item.place?.longitude?.toString() || '0',
      duration: item.durationMinutes || item.place?.avgDurationMinutes || 60,
      startTime: item.startTime ? formatTime(item.startTime) : undefined,
      endTime: item.endTime ? formatTime(item.endTime) : undefined,
      notes: item.notes
    }));

    let optimizedOrder: number[];
    let optimizedPlaces: any[];

    switch (optimizationType) {
      case 'distance':
        // Optimize for shortest distance
        optimizedOrder = solveTSP(places, 0);
        optimizedPlaces = optimizedOrder.map(index => places[index]);
        break;
        
      case 'time':
        // Optimize for time efficiency (shortest route + time slots)
        optimizedOrder = solveTSP(places, 0);
        const reorderedByDistance = optimizedOrder.map(index => places[index]);
        optimizedPlaces = optimizeTimeSlots(
          reorderedByDistance, 
          preferences.startTime || '09:00',
          preferences.bufferMinutes || 30
        );
        break;
        
      case 'priority':
        // Optimize based on place ratings and type priority
        const priorityWeights = {
          tourist_attraction: 10,
          restaurant: 8,
          museum: 9,
          hotel: 5,
          shopping: 6
        };
        
        optimizedPlaces = [...places].sort((a, b) => {
          // FIXED: Now category should be available
          const aWeight = priorityWeights[a.place?.category?.name?.toLowerCase() as keyof typeof priorityWeights] || 5;
          const bWeight = priorityWeights[b.place?.category?.name?.toLowerCase() as keyof typeof priorityWeights] || 5;
          const aRating = parseFloat(a.place?.rating?.toString() || '0');
          const bRating = parseFloat(b.place?.rating?.toString() || '0');
          
          return (bWeight + bRating) - (aWeight + aRating);
        });
        
        if (preferences.addTimeSlots) {
          optimizedPlaces = optimizeTimeSlots(
            optimizedPlaces,
            preferences.startTime || '09:00',
            preferences.bufferMinutes || 30
          );
        }
        break;
        
      default:
        optimizedPlaces = places;
    }

    // Calculate optimization metrics
    const originalDistance = calculateTotalDistance(places);
    const optimizedDistance = calculateTotalDistance(optimizedPlaces);
    const distanceSaved = originalDistance - optimizedDistance;
    const percentageImprovement = ((distanceSaved / originalDistance) * 100).toFixed(1);

    // Update database if requested
    if (body.applyOptimization) {
      for (let i = 0; i < optimizedPlaces.length; i++) {
        const optimizedPlace = optimizedPlaces[i];
        await prisma.itineraryItem.update({
          where: { id: optimizedPlace.id },
          data: {
            orderIndex: i,
            startTime: optimizedPlace.startTime ? parseTime(optimizedPlace.startTime) : null,
            endTime: optimizedPlace.endTime ? parseTime(optimizedPlace.endTime) : null,
            durationMinutes: optimizedPlace.duration
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      optimizationType,
      metrics: {
        originalDistance: originalDistance.toFixed(2),
        optimizedDistance: optimizedDistance.toFixed(2),
        distanceSaved: distanceSaved.toFixed(2),
        percentageImprovement: `${percentageImprovement}%`,
        totalPlaces: places.length
      },
      optimizedPlaces: optimizedPlaces.map((place, index) => ({
        ...place,
        newOrder: index + 1,
        originalOrder: places.findIndex(p => p.id === place.id) + 1
      })),
      applied: body.applyOptimization || false
    });

  } catch (error) {
    console.error('Error optimizing route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateTotalDistance(places: any[]): number {
  if (places.length < 2) return 0;
  
  let total = 0;
  for (let i = 0; i < places.length - 1; i++) {
    total += calculateDistance(
      parseFloat(places[i].latitude),
      parseFloat(places[i].longitude),
      parseFloat(places[i + 1].latitude),
      parseFloat(places[i + 1].longitude)
    );
  }
  return total;
}

// Get optimization suggestions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const dayNumber = parseInt(searchParams.get('day') || '1');
    
    if (isNaN(tripId)) {
      return NextResponse.json(
        { error: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    // Get trip day with places - FIXED: Added category include here too
    const tripDay = await prisma.tripDay.findFirst({
      where: {
        tripId: tripId,
        dayNumber: dayNumber
      },
      include: {
        itineraryItems: {
          include: {
            place: {
              include: {
                category: true // FIXED: Added category relation
              }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!tripDay) {
      return NextResponse.json(
        { error: 'Trip day not found' },
        { status: 404 }
      );
    }

    const places = tripDay.itineraryItems.map(item => ({
      id: item.id,
      place: item.place,
      latitude: item.place?.latitude?.toString() || '0',
      longitude: item.place?.longitude?.toString() || '0',
      duration: item.durationMinutes || item.place?.avgDurationMinutes || 60
    }));

    // Generate suggestions
    const suggestions = [];

    // Distance optimization suggestion
    if (places.length >= 3) {
      const currentDistance = calculateTotalDistance(places);
      const optimizedOrder = solveTSP(places);
      const optimizedPlaces = optimizedOrder.map(index => places[index]);
      const optimizedDistance = calculateTotalDistance(optimizedPlaces);
      const improvement = ((currentDistance - optimizedDistance) / currentDistance * 100);

      if (improvement > 5) {
        suggestions.push({
          type: 'distance',
          title: 'Tối ưu hóa khoảng cách',
          description: `Có thể tiết kiệm ${improvement.toFixed(1)}% quãng đường di chuyển`,
          impact: 'high',
          effort: 'low'
        });
      }
    }

    // Time optimization suggestion
    const hasTimeGaps = places.some((place, index) => {
      if (index === 0) return false;
      const prevPlace = places[index - 1];
      // Check for unrealistic time gaps
      return true; // Simplified logic
    });

    if (hasTimeGaps) {
      suggestions.push({
        type: 'time',
        title: 'Tối ưu hóa thời gian',
        description: 'Sắp xếp lại thời gian để tối ưu lịch trình',
        impact: 'medium',
        effort: 'low'
      });
    }

    // Priority optimization suggestion
    const hasLowRatedFirst = places.length > 1 && 
      parseFloat(places[0].place?.rating?.toString() || '0') < 
      parseFloat(places[places.length - 1].place?.rating?.toString() || '0');

    if (hasLowRatedFirst) {
      suggestions.push({
        type: 'priority',
        title: 'Tối ưu hóa ưu tiên',
        description: 'Sắp xếp theo độ ưu tiên và đánh giá',
        impact: 'medium',
        effort: 'low'
      });
    }

    return NextResponse.json({
      dayNumber,
      totalPlaces: places.length,
      suggestions,
      currentMetrics: {
        totalDistance: calculateTotalDistance(places).toFixed(2),
        averageRating: places.reduce((sum, p) => sum + parseFloat(p.place?.rating?.toString() || '0'), 0) / places.length
      }
    });

  } catch (error) {
    console.error('Error getting optimization suggestions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}