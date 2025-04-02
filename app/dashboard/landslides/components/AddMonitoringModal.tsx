// app/dashboard/landslides/components/AddMonitoringModal.tsx
import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Button } from '@/app/components/ui/Button';
import { LandslidePoint, MonitoringArea } from '@/app/lib/types/landslide';

interface AddMonitoringModalProps {
  landslide: LandslidePoint;
  onClose: () => void;
  onAddMonitoring: (data: Partial<MonitoringArea>) => Promise<void>;
}

// Helper function to format date
function formatDate(dateString: string, locale: string = 'vi-VN'): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export default function AddMonitoringModal({ landslide, onClose, onAddMonitoring }: AddMonitoringModalProps) {
  // Default values
  const defaultBoundingBox = {
    north: landslide.coordinates.lat + 0.05,
    south: landslide.coordinates.lat - 0.05,
    east: landslide.coordinates.lng + 0.05,
    west: landslide.coordinates.lng - 0.05
  };

  const [name, setName] = useState(`${landslide.name} - Monitoring Area`);
  const [monitorFrequency, setMonitorFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('daily');
  const [autoVerify, setAutoVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boundingBox, setBoundingBox] = useState(defaultBoundingBox);
  
  // Thêm state rủi ro mặc định
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const now = new Date().toISOString();
      
      // Ensure all boundingBox values are explicitly set as strings
      const monitoringData: Partial<MonitoringArea> = {
        id: `MON${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name,
        boundingBox: {
          north: boundingBox.north,
          south: boundingBox.south,
          east: boundingBox.east,
          west: boundingBox.west
        },
        monitorFrequency,
        createdAt: now,
        lastChecked: now,
        status: 'active',
        detectedPoints: 0,
        riskLevel,
        landslideId: landslide.id,
        autoVerify
      };
      
      // Log data before sending to API to verify it's correct
      console.log('Sending monitoring data:', JSON.stringify(monitoringData));
      
      // Call API
      await onAddMonitoring(monitoringData);
      
      // Show success message 
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error adding monitoring area:', error);
      alert('Có lỗi xảy ra khi thêm khu vực theo dõi!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Thêm vào danh sách theo dõi liên tục">
      <form onSubmit={handleSubmit}>
        <div className="p-4">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700">Thông tin sạt lở</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Tên:</span> {landslide.name}
              </div>
              <div>
                <span className="text-gray-500">ID:</span> {landslide.id}
              </div>
              <div>
                <span className="text-gray-500">Vĩ độ:</span> {landslide.coordinates.lat.toFixed(6)}
              </div>
              <div>
                <span className="text-gray-500">Kinh độ:</span> {landslide.coordinates.lng.toFixed(6)}
              </div>
              <div>
                <span className="text-gray-500">Phát hiện:</span> {formatDate(landslide.detectedAt)}
              </div>
              <div>
                <span className="text-gray-500">Trạng thái:</span> {landslide.status}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên khu vực theo dõi
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Tần suất theo dõi
            </label>
            <select
              id="frequency"
              value={monitorFrequency}
              onChange={(e) => setMonitorFrequency(e.target.value as 'daily' | 'weekly' | 'biweekly' | 'monthly')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Hàng tuần</option>
              <option value="biweekly">Hai tuần một lần</option>
              <option value="monthly">Hàng tháng</option>
            </select>
          </div>

          {/* Thêm selector mức độ rủi ro */}
          <div className="mb-4">
            <label htmlFor="risk-level" className="block text-sm font-medium text-gray-700 mb-1">
              Mức độ rủi ro
            </label>
            <select
              id="risk-level"
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="low">Thấp</option>
              <option value="medium">Trung bình</option>
              <option value="high">Cao</option>
            </select>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Khu vực theo dõi</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="north" className="block text-xs text-gray-500 mb-1">
                  Vĩ độ bắc
                </label>
                <input
                  type="number"
                  id="north"
                  step="0.00001"
                  value={boundingBox.north}
                  onChange={(e) => setBoundingBox({ ...boundingBox, north: parseFloat(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label htmlFor="south" className="block text-xs text-gray-500 mb-1">
                  Vĩ độ nam
                </label>
                <input
                  type="number"
                  id="south"
                  step="0.00001"
                  value={boundingBox.south}
                  onChange={(e) => setBoundingBox({ ...boundingBox, south: parseFloat(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label htmlFor="east" className="block text-xs text-gray-500 mb-1">
                  Kinh độ đông
                </label>
                <input
                  type="number"
                  id="east"
                  step="0.00001"
                  value={boundingBox.east}
                  onChange={(e) => setBoundingBox({ ...boundingBox, east: parseFloat(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label htmlFor="west" className="block text-xs text-gray-500 mb-1">
                  Kinh độ tây
                </label>
                <input
                  type="number"
                  id="west"
                  step="0.00001"
                  value={boundingBox.west}
                  onChange={(e) => setBoundingBox({ ...boundingBox, west: parseFloat(e.target.value) })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Những tọa độ này xác định khu vực vuông sẽ được theo dõi thường xuyên.
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto-verify"
                checked={autoVerify}
                onChange={(e) => setAutoVerify(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="auto-verify" className="ml-2 text-sm text-gray-700">
                Tự động xác minh các điểm sạt lở được phát hiện
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu và theo dõi'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Hủy
          </Button>
        </div>
      </form>
    </Modal>
  );
}