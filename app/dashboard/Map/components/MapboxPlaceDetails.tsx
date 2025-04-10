'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Clock, 
  Phone, 
  Globe, 
  MapPin, 
  Star, 
  DollarSign,
  Info,
  MessageCircle,
  Camera,
  ThumbsUp,
  X,
  Navigation,
  Bookmark,
  User,
  Calendar
} from 'lucide-react';
import { Place } from '../types';

interface PlaceDetailsProps {
  place: Place;
  onClose?: () => void;
  onGetDirections?: (place: Place) => void;
  onSave?: (place: Place) => void;
}

interface PlacePhoto {
  id: string;
  caption: string;
  images: {
    small: { url: string; width: number; height: number; };
    medium: { url: string; width: number; height: number; };
    large: { url: string; width: number; height: number; };
    original: { url: string; width: number; height: number; };
  };
  source: {
    name: string;
    localized_name: string;
  };
  user?: {
    user_id?: string;
    type?: string;
    username?: string;
  };
  is_professional: boolean;
}

interface PlaceReview {
  id: string;
  lang: string;
  location_id: string;
  published_date: string;
  rating: number;
  helpful_votes: string;
  rating_image_url: string;
  url: string;
  trip_type: string;
  travel_date: string;
  text: string;
  title: string;
  user: {
    user_id: string;
    name: string;
    username: string;
    avatar?: {
      small: {
        url: string;
      };
      large: {
        url: string;
      };
    };
  };
  owner_response?: {
    id: string;
    title: string;
    message: string;
    published_date: string;
  };
}

const MapboxPlaceDetails: React.FC<PlaceDetailsProps> = ({ 
  place, 
  onClose,
  onGetDirections,
  onSave
}) => {
  const [activeTab, setActiveTab] = React.useState<'info' | 'photos' | 'reviews'>('info');
  const [extendedDetails, setExtendedDetails] = useState<Place | null>(null);
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [reviews, setReviews] = useState<PlaceReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // If we have an ID, fetch detailed information
    if (place.id) {
      setLoading(true);
      
      // Try fetching from the /api/places endpoint first (which uses TripAdvisor service internally)
      fetch(`/api/places/${place.id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }
          return res.text(); // Get content as text first
        })
        .then(text => {
          // Check text before parsing JSON
          if (!text || text.trim() === '') {
            throw new Error('Empty response from server');
          }
          try {
            const data = JSON.parse(text);
            console.log('Place details loaded:', data);
            setExtendedDetails(data);
          } catch (e) {
            console.error('Error parsing JSON:', e, 'Raw response:', text);
            throw new Error('Invalid JSON response');
          }
        })
        .catch(err => {
          console.error('Error fetching from /api/places:', err);
          
          // Fall back to direct TripAdvisor endpoint if the places API fails
          console.log('Falling back to direct TripAdvisor API endpoint');
          return fetch(`/api/tripadvisor/details/${place.id}`)
            .then(res => {
              if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
              }
              return res.json();
            })
            .then(data => {
              console.log('TripAdvisor details loaded:', data);
              setExtendedDetails(data);
            })
            .catch(fallbackErr => {
              console.error('Error fetching from TripAdvisor API:', fallbackErr);
            });
        })
        .finally(() => {
          setLoading(false);
        });
      
      // Fetch photos
      fetchPhotos(place.id);
      
      // Fetch reviews
      fetchReviews(place.id);
    }
  }, [place.id]);

  // Fetch photos from the API
  const fetchPhotos = async (placeId: string) => {
    try {
      setPhotosLoading(true);
      const response = await fetch(`/api/tripadvisor/photos/${placeId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setPhotos(data.data || []);
      console.log('Photos fetched:', data.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setPhotos([]);
    } finally {
      setPhotosLoading(false);
    }
  };

  // Fetch reviews from the API
  const fetchReviews = async (placeId: string) => {
    try {
      setReviewsLoading(true);
      const response = await fetch(`/api/tripadvisor/reviews/${placeId}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      setReviews(data.data || []);
      console.log('Reviews fetched:', data.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Use extended details if available, otherwise use the basic place info
  const displayPlace = extendedDetails || place;

  const renderPriceLevel = (level?: string) => {
    if (!level) return null;
    const count = level.length;
    return (
      <div className="flex items-center gap-1">
        {Array(count).fill(0).map((_, i) => (
          <DollarSign key={i} className="w-4 h-4 text-green-600" />
        ))}
      </div>
    );
  };

  const renderRating = (rating: string) => {
    const numRating = parseFloat(rating) || 0;
    const roundedRating = Math.min(5, Math.max(0, Math.round(numRating)));
    const emptyStars = Math.max(0, 5 - roundedRating);
    
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {Array(roundedRating).fill(0).map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 text-yellow-400 fill-current"
            />
          ))}
          {Array(emptyStars).fill(0).map((_, i) => (
            <Star
              key={i + roundedRating}
              className="w-4 h-4 text-gray-300"
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  const handleSave = () => {
    setSaved(true);
    if (onSave) {
      onSave(displayPlace);
    }
  };

  const renderContent = () => {
    if (activeTab === 'info') {
      return (
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-2">
            {displayPlace.details?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <span>{displayPlace.details.address}</span>
              </div>
            )}
            {displayPlace.details?.openingHours ? (
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <span>{displayPlace.details.openingHours}</span>
              </div>
            ) : displayPlace.hours ? (
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Giờ mở cửa:</p>
                  <ul className="text-sm space-y-1">
                    {displayPlace.hours.weekday_text.map((day, idx) => (
                      <li key={idx}>{day}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
            {displayPlace.details?.phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <span>{displayPlace.details.phone}</span>
              </div>
            )}
            {displayPlace.details?.website && (
              <div className="flex items-start gap-2">
                <Globe className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <a
                  href={displayPlace.details.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Truy cập website
                </a>
              </div>
            )}
            
            {displayPlace.details?.description && (
              <div className="flex items-start gap-2 mt-3">
                <Info className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <p className="text-sm">{displayPlace.details.description}</p>
              </div>
            )}
          </div>

          {/* Features */}
          {displayPlace.features && displayPlace.features.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Tiện ích</h3>
              <div className="grid grid-cols-2 gap-2">
                {displayPlace.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Cuisine */}
          {displayPlace.cuisine && displayPlace.cuisine.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Ẩm thực</h3>
              <div className="flex flex-wrap gap-2">
                {displayPlace.cuisine.map((item, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-sm">
                    {item.localized_name || item.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Statistics */}
          {displayPlace.ranking_data && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">Thứ hạng</h3>
              <p className="text-sm">
                {displayPlace.ranking_data.ranking_string}
              </p>
            </div>
          )}
          
          {/* Other amenities */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium mb-2">Tiện ích khác</h3>
            <div className="grid grid-cols-2 gap-2">
              {displayPlace.details?.cuisine && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Ẩm thực: {displayPlace.details.cuisine}</span>
                </div>
              )}
              {displayPlace.details?.outdoor_seating === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Chỗ ngồi ngoài trời</span>
                </div>
              )}
              {displayPlace.details?.takeaway === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Mang đi</span>
                </div>
              )}
              {displayPlace.details?.delivery === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Giao hàng</span>
                </div>
              )}
              {displayPlace.details?.smoking === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Khu vực hút thuốc</span>
                </div>
              )}
              {displayPlace.details?.internet_access === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Wi-Fi</span>
                </div>
              )}
              {displayPlace.details?.air_conditioning === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Điều hòa không khí</span>
                </div>
              )}
              {displayPlace.details?.wheelchair === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Tiếp cận xe lăn</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => onGetDirections && onGetDirections(displayPlace)}
              className="w-full py-2 bg-green-600 text-white text-center rounded-md hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              <span>Chỉ đường</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={saved}
              className={`w-full py-2 ${saved ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white text-center rounded-md transition flex items-center justify-center gap-2`}
            >
              <Bookmark className="w-5 h-5" />
              <span>{saved ? 'Đã lưu' : 'Lưu địa điểm'}</span>
            </button>
            
            {displayPlace.details?.website && (
              <a 
                href={displayPlace.details.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 transition"
              >
                Truy cập website
              </a>
            )}
            {displayPlace.details?.phone && (
              <a 
                href={`tel:${displayPlace.details.phone}`}
                className="w-full py-2 bg-green-500 text-white text-center rounded-md hover:bg-green-600 transition"
              >
                Gọi điện
              </a>
            )}
            {displayPlace.write_review && (
              <a 
                href={displayPlace.write_review}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2 bg-yellow-500 text-white text-center rounded-md hover:bg-yellow-600 transition"
              >
                Viết đánh giá trên TripAdvisor
              </a>
            )}
            <button
              onClick={() => {
                if (displayPlace.latitude && displayPlace.longitude) {
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${displayPlace.latitude},${displayPlace.longitude}`, '_blank');
                }
              }}
              className="w-full py-2 bg-gray-600 text-white text-center rounded-md hover:bg-gray-700 transition"
            >
              Mở trong Google Maps
            </button>
          </div>
        </div>
      );
    } else if (activeTab === 'photos') {
      // Photos Tab
      return (
        <div className="space-y-4">
          {photosLoading ? (
            <div className="py-8 flex justify-center">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative h-40 w-full">
                  <Image
                    src={photo.images.medium.url}
                    alt={photo.caption || displayPlace.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-1 text-xs truncate">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : displayPlace.photo ? (
            <div className="relative h-64 w-full">
              <Image
                src={displayPlace.photo.images.large.url}
                alt={displayPlace.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Không có ảnh nào cho địa điểm này
            </p>
          )}
        </div>
      );
    } else {
      // Reviews Tab
      return (
        <div className="space-y-4">
          {reviewsLoading ? (
            <div className="py-8 flex justify-center">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {review.user?.avatar?.small?.url ? (
                      <Image
                        src={review.user.avatar.small.url}
                        alt={review.user.username}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                    <span className="font-medium">{review.user.username}</span>
                    <div className="ml-auto flex">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  {review.title && <h4 className="font-medium mb-1">{review.title}</h4>}
                  <p className="text-sm text-gray-600">{review.text}</p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(review.published_date)}</span>
                    </div>
                    {review.trip_type && (
                      <span>• {review.trip_type}</span>
                    )}
                    {review.travel_date && (
                      <span>• Du lịch {formatDate(review.travel_date)}</span>
                    )}
                  </div>
                  
                  {/* Owner response */}
                  {review.owner_response && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-md">
                      <p className="text-xs font-medium mb-1">Phản hồi từ chủ cơ sở:</p>
                      <p className="text-sm">{review.owner_response.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(review.owner_response.published_date)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Link to all reviews */}
              {displayPlace.web_url && (
                <div className="text-center pt-2">
                  <a 
                    href={displayPlace.web_url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Xem tất cả đánh giá trên TripAdvisor
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Không có đánh giá nào cho địa điểm này</p>
              {displayPlace.web_url && (
                <a 
                  href={displayPlace.web_url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm block mt-2"
                >
                  Xem trên TripAdvisor
                </a>
              )}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="bg-white h-full overflow-auto">
      {/* Header */}
      <div className="relative h-48">
        {displayPlace.photo ? (
          <Image
            src={displayPlace.photo.images.large.url}
            alt={displayPlace.name}
            fill
            className="object-cover"
          />
        ) : photos.length > 0 ? (
          <Image
            src={photos[0].images.large.url}
            alt={displayPlace.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{displayPlace.name}</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {renderRating(displayPlace.rating)}
            {displayPlace.details?.price_level && renderPriceLevel(displayPlace.details.price_level)}
            {displayPlace.num_reviews && (
              <span className="text-sm text-gray-500">({displayPlace.num_reviews} đánh giá)</span>
            )}
          </div>
          {displayPlace.type && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {displayPlace.type.replace('_', ' ')}
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <div className="flex gap-4">
                <button
                  className={`pb-2 px-1 ${
                    activeTab === 'info'
                      ? 'border-b-2 border-green-500 text-green-600'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('info')}
                >
                  Thông tin
                </button>
                <button
                  className={`pb-2 px-1 flex items-center gap-1 ${
                    activeTab === 'photos'
                      ? 'border-b-2 border-green-500 text-green-600'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('photos')}
                >
                  <Camera className="w-4 h-4" />
                  Ảnh {!photosLoading && `(${photos.length || (displayPlace.photo ? 1 : 0)})`}
                </button>
                <button
                  className={`pb-2 px-1 flex items-center gap-1 ${
                    activeTab === 'reviews'
                      ? 'border-b-2 border-green-500 text-green-600'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <MessageCircle className="w-4 h-4" />
                  Đánh giá {!reviewsLoading && displayPlace.num_reviews ? 
                    `(${displayPlace.num_reviews})` : 
                    !reviewsLoading ? `(${reviews.length})` : ''}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {renderContent()}
          </>
        )}
      </div>
    </div>
  );
};

export default MapboxPlaceDetails;