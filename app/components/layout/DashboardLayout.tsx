// app/components/layout/DashboardLayout.tsx
import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Use media query detection for initial state - default closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Only run on client side, default to true
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // md breakpoint
    }
    return true;
  });
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      <div className="flex flex-1 relative">
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-10 md:hidden" 
            onClick={toggleSidebar}
          ></div>
        )}
        
        <Sidebar isOpen={sidebarOpen} />
        
        <main 
          className="flex-1 p-4 md:p-6 overflow-auto transition-all duration-300"
        >
          <div className="max-w-full mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-h-[calc(100vh-10rem)]">
              {children}
            </div>
          </div>
          
          <footer className="mt-8 text-center text-gray-500 text-sm pb-4">
            <p>© 2025 Hệ thống Quản lý Sạt lở đất</p>
            <p className="text-xs mt-1">Phiên bản 1.0.3 - Bộ Tài nguyên và Môi trường</p>
          </footer>
        </main>
      </div>
    </div>
  );
}