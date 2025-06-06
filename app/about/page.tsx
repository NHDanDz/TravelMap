// app/about/page.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SharedLayout from '@/app/components/layout/SharedLayout';
import { 
  Compass, Globe, MapPin,   Map, Star 
} from 'lucide-react';

const AboutPage = () => {
  return (
    <SharedLayout>
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="relative h-80 md:h-96 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
          {/* Background patterns */}
          <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
          <MapPin className="absolute top-[10%] left-[15%] text-white w-12 h-12" />
          <Compass className="absolute top-[40%] left-[85%] text-white w-16 h-16" />
          <Globe className="absolute top-[70%] left-[25%] text-white w-14 h-14" />
          <Map className="absolute top-[20%] left-[65%] text-white w-10 h-10" />
          
          {/* Các icon bổ sung */}
          <MapPin className="absolute top-[55%] left-[45%] text-white w-8 h-8" />
          <Compass className="absolute top-[5%] left-[80%] text-white w-12 h-12" />
          <Globe className="absolute top-[85%] left-[60%] text-white w-10 h-10" />
          <Map className="absolute top-[30%] left-[10%] text-white w-14 h-14" />
          <MapPin className="absolute top-[75%] left-[85%] text-white w-16 h-16" />
          <Compass className="absolute top-[15%] left-[30%] text-white w-10 h-10" />
          <Globe className="absolute top-[25%] left-[50%] text-white w-12 h-12" />
          <Map className="absolute top-[65%] left-[5%] text-white w-10 h-10" />
        </div>

          </div>
          
          {/* Hero content */}
          <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-center text-white">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Về TravelSense</h1>
            <p className="text-lg md:text-xl max-w-2xl text-white/90">
              Khám phá thế giới xung quanh bạn một cách dễ dàng với nền tảng du lịch thông minh, 
              giúp bạn tìm kiếm và khám phá những địa điểm tuyệt vời.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Sứ mệnh của chúng tôi</h2>
                <p className="text-lg text-gray-600 mb-4">
                  TravelSense ra đời với sứ mệnh giúp mọi người dễ dàng khám phá thế giới xung quanh họ, 
                  từ những quán cà phê ẩn mình trong góc phố đến những địa danh du lịch nổi tiếng.
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  Chúng tôi tin rằng mỗi hành trình đều mang đến những trải nghiệm quý giá, 
                  và công nghệ có thể giúp bạn tạo ra những kỷ niệm đáng nhớ hơn thông qua 
                  việc kết nối bạn với những địa điểm phù hợp nhất với sở thích cá nhân.
                </p>
                
                <div className="flex items-center">
                  <Link href="/dashboard/Map" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Bắt đầu khám phá
                  </Link>
                </div>
              </div>
              
              <div className="relative h-80 md:h-96 rounded-xl overflow-hidden shadow-lg">
                <Image 
                  src="/images/mission.jpg" 
                  alt="TravelSense Mission" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Tính năng nổi bật</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Khám phá địa điểm</h3>
                <p className="text-gray-600">
                  Tìm kiếm các địa điểm thú vị xung quanh bạn với bản đồ tương tác, 
                  bộ lọc thông minh và đánh giá chi tiết.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Map className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Lập lịch trình</h3>
                <p className="text-gray-600">
                  Tạo lịch trình du lịch cá nhân hóa với các điểm tham quan, 
                  nhà hàng và hoạt động yêu thích của bạn.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Star className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Đánh giá thực tế</h3>
                <p className="text-gray-600">
                  Xem đánh giá chi tiết từ cộng đồng người dùng để lựa chọn 
                  những địa điểm tốt nhất cho trải nghiệm của bạn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">Đội ngũ phát triển</h2>
            <p className="text-lg text-center mb-12 text-gray-600 max-w-3xl mx-auto">
              Chúng tôi là những chuyên gia đam mê công nghệ và du lịch, 
              với sứ mệnh kết nối mọi người với thế giới xung quanh.
            </p>
            
            <div className="grid md:grid-cols-6 gap-4 text-center">
              {[
                {
                  name: 'Trần Trung Hiếu',
                  role: 'Founder & CEO',
                  image: '/images/human-1.jpg'
                },
                {
                  name: 'Đàm Vũ Đức Anh',
                  role: 'Lead Developer',
                  image: '/images/human-3.jpg'
                },
                {
                  name: 'Nguyễn Ngọc Hải',
                  role: 'Producer',
                  image: '/images/human-6.jpg'
                },
                {
                  name: 'Nguyễn Đặng Khôi Nguyên',
                  role: 'UX/UI Designer',
                  image: '/images/human-2.jpg'
                },
                {
                  name: 'Nguyễn Hải Đăng',
                  role: 'Data Scientist',
                  image: '/images/human-4.jpg'
                },
                {
                  name: 'Nguyễn Duy Khôi',
                  role: 'Content Creator',
                  image: '/images/human-5.jpg'
                }
               
              ].map((member, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="relative h-64">
                    <Image 
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-1 text-gray-800">{member.name}</h3>
                    <p className="text-blue-600 mb-3">{member.role}</p>
                    <div className="flex space-x-3 center">
                      <a href="#" className="text-gray-400 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.21c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.32 35.32 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Bắt đầu khám phá ngay hôm nay</h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Hàng ngàn địa điểm thú vị đang chờ bạn khám phá. Từ nhà hàng nổi tiếng đến 
              những điểm tham quan ẩn mình, TravelSense giúp bạn tìm kiếm và trải nghiệm chúng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/Map" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Khám phá bản đồ
              </Link>
              <Link href="/contact" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                Liên hệ chúng tôi
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SharedLayout>
  );
};

export default AboutPage;