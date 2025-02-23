// components/PlaceDetails.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Clock, 
  Phone, 
  Globe, 
  MapPin, 
  Star, 
  DollarSign,
  Award,
  MessageCircle,
  Camera,
  ThumbsUp
} from 'lucide-react';
import { Place, Review } from '@/types/map';

interface PlaceDetailsProps {
  place: Place;
  onClose?: () => void;
}

const PlaceDetails: React.FC<PlaceDetailsProps> = ({ place, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'info' | 'reviews'>('info');
  const [showAllReviews, setShowAllReviews] = React.useState(false);

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
    const numRating = parseFloat(rating);
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {Array(5).fill(0).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const renderReview = (review: Review) => (
    <div key={review.id} className="border-b border-gray-200 py-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {review.author.avatar ? (
            <Image
              src={review.author.avatar}
              alt={review.author.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">
                {review.author.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium">{review.author.name}</p>
            <p className="text-sm text-gray-500">{review.date}</p>
          </div>
        </div>
        {renderRating(review.rating.toString())}
      </div>
      <h4 className="font-medium mb-1">{review.title}</h4>
      <p className="text-gray-600 text-sm mb-2">{review.text}</p>
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {review.photos.map((photo, index) => (
            <div key={index} className="relative flex-shrink-0">
              <Image
                src={photo.url}
                alt={photo.caption}
                width={100}
                height={100}
                className="rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'info') {
      return (
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            {place.details?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                <span>{place.details.address}</span>
              </div>
            )}
            {place.details?.openingHours && (
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-gray-500 mt-1" />
                <span>{place.details.openingHours}</span>
              </div>
            )}
            {place.details?.phone && (
              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-gray-500 mt-1" />
                <span>{place.details.phone}</span>
              </div>
            )}
            {place.details?.website && (
              <div className="flex items-start gap-2">
                <Globe className="w-5 h-5 text-gray-500 mt-1" />
                <a
                  href={place.details.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Website
                </a>
              </div>
            )}
          </div>

          {/* TripAdvisor Specific Info */}
          {place.tripAdvisor && (
            <>
              {/* Ranking */}
              {place.tripAdvisor.ranking && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span>{place.tripAdvisor.ranking}</span>
                </div>
              )}

              {/* Awards */}
              {place.tripAdvisor.awards && place.tripAdvisor.awards.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium mb-2">Giải thưởng</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.tripAdvisor.awards.map((award, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg"
                      >
                        <Image
                          src={award.images.small}
                          alt={award.name}
                          width={30}
                          height={30}
                        />
                        <div className="text-sm">
                          <div className="font-medium">{award.name}</div>
                          <div className="text-gray-500">{award.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features & Amenities */}
              {place.details?.features && place.details.features.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium mb-2">Tiện nghi</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {place.details.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    // Reviews Tab
    return (
      <div className="space-y-4">
        {place.tripAdvisor?.reviews ? (
          <>
            <div className="flex justify-between items-center">
              <h3 className="font-medium">
                Đánh giá ({place.tripAdvisor.reviews.length})
              </h3>
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-blue-600 text-sm hover:underline"
              >
                {showAllReviews ? 'Thu gọn' : 'Xem tất cả'}
              </button>
            </div>
            <div className="space-y-4">
              {(showAllReviews
                ? place.tripAdvisor.reviews
                : place.tripAdvisor.reviews.slice(0, 3)
              ).map(renderReview)}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Chưa có đánh giá nào
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="relative h-48">
        {place.photo ? (
          <Image
            src={place.photo.images.large.url}
            alt={place.name}
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
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{place.name}</h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {renderRating(place.rating)}
            {place.details?.price_level && renderPriceLevel(place.details.price_level)}
          </div>
          {place.type && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {place.type}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <div className="flex gap-4">
            <button
              className={`pb-2 px-1 ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('info')}
            >
              Thông tin
            </button>
            <button
              className={`pb-2 px-1 flex items-center gap-1 ${
                activeTab === 'reviews'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              <MessageCircle className="w-4 h-4" />
              Đánh giá
              {place.tripAdvisor?.reviews && (
                <span className="text-sm">
                  ({place.tripAdvisor.reviews.length})
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default PlaceDetails;