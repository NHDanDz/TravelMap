// app/api/admin/weather/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

// Helper function: Tạo weather data từ OpenWeather API
async function createWeatherDataFromAPI(cityId: number, date: Date) {
  console.log(`🌤️ Fetching weather data for city ID ${cityId} on ${date.toISOString().split('T')[0]}...`);
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
    const now = new Date();
    const vietnamNow = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
    vietnamNow.setUTCHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((date.getTime() - vietnamNow.getTime()) / (1000 * 60 * 60 * 24));

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
        clouds: weatherApiData.clouds,
        humidity: weatherApiData.main.humidity,
        windSpeed: weatherApiData.wind?.speed || 0
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
      
      // Tính trung bình humidity và wind speed
      const avgHumidity = forecastItems.reduce((sum: number, item: any) => sum + item.main.humidity, 0) / forecastItems.length;
      const avgWindSpeed = forecastItems.reduce((sum: number, item: any) => sum + (item.wind?.speed || 0), 0) / forecastItems.length;
      
      weatherInfo = {
        tempMax: tempMax,
        tempMin: tempMin,
        condition: mostCommonCondition,
        rain: forecastItems[0].rain,
        clouds: forecastItems[0].clouds,
        humidity: avgHumidity,
        windSpeed: avgWindSpeed
      };
    }
    
    // Map weather condition
    const condition = mapWeatherCondition(weatherInfo.condition);
    
    // Tạo weather data với đầy đủ các trường
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
        // TODO: Add humidity and windSpeed after running migration
        // humidity: Math.round(weatherInfo.humidity),
        // windSpeed: Math.round(weatherInfo.windSpeed * 3.6 * 100) / 100 // Convert m/s to km/h
      }
    });

    console.log(`✅ Created weather data for ${city.name} on ${date.toISOString().split('T')[0]}`);
    console.log(`   Date saved: ${weatherData.date}`);
    console.log(`   Temperature: ${weatherData.temperatureLow}°C - ${weatherData.temperatureHigh}°C`);
    console.log(`   Condition: ${weatherData.condition}`);
    
    return weatherData;

  } catch (error) {
    console.error('Error creating weather data from API:', error);
    return null;
  }
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
        // TODO: Add humidity and windSpeed after running migration
        // humidity: Math.floor(Math.random() * 40) + 50, // 50-90%
        // windSpeed: Math.floor(Math.random() * 20) + 5 // 5-25 km/h
      }
    });
  } catch (error) {
    console.error('Error creating mock weather data:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌤️ Starting weather data sync...');
    
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    console.log('🔑 API Key configured:', !!API_KEY);
    
    if (!API_KEY) {
      console.error('❌ Weather API key not configured');
      return NextResponse.json(
        { error: 'Weather API key not configured' },
        { status: 500 }
      );
    }

    // Lấy danh sách cities
    const cities = await prisma.city.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    console.log(`📍 Found ${cities.length} cities with coordinates`);

    // Tạo ngày hôm nay theo timezone Vietnam (UTC+7)
    const now = new Date();
    const vietnamDate = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // UTC+7
    vietnamDate.setUTCHours(0, 0, 0, 0); // Set về đầu ngày
    
    console.log(`📅 Server time: ${now.toString()}`);
    console.log(`📅 Vietnam time: ${new Date(now.getTime() + (7 * 60 * 60 * 1000)).toString()}`);
    console.log(`📅 Vietnam date (start of day): ${vietnamDate.toString()}`);
    console.log(`📅 Syncing data for date: ${vietnamDate.toISOString()}`);
    console.log(`📅 Date string: ${vietnamDate.toISOString().split('T')[0]}`);
    
    let synced = 0;
    let errors = 0;
    let skipped = 0;

    for (const city of cities) {
      try {
        console.log(`\n🏙️ Processing city: ${city.name}, ${city.country}`);
        
        // Kiểm tra data existing
        const existing = await prisma.weatherData.findUnique({
          where: {
            cityId_date: {
              cityId: city.id,
              date: vietnamDate
            }
          }
        });

        if (existing) {
          console.log(`  ⏭️ Data already exists for ${city.name}, skipping...`);
          skipped++;
          continue;
        }

        // Tạo weather data từ API với đầy đủ các trường
        const weatherData = await createWeatherDataFromAPI(city.id, vietnamDate);
        
        if (weatherData) {
          synced++;
        } else {
          console.error(`  ❌ Failed to create weather data for ${city.name}`);
          errors++;
        }
        
        // Delay để tránh rate limit
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.error(`  ❌ Error syncing weather for city ${city.id} (${city.name}):`, err);
        errors++;
      }
    }

    const result = {
      success: true,
      message: `Synced weather data for ${synced} cities`,
      synced,
      errors,
      skipped,
      total: cities.length,
      date: vietnamDate.toISOString().split('T')[0]
    };

    console.log('\n📈 Sync Summary:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('💥 Fatal error syncing weather data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}