'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import { StatusDistributionChart } from './components/StatusDistributionChart';
import { MonthlyDetectionChart } from './components/MonthlyDetectionChart';
import { StatisticsDataTable } from './components/StatisticsDataTable';
import { StatisticsOverview } from './components/StatisticsOverview';
import { RegionDistributionMap } from './components/RegionDistributionMap';

interface LandslideData {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  detectedAt: string;
  status: string;
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
  createdAt: string;
  updatedAt: string;
}

export default function StatisticsPage() {
  const [landslides, setLandslides] = useState<LandslideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'all' | '1m' | '3m' | '6m' | '1y'>('all');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'geographical' | 'detailed'>('overview');

  // Tải dữ liệu sạt lở từ API
  useEffect(() => {
    const fetchLandslides = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/landslide-confirmation');
        
        if (!response.ok) {
          throw new Error('Không thể lấy dữ liệu sạt lở');
        }
        
        const data = await response.json();
        setLandslides(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu');
        console.error('Error fetching landslide data:', err);
        
        // Fallback data khi không thể lấy dữ liệu từ API
        setLandslides([
          {
            id: 'LS001',
            name: 'Đèo Hải Vân',
            coordinates: { lat: 16.2185, lng: 108.1155 },
            detectedAt: '2025-01-15T08:30:00Z',
            status: 'high_risk',
            details: {
              affectedArea: '2.35 km²',
              potentialImpact: 'Đường Quốc lộ 1A',
              lastUpdate: '2025-03-30T14:22:00Z'
            },
            history: [
              { date: '2025-01-15', status: 'detected', note: 'Phát hiện ban đầu' },
              { date: '2025-01-20', status: 'field_verified', note: 'Xác minh tại hiện trường' },
              { date: '2025-03-15', status: 'monitored', note: 'Tăng diện tích ảnh hưởng 15%' }
            ],
            createdAt: '2025-01-15T08:30:00Z',
            updatedAt: '2025-03-30T14:22:00Z'
          },
          {
            id: 'LS002',
            name: 'Thác Bạc, Sa Pa',
            coordinates: { lat: 22.3545, lng: 103.7778 },
            detectedAt: '2025-02-10T14:15:00Z',
            status: 'active',
            details: {
              affectedArea: '1.15 km²',
              potentialImpact: 'Khu du lịch',
              lastUpdate: '2025-03-28T09:15:00Z'
            },
            history: [
              { date: '2025-02-10', status: 'detected', note: 'Phát hiện ban đầu' },
              { date: '2025-02-15', status: 'field_verified', note: 'Xác minh tại hiện trường' }
            ],
            createdAt: '2025-02-10T14:15:00Z',
            updatedAt: '2025-03-28T09:15:00Z'
          },
          {
            id: 'LS003',
            name: 'Đèo Ô Quý Hồ',
            coordinates: { lat: 22.3476, lng: 103.7692 },
            detectedAt: '2025-03-05T10:20:00Z',
            status: 'high_risk',
            details: {
              affectedArea: '1.78 km²',
              potentialImpact: 'Đường giao thông',
              lastUpdate: '2025-03-31T16:45:00Z'
            },
            history: [
              { date: '2025-03-05', status: 'detected', note: 'Phát hiện ban đầu' },
              { date: '2025-03-10', status: 'field_verified', note: 'Xác minh tại hiện trường' }
            ],
            createdAt: '2025-03-05T10:20:00Z',
            updatedAt: '2025-03-31T16:45:00Z'
          },
          {
            id: 'LS004',
            name: 'Thung lũng Mai Châu',
            coordinates: { lat: 20.6634, lng: 104.9964 },
            detectedAt: '2024-12-20T09:10:00Z',
            status: 'stabilized',
            details: {
              affectedArea: '0.75 km²',
              potentialImpact: 'Khu dân cư',
              lastUpdate: '2025-03-20T11:30:00Z'
            },
            history: [
              { date: '2024-12-20', status: 'detected', note: 'Phát hiện ban đầu' },
              { date: '2024-12-25', status: 'field_verified', note: 'Xác minh tại hiện trường' },
              { date: '2025-01-15', status: 'remediation', note: 'Áp dụng biện pháp gia cố' },
              { date: '2025-03-20', status: 'stabilized', note: 'Đã ổn định sau các biện pháp xử lý' }
            ],
            createdAt: '2024-12-20T09:10:00Z',
            updatedAt: '2025-03-20T11:30:00Z'
          },
          {
            id: 'LS005',
            name: 'Đèo Ngang',
            coordinates: { lat: 18.0676, lng: 106.0225 },
            detectedAt: '2025-03-15T16:45:00Z',
            status: 'monitored',
            details: {
              affectedArea: '1.25 km²',
              potentialImpact: 'Đường sắt Bắc Nam',
              lastUpdate: '2025-03-28T08:20:00Z'
            },
            history: [
              { date: '2025-03-15', status: 'detected', note: 'Phát hiện ban đầu' },
              { date: '2025-03-20', status: 'monitored', note: 'Bắt đầu theo dõi liên tục' }
            ],
            createdAt: '2025-03-15T16:45:00Z',
            updatedAt: '2025-03-28T08:20:00Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLandslides();
  }, []);

  // Lọc dữ liệu dựa trên bộ lọc thời gian
  const filteredByTime = (() => {
    if (timeRange === 'all') return landslides;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return landslides.filter(item => {
      const detectedDate = new Date(item.detectedAt);
      return detectedDate >= cutoffDate;
    });
  })();

  // Lọc dữ liệu dựa trên bộ lọc trạng thái
  const filteredData = statusFilter === 'all' 
    ? filteredByTime 
    : filteredByTime.filter(item => item.status === statusFilter);

  // Chuẩn bị dữ liệu cho biểu đồ phân bố trạng thái
  const statusDistribution = (() => {
    const counts: Record<string, number> = {
      'high_risk': 0,
      'active': 0,
      'monitored': 0,
      'stabilized': 0,
      'remediated': 0
    };
    
    filteredByTime.forEach(item => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      } else {
        counts[item.status] = 1;
      }
    });
    
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      percentage: filteredByTime.length ? Math.round((count / filteredByTime.length) * 100) : 0
    }));
  })();

  // Chuẩn bị dữ liệu cho biểu đồ phát hiện theo tháng
  const monthlyDetections = (() => {
    // Sử dụng Map để lưu trữ số lượng sạt lở phát hiện theo tháng
    const detectionMap = new Map<string, number>();
    const monthFormatOptions = { year: 'numeric', month: 'short' } as Intl.DateTimeFormatOptions;
    
    // Lấy tháng hiện tại và 11 tháng trước đó
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(now.getMonth() - i);
      const monthKey = date.toLocaleDateString('vi-VN', monthFormatOptions);
      detectionMap.set(monthKey, 0);
    }
    
    // Đếm số lượng sạt lở phát hiện theo tháng
    filteredByTime.forEach(item => {
      const detectedDate = new Date(item.detectedAt);
      const monthKey = detectedDate.toLocaleDateString('vi-VN', monthFormatOptions);
      
      if (detectionMap.has(monthKey)) {
        detectionMap.set(monthKey, detectionMap.get(monthKey)! + 1);
      }
    });
    
    // Chuyển đổi Map thành mảng để sử dụng trong biểu đồ
    return Array.from(detectionMap.entries()).map(([month, count]) => ({
      month,
      count
    }));
  })();

  // Hàm trợ giúp định dạng ngày tháng
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 relative">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Thống kê sạt lở đất</h1>
          
          {/* Bộ lọc thời gian */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-700'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setTimeRange('1m')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '1m' ? 'bg-white shadow text-blue-600' : 'text-gray-700'}`}
            >
              1 tháng
            </button>
            <button 
              onClick={() => setTimeRange('3m')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '3m' ? 'bg-white shadow text-blue-600' : 'text-gray-700'}`}
            >
              3 tháng
            </button>
            <button 
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '6m' ? 'bg-white shadow text-blue-600' : 'text-gray-700'}`}
            >
              6 tháng
            </button>
            <button 
              onClick={() => setTimeRange('1y')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === '1y' ? 'bg-white shadow text-blue-600' : 'text-gray-700'}`}
            >
              1 năm
            </button>
          </div>

          {/* Bộ lọc trạng thái */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:ring focus:border-blue-300"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="high_risk">Nguy cơ cao</option>
              <option value="active">Đang hoạt động</option>
              <option value="monitored">Đang theo dõi</option>
              <option value="stabilized">Đã ổn định</option>
              <option value="remediated">Đã xử lý</option>
            </select>
          </div>
        </div>

        {/* Tabs điều hướng */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('geographical')}
              className={`py-3 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'geographical'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Phân bố địa lý
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`py-3 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'detailed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dữ liệu chi tiết
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 rounded-lg text-red-500">
            {error}
          </div>
        ) : (
          <>
            {/* Tab: Tổng quan */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <StatisticsOverview 
                  landslides={filteredByTime}
                  statusDistribution={statusDistribution}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold">Phân bố theo trạng thái</h2>
                    </CardHeader>
                    <CardBody>
                      <StatusDistributionChart data={statusDistribution} />
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold">Sạt lở phát hiện theo tháng</h2>
                    </CardHeader>
                    <CardBody>
                      <MonthlyDetectionChart data={monthlyDetections} />
                    </CardBody>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">5 điểm sạt lở mới nhất</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Vị trí
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phát hiện
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredByTime
                            .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
                            .slice(0, 5)
                            .map((landslide) => (
                              <tr key={landslide.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {landslide.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {landslide.coordinates.lat.toFixed(4)}, {landslide.coordinates.lng.toFixed(4)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(landslide.detectedAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${landslide.status === 'high_risk' ? 'bg-red-100 text-red-800' : 
                                      landslide.status === 'active' ? 'bg-orange-100 text-orange-800' :
                                      landslide.status === 'monitored' ? 'bg-blue-100 text-blue-800' :
                                      landslide.status === 'stabilized' ? 'bg-green-100 text-green-800' : 
                                      'bg-gray-100 text-gray-800'}`}>
                                    {landslide.status === 'high_risk' ? 'Nguy cơ cao' :
                                     landslide.status === 'active' ? 'Đang hoạt động' :
                                     landslide.status === 'monitored' ? 'Đang theo dõi' :
                                     landslide.status === 'stabilized' ? 'Đã ổn định' :
                                     landslide.status === 'remediated' ? 'Đã xử lý' : 
                                     landslide.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
            
            {/* Tab: Phân bố địa lý */}
            {activeTab === 'geographical' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">Phân bố địa lý</h2>
                  </CardHeader>
                  <CardBody>
                    <div className="h-96">
                      <RegionDistributionMap landslides={filteredData} />
                    </div>
                  </CardBody>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold">Top 5 tỉnh có nhiều điểm sạt lở nhất</h2>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-40 text-sm font-medium">Lào Cai</div>
                          <div className="flex-1">
                            <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                          <div className="w-10 text-sm font-medium text-right">17</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-40 text-sm font-medium">Quảng Nam</div>
                          <div className="flex-1">
                            <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                          <div className="w-10 text-sm font-medium text-right">15</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-40 text-sm font-medium">Thừa Thiên Huế</div>
                          <div className="flex-1">
                            <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                          <div className="w-10 text-sm font-medium text-right">13</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-40 text-sm font-medium">Yên Bái</div>
                          <div className="flex-1">
                            <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }}></div>
                            </div>
                          </div>
                          <div className="w-10 text-sm font-medium text-right">10</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-40 text-sm font-medium">Hà Giang</div>
                          <div className="flex-1">
                            <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }}></div>
                            </div>
                          </div>
                          <div className="w-10 text-sm font-medium text-right">8</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold">Phân bố theo mức độ ảnh hưởng</h2>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Đường giao thông</span>
                            <span className="text-sm text-gray-600">42%</span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full">
                            <div className="h-full bg-yellow-400 rounded-full" style={{ width: '42%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Khu dân cư</span>
                            <span className="text-sm text-gray-600">28%</span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full">
                            <div className="h-full bg-red-400 rounded-full" style={{ width: '28%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Khu du lịch</span>
                            <span className="text-sm text-gray-600">15%</span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full">
                            <div className="h-full bg-blue-400 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Cơ sở hạ tầng</span>
                            <span className="text-sm text-gray-600">10%</span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full">
                            <div className="h-full bg-green-400 rounded-full" style={{ width: '10%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Khác</span>
                            <span className="text-sm text-gray-600">5%</span>
                          </div>
                          <div className="h-4 bg-gray-100 rounded-full">
                            <div className="h-full bg-purple-400 rounded-full" style={{ width: '5%' }}></div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}
            
            {/* Tab: Dữ liệu chi tiết */}
            {activeTab === 'detailed' && (
              <StatisticsDataTable landslides={filteredData} />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}