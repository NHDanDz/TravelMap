// app/dashboard/Map/components/MapboxPlaceDetails.tsx
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
  Navigation
} from 'lucide-react';
import { Place } from '../types';

interface PlaceDetailsProps {
  place: Place;
  onClose?: () => void;
  onGetDirections?: (place: Place) => void;
}

const MapboxPlaceDetails: React.FC<PlaceDetailsProps> = ({ 
  place, 
  onClose,
  onGetDirections 
}) => {
  const [activeTab, setActiveTab] = React.useState<'info' | 'photos'>('info');
  const [extendedDetails, setExtendedDetails] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have an ID, fetch detailed information
    if (place.id) {
      setLoading(true);
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
            setExtendedDetails(data);
          } catch (e) {
            console.error('Error parsing JSON:', e, 'Raw response:', text);
            throw new Error('Invalid JSON response');
          }
        })
        .catch(err => {
          console.error('Error fetching place details:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [place.id]);

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
            {displayPlace.details?.openingHours && (
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <span>{displayPlace.details.openingHours}</span>
              </div>
            )}
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
                  Visit Website
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

          {/* Amenities */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium mb-2">Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {displayPlace.details?.cuisine && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Cuisine: {displayPlace.details.cuisine}</span>
                </div>
              )}
              {displayPlace.details?.outdoor_seating === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Outdoor Seating</span>
                </div>
              )}
              {displayPlace.details?.takeaway === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Takeout Available</span>
                </div>
              )}
              {displayPlace.details?.delivery === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Delivery Available</span>
                </div>
              )}
              {displayPlace.details?.smoking === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Smoking Area</span>
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
                  <span className="text-sm">Air Conditioning</span>
                </div>
              )}
              {displayPlace.details?.wheelchair === 'yes' && (
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Wheelchair Accessible</span>
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
              <span>Get Directions</span>
            </button>
            
            {displayPlace.details?.website && (
              <a 
                href={displayPlace.details.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 transition"
              >
                Visit Website
              </a>
            )}
            {displayPlace.details?.phone && (
              <a 
                href={`tel:${displayPlace.details.phone}`}
                className="w-full py-2 bg-green-500 text-white text-center rounded-md hover:bg-green-600 transition"
              >
                Call
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
              Open in Google Maps
            </button>
          </div>
        </div>
      );
    }

    // Photos Tab
    return (
      <div className="space-y-4">
        {displayPlace.photo ? (
          <div className="grid grid-cols-1 gap-2">
            <div className="relative h-64 w-full">
              <Image
                src={displayPlace.photo.images.large.url}
                alt={displayPlace.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No photos available for this place
          </p>
        )}
      </div>
    );
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
                  Information
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
                  Photos
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