// app/api/admin/weather/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const weatherData = await prisma.weatherData.findMany({
      include: {
        city: {
          select: {
            name: true,
            country: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { city: { name: 'asc' } }
      ]
    });

    // Tạo CSV content
    const csvHeaders = [
      'ID',
      'City',
      'Country',
      'Date',
      'High Temperature (°C)',
      'Low Temperature (°C)',
      'Condition',
      'Precipitation Chance (%)',
      'Humidity (%)',
      'Wind Speed (km/h)',
      'Created At'
    ];

    const csvRows = weatherData.map(data => [
      data.id,
      data.city?.name ?? '',
      data.city?.country ?? '',
      data.date.toISOString().split('T')[0],
      data.temperatureHigh || '',
      data.temperatureLow || '',
      data.condition || '',
      data.precipitationChance || '', 
      data.createdAt?.toISOString().split('T')[0] || ''
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
        'Content-Disposition': `attachment; filename="weather_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Error exporting weather data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}