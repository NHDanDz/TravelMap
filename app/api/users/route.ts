import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// GET - Lấy danh sách users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Tạo user mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, fullName } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: username, email, password' },
        { status: 400 }
      );
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json({ error: `${field} already exists` }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}