// app/components/layout/SharedLayout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link'; 
import { 
  MapPin, Compass, Star,  
  Menu, X, User, LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TravelChat } from '../chat/TravelChat';

// Navbar component
export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    // Clear user sessions before logout
    if (typeof window !== 'undefined') {
      try {
        // Import ChatService dynamically to avoid SSR issues
        import('@/services/chatService').then(({ ChatService }) => {
          ChatService.clearAllUserSessions();
        }).catch(error => {
          console.error('Error importing ChatService:', error);
        });
      } catch (error) {
        console.error('Error clearing chat sessions on logout:', error);
      }
    }
    
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-3' : 'bg-white shadow-sm py-3'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Compass className={`h-6 w-6 mr-2 text-blue-600`} />
          <span className={`text-xl font-bold text-blue-600`}>
            TravelSense
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/" 
            className={`font-medium hover:text-blue-500 transition-colors text-gray-700`}
          >
            Trang chủ
          </Link>
          <Link 
            href="/dashboard/Map" 
            className={`font-medium hover:text-blue-500 transition-colors text-gray-700`}
          >
            Bản đồ
          </Link>
          <Link 
            href="/cities" 
            className={`font-medium hover:text-blue-500 transition-colors text-gray-700`}
          >
            Thành phố
          </Link>
          <Link 
            href="/trip-planner" 
            className={`font-medium hover:text-blue-500 transition-colors text-gray-700`}
          >
            Lịch trình
          </Link>
          <Link 
            href="/chat" 
            className={`font-medium hover:text-blue-500 transition-colors text-gray-700`}
          >
            TravelBot
          </Link>
          <Link 
            href="/about" 
            className={`font-medium hover:text-blue-500 transition-colors text-gray-700`}
          >
            Giới thiệu
          </Link>
          <Link 
            href="/contact" 
            className={`font-medium hover:text-blue-500 transition-colors text-gray-700`}
          >
            Liên hệ
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link 
                href="/account" 
                className="font-medium text-gray-700 hover:text-blue-500 transition-colors"
              >
                Xin chào, {user.username}
              </Link>
              <button
                onClick={handleLogout}
                className="font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth" 
                className={`font-medium hover:text-blue-500 transition-colors text-gray-700`}
              >
                Đăng nhập
              </Link>
              <Link 
                href="/auth" 
                className="bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>

        <button 
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3 absolute w-full z-10 shadow-md">
          <Link 
            href="/" 
            className="block py-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileMenu(false)}
          >
            Trang chủ
          </Link>
          <Link 
            href="/dashboard/Map" 
            className="block py-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileMenu(false)}
          >
            Bản đồ
          </Link>
          <Link 
            href="/trip-planner" 
            className="block py-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileMenu(false)}
          >
            Lịch trình
          </Link>
          <Link 
            href="/about" 
            className="block py-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileMenu(false)}
          >
            Giới thiệu
          </Link>
          <Link 
            href="/contact" 
            className="block py-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileMenu(false)}
          >
            Liên hệ
          </Link>
          {user ? (
            <>
              <Link
                href="/account"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowMobileMenu(false)}
              >
                <User className="h-5 w-5" />
                <span>Tài khoản ({user.username})</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700 w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowMobileMenu(false)}
              >
                <User className="h-5 w-5" />
                <span>Đăng nhập</span>
              </Link>
              <Link
                href="/auth"
                className="flex items-center gap-2 py-2 text-blue-600 hover:text-blue-700"
                onClick={() => setShowMobileMenu(false)}
              >
                <User className="h-5 w-5" />
                <span>Đăng ký</span>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

// Footer component
export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Compass className="h-8 w-8 mr-2 text-blue-400" />
              <span className="text-2xl font-bold">TravelSense</span>
            </div>
            <p className="text-gray-400 mb-4">
              Nền tảng du lịch thông minh giúp bạn khám phá những địa điểm tuyệt vời xung quanh bạn.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Liên kết</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard/Map" className="text-gray-400 hover:text-white transition-colors">
                  Khám phá địa điểm
                </Link>
              </li>
              <li>
                <Link href="/trip-planner" className="text-gray-400 hover:text-white transition-colors">
                  Lịch trình du lịch
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Hỗ trợ</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Liên hệ</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-gray-400">
                  Tòa nhà Innovation, 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-gray-400">+84 28 3812 3456</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-gray-400">info@travelsense.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} TravelSense. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-4">
              <Link href="/privacy" className="text-gray-400 text-sm hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="text-gray-400 text-sm hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link href="/cookies" className="text-gray-400 text-sm hover:text-white transition-colors">
                Chính sách cookie
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Mobile Bottom Navigation
export const MobileNavigation = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth');
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-20">
      <div className="grid grid-cols-4 h-16">
        <Link
          href="/dashboard"
          className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
        >
          <Compass className="h-6 w-6" />
          <span className="text-xs mt-1">Trang chủ</span>
        </Link>
        <Link
          href="/dashboard/Map"
          className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
        >
          <MapPin className="h-6 w-6" />
          <span className="text-xs mt-1">Bản đồ</span>
        </Link>
        <Link
          href="/saved"
          className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
        >
          <Star className="h-6 w-6" />
          <span className="text-xs mt-1">Đã lưu</span>
        </Link>
        {user ? (
          <Link
            href="/account"
            className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Tài khoản</span>
          </Link>
        ) : (
          <Link
            href="/auth"
            className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600"
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Tài khoản</span>
          </Link>
        )}
      </div>
    </div>
  );
};

interface SharedLayoutProps {
  children: React.ReactNode;
}

// Main layout wrapper component
const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Main content with padding for fixed header */}
      <div className="flex-grow pt-16">
        {children}
      </div>
      
      <Footer />
      
      {/* Mobile Bottom Navigation - Only rendered client-side */}
      {isMounted && <MobileNavigation />}
      
      {/* Travel Chat Component - Available globally */}
      {isMounted && <TravelChat />}
    </div>
  );
};

export default SharedLayout;