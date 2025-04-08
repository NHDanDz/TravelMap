// app/dashboard/Map/components/TrafficToggle.tsx
'use client';

import React from 'react';
import { Car } from 'lucide-react';

interface TrafficToggleProps {
  isActive: boolean;
  onChange: () => void;
}

const TrafficToggle = ({ isActive, onChange }: TrafficToggleProps) => {
  return (
    <button
      onClick={onChange}
      className={`flex items-center space-x-2 py-2 px-3 rounded-lg shadow ${
        isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
      }`}
      title="Hiển thị tình trạng giao thông"
    >
      <Car className="w-5 h-5" />
      <span>Giao thông</span>
    </button>
  );
};

export default TrafficToggle;