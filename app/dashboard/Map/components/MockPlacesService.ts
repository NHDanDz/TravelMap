// MockPlacesService.ts - Dịch vụ giả lập tìm kiếm địa điểm
import { Place, PlaceType } from '../types';

// Dữ liệu mẫu với các loại địa điểm khác nhau
const mockPlacesData: Record<PlaceType, Place[]> = {
  'restaurant': [
    {
      id: 'mock-rest-1',
      name: 'Nhà hàng Ngon',
      latitude: '21.0285',
      longitude: '105.8542',
      rating: '4.5',
      type: 'restaurant',
      photo: {
        images: {
          large: {
            url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&w=1000&q=80'
          }
        }
      },
      details: {
        address: '123 Đường Lê Lợi, Quận Hoàn Kiếm, Hà Nội',
        phone: '024 3825 1234',
        openingHours: '10:00 AM - 10:00 PM',
        website: 'https://example.com/restaurant',
        description: 'Nhà hàng đặc sản Việt Nam với không gian sang trọng và ấm cúng.',
        price_level: '$$',
        cuisine: 'Việt Nam',
        outdoor_seating: 'yes',
        delivery: 'yes'
      }
    },
    {
      id: 'mock-rest-2',
      name: 'Quán Cơm Phố',
      latitude: '21.0305',
      longitude: '105.8522',
      rating: '4.2',
      type: 'restaurant',
      photo: {
        images: {
          large: {
            url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&w=1000&q=80'
          }
        }
      },
      details: {
        address: '78 Phố Hàng Bông, Quận Hoàn Kiếm, Hà Nội',
        phone: '024 3828 5678',
        openingHours: '11:00 AM - 9:00 PM',
        description: 'Quán cơm bình dân với giá cả phải chăng và đồ ăn ngon.',
        price_level: '$',
        cuisine: 'Việt Nam'
      }
    },
    {
      id: 'mock-rest-3',
      name: 'BBQ Garden',
      latitude: '21.0255',
      longitude: '105.8562',
      rating: '4.7',
      type: 'restaurant',
      photo: {
        images: {
          large: {
            url: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8YmJxfGVufDB8fDB8fA%3D%3D&w=1000&q=80'
          }
        }
      },
      details: {
        address: '256 Đường Tôn Đức Thắng, Quận Đống Đa, Hà Nội',
        phone: '024 3823 9012',
        openingHours: '5:00 PM - 11:00 PM',
        website: 'https://example.com/bbq',
        description: 'Nhà hàng nướng nổi tiếng với các món thịt tươi ngon.',
        price_level: '$$$',
        cuisine: 'BBQ, Hàn Quốc',
        outdoor_seating: 'yes',
        smoking: 'yes'
      }
    }
  ],
  'cafe': [
    {
      id: 'mock-cafe-1',
      name: 'Highland Coffee',
      latitude: '21.0275',
      longitude: '105.8552',
      rating: '4.3',
      type: 'cafe',
      photo: {
        images: {
          large: {
            url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHw%3D&w=1000&q=80'
          }
        }
      },
      details: {
        address: '43 Phố Nguyễn Du, Quận Hai Bà Trưng, Hà Nội',
        phone: '024 3732 1234',
        openingHours: '7:00 AM - 10:00 PM',
        website: 'https://example.com/highland',
        description: 'Chuỗi cà phê nổi tiếng với nhiều chi nhánh trên toàn quốc.',
        price_level: '$$', 
        air_conditioning: 'yes'
      }
    },
    {
      id: 'mock-cafe-2',
      name: 'The Coffee House',
      latitude: '21.0295',
      longitude: '105.8535',
      rating: '4.4',
      type: 'cafe',
      photo: {
        images: {
          large: {
            url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8Y2FmZXxlbnwwfHwwfHw%3D&w=1000&q=80'
          }
        }
      },
      details: {
        address: '19 Phố Quang Trung, Quận Hoàn Kiếm, Hà Nội',
        phone: '024 3734 5678',
        openingHours: '7:30 AM - 11:00 PM',
        website: 'https://example.com/coffeehouse',
        description: 'Không gian thoáng đãng với nhiều món đồ uống hấp dẫn.',
        price_level: '$$', 
        air_conditioning: 'yes',
        outdoor_seating: 'yes'
      }
    }
  ],
  'hotel': [
    {
      id: 'mock-hotel-1',
      name: 'Sofitel Legend Metropole',
      latitude: '21.0245',
      longitude: '105.8572',
      rating: '4.9',
      type: 'hotel',
      photo: {
        images: {
          large: {
            url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8aG90ZWx8ZW58MHx8MHx8&w=1000&q=80'
          }
        }
      },
      details: {
        address: '15 Phố Ngô Quyền, Quận Hoàn Kiếm, Hà Nội',
        phone: '024 3826 6919',
        website: 'https://example.com/metropole',
        description: 'Khách sạn 5 sao hàng đầu với kiến trúc cổ điển và sang trọng.',
        price_level: '$$$$',
        internet_access: 'yes',
        air_conditioning: 'yes',
        wheelchair: 'yes'
      }
    },
    {
      id: 'mock-hotel-2',
      name: 'Hanoi La Siesta Hotel & Spa',
      latitude: '21.0310',
      longitude: '105.8505',
      rating: '4.8',
      type: 'hotel',
      photo: {
        images: {
          large: {
            url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGhvdGVsfGVufDB8fDB8fA%3D%3D&w=1000&q=80'
          }
        }
      },
      details: {
        address: '94 Phố Mã Mây, Quận Hoàn Kiếm, Hà Nội',
        phone: '024 3926 3401',
        website: 'https://example.com/lasiesta',
        description: 'Khách sạn boutique với dịch vụ spa cao cấp.',
        price_level: '$$$',
        internet_access: 'yes',
        air_conditioning: 'yes'
      }
    }
  ],
  'tourist_attraction': [
    {
      id: 'mock-attr-1',
      name: 'Hồ Hoàn Kiếm',
      latitude: '21.0285',
      longitude: '105.8524',
      rating: '4.7',
      type: 'tourist_attraction',
      photo: {
        images: {
          large: {
            url: 'https://images.unsplash.com/photo-1586352858562-32cd6e85aad9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aG9hbiUyMGtpZW0lMjBsYWtlfGVufDB8fDB8fA%3D%3D&w=1000&q=80'
          }
        }
      },
      details: {
        address: 'Phố Đinh Tiên Hoàng, Quận Hoàn Kiếm, Hà Nội',
        description: 'Hồ nước nổi tiếng ở trung tâm Hà Nội với đền Ngọc Sơn và Tháp Rùa.',
        openingHours: '24/7',
        price_level: '$'
      }
    },
    {
      id: 'mock-attr-2',
      name: 'Văn Miếu - Quốc Tử Giám',
      latitude: '21.0274',
      longitude: '105.8354',
      rating: '4.6',
      type: 'tourist_attraction',
      photo: {
        images: {
          large: {
            url: 'https://images.unsplash.com/photo-1596615644583-21b01af6246c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dGVtcGxlJTIwb2YlMjBsaXRlcmF0dXJlfGVufDB8fDB8fA%3D%3D&w=1000&q=80'
          }
        }
      },
      details: {
        address: '58 Phố Quốc Tử Giám, Quận Đống Đa, Hà Nội',
        phone: '024 3747 2566',
        openingHours: '8:00 AM - 5:00 PM',
        description: 'Đền thờ Khổng Tử và trường đại học đầu tiên của Việt Nam.',
        price_level: '$'
      }
    }
  ],
  // Các loại khác với placeholder để giảm kích thước code
  'fast_food': [],
  'bar': [],
  'food_court': [],
  'street_food': [],
  'hostel': [],
  'apartment': [],
  'guest_house': [],
  'museum': [],
  'temple': [],
  'historic': [],
  'viewpoint': [],
  'entertainment': [],
  'cinema': [],
  'karaoke': [],
  'mall': [],
  'supermarket': [],
  'market': [],
  'hospital': [],
  'pharmacy': []
};

// Thêm dữ liệu cho loại Trung tâm thương mại
mockPlacesData['mall'] = [
  {
    id: 'mock-mall-1',
    name: 'Vincom Center Bà Triệu',
    latitude: '21.0194',
    longitude: '105.8525',
    rating: '4.4',
    type: 'mall',
    photo: {
      images: {
        large: {
          url: 'https://images.unsplash.com/photo-1594394894189-8534e41dd525?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWFsbHxlbnwwfHwwfHw%3D&w=1000&q=80'
        }
      }
    },
    details: {
      address: '191 Phố Bà Triệu, Quận Hai Bà Trưng, Hà Nội',
      phone: '024 3974 8668',
      openingHours: '10:00 AM - 10:00 PM',
      website: 'https://example.com/vincom',
      description: 'Trung tâm mua sắm hiện đại với nhiều thương hiệu nổi tiếng.',
      air_conditioning: 'yes',
      wheelchair: 'yes'
    }
  }
];

// Thêm dữ liệu cho loại Giải trí
mockPlacesData['entertainment'] = [
  {
    id: 'mock-ent-1',
    name: 'CGV Cinemas',
    latitude: '21.0264',
    longitude: '105.8498',
    rating: '4.3',
    type: 'entertainment',
    photo: {
      images: {
        large: {
          url: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8Y2luZW1hfGVufDB8fDB8fA%3D%3D&w=1000&q=80'
        }
      }
    },
    details: {
      address: 'Tầng 6, Vincom Center, 191 Bà Triệu, Quận Hai Bà Trưng, Hà Nội',
      phone: '1900 6017',
      openingHours: '9:00 AM - 11:00 PM',
      website: 'https://example.com/cgv',
      description: 'Rạp chiếu phim cao cấp với công nghệ hiện đại.',
      air_conditioning: 'yes',
      wheelchair: 'yes'
    }
  }
];

export class MockPlacesService {
  /**
   * Tìm kiếm địa điểm xung quanh
   */
  static async searchPlaces(
    latitude: number,
    longitude: number,
    type: PlaceType,
    radius: number
  ): Promise<Place[]> {
    console.log(`Searching for ${type} near ${latitude}, ${longitude} within ${radius}m`);
    
    // Tạo độ trễ giả lập để mô phỏng API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Sử dụng dữ liệu mẫu cho loại địa điểm được chọn
    const places = mockPlacesData[type] || [];
    
    // Điều chỉnh tọa độ để tạo ảo giác vị trí gần người dùng
    return places.map(place => {
      // Tạo offset ngẫu nhiên trong bán kính tìm kiếm
      const latOffset = (Math.random() - 0.5) * 0.01 * (radius / 1000);
      const lngOffset = (Math.random() - 0.5) * 0.01 * (radius / 1000);
      
      return {
        ...place,
        latitude: String(latitude + latOffset),
        longitude: String(longitude + lngOffset)
      };
    });
  }
  
  /**
   * Lấy chi tiết địa điểm
   */
  static async getPlaceDetails(placeId: string): Promise<Place | null> {
    console.log(`Fetching details for place: ${placeId}`);
    
    // Tạo độ trễ giả lập để mô phỏng API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Tìm kiếm địa điểm trong tất cả các loại
    for (const type in mockPlacesData) {
      const places = mockPlacesData[type as PlaceType];
      const place = places.find(p => p.id === placeId);
      if (place) {
        return place;
      }
    }
    
    return null;
  }
}