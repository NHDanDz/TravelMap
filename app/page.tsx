// app/page.tsx
'use client';
import { SiGoogleplay } from 'react-icons/si';
import { FaApple } from 'react-icons/fa';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  MapPin, Compass, ArrowRight, Search, Star, 
  Calendar, Users, Coffee, Hotel, Utensils, Landmark,
  ChevronRight, Globe, Shield, Download, CheckCircle
} from 'lucide-react';
import {Menu, X, User, LogOut } from 'lucide-react';
// Navbar component
// Navbar component
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const router = useRouter();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Xử lý scroll
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

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowMobileMenu(false);
    router.push('/auth');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Compass className={`h-8 w-8 mr-2 ${scrolled ? 'text-blue-600' : 'text-white'}`} />
          <span className={`text-2xl font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>
            TravelSense
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/dashboard/Map" 
            className={`font-medium hover:text-blue-500 transition-colors ${
              scrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            Khám phá
          </Link>
          <Link 
            href="/trip-planner" 
            className={`font-medium hover:text-blue-500 transition-colors ${
              scrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            Lịch trình
          </Link>
          <Link 
            href="/about" 
            className={`font-medium hover:text-blue-500 transition-colors ${
              scrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            Giới thiệu
          </Link>
          <Link 
            href="/contact" 
            className={`font-medium hover:text-blue-500 transition-colors ${
              scrolled ? 'text-gray-700' : 'text-white'
            }`}
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
                className={`font-medium hover:text-red-700 transition-colors ${
                  scrolled ? 'text-red-600' : 'text-red-400'
                }`}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth" 
                className={`font-medium hover:text-blue-500 transition-colors ${
                  scrolled ? 'text-gray-700' : 'text-white'
                }`}
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

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3 absolute w-full z-10 shadow-md">
          <Link 
            href="/dashboard/Map" 
            className="block py-2 text-gray-600 hover:text-gray-900"
            onClick={() => setShowMobileMenu(false)}
          >
            Khám phá
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
              <div className="flex items-center gap-2 py-2 text-gray-600 hover:text-gray-900">
                <User className="h-5 w-5" />
                <span>{user.username}</span>
              </div>
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
const Footer = () => {
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

// Featured places data
const featuredPlaces = [
  {
    id: 1,
    name: 'Hồ Hoàn Kiếm',
    location: 'Hà Nội',
    image: '/images/place-hanoi.jpg',
    rating: 4.8,
    type: 'tourist_attraction'
  },
  {
    id: 2,
    name: 'Phố cổ Hội An',
    location: 'Quảng Nam',
    image: '/images/place-hoian.webp',
    rating: 4.9,
    type: 'tourist_attraction'
  },
  {
    id: 3,
    name: 'Vịnh Hạ Long',
    location: 'Quảng Ninh',
    image: '/images/place-halong.jpg',
    rating: 4.7,
    type: 'tourist_attraction'
  },
  {
    id: 4,
    name: 'Phở Bát Đàn',
    location: 'Hà Nội',
    image: '/images/place-pho.png',
    rating: 4.6,
    type: 'restaurant'
  }
];

// Popular cities data
const popularCities = [
  {
    id: 1,
    name: 'Hà Nội',
    image: '/images/ha-noi.jpg',
    count: 240
  },
  {
    id: 2,
    name: 'TP. Hồ Chí Minh',
    image: '/images/sai-gon.jpg',
    count: 320
  },
  {
    id: 3,
    name: 'Đà Nẵng',
    image: '/images/da-nang.jpg',
    count: 180
  },
  {
    id: 4,
    name: 'Huế',
    image: '/images/hue.jpg',
    count: 150
  },
  {
    id: 5,
    name: 'Nha Trang',
    image: '/images/nha-trang.jpg',
    count: 200
  },
  {
    id: 6,
    name: 'Đà Lạt',
    image: '/images/da-lat.jpg',
    count: 210
  }
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    content: 'TravelSense giúp tôi khám phá nhiều địa điểm thú vị mà trước đây tôi không biết, ngay cả ở thành phố tôi đã sống nhiều năm.',
    author: 'Trần Trung Hiếu',
    location: 'Hà Nội',
    avatar: '/images/human-1.jpg'
  },
  {
    id: 2,
    content: 'Tính năng lập lịch trình của TravelSense rất hữu ích cho chuyến du lịch của gia đình tôi. Mọi thứ đều được sắp xếp hợp lý và tiết kiệm thời gian.',
    author: 'Nguyễn Đặng Khôi Nguyên',
    location: 'TP. Hồ Chí Minh',
    avatar: '/images/human-2.jpg'
  },
  {
    id: 3,
    content: 'Đánh giá và gợi ý trên TravelSense rất chính xác. Tôi đã tìm được những nhà hàng ngon và khách sạn tốt nhờ nền tảng này.',
    author: 'Đàm Vũ Đức Anh',
    location: 'Đà Nẵng',
    avatar: '/images/human-3.jpg'
  }
];

// Category icon mapping
const getCategoryIcon = (type: string) => {
  switch (type) {
    case 'restaurant':
      return <Utensils className="w-4 h-4" />;
    case 'cafe':
      return <Coffee className="w-4 h-4" />;
    case 'hotel':
      return <Hotel className="w-4 h-4" />;
    case 'tourist_attraction':
      return <Landmark className="w-4 h-4" />;
    default:
      return <MapPin className="w-4 h-4" />;
  }
};

// Home page component
const HomePage = () => {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-1.jpg"
            alt="Khám phá những địa điểm tuyệt vời"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-indigo-900/40"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Khám phá những địa điểm tuyệt vời xung quanh bạn
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              TravelSense giúp bạn tìm kiếm và khám phá những nhà hàng, quán cà phê, khách sạn và địa điểm du lịch hấp dẫn.
            </p>
            
            <div className="relative rounded-xl overflow-hidden shadow-lg max-w-xl">
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm..."
                className="w-full py-4 px-6 pl-12 text-gray-800 rounded-xl focus:outline-none"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded-lg py-2 px-4 hover:bg-blue-700 transition-colors">
                Tìm kiếm
              </button>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dashboard/Map"
                className="flex items-center py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <MapPin className="h-5 w-5 mr-2" />
                <span>Khám phá bản đồ</span>
              </Link>
              <Link
                href="/trip-planner"
                className="flex items-center py-3 px-6 bg-white text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Calendar className="h-5 w-5 mr-2" />
                <span>Lập lịch trình</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
      
      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Cách TravelSense hoạt động
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              TravelSense giúp bạn dễ dàng khám phá, lên kế hoạch và chia sẻ những trải nghiệm du lịch tuyệt vời.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Khám phá</h3>
              <p className="text-gray-600">
                Tìm kiếm và khám phá các địa điểm thú vị như nhà hàng, quán cà phê, khách sạn và các điểm tham quan.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Lập kế hoạch</h3>
              <p className="text-gray-600">
                Tạo lịch trình du lịch cá nhân hóa với các địa điểm yêu thích và chia sẻ với bạn bè.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Đánh giá & Chia sẻ</h3>
              <p className="text-gray-600">
                Đánh giá những địa điểm bạn đã đến và chia sẻ trải nghiệm với cộng đồng.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Places */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Địa điểm nổi bật
              </h2>
              <p className="text-xl text-gray-600">
                Khám phá những địa điểm được yêu thích nhất trên TravelSense
              </p>
            </div>
            
            <Link href="/dashboard/Map" className="hidden md:flex items-center text-blue-600 hover:text-blue-700 font-medium">
              <span className="mr-2">Xem tất cả</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPlaces.map(place => (
              <div key={place.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-60">
                  <Image
                    src={place.image}
                    alt={place.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white py-1 px-2 rounded-full flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{place.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm py-1 px-3 rounded-full flex items-center">
                    {getCategoryIcon(place.type)}
                    <span className="ml-1 text-xs">
                      {place.type === 'restaurant' ? 'Nhà hàng' : 
                      place.type === 'hotel' ? 'Khách sạn' : 
                      place.type === 'cafe' ? 'Quán cà phê' : 
                      place.type === 'tourist_attraction' ? 'Du lịch' : place.type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1">{place.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{place.location}</span>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/dashboard/Map?place=${place.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      <span>Xem chi tiết</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center md:hidden">
            <Link
              href="/dashboard/Map"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <span className="mr-2">Xem tất cả</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Popular Cities */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Thành phố phổ biến
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá những thành phố hấp dẫn với hàng trăm địa điểm thú vị
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCities.map(city => (
              <div key={city.id} className="relative h-60 group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all">
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{city.name}</h3>
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{city.count} địa điểm</span>
                  </div>
                  <Link
                    href={`/dashboard/Map?city=${city.name}`}
                    className="mt-3 inline-flex items-center text-white hover:text-blue-100 text-sm"
                  >
                    <span>Khám phá</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* App Features */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-indigo-700 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ứng dụng TravelSense
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Tải ứng dụng TravelSense để khám phá những địa điểm thú vị mọi lúc, mọi nơi, ngay cả khi không có kết nối internet.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Khám phá địa điểm ngay cả khi offline',
                  'Tạo và quản lý lịch trình du lịch',
                  'Lưu địa điểm yêu thích để truy cập nhanh',
                  'Nhận thông báo về các sự kiện và ưu đãi gần bạn',
                  'Chia sẻ trải nghiệm với bạn bè'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-400 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap gap-4">
              <a href="#" className="flex items-center py-2 px-6 bg-black hover:bg-gray-900 rounded-lg transition-colors">
                <FaApple className="w-8 h-8 mr-3" />
                <div>
                  <div className="text-xs">Tải trên</div>
                  <div className="text-xl font-semibold">App Store</div>
                </div>
              </a>
              <a href="#" className="flex items-center py-2 px-6 bg-black hover:bg-gray-900 rounded-lg transition-colors">
                <SiGoogleplay className="w-8 h-8 mr-3" />
                <div>
                  <div className="text-xs">Tải trên</div>
                  <div className="text-xl font-semibold">Google Play</div>
                </div>
              </a>
              </div>
            </div>
            
            <div className="relative hidden md:block">
              <div className="relative z-10 ml-10">
                <Image
                  src="/images/mobile-1.png"
                  alt="TravelSense App"
                  width={300}
                  height={600}
                  className="rounded-3xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-10 -left-10 z-0">
                <Image
                  src="/images/mobile-2.png"
                  alt="TravelSense App"
                  width={300}
                  height={600}
                  className="rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Người dùng nói gì về chúng tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hàng ngàn người dùng đã tin tưởng TravelSense để khám phá những địa điểm tuyệt vời
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{testimonial.author}</h4>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center">
                <div className="flex">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-xl font-bold">4.8/5</span>
              </div>
              <p className="text-gray-600 mt-1">Dựa trên hơn 10,000 đánh giá</p>
            </div>
            
            <Link
              href="/auth"
              className="inline-flex items-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <span className="mr-2">Tham gia cùng chúng tôi</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Sẵn sàng khám phá thế giới xung quanh bạn?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
                Đăng ký miễn phí ngay hôm nay và bắt đầu hành trình khám phá những địa điểm tuyệt vời cùng TravelSense.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/auth"
                  className="py-3 px-8 bg-white text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                >
                  Đăng ký miễn phí
                </Link>
                <Link
                  href="/dashboard/Map"
                  className="py-3 px-8 bg-blue-800 text-white hover:bg-blue-900 rounded-lg font-medium transition-colors"
                >
                  Khám phá bản đồ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </>
  );
};

export default HomePage;