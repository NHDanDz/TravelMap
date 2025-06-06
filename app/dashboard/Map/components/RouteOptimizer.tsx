// app/dashboard/Map/components/RouteOptimizer.tsx
'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { GripVertical, RotateCw, Navigation } from 'lucide-react';
import { Place } from '../types';

interface RouteOptimizerProps {
  savedPlaces: Place[];
  onOptimizeRoute: (places: Place[]) => void;
  onStartNavigation: (places: Place[]) => void;
}

const RouteOptimizer = ({ savedPlaces, onOptimizeRoute, onStartNavigation }: RouteOptimizerProps) => {
  const [places, setPlaces] = useState(savedPlaces);
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(places);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setPlaces(items);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-80">
      <h3 className="font-medium text-gray-800 mb-3 flex items-center">
        <Navigation className="w-5 h-5 mr-2 text-blue-600" />
        Tối ưu lộ trình
      </h3>
      
      {places.length === 0 ? (
        <p className="text-gray-500 text-sm py-4 text-center">
          Chưa có địa điểm nào được lưu
        </p>
      ) : (
        <>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="places"  isDropDisabled={true} isCombineEnabled={true} >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 mb-4 max-h-60 overflow-y-auto"
                >
                  {places.map((place, index) => (
                    <Draggable key={place.id || `place-${index}`} draggableId={place.id || `place-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center bg-gray-50 p-2 rounded"
                        >
                          <div {...provided.dragHandleProps} className="mr-2">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="font-medium text-sm truncate">{place.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {place.details?.address || `${place.latitude}, ${place.longitude}`}
                            </p>
                          </div>
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full text-blue-800 font-medium text-xs">
                            {index + 1}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onOptimizeRoute(places)}
              className="flex-1 flex items-center justify-center py-2 bg-blue-600 text-white rounded"
            >
              <RotateCw className="w-4 h-4 mr-1" />
              <span>Tối ưu</span>
            </button>
            <button
              onClick={() => onStartNavigation(places)}
              className="flex-1 flex items-center justify-center py-2 bg-green-600 text-white rounded"
            >
              <Navigation className="w-4 h-4 mr-1" />
              <span>Bắt đầu</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RouteOptimizer;