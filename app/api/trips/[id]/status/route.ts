// app/api/trips/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// Valid trip status values
const VALID_STATUSES = ['draft', 'planned', 'completed'] as const;
type TripStatus = typeof VALID_STATUSES[number];

// Status validation helper
function isValidStatus(status: any): status is TripStatus {
  return VALID_STATUSES.includes(status);
}

// Status transition validation (optional - you can remove this if you want to allow any transition)
function isValidStatusTransition(from: TripStatus, to: TripStatus): boolean {
  // Define allowed transitions
  const allowedTransitions: Record<TripStatus, TripStatus[]> = {
    'draft': ['planned', 'completed'],
    'planned': ['draft', 'completed'],
    'completed': ['planned', 'draft'] // Allow going back for corrections
  };
  
  return allowedTransitions[from].includes(to);
}

// PATCH - Quick status update
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tripId = parseInt(id);
    
    // Validate trip ID
    if (isNaN(tripId)) {
      return NextResponse.json(
        { error: 'Invalid trip ID' }, 
        { status: 400 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON body' }, 
        { status: 400 }
      );
    }
    
    const { status } = body;
    
    // Validate status
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' }, 
        { status: 400 }
      );
    }
    
    if (!isValidStatus(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status', 
          details: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          provided: status
        }, 
        { status: 400 }
      );
    }
    
    // Check if trip exists and get current status
    const existingTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, status: true, name: true }
    });
    
    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' }, 
        { status: 404 }
      );
    }
    
    // Check if status is actually changing
    if (existingTrip.status === status) {
      return NextResponse.json({
        success: true,
        status: existingTrip.status,
        message: 'Status is already set to this value',
        unchanged: true
      });
    }
    
    // Optional: Validate status transition
    // Uncomment the lines below if you want to enforce status transition rules
    /*
    if (!isValidStatusTransition(existingTrip.status as TripStatus, status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status transition',
          details: `Cannot change status from '${existingTrip.status}' to '${status}'`,
          currentStatus: existingTrip.status,
          requestedStatus: status
        }, 
        { status: 400 }
      );
    }
    */
    
    // Update trip status
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: { 
        status,
        updatedAt: new Date() // Update the modification timestamp
      },
      select: {
        id: true,
        status: true,
        name: true,
        updatedAt: true
      }
    });
    
    // Log the status change (optional - for debugging/audit purposes)
    console.log(`Trip ${tripId} (${existingTrip.name}) status changed from '${existingTrip.status}' to '${status}'`);
    
    // Return success response
    return NextResponse.json({
      success: true,
      status: updatedTrip.status,
      message: `Status successfully updated to '${status}'`,
      trip: {
        id: updatedTrip.id,
        name: updatedTrip.name,
        status: updatedTrip.status,
        updatedAt: updatedTrip.updatedAt
      },
      previousStatus: existingTrip.status
    });
    
  } catch (error) {
    console.error('Error updating trip status:', error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'Trip not found' }, 
          { status: 404 }
        );
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'Database constraint violation' }, 
          { status: 400 }
        );
      }
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to update trip status. Please try again.'
      }, 
      { status: 500 }
    );
  }
}

// GET - Get current status (optional endpoint for checking status)
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const tripId = parseInt(id);
    
    if (isNaN(tripId)) {
      return NextResponse.json(
        { error: 'Invalid trip ID' }, 
        { status: 400 }
      );
    }
    
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        name: true,
        status: true,
        updatedAt: true
      }
    });
    
    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      trip: {
        id: trip.id,
        name: trip.name,
        status: trip.status,
        updatedAt: trip.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error fetching trip status:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch trip status. Please try again.'
      }, 
      { status: 500 }
    );
  }
}

// OPTIONS - Handle CORS preflight requests (optional)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}