// app/api/account/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, avatarUrl } = body;

    if (!userId || !avatarUrl) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, avatarUrl' 
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        avatarUrl,
        updatedAt: new Date()
      },
      select: {
        id: true,
        avatarUrl: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}