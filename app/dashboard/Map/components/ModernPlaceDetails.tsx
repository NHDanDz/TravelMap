// app/dashboard/Map/components/ModernPlaceDetails.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, 
  Star, 
  Clock, 
  Phone, 
  Globe, 
  MapPin, 
  Navigation, 
  Bookmark, 
  Share,  
  DollarSign,
  Info,
  MessageCircle,
  Camera,
  ThumbsUp,
  ExternalLink,
  User,
  Calendar,
  Loader2
} from 'lucide-react';
import { Place } from '../types';

interface ModernPlaceDetailsProps {
  place: Place;
  onClose: () => void;
  onGetDirections?: (place: Place) => void;
  onSave?: (place: Place) => void;
}

const ModernPlaceDetails: React.FC<ModernPlaceDetailsProps> = ({ 
  place, 
  onClose,
  onGetDirections,
  onSave 
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'reviews'>('info');
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Load additional details when component mounts
  useEffect(() => {
    if (place.id) {
      loadPlaceDetails();
    }
  }, [place.id]);

  const loadPlaceDetails = async () => {
    setDetailsLoading(true);
    
    try {
      // Load photos
      const photosResponse = await fetch(`/api/tripadvisor/photos/${place.id}`);
      if (photosResponse.ok) {
        const photosData = await photosResponse.json();
        setPhotos(photosData.data || []);
      }

      // Load reviews
      const reviewsResponse = await fetch(`/api/tripadvisor/reviews/${place.id}`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.data || []);
      }
    } catch (error) {
      console.error('Error loading place details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Format rating display
  const renderRating = (rating: string) => {
    const numRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {Array(fullStars).fill(0).map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          ))}
          {hasHalfStar && (
            <Star className="w-4 h-4 text-yellow-400 fill-current opacity-50" />
          )}
          {Array(emptyStars).fill(0).map((_, i) => (
            <Star key={i + fullStars} className="w-4 h-4 text-gray-300" />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {numRating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Price level indicator
  const renderPriceLevel = (level?: string) => {
    if (!level) return null;
    const count = level.length;
    return (
      <div className="flex items-center space-x-1">
        {Array(count).fill(0).map((_, i) => (
          <DollarSign key={i} className="w-4 h-4 text-green-600" />
        ))}
        {Array(4 - count).fill(0).map((_, i) => (
          <DollarSign key={i + count} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Handle save
  const handleSave = () => {
    setSaved(true);
    onSave?.(place);
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: place.name,
          text: `Xem thông tin về ${place.name}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // Show toast notification
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const displayPhotos = photos.length > 0 ? photos : (place.photo ? [place.photo] : []);

  return (
    <div className="bg-white h-full overflow-auto shadow-2xl">
      {/* Header Image */}
      <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
        {displayPhotos.length > 0 ? (
          <div className="relative h-full">
            <Image
              src={displayPhotos[currentPhotoIndex]?.images?.large?.url || displayPhotos[currentPhotoIndex]?.url || '/images/default-place.jpg'}
              alt={place.name}
              fill
              className="object-cover"
            />
            
            {/* Photo navigation */}
            {displayPhotos.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentPhotoIndex(prev => 
                    prev > 0 ? prev - 1 : displayPhotos.length - 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentPhotoIndex(prev => 
                    prev < displayPhotos.length - 1 ? prev + 1 : 0
                  )}
                  className="absolute right-16 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                >
                  →
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {displayPhotos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Camera className="w-16 h-16 text-white/50" />
          </div>
        )}
        
        {/* Header Controls */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            <Share className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Rating */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{place.name}</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {renderRating(place.rating)}
              {place.details?.price_level && renderPriceLevel(place.details.price_level)}
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {place.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => onGetDirections?.(place)}
            className="flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg"
          >
            <Navigation className="w-5 h-5" />
            <span className="font-medium">Chỉ đường</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center justify-center space-x-2 py-3 rounded-xl transition-all duration-200 ${
              saved 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span className="font-medium">{saved ? 'Đã lưu' : 'Lưu'}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {[
              { id: 'info', icon: Info, label: 'Thông tin' },
              { id: 'photos', icon: Camera, label: `Ảnh (${displayPhotos.length})` },
              { id: 'reviews', icon: MessageCircle, label: `Đánh giá (${reviews.length})` }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 pb-3 border-b-2 transition-all ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                {place.details?.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900">{place.details.address}</p>
                    </div>
                  </div>
                )}
                
                {place.details?.openingHours && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900">{place.details.openingHours}</p>
                    </div>
                  </div>
                )}
                
                {place.details?.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <a href={`tel:${place.details.phone}`} className="text-blue-600 hover:underline">
                      {place.details.phone}
                    </a>
                  </div>
                )}
                
                {place.details?.website && (
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                    <a 
                      href={place.details.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center space-x-1"
                    >
                      <span>Trang web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {place.details?.description && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                  <p className="text-gray-700 leading-relaxed">{place.details.description}</p>
                </div>
              )}

              {/* Features */}
              {place.features && place.features.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tiện ích</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {place.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                        <ThumbsUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cuisine */}
              {place.cuisine && place.cuisine.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Ẩm thực</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.cuisine.map((item, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                      >
                        {item.localized_name || item.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : displayPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {displayPhotos.map((photo, index) => (
                    <div key={index} className="relative h-32 rounded-xl overflow-hidden group cursor-pointer">
                      <Image
                        src={photo.images?.medium?.url || photo.url || '/images/default-place.jpg'}
                        alt={photo.caption || place.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-white text-xs truncate">{photo.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Không có ảnh nào</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.user?.username}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(review.published_date)}</span>
                            </div>
                          </div>
                        </div>
                        {renderRating(review.rating.toString())}
                      </div>
                      
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                      )}
                      
                      <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
                      
                      {review.trip_type && (
                        <div className="mt-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {review.trip_type}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {place.web_url && (
                    <div className="text-center pt-4">
                      <a 
                        href={place.web_url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <span>Xem tất cả đánh giá</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có đánh giá nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernPlaceDetails;