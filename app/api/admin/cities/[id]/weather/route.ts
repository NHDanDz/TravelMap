// app/api/cities/[id]/weather/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    id: string;
  };
}

// GET - Lấy dữ liệu thời tiết cho thành phố theo ngày
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const cityId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    if (isNaN(cityId)) {
      return NextResponse.json(
        { error: 'Invalid city ID' },
        { status: 400 }
      );
    }

    // Kiểm tra city có tồn tại không
    const city = await prisma.city.findUnique({
      where: { id: cityId }
    });

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    // Nếu có date param, tìm weather data cho ngày cụ thể
    if (dateParam) {
      const targetDate = new Date(dateParam);
      targetDate.setHours(0, 0, 0, 0);

      let weatherData = await prisma.weatherData.findUnique({
        where: {
          cityId_date: {
            cityId: cityId,
            date: targetDate
          }
        }
      });

      // Nếu không có dữ liệu thời tiết, tạo mới từ API
      if (!weatherData) {
        console.log(`No weather data found for city ${cityId} on ${dateParam}, creating new data...`);
        
        const createdWeather = await createWeatherDataFromAPI(cityId, targetDate);
        if (createdWeather) {
          weatherData = createdWeather;
        }
      }

      if (!weatherData) {
        return NextResponse.json(
          { error: 'Weather data not found and could not be created' },
          { status: 404 }
        );
      }

      return NextResponse.json(weatherData);
    }

    // Nếu không có date param, trả về tất cả weather data của city
    const weatherData = await prisma.weatherData.findMany({
      where: { cityId: cityId },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(weatherData);
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Tạo/kiểm tra dữ liệu thời tiết cho thành phố 
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const cityId = parseInt(id);
    const body = await request.json();
    const { dates, mode = 'check' } = body; // mode can be 'check' for batch or '5days' for next 5 days

    if (isNaN(cityId)) {
      return NextResponse.json(
        { error: 'Invalid city ID' },
        { status: 400 }
      );
    }

    // Kiểm tra city có tồn tại và có tọa độ không
    const city = await prisma.city.findUnique({
      where: { id: cityId }
    });

    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      );
    }

    if (!city.latitude || !city.longitude) {
      return NextResponse.json(
        { error: 'City coordinates not available' },
        { status: 400 }
      );
    }

    // Handle different modes
    if (mode === '5days') {
      // Tạo weather data cho 5 ngày tới
      const results = await createWeatherDataFor5Days(cityId);
      
      return NextResponse.json({
        success: true,
        message: `Created weather data for ${results.created} days`,
        created: results.created,
        skipped: results.skipped,
        errors: results.errors
      });
    } else if (mode === 'check' && dates && Array.isArray(dates)) {
      // Kiểm tra và tạo weather data cho các ngày cụ thể
      const results = {
        existing: [] as any[],
        created: [] as any[],
        errors: [] as string[]
      };

      // Xử lý từng ngày
      for (const dateString of dates) {
        try {
          const targetDate = new Date(dateString);
          targetDate.setHours(0, 0, 0, 0);

          // Kiểm tra weather data đã tồn tại chưa
          let weatherData = await prisma.weatherData.findUnique({
            where: {
              cityId_date: {
                cityId: cityId,
                date: targetDate
              }
            }
          });

          if (weatherData) {
            console.log(`Weather data already exists for ${dateString}`);
            results.existing.push(weatherData);
          } else {
            // Tạo weather data mới từ API
            console.log(`Creating weather data for ${dateString}`);
            weatherData = await createWeatherDataFromAPI(cityId, targetDate);
            
            if (weatherData) {
              results.created.push(weatherData);
            } else {
              results.errors.push(`Failed to create weather data for ${dateString}`);
            }
          }

          // Delay để tránh rate limit
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`Error processing date ${dateString}:`, error);
          results.errors.push(`Error processing ${dateString}: ${error}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Processed ${dates.length} dates`,
        results: results,
        summary: {
          total: dates.length,
          existing: results.existing.length,
          created: results.created.length,
          errors: results.errors.length
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid mode or missing dates array' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing weather data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function: Tạo weather data từ OpenWeather API
async function createWeatherDataFromAPI(cityId: number, date: Date) {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    
    if (!API_KEY) {
      console.error('OpenWeather API key not configured');
      return null;
    }

    // Lấy thông tin city
    const city = await prisma.city.findUnique({
      where: { id: cityId }
    });

    if (!city || !city.latitude || !city.longitude) {
      console.error('City not found or missing coordinates');
      return null;
    }

    console.log(`Calling OpenWeather API for city: ${city.name} on ${date.toISOString().split('T')[0]}`);

    // Kiểm tra xem ngày có trong tương lai gần không (5 ngày tới) để dùng current weather
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let apiUrl: string;
    
    if (diffDays <= 0) {
      // Ngày hiện tại hoặc quá khứ - dùng current weather
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${city.latitude}&lon=${city.longitude}&appid=${API_KEY}&units=metric`;
    } else if (diffDays <= 5) {
      // 5 ngày tới - dùng forecast API (miễn phí)
      apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${city.latitude}&lon=${city.longitude}&appid=${API_KEY}&units=metric`;
    } else {
      // Quá 5 ngày - tạo dữ liệu mô phỏng
      console.log(`Date ${date.toISOString().split('T')[0]} is too far in the future for free API`);
      return createMockWeatherData(cityId, date);
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`OpenWeather API failed: ${response.status}`);
      return null;
    }

    const weatherApiData = await response.json();
    
    let weatherInfo;
    
    if (diffDays <= 0) {
      // Current weather response
      weatherInfo = {
        tempMax: weatherApiData.main.temp_max,
        tempMin: weatherApiData.main.temp_min,
        condition: weatherApiData.weather[0].main,
        rain: weatherApiData.rain,
        clouds: weatherApiData.clouds
      };
    } else {
      // Forecast response - lấy dữ liệu cho ngày cụ thể
      const targetDateStr = date.toISOString().split('T')[0];
      const forecastItems = weatherApiData.list.filter((item: any) => 
        item.dt_txt.startsWith(targetDateStr)
      );
      
      if (forecastItems.length === 0) {
        console.error(`No forecast data found for ${targetDateStr}`);
        return createMockWeatherData(cityId, date);
      }
      
      // Tính toán temp max/min từ các forecast items trong ngày
      const temps = forecastItems.map((item: any) => item.main.temp);
      const tempMax = Math.max(...temps);
      const tempMin = Math.min(...temps);
      
      // Lấy condition phổ biến nhất trong ngày
      const conditions = forecastItems.map((item: any) => item.weather[0].main);
      const mostCommonCondition = conditions.sort((a: string, b: string) =>
        conditions.filter((v: string) => v === a).length - conditions.filter((v: string) => v === b).length
      ).pop();
      
      weatherInfo = {
        tempMax: tempMax,
        tempMin: tempMin,
        condition: mostCommonCondition,
        rain: forecastItems[0].rain,
        clouds: forecastItems[0].clouds
      };
    }
    
    // Map weather condition
    const condition = mapWeatherCondition(weatherInfo.condition);
    
    // Tạo weather data
    const weatherData = await prisma.weatherData.create({
      data: {
        cityId: cityId,
        date: date,
        temperatureHigh: Math.round(weatherInfo.tempMax),
        temperatureLow: Math.round(weatherInfo.tempMin),
        condition: condition,
        precipitationChance: weatherInfo.rain ? 
          Math.min(100, Math.round((weatherInfo.rain['1h'] || weatherInfo.rain['3h'] || 1) * 100)) : 
          (weatherInfo.clouds?.all > 70 ? Math.round(weatherInfo.clouds.all * 0.5) : 0)
      }
    });

    console.log(`Created weather data for ${city.name} on ${date.toISOString().split('T')[0]}`);
    return weatherData;

  } catch (error) {
    console.error('Error creating weather data from API:', error);
    return null;
  }
}

// Helper function: Tạo weather data cho 5 ngày tới
async function createWeatherDataFor5Days(cityId: number) {
  const results = {
    created: 0,
    skipped: 0,
    errors: 0
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 5; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);

    try {
      // Kiểm tra weather data đã tồn tại chưa
      const existingData = await prisma.weatherData.findUnique({
        where: {
          cityId_date: {
            cityId: cityId,
            date: targetDate
          }
        }
      });

      if (existingData) {
        console.log(`Weather data already exists for ${targetDate.toISOString().split('T')[0]}`);
        results.skipped++;
        continue;
      }

      // Tạo weather data mới
      const weatherData = await createWeatherDataFromAPI(cityId, targetDate);
      
      if (weatherData) {
        results.created++;
      } else {
        results.errors++;
      }

      // Delay để tránh rate limit
      if (i < 4) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }

    } catch (error) {
      console.error(`Error creating weather data for ${targetDate.toISOString().split('T')[0]}:`, error);
      results.errors++;
    }
  }

  return results;
}

// Helper function: Tạo dữ liệu thời tiết mô phỏng
async function createMockWeatherData(cityId: number, date: Date) {
  try {
    const month = date.getMonth();
    const conditions = ['sunny', 'cloudy', 'rain'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Nhiệt độ dựa trên tháng (giả định khí hậu nhiệt đới)
    let baseTempHigh = 30;
    let baseTempLow = 22;
    
    if (month >= 11 || month <= 2) { // Mùa đông
      baseTempHigh = 28;
      baseTempLow = 20;
    } else if (month >= 3 && month <= 5) { // Mùa xuân/hè
      baseTempHigh = 35;
      baseTempLow = 25;
    }
    
    const tempVariation = (Math.random() - 0.5) * 6; // +/- 3 độ
    
    return await prisma.weatherData.create({
      data: {
        cityId: cityId,
        date: date,
        temperatureHigh: Math.round(baseTempHigh + tempVariation),
        temperatureLow: Math.round(baseTempLow + tempVariation),
        condition: condition,
        precipitationChance: condition === 'rain' ? Math.floor(Math.random() * 60) + 40 : Math.floor(Math.random() * 30)
      }
    });
  } catch (error) {
    console.error('Error creating mock weather data:', error);
    return null;
  }
}

// Helper function: Map weather condition
function mapWeatherCondition(openWeatherCondition: string): string {
  const conditionMap: Record<string, string> = {
    'Clear': 'sunny',
    'Clouds': 'cloudy', 
    'Rain': 'rain',
    'Drizzle': 'light_rain',
    'Thunderstorm': 'thunderstorm',
    'Snow': 'snow',
    'Mist': 'fog',
    'Fog': 'fog',
    'Haze': 'fog'
  };
  
  return conditionMap[openWeatherCondition] || 'cloudy';
}