// app/contact/page.tsx
'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import SharedLayout from '@/app/components/layout/SharedLayout';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2 
} from 'lucide-react';

const ContactPage = () => {
    // Tọa độ văn phòng
    const longitude = 105.785851;
    const latitude = 21.048411;
    
    // Cấu hình Mapbox Static Map
    const zoom = 15;
    const width = 1200;
    const height = 600;
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    // Tạo URL của Mapbox Static Map với marker tại vị trí văn phòng
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+f44336(${longitude},${latitude})/${longitude},${latitude},${zoom},0/${width}x${height}?access_token=${mapboxToken}`;
    
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Simulate API call
    try {
      // In a real application, you would send the form data to your API here
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SharedLayout>
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="relative h-64 md:h-80 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute w-full h-full">
              <div className="absolute top-[20%] left-[80%] bg-white/20 h-40 w-40 rounded-full blur-3xl"></div>
              <div className="absolute top-[40%] left-[10%] bg-white/20 h-60 w-60 rounded-full blur-3xl"></div>
            </div>
          </div>
          
          <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white">Liên hệ với chúng tôi</h1>
            <p className="text-lg md:text-xl max-w-2xl text-white/90">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào.
            </p>
          </div>
        </section>

        {/* Contact Info & Form */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Thông tin liên hệ</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800">Địa chỉ</h3>
                      <p className="text-gray-600 mt-1">
                        Số 236 Hoàng Quốc Việt, Cổ Nhuế<br />
                        Bắc Từ Liêm, Hà Nội
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800">Điện thoại</h3>
                      <p className="text-gray-600 mt-1">
                        <a href="tel:+84901234567" className="hover:text-blue-600">+84 9717 93374</a>
                      </p>
                      <p className="text-gray-600">
                        <a href="tel:+842838123456" className="hover:text-blue-600">+84 9733 96044</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800">Email</h3>
                      <p className="text-gray-600 mt-1">
                        <a href="mailto:info@travelsense.com" className="hover:text-blue-600">nhdandz@gmail.com</a>
                      </p>
                      <p className="text-gray-600">
                        <a href="mailto:support@travelsense.com" className="hover:text-blue-600">satianryokubn@gmail.com</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800">Giờ làm việc</h3>
                      <p className="text-gray-600 mt-1">
                        Thứ Hai - Thứ Sáu: 8:30 AM - 6:00 PM
                      </p>
                      <p className="text-gray-600">
                        Thứ Bảy: 9:00 AM - 12:00 PM
                      </p>
                      <p className="text-gray-600">
                        Chủ Nhật: Đóng cửa
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Social Media */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Kết nối với chúng tôi</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white hover:bg-pink-700 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M21.593 7.203a2.506 2.506 0 00-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.404a2.56 2.56 0 00-1.766 1.778c-.413 1.566-.417 4.814-.417 4.814s-.004 3.264.406 4.814c.23.857.905 1.534 1.763 1.765 1.582.43 7.83.437 7.83.437s6.265.007 7.831-.403a2.515 2.515 0 001.767-1.763c.414-1.565.417-4.812.417-4.812s.02-3.265-.407-4.831zM9.996 15.005l.005-6 5.207 3.005-5.212 2.995z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Gửi tin nhắn cho chúng tôi</h2>
                
                {isSubmitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-green-800">Cảm ơn bạn đã liên hệ!</h3>
                      <p className="text-green-700 mt-2">
                        Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.
                      </p>
                      <button
                        className="mt-4 text-green-700 font-medium hover:text-green-800"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Gửi tin nhắn khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập họ và tên của bạn"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="example@email.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Chọn chủ đề</option>
                        <option value="general">Câu hỏi chung</option>
                        <option value="support">Hỗ trợ kỹ thuật</option>
                        <option value="partnership">Hợp tác kinh doanh</option>
                        <option value="feedback">Góp ý, phản hồi</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Tin nhắn</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập nội dung tin nhắn của bạn tại đây..."
                        required
                      ></textarea>
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <button
                        type="submit"
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Gửi tin nhắn
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Map */}
        <section className="py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-xl overflow-hidden h-96 shadow-lg">
          <div className="w-full h-full relative">
            {/* Ảnh bản đồ tĩnh */}
            <Image
              src={mapUrl}
              alt="Vị trí văn phòng công ty"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-xl"
            />
            
            {/* Overlay thông tin */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
              <h3 className="font-medium text-gray-800">Văn phòng công ty</h3>
              <p className="text-gray-600 text-sm mt-1">
                Số 236 Hoàng Quốc Việt, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
        
        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">Câu hỏi thường gặp</h2>
            
            <div className="space-y-6">
              {[
                {
                  question: "TravelSense hoạt động như thế nào?",
                  answer: "TravelSense là nền tảng du lịch thông minh giúp bạn tìm kiếm và khám phá các địa điểm xung quanh. Chúng tôi cung cấp bản đồ tương tác, thông tin chi tiết về địa điểm, đánh giá từ cộng đồng và công cụ lập kế hoạch hành trình."
                },
                {
                  question: "Làm thế nào để tạo tài khoản TravelSense?",
                  answer: "Bạn có thể tạo tài khoản TravelSense bằng cách nhấp vào nút 'Đăng ký' ở góc trên bên phải trang web, sau đó điền thông tin cá nhân của bạn và xác nhận email. Việc đăng ký hoàn toàn miễn phí và chỉ mất vài phút."
                },
                {
                  question: "TravelSense có ứng dụng di động không?",
                  answer: "Có, TravelSense có ứng dụng di động cho cả iOS và Android. Bạn có thể tải xuống từ App Store hoặc Google Play Store để trải nghiệm đầy đủ các tính năng của chúng tôi khi đang di chuyển."
                },
                {
                  question: "Làm thế nào để báo cáo thông tin không chính xác về một địa điểm?",
                  answer: "Nếu bạn phát hiện thông tin không chính xác về bất kỳ địa điểm nào, bạn có thể sử dụng tính năng 'Báo cáo thông tin' trên trang chi tiết của địa điểm đó hoặc liên hệ với chúng tôi qua email support@travelsense.com."
                },
                {
                  question: "TravelSense có hoạt động ở quốc gia nào?",
                  answer: "Hiện tại, TravelSense đang hoạt động tại Việt Nam và đang mở rộng sang các quốc gia Đông Nam Á khác. Chúng tôi có kế hoạch mở rộng phạm vi hoạt động toàn cầu trong tương lai gần."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer p-6">
                      <h3 className="text-lg font-medium text-gray-800">{faq.question}</h3>
                      <span className="relative ml-4 flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-500 group-open:hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <svg className="w-5 h-5 text-gray-500 hidden group-open:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Không tìm thấy câu trả lời cho câu hỏi của bạn?</p>
              <a href="#" className="text-blue-600 font-medium hover:text-blue-700">
                Xem tất cả FAQ
              </a>
            </div>
          </div>
        </section>
      </div>
    </SharedLayout>
  );
};

export default ContactPage;