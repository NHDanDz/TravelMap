// app/test-tripadvisor/page.tsx
'use client';

import React, { useState } from 'react';
import { Place, PlaceType } from '@/app/dashboard/Map/types';
import Image from 'next/image';

export default function TestTripadvisorPage() {
  const [lat, setLat] = useState('21.0285');
  const [lng, setLng] = useState('105.8542');
  const [placeType, setPlaceType] = useState<PlaceType>('restaurant');
  const [radius, setRadius] = useState('1000');
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchPlaces = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        lat,
        lng,
        type: placeType,
        radius
      });
      
      const response = await fetch(`/api/places?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json() as Place[];
      setPlaces(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error searching places:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPlaceDetails = async (placeId: string) => {
    if (!placeId) return;
    
    setDetailsLoading(true);
    
    try {
      const response = await fetch(`/api/places/${placeId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json() as Place;
      setSelectedPlace(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching place details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Foursquare API</h1>
      
      {/* Search Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Places</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitude</label>
            <input
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitude</label>
            <input
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Place Type</label>
            <select
              value={placeType}
              onChange={(e) => setPlaceType(e.target.value as PlaceType)}
              className="w-full p-2 border rounded"
            >
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="bar">Bar</option>
              <option value="hotel">Hotel</option>
              <option value="tourist_attraction">Tourist Attraction</option>
              <option value="museum">Museum</option>
              <option value="cinema">Cinema</option>
              <option value="supermarket">Supermarket</option>
              <option value="hospital">Hospital</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Radius (meters)</label>
            <input
              type="text"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          onClick={searchPlaces}
          disabled={loading}
          className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Searching...' : 'Search Places'}
        </button>
      </div>
      
      {/* Results */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Results</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => (
              <div
                key={place.id || `${place.latitude}-${place.longitude}`}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition cursor-pointer"
                onClick={() => place.id && fetchPlaceDetails(place.id)}
              >
                <div className="relative h-40 w-full">
                  {place.photo ? (
                    <Image
                      src={place.photo.images.large.url}
                      alt={place.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1">{place.name}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="mr-2">Rating: {place.rating || 'N/A'}</span>
                    <span>Type: {place.type}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Lat: {place.latitude}, Lng: {place.longitude}
                  </div>
                  <button
                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      place.id && fetchPlaceDetails(place.id)
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No places found. Try searching with different parameters.</p>
        )}
      </div>
      
      {/* Selected Place Details */}
      {selectedPlace && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Place Details</h2>
          
          {detailsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-medium mb-2">{selectedPlace.name}</h3>
              
              {selectedPlace.photo && (
                <div className="relative h-64 w-full mb-4">
                  <Image
                    src={selectedPlace.photo.images.large.url}
                    alt={selectedPlace.name}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <p><strong>Type:</strong> {selectedPlace.type}</p>
                  <p><strong>Rating:</strong> {selectedPlace.rating || 'N/A'}</p>
                  <p><strong>Location:</strong> {selectedPlace.latitude}, {selectedPlace.longitude}</p>
                </div>
                
                {selectedPlace.details && (
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    {selectedPlace.details.address && (
                      <p><strong>Address:</strong> {selectedPlace.details.address}</p>
                    )}
                    {selectedPlace.details.phone && (
                      <p><strong>Phone:</strong> {selectedPlace.details.phone}</p>
                    )}
                    {selectedPlace.details.website && (
                      <p>
                        <strong>Website:</strong>{' '}
                        <a
                          href={selectedPlace.details.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {selectedPlace.details.website}
                        </a>
                      </p>
                    )}
                    {selectedPlace.details.openingHours && (
                      <p><strong>Hours:</strong> {selectedPlace.details.openingHours}</p>
                    )}
                    {selectedPlace.details.price_level && (
                      <p><strong>Price Level:</strong> {selectedPlace.details.price_level}</p>
                    )}
                    {selectedPlace.details.cuisine && (
                      <p><strong>Cuisine:</strong> {selectedPlace.details.cuisine}</p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Raw JSON Data */}
              <div className="mt-6">
                <h4 className="font-medium mb-2">Raw JSON Data</h4>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                  {JSON.stringify(selectedPlace, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* API Key Status */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">API Key Status</h2>
        <TestApiKey />
      </div>
    </div>
  );
}

// Component to test if the API key exists
function TestApiKey() {
  const [keyStatus, setKeyStatus] = useState<{exists: boolean, timestamp: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const checkApiKey = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-key');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      setKeyStatus(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error checking API key:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <button
        onClick={checkApiKey}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Checking...' : 'Check API Key Status'}
      </button>
      
      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {keyStatus && (
        <div className="mt-4">
          <p>
            <strong>API Key Exists:</strong>{' '}
            <span className={`font-medium ${keyStatus.exists ? 'text-green-600' : 'text-red-600'}`}>
              {keyStatus.exists ? 'Yes' : 'No'}
            </span>
          </p>
          <p><strong>Checked at:</strong> {new Date(keyStatus.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}