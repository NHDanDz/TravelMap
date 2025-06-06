import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ OPTION 2: Category name to ID mapping
const categoryIdMap: { [key: string]: number } = {
  'restaurant': 1,
  'cafe': 2, 
  'hotel': 3,
  'tourist_attraction': 4,
  'shopping': 5,
  'museum': 6,
  'beach': 7,
  'nature': 8,
  'entertainment': 9
};

export async function GET(request: NextRequest) {
  try {
    // Lấy các tham số lọc từ URL (giữ nguyên)
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');  // ← Giữ nguyên nhận 'category'
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    console.log('🔍 API Parameters:', { category, city, search, limit, page });

    // Xây dựng điều kiện lọc
    const where: any = {};
    
    // ✅ FIXED: Map category name to ID như Admin API
    if (category) {
      const categoryId = categoryIdMap[category.trim()];
      
      if (categoryId) {
        where.categoryId = categoryId;  // ← Dùng categoryId như Admin API
        console.log('✅ Category mapped successfully:', { 
          categoryName: category, 
          categoryId: categoryId 
        });
      } else {
        console.warn('⚠️ Unknown category:', category);
        // Optional: Fallback to name matching hoặc return empty results
        where.category = {
          name: {
            contains: category.trim(),
            mode: 'insensitive' as const
          }
        };
        console.log('🔄 Fallback to name matching for unknown category');
      }
    }

    if (city) {
      where.city = {
        name: {
          equals: city.trim(),
          mode: 'insensitive' as const
        }
      };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { address: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    console.log('🔍 Final where clause:', JSON.stringify(where, null, 2));

    // Thực hiện truy vấn với Prisma
    const places = await prisma.place.findMany({
      where,
      include: {
        category: true,
        city: true,
        photos: {
          where: { isPrimary: true },
          take: 1
        },
      },
      take: limit,
      skip,
      orderBy: {
        rating: 'desc'
      }
    });

    // Đếm tổng số địa điểm phù hợp với bộ lọc
    const total = await prisma.place.count({ where });

    console.log('📊 Query results:', {
      placesFound: places.length,
      total,
      page,
      limit,
      categoryUsed: category,
      categoryIdMapped: category ? categoryIdMap[category.trim()] : 'none'
    });

    // Debug: Log sample results
    if (places.length > 0) {
      console.log('📍 Sample results:', places.slice(0, 3).map(p => ({
        name: p.name,
        categoryId: p.categoryId,
        categoryName: p.category?.name,
        cityName: p.city?.name
      })));
    }

    // ✅ Calculate pagination properly
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    // Trả về kết quả
    return NextResponse.json({
      places,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage  // ← Fix cho load more button
      }
    });
  } catch (error) {
    console.error('❌ Error fetching places:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation như Admin API
    if (!body.name || !body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: 'Missing required fields: name, latitude, longitude' },
        { status: 400 }
      );
    }

    // Kiểm tra tọa độ hợp lệ
    const lat = parseFloat(body.latitude);
    const lng = parseFloat(body.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }
    
    // Tạo địa điểm mới
    const newPlace = await prisma.place.create({
      data: {
        name: body.name.trim(),
        address: body.address?.trim() || null,
        description: body.description?.trim() || null,
        latitude: lat,
        longitude: lng,
        imageUrl: body.imageUrl?.trim() || null,
        openingHours: body.openingHours?.trim() || null,
        contactInfo: body.contactInfo?.trim() || null,
        website: body.website?.trim() || null,
        avgDurationMinutes: body.avgDurationMinutes || null,
        priceLevel: body.priceLevel || null,
        categoryId: body.categoryId || null,
        cityId: body.cityId || null
      },
      include: {
        category: true,
        city: true
      }
    });
    
    return NextResponse.json({
      success: true,
      place: newPlace
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating place:', error);
    
    // Handle Prisma errors như Admin API
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A place with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ===================================
// DEBUG HELPER FUNCTION
// ===================================

// Thêm endpoint OPTIONS để debug mapping
export async function OPTIONS(request: NextRequest) {
  try {
    return NextResponse.json({
      debug: true,
      categoryMapping: categoryIdMap,
      availableCategories: Object.keys(categoryIdMap),
      message: "Use GET /api/places?category=tourist_attraction to test"
    });
  } catch (error) {
    return NextResponse.json({ error: 'Debug failed' });
  }
}

// ===================================
// TESTING NOTES
// ===================================

/*
🧪 TEST URLs:
- GET /api/places?category=tourist_attraction&city=Hà Nội&limit=5
- GET /api/places?category=restaurant&limit=10
- OPTIONS /api/places (để xem mapping)

📊 EXPECTED BEHAVIOR:
1. category='tourist_attraction' → categoryId=4 → tìm places với categoryId=4
2. Console logs sẽ show mapping thành công
3. Load more button sẽ hiện (hasNextPage=true)
4. Kết quả sẽ match với Admin API

🔍 DEBUG CHECKLIST:
✅ categoryIdMap có đúng values
✅ category.trim() loại bỏ spaces
✅ where.categoryId = number (không phải string)
✅ Console logs cho thấy mapping process
✅ hasNextPage được calculate đúng
*/