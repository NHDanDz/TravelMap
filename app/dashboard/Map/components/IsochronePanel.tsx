// app/dashboard/Map/components/IsochronePanel.tsx
'use client';

import React from 'react';
import { Clock, Navigation } from 'lucide-react';

interface IsochronePanelProps {
  travelTime: number;
  onTravelTimeChange: (time: number) => void;
  onGenerateIsochrone: () => void;
}

const IsochronePanel = ({ travelTime, onTravelTimeChange, onGenerateIsochrone }: IsochronePanelProps) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg">
      <div className="flex items-center mb-2">
        <Clock className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-sm font-medium">Phạm vi di chuyển</h3>
      </div>
      
      <div className="mb-3">
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={travelTime}
          onChange={(e) => onTravelTimeChange(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>5 phút</span>
          <span>{travelTime} phút</span>
          <span>60 phút</span>
        </div>
      </div>
      
      <button
        onClick={onGenerateIsochrone}
        className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center"
      >
        <Navigation className="w-4 h-4 mr-1" />
        <span>Hiển thị phạm vi</span>
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Hiển thị khu vực bạn có thể đến trong {travelTime} phút
      </p>
    </div>
  );
};

export default IsochronePanel;