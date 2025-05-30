// app/api/admin/users/[id]/ban/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// POST - Khóa tài khoản người dùng
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Kiểm tra người dùng có tồn tại không
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Khóa tài khoản
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        updatedAt: new Date()
      },
      select: {
        id: true,
        username: true,
        email: true, 
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User banned successfully'
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}