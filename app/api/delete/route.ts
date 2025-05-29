
// app/api/account/delete/route.ts - API để xóa tài khoản
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, password, confirmText } = body;

    if (!userId || !password || confirmText !== 'DELETE') {
      return NextResponse.json({ 
        error: 'Missing required fields or confirmation text incorrect' 
      }, { status: 400 });
    }

    // Xác minh mật khẩu
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { passwordHash: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password is incorrect' }, { status: 400 });
    }

    // Xóa tài khoản và tất cả dữ liệu liên quan (cascade delete sẽ xử lý)
    await prisma.user.delete({
      where: { id: parseInt(userId) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}