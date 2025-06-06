// app/places/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  MapPin, ArrowLeft, Star, Phone, Globe, Clock,
  Camera, Navigation, User, MessageCircle, 
  Coffee, Hotel, Utensils, Landmark, Share, Heart, ExternalLink
} from 'lucide-react';
import SharedLayout from '../../components/layout/SharedLayout';

interface Category {
  id: number;
  name: string;
  icon?: string;
}

interface City {
  id: number;
  name: string;
  country: string;
}

interface Photo {
  id: number;
  url: string;
  caption?: string;
  isPrimary: boolean;
  user?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  visitDate?: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
}

interface NearbyPlace {
  nearbyPlace: {
    id: number;
    name: string;
    category?: Category;
    photos?: Photo[];
  };
}

interface PlaceDetail {
  id: number;
  name: string;
  address?: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  openingHours?: string;
  contactInfo?: string;
  website?: string;
  avgDurationMinutes?: number;
  priceLevel?: string;
  rating?: number;
  category?: Category;
  city?: City;
  photos: Photo[];
  reviews: Review[];
  nearbyFromPlaces: NearbyPlace[];
}

const getCategoryIcon = (categoryName?: string) => {
  switch (categoryName?.toLowerCase()) {
    case 'restaurant':
    case 'nhà hàng':
      return <Utensils className="w-5 h-5" />;
    case 'cafe':
    case 'quán cà phê':
      return <Coffee className="w-5 h-5" />;
    case 'hotel':
    case 'khách sạn':
      return <Hotel className="w-5 h-5" />;
    case 'tourist_attraction':
    case 'du lịch':
      return <Landmark className="w-5 h-5" />;
    default:
      return <MapPin className="w-5 h-5" />;
  }
};

const getPriceDisplay = (level?: string) => {
  switch (level?.toLowerCase()) {
    case 'cheap':
      return { text: 'Giá rẻ', icon: '$', color: 'text-green-600' };
    case 'moderate':
      return { text: 'Trung bình', icon: '$$', color: 'text-yellow-600' };
    case 'expensive':
      return { text: 'Cao cấp', icon: '$$$', color: 'text-red-600' };
    default:
      return { text: 'Chưa rõ', icon: '', color: 'text-gray-600' };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const PlaceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const placeId = params.id as string;

  const [place, setPlace] = useState<PlaceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'reviews' | 'nearby'>('overview');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (placeId) {
      fetchPlaceDetail();
    }
  }, [placeId]);

  const fetchPlaceDetail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/places/${placeId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Không tìm thấy địa điểm');
        }
        throw new Error('Không thể tải thông tin địa điểm');
      }
      
      const data = await response.json();
      setPlace(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSharePlace = () => {
    if (navigator.share && place) {
      navigator.share({
        title: place.name,
        text: `Khám phá ${place.name} trên TravelSense`,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  const openGoogleMaps = () => {
    if (place) {
      const url = `https://www.google.com/maps?q=${place.latitude},${place.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <SharedLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
              <div className="h-96 bg-gray-300 rounded-xl mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="h-32 bg-gray-300 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SharedLayout>
    );
  }

  if (error || !place) {
    return (
      <SharedLayout>
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-4">
              {error || 'Không tìm thấy địa điểm'}
            </div>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const priceInfo = getPriceDisplay(place.priceLevel);
  const primaryPhoto = place.photos.find(photo => photo.isPrimary) || place.photos[0];

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="relative h-96 overflow-hidden">
          <Image
            src={primaryPhoto?.url || place.imageUrl || '/images/default-place.jpg'}
            alt={place.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-white bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-black/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSharePlace}
                className="text-white bg-black/30 backdrop-blur-sm p-2 rounded-lg hover:bg-black/50 transition-colors"
              >
                <Share className="w-5 h-5" />
              </button>
              <button className="text-white bg-black/30 backdrop-blur-sm p-2 rounded-lg hover:bg-black/50 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {place.name}
                  </h1>
                  {place.category && (
                    <div className="flex items-center text-white/90 text-lg mb-2">
                      {getCategoryIcon(place.category.name)}
                      <span className="ml-2">{place.category.name}</span>
                    </div>
                  )}
                </div>
                
                {place.rating && (
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-2 font-bold text-lg">{place.rating}</span>
                  </div>
                )}
              </div>
              
              {place.address && (
                <div className="flex items-center text-white/90 text-lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{place.address}</span>
                  {place.city && (
                    <span className="ml-2">• {place.city.name}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {place.priceLevel && (
                <div className="text-center">
                  <div className={`text-xl font-bold ${priceInfo.color} mb-1`}>
                    {priceInfo.icon}
                  </div>
                  <div className="text-sm text-gray-600">{priceInfo.text}</div>
                </div>
              )}
              
              {place.avgDurationMinutes && (
                <div className="text-center">
                  <div className="flex items-center justify-center text-blue-600 mb-1">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-sm text-gray-600">
                    ~{Math.round(place.avgDurationMinutes / 60)}h thăm quan
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <div className="flex items-center justify-center text-green-600 mb-1">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-sm text-gray-600">
                  {place.photos.length} ảnh
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center text-purple-600 mb-1">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="text-sm text-gray-600">
                  {place.reviews.length} đánh giá
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-6">
            <div className="flex border-b">
              {[
                { key: 'overview', label: 'Tổng quan' },
                { key: 'photos', label: `Ảnh (${place.photos.length})` },
                { key: 'reviews', label: `Đánh giá (${place.reviews.length})` },
                { key: 'nearby', label: `Gần đây (${place.nearbyFromPlaces.length})` }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 py-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {place.description && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Mô tả</h2>
                    <p className="text-gray-600 leading-relaxed">{place.description}</p>
                  </div>
                )}

                {place.openingHours && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Giờ mở cửa</h2>
                    <div className="text-gray-600">{place.openingHours}</div>
                  </div>
                )}

                {/* Recent Reviews */}
                {place.reviews.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Đánh giá gần đây</h2>
                    <div className="space-y-4">
                      {place.reviews.slice(0, 3).map(review => (
                        <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                          <div className="flex items-start gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                              {review.user.avatarUrl ? (
                                <Image
                                  src={review.user.avatarUrl}
                                  alt={review.user.username}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{review.user.username}</span>
                                <div className="flex">
                                  {Array(5).fill(0).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-gray-600 text-sm mb-1">{review.comment}</p>
                              )}
                              <div className="text-xs text-gray-500">
                                {formatDate(review.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {place.reviews.length > 3 && (
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Xem tất cả {place.reviews.length} đánh giá
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Thông tin liên hệ</h2>
                  <div className="space-y-3">
                    {place.contactInfo && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="text-gray-600">{place.contactInfo}</span>
                      </div>
                    )}
                    
                    {place.website && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-gray-400 mr-3" />
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          Website
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                    
                    <button
                      onClick={openGoogleMaps}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Navigation className="w-4 h-4 mr-3" />
                      Chỉ đường
                    </button>
                  </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Vị trí</h2>
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">Bản đồ</span>
                    {/* Could integrate with Google Maps or similar here */}
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Tọa độ: {place.latitude}, {place.longitude}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {place.photos.map(photo => (
                <div
                  key={photo.id}
                  className="relative aspect-square cursor-pointer group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || place.name}
                    fill
                    className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                  {photo.isPrimary && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Ảnh chính
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {place.reviews.map(review => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {review.user.avatarUrl ? (
                        <Image
                          src={review.user.avatarUrl}
                          alt={review.user.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">{review.user.username}</span>
                        <div className="flex">
                          {Array(5).fill(0).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600">{review.comment}</p>
                      )}
                      {review.visitDate && (
                        <div className="mt-2 text-sm text-gray-500">
                          Đã ghé thăm vào {formatDate(review.visitDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {place.reviews.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500">Chưa có đánh giá nào</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'nearby' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {place.nearbyFromPlaces.map((nearby, index) => (
                <Link
                  key={index}
                  href={`/places/${nearby.nearbyPlace.id}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-48">
                    <Image
                      src={nearby.nearbyPlace.photos?.[0]?.url || '/images/default-place.jpg'}
                      alt={nearby.nearbyPlace.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {nearby.nearbyPlace.category && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center">
                        {getCategoryIcon(nearby.nearbyPlace.category.name)}
                        <span className="ml-1 text-xs">{nearby.nearbyPlace.category.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{nearby.nearbyPlace.name}</h3>
                  </div>
                </Link>
              ))}
              
              {place.nearbyFromPlaces.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500">Không có địa điểm gần đây</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Photo Modal */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || place.name}
                width={800}
                height={600}
                className="object-contain max-w-full max-h-full"
              />
              {selectedPhoto.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                  {selectedPhoto.caption}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SharedLayout>
  );
};

export default PlaceDetailPage;