// app/api/admin/weather/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalRecords,
      citiesWithData,
      latestRecord,
      avgTemperature,
      recordsThisMonth
    ] = await Promise.all([
      // Tổng số bản ghi
      prisma.weatherData.count(),
      
      // Số thành phố có dữ liệu
      prisma.weatherData.groupBy({
        by: ['cityId'],
        _count: {
          cityId: true
        }
      }).then(result => result.length),
      
      // Bản ghi mới nhất
      prisma.weatherData.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }),
      
      // Nhiệt độ trung bình
      prisma.weatherData.aggregate({
        _avg: {
          temperatureHigh: true,
          temperatureLow: true
        }
      }),
      
      // Bản ghi tháng này
      prisma.weatherData.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      })
    ]);

    const high = avgTemperature._avg.temperatureHigh?.toNumber() ?? 0;
    const low = avgTemperature._avg.temperatureLow?.toNumber() ?? 0;
    const avgTemp = (high + low) / 2;
    const stats = {
      totalRecords,
      citiesWithData,
      latestUpdate: latestRecord?.createdAt?.toISOString() || new Date().toISOString(),
      avgTemperature: avgTemp,
      recordsThisMonth
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching weather stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
