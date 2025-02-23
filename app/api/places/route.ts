// app/api/places/route.ts
import { NextResponse } from 'next/server';
import { Place } from '@/app/dashboard/Map/types';

interface OverpassElement {
  type: string;
  id: number;
  tags?: {
    name?: string;
    cuisine?: string;
    'opening_hours'?: string;
    phone?: string;
    'contact:phone'?: string;
    website?: string;
    'contact:website'?: string;
    url?: string;
    description?: string;
    'description:vi'?: string;
    note?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    rating?: string;
    capacity?: string;
    wheelchair?: string;
    internet_access?: string;
    outdoor_seating?: string;
    takeaway?: string;
    delivery?: string;
    drive_through?: string;
    smoking?: string;
    air_conditioning?: string;
    service_times?: string;
    'phone:mobile'?: string;
    'social:facebook'?: string;
  };
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
}

interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

async function fetchPlacesFromOverpass(lat: number, lng: number, type: string, radius: number): Promise<Place[]> {
  const typeMapping: Record<string, string[]> = {
    // Ẩm thực
    restaurant: [
      'amenity=restaurant',
      'cuisine=*'
    ],
    fast_food: [
      'amenity=fast_food',
      'amenity=food_court'
    ],
    cafe: [
      'amenity=cafe',
      'shop=coffee',
      'cuisine=coffee_shop'
    ],
    bar: [
      'amenity=bar',
      'amenity=pub',
      'club=yes'
    ],
    food_court: [
      'amenity=food_court',
      'amenity=marketplace'
    ],
    street_food: [
      'amenity=marketplace',
      'amenity=food_court',
      'shop=street_food'
    ],

    // Lưu trú
    hotel: [
      'tourism=hotel',
      'building=hotel'
    ],
    hostel: [
      'tourism=hostel',
      'building=hostel'
    ],
    apartment: [
      'tourism=apartment',
      'building=apartments'
    ],
    guest_house: [
      'tourism=guest_house',
      'building=guest_house'
    ],

    // Du lịch & Văn hóa
    tourist_attraction: [
      'tourism=attraction',
      'tourism=viewpoint',
      'historic=*'
    ],
    museum: [
      'tourism=museum',
      'building=museum'
    ],
    temple: [
      'amenity=place_of_worship',
      'building=temple',
      'historic=temple',
      'religion=buddhist'
    ],
    historic: [
      'historic=monument',
      'historic=memorial',
      'historic=archaeological_site',
      'historic=castle',
      'historic=ruins'
    ],
    viewpoint: [
      'tourism=viewpoint',
      'tourism=artwork'
    ],

    // Giải trí
    entertainment: [
      'leisure=amusement_arcade',
      'leisure=park',
      'leisure=playground',
      'leisure=sports_centre',
      'amenity=entertainment'
    ],
    cinema: [
      'amenity=cinema',
      'leisure=cinema'
    ],
    karaoke: [
      'amenity=karaoke',
      'leisure=dance',
      'club=yes'
    ],

    // Mua sắm
    mall: [
      'shop=mall',
      'shop=department_store',
      'building=retail',
      'building=commercial'
    ],
    supermarket: [
      'shop=supermarket',
      'shop=convenience',
      'shop=grocery'
    ],
    market: [
      'amenity=marketplace',
      'shop=market',
      'building=market'
    ],

    // Y tế & Sức khỏe
    hospital: [
      'amenity=hospital',
      'amenity=clinic',
      'healthcare=hospital',
      'healthcare=clinic'
    ],
    pharmacy: [
      'amenity=pharmacy',
      'healthcare=pharmacy',
      'shop=pharmacy'
    ]
  };

  const types = typeMapping[type];
  if (!types || types.length === 0) {
    throw new Error(`Invalid place type: ${type}`);
  }

  // Build queries for each type
  const queryParts = types.map(t => {
    const [key, value] = t.split('=');
    return value === '*' ? `${key}` : `${key}="${value}"`;
  });


  const query = `
    [out:json][timeout:50];
    (
      ${queryParts.map(part => `node[${part}](around:${radius},${lat},${lng});`).join('')}
      ${queryParts.map(part => `way[${part}](around:${radius},${lat},${lng});`).join('')}
      ${queryParts.map(part => `relation[${part}](around:${radius},${lat},${lng});`).join('')}
    );
    out body;
    >;
    out skel qt;
  `.trim();

  console.log('Query:', query);

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'TravelSense/1.0'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Overpass API error:', response.status, errorText);
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data = await response.json() as OverpassResponse;
    
    if (!data.elements || !Array.isArray(data.elements)) {
      console.error('Invalid response format:', data);
      return [];
    }

    console.log(`Found ${data.elements.length} raw elements`);

    const places: Place[] = data.elements
      .filter((element: OverpassElement) => {
        const hasName = element.tags?.name;
        const hasCoords = 
          (element.type === 'node' && typeof element.lat === 'number' && typeof element.lon === 'number') ||
          (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number');
        return hasName && hasCoords;
      })
      .map((element: OverpassElement): Place | null => {
        const { tags } = element;
        if (!tags) return null;

        let latitude: number | undefined;
        let longitude: number | undefined;

        if (element.type === 'node') {
          latitude = element.lat;
          longitude = element.lon;
        } else if (element.center) {
          latitude = element.center.lat;
          longitude = element.center.lon;
        }

        if (typeof latitude === 'undefined' || typeof longitude === 'undefined') {
          return null;
        }

        // Build address string
        let address = '';
        if (tags['addr:street']) {
          address = tags['addr:street'];
          if (tags['addr:housenumber']) {
            address = `${address} ${tags['addr:housenumber']}`;
          }
        }

        return {
          name: tags.name || 'Không có tên',
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          rating: tags.rating || '4',
          type: type,
          details: {
            cuisine: tags.cuisine,
            openingHours: tags['opening_hours'] || tags['service_times'],
            phone: tags.phone || tags['contact:phone'] || tags['phone:mobile'],
            website: tags.website || tags['contact:website'] || tags.url || tags['social:facebook'],
            description: tags.description || tags['description:vi'] || tags.note,
            address: address || undefined,
            // Additional details if needed
            capacity: tags.capacity,
            wheelchair: tags.wheelchair,
            internet_access: tags.internet_access,
            outdoor_seating: tags.outdoor_seating,
            takeaway: tags.takeaway,
            delivery: tags.delivery,
            drive_through: tags.drive_through,
            smoking: tags.smoking,
            air_conditioning: tags.air_conditioning
          }
        };
      })
      .filter((place): place is Place => place !== null);

    const uniquePlaces = Array.from(
      new Map(places.map(place => [place.name + place.latitude + place.longitude, place])).values()
    );

    console.log(`Returning ${uniquePlaces.length} unique places`);
    return uniquePlaces;

  } catch (error) {
    console.error('Error fetching from Overpass:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const type = searchParams.get('type');
    const radius = searchParams.get('radius');

    if (!lat || !lng || !type || !radius) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Search request:', { lat, lng, type, radius });

    const places = await fetchPlacesFromOverpass(
      parseFloat(lat),
      parseFloat(lng),
      type,
      parseInt(radius)
    );

    return NextResponse.json(places);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}