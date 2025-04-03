import Link from 'next/link';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="flex h-20 shrink-0 items-center justify-between px-8 py-4 bg-white shadow-sm md:h-24">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className={`${lusitana.className} text-xl font-bold md:text-2xl`}>
            <span className="text-blue-600">Land</span>
            <span className="text-gray-900">Monitor</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Tính năng</a>
          <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">Giới thiệu</a>
          <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Liên hệ</a>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="mt-6 md:mt-12 px-6 md:px-12 lg:px-24 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
        <div className="md:w-1/2 space-y-6 md:space-y-8">
          <h1 className={`${lusitana.className} text-3xl md:text-5xl font-bold text-gray-900`}>
            Hệ thống quản lý và<br /> 
            cảnh báo <span className="text-blue-600">sạt lở đất</span>
          </h1>
          
          <p className="text-lg text-gray-600 md:pr-12">
            Giám sát, phân tích và cảnh báo các khu vực có nguy cơ sạt lở đất thông qua 
            công nghệ trí tuệ nhân tạo và dữ liệu vệ tinh thời gian thực.
          </p>
          
          <div className="flex gap-4 pt-4">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 md:text-base"
            >
              <span>Đăng nhập</span> <ArrowRightIcon className="w-5 md:w-6" />
            </Link>
            
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 md:text-base"
            >
              <span>Xem demo</span>
            </Link>
          </div>
          
          <div className="flex items-center pt-4 gap-8">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-600">25+</span>
              <span className="text-sm text-gray-500">Tỉnh thành</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-600">500+</span>
              <span className="text-sm text-gray-500">Điểm theo dõi</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-blue-600">98%</span>
              <span className="text-sm text-gray-500">Độ chính xác</span>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2 relative">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
          <div className="absolute -bottom-5 -right-5 w-16 h-16 bg-yellow-100 rounded-full opacity-60 blur-lg"></div>
          
          <div className="relative bg-white p-3 rounded-2xl shadow-xl center">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-2 rounded-full shadow-md flex items-center">
              <span className="h-2 w-2 bg-red-500 rounded-full mr-1"></span>
              <span className="h-2 w-2 bg-yellow-500 rounded-full mr-1"></span>
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>
              <span className="text-xs font-medium ml-1">Bản đồ cảnh báo</span>
            </div>
            
            <Image
              src="/hero2.png"
              width={600}
              height={400}
              className="rounded-lg"
              alt="Bản đồ cảnh báo sạt lở"
            />
            
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Phát hiện 9 điểm nguy cơ cao
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-16 px-6 md:px-12 lg:px-24 bg-white mt-24">
        <div className="text-center mb-12">
          <h2 className={`${lusitana.className} text-3xl font-bold text-gray-900`}>Tính năng chính</h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">Hệ thống cung cấp các công cụ toàn diện để quản lý, theo dõi và cảnh báo sạt lở đất</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-blue-50 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Bản đồ trực tiếp</h3>
            <p className="text-gray-600">Hiển thị vị trí các điểm sạt lở trên bản đồ vệ tinh với dữ liệu thời gian thực.</p>
          </div>
          
          <div className="bg-red-50 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Cảnh báo sớm</h3>
            <p className="text-gray-600">Hệ thống cảnh báo sớm thông qua SMS, email và thông báo ứng dụng tới người dùng.</p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Phân tích dữ liệu</h3>
            <p className="text-gray-600">Phân tích dữ liệu lịch sử để dự đoán và ngăn ngừa các sự cố sạt lở trong tương lai.</p>
          </div>
        </div>
      </div>
      
      {/* How it works Section */}
      <div id="about" className="py-16 px-6 md:px-12 lg:px-24">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <Image 
              src="/hero1.png" 
              width={500} 
              height={400}
              alt="Minh họa luồng làm việc của hệ thống"
              className="rounded-xl shadow-md"
            />
          </div>
          
          <div className="md:w-1/2 space-y-6">
            <h2 className={`${lusitana.className} text-3xl font-bold text-gray-900`}>Cách hệ thống hoạt động</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold">Thu thập dữ liệu</h3>
                  <p className="text-gray-600 mt-1">Hệ thống thu thập dữ liệu từ vệ tinh, cảm biến mặt đất và các nguồn khí tượng thủy văn.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold">Phân tích và dự báo</h3>
                  <p className="text-gray-600 mt-1">Trí tuệ nhân tạo phân tích dữ liệu và xác định các khu vực có nguy cơ sạt lở cao.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold">Cảnh báo và phản ứng</h3>
                  <p className="text-gray-600 mt-1">Gửi cảnh báo tự động đến chính quyền địa phương và người dân trong khu vực nguy hiểm.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="font-semibold">Theo dõi liên tục</h3>
                  <p className="text-gray-600 mt-1">Hệ thống tiếp tục theo dõi tình hình và cập nhật trạng thái của các khu vực đang được giám sát.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-16 px-6 md:px-12 lg:px-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`${lusitana.className} text-3xl font-bold mb-4`}>Sẵn sàng bảo vệ cộng đồng của bạn?</h2>
          <p className="text-blue-100 mb-8">Truy cập vào hệ thống quản lý sạt lở đất ngay hôm nay để bắt đầu theo dõi và bảo vệ các khu vực có nguy cơ.</p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
            >
              Vào trang quản lý
              <ArrowRightIcon className="ml-2 w-5" />
            </Link>
            
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer id="contact" className="bg-gray-50 py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={`${lusitana.className} text-lg font-bold`}>
                  <span className="text-blue-600">Land</span>
                  <span className="text-gray-900">Monitor</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Hệ thống quản lý và cảnh báo sạt lở đất toàn diện, giúp bảo vệ cộng đồng và giảm thiểu thiệt hại do sạt lở gây ra.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124-4.09-.193-7.715-2.157-10.141-5.126-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14v-.617c.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Liên kết</h3>
              <ul className="space-y-2 text-gray-500">
                <li><a href="#" className="hover:text-blue-600">Trang chủ</a></li>
                <li><a href="#features" className="hover:text-blue-600">Tính năng</a></li>
                <li><a href="#about" className="hover:text-blue-600">Giới thiệu</a></li>
                <li><a href="#" className="hover:text-blue-600">Tài liệu hướng dẫn</a></li>
                <li><a href="#" className="hover:text-blue-600">Chính sách bảo mật</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-3 text-gray-500">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>10 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>contact@landmonitor.gov.vn</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>(+84) 24 1234 5678</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-6 text-center text-gray-500 text-sm">
            <p>© 2025 LandMonitor. Hệ thống quản lý sạt lở đất. Bản quyền thuộc về Bộ Tài nguyên và Môi trường.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}