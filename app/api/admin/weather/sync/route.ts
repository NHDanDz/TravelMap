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
    cities.forEach(city => {
      console.log(`  - ${city.name}, ${city.country} (${city.latitude}, ${city.longitude})`);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log(`📅 Syncing data for date: ${today.toISOString()}`);
    
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
              date: today
            }
          }
        });

        if (existing) {
          console.log(`  ⏭️ Data already exists for ${city.name}, skipping...`);
          skipped++;
          continue;
        }

        // Gọi OpenWeather API
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${city.latitude}&lon=${city.longitude}&appid=${API_KEY}&units=metric`;
        console.log(`  🌐 Calling API: ${apiUrl.replace(API_KEY, 'HIDDEN_KEY')}`);
        
        const weatherResponse = await fetch(apiUrl, { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log(`  📡 API Response status: ${weatherResponse.status}`);

        if (!weatherResponse.ok) {
          const errorText = await weatherResponse.text();
          console.error(`  ❌ Weather API failed for city ${city.name}: ${weatherResponse.status} - ${errorText}`);
          errors++;
          continue;
        }

        const weatherData = await weatherResponse.json();
        console.log(`  📊 Raw weather data:`, {
          temp_max: weatherData.main?.temp_max,
          temp_min: weatherData.main?.temp_min,
          condition: weatherData.weather?.[0]?.main,
          description: weatherData.weather?.[0]?.description,
          rain: weatherData.rain,
          clouds: weatherData.clouds?.all
        });

        // Tạo data từ API response
        const realWeatherData = {
          cityId: city.id,
          date: today,
          temperatureHigh: Math.round(weatherData.main.temp_max),
          temperatureLow: Math.round(weatherData.main.temp_min),
          condition: mapWeatherCondition(weatherData.weather[0].main),
          precipitationChance: weatherData.rain ? 
            Math.min(100, Math.round((weatherData.rain['1h'] || weatherData.rain['3h'] || 1) * 100)) : 
            (weatherData.clouds?.all > 70 ? Math.round(weatherData.clouds.all * 0.5) : 0)
        };

        console.log(`  💾 Saving weather data:`, realWeatherData);

        // Lưu vào database
        const savedData = await prisma.weatherData.create({
          data: realWeatherData
        });
        
        console.log(`  ✅ Successfully saved with ID: ${savedData.id}`);
        synced++;
        
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
      total: cities.length
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