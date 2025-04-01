import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Button } from '@/app/components/ui/Button';
import { StatusBadge } from '@/app/components/ui/StatusBadge';

// Định nghĩa kiểu dữ liệu cho tọa độ
interface Coordinates {
  lat: number;
  lng: number;
}

// Định nghĩa kiểu dữ liệu cho form data
interface LandslideFormData {
  name: string;
  status: 'high_risk' | 'active' | 'monitored' | 'stabilized';
  affectedArea: string;
  potentialImpact: string;
  note: string;
}

// Định nghĩa kiểu dữ liệu cho dữ liệu sạt lở khi submit
interface LandslideData {
  name: string;
  coordinates: Coordinates;
  detectedAt: string;
  status: 'high_risk' | 'active' | 'monitored' | 'stabilized';
  details: {
    affectedArea: string;
    potentialImpact: string;
    lastUpdate: string;
  };
  history: Array<{
    date: string;
    status: string;
    note: string;
  }>;
  image?: string | null;
}

// Định nghĩa kiểu dữ liệu cho props của component
interface LandslideConfirmationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LandslideData) => Promise<void>;
  detectedCoordinates: Coordinates | null;
  detectedImage?: string | null;
}

const LandslideConfirmationForm: React.FC<LandslideConfirmationFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  detectedCoordinates, 
  detectedImage 
}) => {
  const [formData, setFormData] = useState<LandslideFormData>({
    name: '',
    status: 'high_risk',
    affectedArea: '',
    potentialImpact: '',
    note: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingCoordinates, setCheckingCoordinates] = useState<boolean>(false);
  const [coordinateExists, setCoordinateExists] = useState<boolean>(false);
  const [existingLandslide, setExistingLandslide] = useState<any>(null);
  const [coordinateChecked, setCoordinateChecked] = useState<boolean>(false);

  // Thiết lập ngày hiện tại cho trường detectedAt
  const today = new Date().toISOString().slice(0, 10);
  const [detectedAt, setDetectedAt] = useState<string>(today);

  // Kiểm tra tọa độ khi component được mount hoặc khi tọa độ thay đổi
  useEffect(() => {
    if (detectedCoordinates) {
      checkCoordinatesInDatabase();
    }
  }, [detectedCoordinates]);

  // Hàm kiểm tra tọa độ trong CSDL
  const checkCoordinatesInDatabase = async () => {
    if (!detectedCoordinates) return;
    
    try {
      setCheckingCoordinates(true);
      
      // Gọi API để kiểm tra tọa độ
      const response = await fetch('/api/landslide-confirmation/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: detectedCoordinates.lat,
          lng: detectedCoordinates.lng,
          // Thêm một ngưỡng dung sai để kiểm tra các điểm gần nhau
          tolerance: 0.0001 // Xấp xỉ khoảng 10m tại đường xích đạo
        }),
      });

      const data = await response.json();
      
      if (data.exists) {
        setCoordinateExists(true);
        setExistingLandslide(data.landslide);
      } else {
        setCoordinateExists(false);
        setExistingLandslide(null);
      }
      
      setCoordinateChecked(true);
    } catch (error) {
      console.error('Lỗi khi kiểm tra tọa độ:', error);
      // Nếu có lỗi, giả định là không có tọa độ trùng lặp để cho phép người dùng tiếp tục
      setCoordinateExists(false);
      setExistingLandslide(null);
    } finally {
      setCheckingCoordinates(false);
    }
  };

  // Xử lý khi thay đổi trường input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý khi submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Kiểm tra lại tọa độ nếu chưa kiểm tra
    if (!coordinateChecked) {
      await checkCoordinatesInDatabase();
      
      // Nếu tọa độ tồn tại, hiển thị thông báo và không cho submit
      if (coordinateExists) {
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Chuẩn bị dữ liệu để gửi
      const landslideData: LandslideData = {
        name: formData.name,
        coordinates: {
          lat: detectedCoordinates?.lat || 0,
          lng: detectedCoordinates?.lng || 0
        },
        detectedAt: new Date(detectedAt).toISOString(),
        status: formData.status,
        details: {
          affectedArea: formData.affectedArea,
          potentialImpact: formData.potentialImpact,
          lastUpdate: new Date().toISOString()
        },
        history: [
          {
            date: today,
            status: 'detected',
            note: formData.note || 'Phát hiện ban đầu'
          }
        ],
        // Thông tin về ảnh từ khu vực detect
        image: detectedImage
      };
      
      await onSubmit(landslideData);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu điểm sạt lở:', error);
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Xác nhận và thêm điểm sạt lở"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-4">
          {/* Hiển thị thông báo nếu tọa độ đã tồn tại */}
          {coordinateChecked && coordinateExists && existingLandslide && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Cảnh báo: Tọa độ đã tồn tại</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Đã có điểm sạt lở tại vị trí này hoặc rất gần đây.</p>
                    <div className="mt-1">
                      <p><strong>Tên:</strong> {existingLandslide.name}</p>
                      <p><strong>ID:</strong> {existingLandslide.id}</p>
                      <p><strong>Trạng thái:</strong> {existingLandslide.status}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-orange-800">Bạn có thể chọn cập nhật điểm sạt lở hiện có thay vì tạo mới.</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        // Thêm logic để mở form cập nhật hoặc điều hướng đến trang chi tiết
                        onClose();
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hiển thị hình ảnh khu vực detect */}
          <div className="mb-4">
            <div className="relative h-56 bg-gray-200 rounded-lg overflow-hidden mb-2">
              {detectedImage ? (
                <img 
                  src={detectedImage} 
                  alt="Khu vực sạt lở" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <p>Hình ảnh khu vực phát hiện sạt lở</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">Hình ảnh khu vực phát hiện được sử dụng để phân tích điểm sạt lở</p>
          </div>

          {/* Thông tin tọa độ */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Thông tin tọa độ phát hiện</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Vĩ độ:</span> {detectedCoordinates?.lat.toFixed(6) || 'N/A'}
              </div>
              <div>
                <span className="text-gray-500">Kinh độ:</span> {detectedCoordinates?.lng.toFixed(6) || 'N/A'}
              </div>
            </div>
            <div className="mt-2 text-xs">
              {checkingCoordinates ? (
                <span className="text-blue-600">Đang kiểm tra tọa độ trong CSDL...</span>
              ) : coordinateChecked ? (
                coordinateExists ? (
                  <span className="text-yellow-600">❗ Tọa độ đã tồn tại trong hệ thống.</span>
                ) : (
                  <span className="text-green-600">✓ Tọa độ chưa được ghi nhận trước đây.</span>
                )
              ) : null}
            </div>
          </div>

          {/* Form nhập thông tin */}
          <div className="space-y-4">
            {/* Tên điểm sạt lở */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên điểm sạt lở <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Nhập tên địa điểm sạt lở"
              />
            </div>

            {/* Trạng thái mức độ nguy hiểm */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Mức độ nguy hiểm <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="high_risk">Nguy cơ cao</option>
                <option value="active">Đang hoạt động</option>
                <option value="monitored">Đang theo dõi</option>
                <option value="stabilized">Đã ổn định</option>
              </select>
              <div className="mt-1">
                <StatusBadge status={formData.status} />
              </div>
            </div>

            {/* Ngày phát hiện */}
            <div>
              <label htmlFor="detectedAt" className="block text-sm font-medium text-gray-700 mb-1">
                Ngày phát hiện <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="detectedAt"
                name="detectedAt"
                value={detectedAt}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDetectedAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Diện tích ảnh hưởng */}
            <div>
                <label
                    htmlFor="affectedArea"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Diện tích khu vực
                </label>
                <input
                    type="text"
                    id="affectedArea"
                    name="affectedArea"
                    value="25 km²"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                />
            </div>

            {/* Tác động tiềm tàng */}
            <div>
              <label htmlFor="potentialImpact" className="block text-sm font-medium text-gray-700 mb-1">
                Tác động tiềm tàng
              </label>
              <input
                type="text"
                id="potentialImpact"
                name="potentialImpact"
                value={formData.potentialImpact}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="VD: Đường cao tốc, khu dân cư, ..."
              />
            </div>

            {/* Ghi chú */}
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Thông tin bổ sung về điểm sạt lở"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || (coordinateExists && !!existingLandslide)}
          >
            {loading ? 'Đang lưu...' : 'Xác nhận và lưu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LandslideConfirmationForm;