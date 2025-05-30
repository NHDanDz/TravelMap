// app/api/admin/users/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true, 
        _count: {
          select: {
            trips: true,
            reviews: true,
            savedPlaces: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Tạo CSV content
    const csvHeaders = [
      'ID',
      'Username',
      'Email', 
      'Full Name',
      'Status',
      'Created At',
      'Last Login',
      'Trips',
      'Reviews',
      'Saved Places'
    ];

    const csvRows = users.map(user => [
      user.id,
      user.username,
      user.email,
      user.fullName || '',
      user.createdAt?.toISOString().split('T')[0] || '',
      user._count.trips,
      user._count.reviews,
      user._count.savedPlaces
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field}"` 
          : field
      ).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}