
// app/api/cities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        country: true,
        description: true,
        imageUrl: true,
        latitude: true,
        longitude: true,
        _count: {
          select: {
            places: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}