
// app/components/layout/Header.tsx
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white shadow-sm z-10 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Quản lý và Theo dõi Sạt lở đất
            </Link>
          </div>
          <div className="flex items-center space-x-4"> 
            <Link href="/dashboard/statistics" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Thống kê
            </Link>
            <Link href="/dashboard/settings" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Cài đặt
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
