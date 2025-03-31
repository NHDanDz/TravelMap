// app/dashboard/page.tsx
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/app/components/ui/Card';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';

export const metadata = {
  title: 'Dashboard',
  description: 'Tổng quan về hệ thống quản lý sạt lở đất',
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="text-center p-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">25</div>
              <div className="text-gray-500 text-sm">Tổng số điểm sạt lở</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center p-6">
              <div className="text-3xl font-bold text-red-600 mb-2">8</div>
              <div className="text-gray-500 text-sm">Điểm nguy cơ cao</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center p-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">12</div>
              <div className="text-gray-500 text-sm">Điểm đang hoạt động</div>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody className="text-center p-6">
              <div className="text-3xl font-bold text-green-600 mb-2">5</div>
              <div className="text-gray-500 text-sm">Điểm đã ổn định</div>
            </CardBody>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <h2 className="text-lg font-semibold">Điểm sạt lở mới nhất</h2>
              </CardHeader>
              <CardBody>
                <div className="divide-y">
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">Đèo Ô Quý Hồ</div>
                      <div className="text-sm text-gray-500">31/03/2025</div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Nguy cơ cao</span>
                  </div>
                  
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">Thác Bạc, Sa Pa</div>
                      <div className="text-sm text-gray-500">10/03/2025</div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Đang hoạt động</span>
                  </div>
                  
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">Thung lũng Mai Châu</div>
                      <div className="text-sm text-gray-500">05/01/2025</div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Đã ổn định</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link 
                    href="/dashboard/landslides" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    Xem tất cả
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <Card className="h-full">
            <CardHeader>
              <h2 className="text-lg font-semibold">Cảnh báo gần đây</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="border-l-4 border-red-500 p-2 rounded-r bg-red-50">
                  <div className="flex justify-between">
                    <div className="text-red-800 font-medium text-sm">Cảnh báo sạt lở mới</div>
                    <div className="text-xs text-gray-500">31/03</div>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">Đèo Ô Quý Hồ</div>
                </div>
                
                <div className="border-l-4 border-orange-500 p-2 rounded-r bg-orange-50">
                  <div className="flex justify-between">
                    <div className="text-orange-800 font-medium text-sm">Cập nhật trạng thái</div>
                    <div className="text-xs text-gray-500">20/03</div>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">Thác Bạc, Sa Pa</div>
                </div>
                
                <div className="border-l-4 border-yellow-500 p-2 rounded-r bg-yellow-50">
                  <div className="flex justify-between">
                    <div className="text-yellow-800 font-medium text-sm">Dự báo thời tiết</div>
                    <div className="text-xs text-gray-500">15/03</div>
                  </div>
                  <div className="text-xs text-gray-700 mt-1">Dự báo mưa lớn tại Sa Pa</div>
                </div>
              </div>
              
              <div className="mt-4">
                <Link 
                  href="/dashboard/landslides?tab=notifications" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  Xem tất cả thông báo
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Truy cập nhanh</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <Link 
                  href="/dashboard/map" 
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition"
                >
                  <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-sm font-medium">Bản đồ trực tiếp</span>
                </Link>
                
                <Link 
                  href="/dashboard/landslides?tab=monitoring" 
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition"
                >
                  <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm font-medium">Theo dõi liên tục</span>
                </Link>
                
                <Link 
                  href="/dashboard/statistics" 
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition"
                >
                  <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium">Thống kê dữ liệu</span>
                </Link>
                
                <Link 
                  href="/dashboard/settings" 
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 transition"
                >
                  <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Cài đặt</span>
                </Link>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">Dự báo thời tiết</h2>
            </CardHeader>
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-medium">Hà Nội</div>
                  <div className="text-sm text-gray-500">Hôm nay, 31/03/2025</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">27°C</div>
                  <div className="text-sm text-gray-500">Nhiều mây, có mưa rào</div>
                </div>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Dự báo 5 ngày tới:</h3>
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div>
                    <div className="text-xs text-gray-500">01/04</div>
                    <div className="font-medium text-sm">28°C</div>
                    <div className="text-xs">Mưa</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">02/04</div>
                    <div className="font-medium text-sm">30°C</div>
                    <div className="text-xs">Nắng</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">03/04</div>
                    <div className="font-medium text-sm">31°C</div>
                    <div className="text-xs">Nắng</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">04/04</div>
                    <div className="font-medium text-sm">29°C</div>
                    <div className="text-xs">Mưa rào</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">05/04</div>
                    <div className="font-medium text-sm">27°C</div>
                    <div className="text-xs">Mưa</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}