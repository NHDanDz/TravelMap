// app/dashboard/landslides/components/MonitoringTable.tsx
import { MonitoringArea } from '@/app/lib/types/landslide';
import { formatDate } from '@/app/lib/utils';

interface MonitoringTableProps {
  areas: MonitoringArea[];
}

export default function MonitoringTable({ areas }: MonitoringTableProps) {
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <h2 className="text-lg font-medium text-gray-900">Theo dõi liên tục</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            {areas.length} khu vực
          </span>
        </div>
        <div>
          <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium rounded-lg text-sm px-4 py-2 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Thêm khu vực mới
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khu vực</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tạo lúc</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tần suất</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kiểm tra gần nhất</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm phát hiện</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mức độ rủi ro</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {areas.map((area) => (
              <tr key={area.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                  {area.name}
                  <div className="text-xs text-gray-500">ID: {area.id}</div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {formatDate(area.createdAt)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {area.monitorFrequency === 'daily' ? 'Hàng ngày' : 'Hàng tuần'}
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {formatDate(area.lastChecked)}
                </td>
                <td className="py-3 px-4 text-sm text-center font-medium">
                  <span className={`px-2 py-1 rounded-full text-xs 
                    ${area.detectedPoints > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {area.detectedPoints}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${area.riskLevel === 'high' ? 'bg-red-100 text-red-800' : 
                      area.riskLevel === 'medium' ? 'bg-orange-100 text-orange-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {area.riskLevel === 'high' ? 'Cao' : 
                      area.riskLevel === 'medium' ? 'Trung bình' : 'Thấp'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${area.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {area.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500 text-right space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Xem</button>
                  <button className="text-gray-600 hover:text-gray-900">Chỉnh sửa</button>
                  <button className="text-red-600 hover:text-red-900">Dừng</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {areas.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có khu vực nào</h3>
          <p className="mt-1 text-sm text-gray-500">Hãy thêm khu vực theo dõi để nhận được cảnh báo sớm.</p>
        </div>
      )}
    </div>
  );
}
