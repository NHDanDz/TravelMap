// app/admin/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, MapPin, Building2, Star, CloudRain, 
  Users, MessageSquare, Settings, Menu, X, LogOut,
  Shield, BarChart3, Calendar, FileText
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Kiểm tra quyền admin (giả lập - trong thực tế nên kiểm tra từ server)
      // if (!userData.isAdmin) {
      //   router.push('/dashboard');
      //   return;
      // }
    } else {
      router.push('/auth');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth');
  };

  const sidebarItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      exact: true
    },
    {
      name: 'Quản lý địa điểm',
      href: '/admin/places',
      icon: MapPin
    },
    {
      name: 'Quản lý thành phố',
      href: '/admin/cities',
      icon: Building2
    },
    {
      name: 'Quản lý đánh giá',
      href: '/admin/reviews',
      icon: Star
    },
    {
      name: 'Dữ liệu thời tiết',
      href: '/admin/weather',
      icon: CloudRain
    },
    {
      name: 'Quản lý người dùng',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'Quản lý chuyến đi',
      href: '/admin/trips',
      icon: Calendar
    },
    {
      name: 'Báo cáo',
      href: '/admin/reports',
      icon: BarChart3
    },
    {
      name: 'Cài đặt',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  const isActiveLink = (href: string, exact: boolean = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/admin" className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-800">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveLink(item.href, item.exact);
              
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`${active 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`${active ? 'text-blue-600' : 'text-gray-400'} 
                      mr-3 h-5 w-5 group-hover:text-blue-600`} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-700 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {pathname === '/admin' ? 'Dashboard' :
                 pathname === '/admin/places' ? 'Quản lý địa điểm' :
                 pathname === '/admin/cities' ? 'Quản lý thành phố' :
                 pathname === '/admin/reviews' ? 'Quản lý đánh giá' :
                 pathname === '/admin/weather' ? 'Dữ liệu thời tiết' :
                 pathname === '/admin/users' ? 'Quản lý người dùng' :
                 pathname === '/admin/trips' ? 'Quản lý chuyến đi' :
                 pathname === '/admin/reports' ? 'Báo cáo' :
                 pathname === '/admin/settings' ? 'Cài đặt' : 'Admin Panel'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;