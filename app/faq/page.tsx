// app/faq/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, Search, ChevronDown, ChevronUp,
  MapPin, Calendar, Lock, CreditCard, User, MessageSquare,
  Mail, Info
} from 'lucide-react';

interface FAQCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: React.ReactNode;
  category: string;
}

// FAQ Categories
const categories: FAQCategory[] = [
  { 
    id: 'general', 
    name: 'Tổng quan', 
    icon: <Info className="w-5 h-5" />,
    description: 'Thông tin chung về TravelSense'
  },
  { 
    id: 'account', 
    name: 'Tài khoản', 
    icon: <User className="w-5 h-5" />,
    description: 'Đăng ký, đăng nhập và quản lý tài khoản'
  },
  { 
    id: 'features', 
    name: 'Tính năng', 
    icon: <MapPin className="w-5 h-5" />,
    description: 'Hướng dẫn sử dụng các tính năng của TravelSense'
  },
  { 
    id: 'trips', 
    name: 'Lịch trình', 
    icon: <Calendar className="w-5 h-5" />,
    description: 'Tạo và quản lý lịch trình du lịch'
  },
  { 
    id: 'privacy', 
    name: 'Bảo mật & Quyền riêng tư', 
    icon: <Lock className="w-5 h-5" />,
    description: 'Thông tin về bảo mật và quyền riêng tư'
  },
  { 
    id: 'billing', 
    name: 'Thanh toán', 
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Gói dịch vụ và thanh toán'
  },
  { 
    id: 'support', 
    name: 'Hỗ trợ', 
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Hỗ trợ và giải đáp thắc mắc'
  }
];

// FAQ data
const faqs: FAQ[] = [
  // General
  {
    id: 'what-is-travelsense',
    question: 'TravelSense là gì?',
    answer: (
      <div>
        <p>
          TravelSense là nền tảng du lịch thông minh giúp người dùng tìm kiếm, khám phá và lưu trữ thông tin về các địa điểm thú vị như nhà hàng, quán cà phê, khách sạn và điểm tham quan. 
        </p>
        <p className="mt-2">
          Với TravelSense, bạn có thể:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Tìm kiếm địa điểm xung quanh bạn hoặc tại bất kỳ thành phố nào</li>
          <li>Lưu địa điểm yêu thích để truy cập nhanh sau này</li>
          <li>Tạo và quản lý lịch trình du lịch</li>
          <li>Đọc và viết đánh giá về các địa điểm</li>
          <li>Khám phá các địa điểm được đề xuất dựa trên sở thích của bạn</li>
        </ul>
      </div>
    ),
    category: 'general'
  },
  {
    id: 'how-to-use-travelsense',
    question: 'Làm thế nào để sử dụng TravelSense?',
    answer: (
      <div>
        <p>
          Bạn có thể sử dụng TravelSense thông qua website hoặc ứng dụng di động (iOS và Android). Để bắt đầu:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>
            <strong>Đăng ký tài khoản:</strong> Tạo tài khoản bằng email, Facebook hoặc Google.
          </li>
          <li>
            <strong>Khám phá bản đồ:</strong> Sử dụng bản đồ tương tác để tìm kiếm các địa điểm xung quanh vị trí hiện tại hoặc bất kỳ địa điểm nào bạn quan tâm.
          </li>
          <li>
            <strong>Lưu địa điểm yêu thích:</strong> Nhấn vào biểu tượng trái tim để lưu địa điểm vào danh sách yêu thích của bạn.
          </li>
          <li>
            <strong>Tạo lịch trình:</strong> Sử dụng tính năng lập lịch trình để tạo kế hoạch cho chuyến đi của bạn.
          </li>
        </ol>
        <p className="mt-2">
          TravelSense có thể được sử dụng miễn phí, với một số tính năng cao cấp dành cho người dùng Premium.
        </p>
      </div>
    ),
    category: 'general'
  },
  {
    id: 'travelsense-available-cities',
    question: 'TravelSense có sẵn ở những thành phố nào?',
    answer: (
      <div>
        <p>
          Hiện tại, TravelSense đang hoạt động tại các thành phố lớn ở Việt Nam, bao gồm:
        </p>
        <ul className="list-disc pl-5 mt-2 grid grid-cols-2 gap-2">
          <li>Hà Nội</li>
          <li>TP. Hồ Chí Minh</li>
          <li>Đà Nẵng</li>
          <li>Huế</li>
          <li>Nha Trang</li>
          <li>Đà Lạt</li>
          <li>Hội An</li>
          <li>Vũng Tàu</li>
          <li>Phú Quốc</li>
          <li>Hạ Long</li>
        </ul>
        <p className="mt-2">
          Chúng tôi đang tiếp tục mở rộng phạm vi hoạt động sang các thành phố khác ở Việt Nam và các quốc gia Đông Nam Á. Nếu thành phố của bạn chưa được hỗ trợ đầy đủ, bạn vẫn có thể tìm kiếm thông tin cơ bản về các địa điểm tại đó.
        </p>
      </div>
    ),
    category: 'general'
  },
  {
    id: 'data-sources',
    question: 'TravelSense thu thập dữ liệu từ đâu?',
    answer: (
      <div>
        <p>
          TravelSense thu thập thông tin về các địa điểm từ nhiều nguồn khác nhau để đảm bảo dữ liệu chính xác và toàn diện:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Các nguồn dữ liệu mở và đáng tin cậy</li>
          <li>Đóng góp và đánh giá từ cộng đồng người dùng</li>
          <li>Đối tác cung cấp dữ liệu chuyên nghiệp</li>
          <li>Đội ngũ nghiên cứu và kiểm duyệt nội dung của chúng tôi</li>
        </ul>
        <p className="mt-2">
          Chúng tôi liên tục cập nhật thông tin để đảm bảo tính chính xác. Nếu bạn phát hiện thông tin không chính xác, bạn có thể báo cáo để chúng tôi kiểm tra và cập nhật.
        </p>
      </div>
    ),
    category: 'general'
  },
  
  // Account
  {
    id: 'create-account',
    question: 'Làm thế nào để tạo tài khoản TravelSense?',
    answer: (
      <div>
        <p>Tạo tài khoản TravelSense rất đơn giản và miễn phí. Bạn có thể đăng ký bằng các cách sau:</p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Đăng ký bằng email:</strong> Truy cập trang đăng ký, nhập email, tạo mật khẩu và hoàn thành thông tin cá nhân cơ bản.
          </li>
          <li>
            <strong>Đăng ký qua mạng xã hội:</strong> Sử dụng tài khoản Facebook hoặc Google để đăng ký nhanh chóng.
          </li>
        </ul>
        <p className="mt-2">
          Sau khi đăng ký, bạn sẽ nhận được email xác nhận. Nhấp vào liên kết trong email để xác minh tài khoản của bạn và bắt đầu sử dụng TravelSense.
        </p>
        <div className="mt-3">
          <Link href="/auth" className="text-blue-600 hover:underline font-medium">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    ),
    category: 'account'
  },
  {
    id: 'reset-password',
    question: 'Tôi quên mật khẩu. Làm thế nào để đặt lại?',
    answer: (
      <div>
        <p>Nếu bạn quên mật khẩu, bạn có thể dễ dàng đặt lại bằng cách:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Truy cập trang đăng nhập và nhấp vào liên kết "Quên mật khẩu"</li>
          <li>Nhập địa chỉ email đã đăng ký với tài khoản của bạn</li>
          <li>Kiểm tra hộp thư của bạn (bao gồm cả thư mục spam) để tìm email có hướng dẫn đặt lại mật khẩu</li>
          <li>Nhấp vào liên kết trong email và tạo mật khẩu mới</li>
        </ol>
        <p className="mt-2">
          Liên kết đặt lại mật khẩu có hiệu lực trong 24 giờ. Nếu bạn không nhận được email hoặc liên kết đã hết hạn, bạn có thể yêu cầu gửi lại.
        </p>
      </div>
    ),
    category: 'account'
  },
  {
    id: 'delete-account',
    question: 'Làm thế nào để xóa tài khoản TravelSense?',
    answer: (
      <div>
        <p>
          Bạn có thể xóa tài khoản TravelSense của mình bất kỳ lúc nào, mặc dù chúng tôi sẽ rất tiếc khi thấy bạn rời đi. Để xóa tài khoản:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Đăng nhập vào tài khoản của bạn</li>
          <li>Truy cập trang "Cài đặt tài khoản" từ menu người dùng</li>
          <li>Cuộn xuống phần cuối và nhấp vào "Xóa tài khoản"</li>
          <li>Xác nhận quyết định của bạn bằng cách nhập mật khẩu</li>
        </ol>
        <p className="mt-2 text-red-600">
          <strong>Lưu ý:</strong> Việc xóa tài khoản là không thể đảo ngược. Tất cả dữ liệu của bạn, bao gồm địa điểm đã lưu, đánh giá và lịch trình sẽ bị xóa vĩnh viễn.
        </p>
        <p className="mt-2">
          Nếu bạn chỉ muốn tạm ngừng sử dụng, bạn có thể đăng xuất khỏi tài khoản mà không cần xóa nó.
        </p>
      </div>
    ),
    category: 'account'
  },
  {
    id: 'account-security',
    question: 'Làm thế nào để bảo vệ tài khoản của tôi?',
    answer: (
      <div>
        <p>
          Bảo mật tài khoản của bạn là điều quan trọng. Dưới đây là một số cách để bảo vệ tài khoản TravelSense của bạn:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Sử dụng mật khẩu mạnh và duy nhất (kết hợp chữ cái, số và ký tự đặc biệt)</li>
          <li>Bật xác thực hai yếu tố trong phần Cài đặt tài khoản</li>
          <li>Không chia sẻ thông tin đăng nhập của bạn với người khác</li>
          <li>Đăng xuất khi sử dụng thiết bị công cộng</li>
          <li>Cập nhật địa chỉ email khôi phục và số điện thoại</li>
          <li>Thường xuyên kiểm tra hoạt động tài khoản để phát hiện bất thường</li>
        </ul>
        <p className="mt-2">
          Nếu bạn nghi ngờ tài khoản của mình đã bị xâm phạm, hãy đổi mật khẩu ngay lập tức và liên hệ với bộ phận hỗ trợ của chúng tôi.
        </p>
      </div>
    ),
    category: 'account'
  },
  
  // Features
  {
    id: 'find-places',
    question: 'Làm thế nào để tìm kiếm địa điểm trên TravelSense?',
    answer: (
      <div>
        <p>TravelSense cung cấp nhiều cách để tìm kiếm địa điểm:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>
            <strong>Tìm kiếm trên bản đồ:</strong> Truy cập trang Bản đồ, di chuyển đến khu vực bạn quan tâm và khám phá các địa điểm được hiển thị.
          </li>
          <li>
            <strong>Tìm kiếm theo từ khóa:</strong> Sử dụng thanh tìm kiếm ở đầu trang để nhập tên địa điểm, loại địa điểm (như "nhà hàng", "quán cà phê") hoặc đặc điểm ("view đẹp", "món ngon").
          </li>
          <li>
            <strong>Lọc kết quả:</strong> Sử dụng bộ lọc để thu hẹp kết quả theo loại địa điểm, khoảng cách, đánh giá, giá cả và các tiêu chí khác.
          </li>
          <li>
            <strong>Khám phá theo danh mục:</strong> Duyệt qua các danh mục đề xuất như "Nhà hàng nổi tiếng", "Điểm tham quan hàng đầu" hoặc "Địa điểm mới".
          </li>
        </ol>
        <p className="mt-2">
          Kết quả tìm kiếm sẽ hiển thị trên bản đồ và dưới dạng danh sách. Nhấp vào một địa điểm để xem thông tin chi tiết, đánh giá và hình ảnh.
        </p>
      </div>
    ),
    category: 'features'
  },
  {
    id: 'save-favorite-places',
    question: 'Làm thế nào để lưu địa điểm yêu thích?',
    answer: (
      <div>
        <p>
          Để lưu địa điểm yêu thích vào danh sách của bạn:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Tìm kiếm và chọn địa điểm bạn muốn lưu</li>
          <li>Trên trang chi tiết địa điểm, nhấp vào biểu tượng trái tim ở góc trên</li>
          <li>Hoặc, trên kết quả tìm kiếm, nhấp vào biểu tượng trái tim bên cạnh tên địa điểm</li>
        </ol>
        <p className="mt-2">
          Tất cả địa điểm đã lưu sẽ được hiển thị trong phần "Địa điểm đã lưu" trên trang cá nhân của bạn. Bạn có thể tổ chức chúng thành các danh sách khác nhau như "Muốn đến", "Đã đến" hoặc tạo danh sách tùy chỉnh.
        </p>
        <p className="mt-2">
          Để truy cập nhanh vào địa điểm đã lưu, nhấp vào biểu tượng trái tim trong menu chính hoặc truy cập hồ sơ của bạn.
        </p>
      </div>
    ),
    category: 'features'
  },
  {
    id: 'write-reviews',
    question: 'Làm thế nào để viết đánh giá cho một địa điểm?',
    answer: (
      <div>
        <p>
          Đánh giá của bạn giúp ích cho cộng đồng TravelSense! Để viết đánh giá:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Tìm và mở trang chi tiết của địa điểm bạn muốn đánh giá</li>
          <li>Cuộn xuống phần "Đánh giá" và nhấp vào nút "Viết đánh giá"</li>
          <li>Cho điểm từ 1-5 sao và viết nhận xét của bạn</li>
          <li>Tùy chọn: Thêm hình ảnh để chia sẻ trải nghiệm của bạn</li>
          <li>Nhấp vào "Đăng" để hoàn tất</li>
        </ol>
        <p className="mt-2">
          Một vài lưu ý khi viết đánh giá:
        </p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Hãy trung thực và khách quan</li>
          <li>Cung cấp chi tiết cụ thể về trải nghiệm của bạn</li>
          <li>Đề cập đến những điểm nổi bật và những điểm cần cải thiện</li>
          <li>Tránh sử dụng ngôn ngữ xúc phạm hoặc nội dung không phù hợp</li>
        </ul>
        <p className="mt-2">
          Bạn có thể chỉnh sửa hoặc xóa đánh giá của mình bất kỳ lúc nào từ trang hồ sơ cá nhân.
        </p>
      </div>
    ),
    category: 'features'
  },
  {
    id: 'use-offline',
    question: 'Tôi có thể sử dụng TravelSense khi không có kết nối internet không?',
    answer: (
      <div>
        <p>
          Có, TravelSense cung cấp một số tính năng ngoại tuyến, đặc biệt là trên ứng dụng di động:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Bản đồ ngoại tuyến:</strong> Tải xuống bản đồ của khu vực bạn dự định đến trước khi mất kết nối.
          </li>
          <li>
            <strong>Địa điểm đã lưu:</strong> Truy cập danh sách địa điểm đã lưu của bạn, bao gồm thông tin cơ bản và ghi chú.
          </li>
          <li>
            <strong>Lịch trình du lịch:</strong> Xem lịch trình đã tạo của bạn mà không cần kết nối internet.
          </li>
        </ul>
        <p className="mt-2">
          Để sử dụng TravelSense ngoại tuyến:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>Mở ứng dụng TravelSense khi có kết nối internet</li>
          <li>Truy cập Cài đặt / Dữ liệu ngoại tuyến</li>
          <li>Chọn khu vực bạn muốn lưu cho sử dụng ngoại tuyến</li>
          <li>Nhấp vào "Tải xuống"</li>
        </ol>
        <p className="mt-2">
          Lưu ý rằng một số tính năng như tìm kiếm mới, đánh giá mới nhất và cập nhật thời gian thực sẽ không khả dụng trong chế độ ngoại tuyến.
        </p>
      </div>
    ),
    category: 'features'
  },
  
  // Trips
  {
    id: 'create-trip',
    question: 'Làm thế nào để tạo lịch trình du lịch trên TravelSense?',
    answer: (
      <div>
        <p>
          Tạo lịch trình du lịch trên TravelSense rất đơn giản:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>
            <strong>Bắt đầu tạo lịch trình:</strong> Nhấp vào "Lịch trình" trên menu chính, sau đó chọn "Tạo lịch trình mới".
          </li>
          <li>
            <strong>Thêm thông tin cơ bản:</strong> Đặt tên cho lịch trình, chọn ngày bắt đầu và kết thúc, và thêm mô tả nếu muốn.
          </li>
          <li>
            <strong>Thêm địa điểm:</strong> Tìm kiếm và thêm địa điểm vào từng ngày trong lịch trình của bạn. Bạn có thể thêm địa điểm từ danh sách đã lưu hoặc tìm kiếm địa điểm mới.
          </li>
          <li>
            <strong>Sắp xếp lộ trình:</strong> Kéo và thả để sắp xếp các địa điểm theo thứ tự bạn muốn ghé thăm.
          </li>
          <li>
            <strong>Thêm chi tiết:</strong> Với mỗi địa điểm, bạn có thể thêm thời gian ghé thăm, ghi chú và các chi tiết khác.
          </li>
          <li>
            <strong>Lưu và chia sẻ:</strong> Lưu lịch trình của bạn và tùy chọn chia sẻ với bạn bè hoặc gia đình.
          </li>
        </ol>
        <p className="mt-2">
          Lịch trình của bạn sẽ được lưu trong tài khoản và bạn có thể chỉnh sửa hoặc cập nhật bất kỳ lúc nào. Bạn cũng có thể xuất lịch trình sang PDF hoặc đồng bộ với Google Calendar.
        </p>
        <div className="mt-3">
          <Link href="/trip-planner" className="text-blue-600 hover:underline font-medium">
            Tạo lịch trình ngay
          </Link>
        </div>
      </div>
    ),
    category: 'trips'
  },
  {
    id: 'share-trip',
    question: 'Làm thế nào để chia sẻ lịch trình với bạn bè?',
    answer: (
      <div>
        <p>
          TravelSense cho phép bạn dễ dàng chia sẻ lịch trình du lịch với bạn bè, gia đình hoặc đồng nghiệp. Để chia sẻ lịch trình:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Mở lịch trình bạn muốn chia sẻ</li>
          <li>Nhấp vào nút "Chia sẻ" ở góc trên bên phải</li>
          <li>Chọn một trong các tùy chọn chia sẻ sau:</li>
        </ol>
        <ul className="list-disc pl-10 mt-1 space-y-1">
          <li>
            <strong>Chia sẻ qua đường dẫn:</strong> Tạo liên kết có thể chia sẻ và gửi qua tin nhắn, email, v.v.
          </li>
          <li>
            <strong>Chia sẻ qua email:</strong> Nhập địa chỉ email của người nhận và gửi trực tiếp từ TravelSense.
          </li>
          <li>
            <strong>Chia sẻ qua mạng xã hội:</strong> Đăng lên Facebook, Twitter hoặc các nền tảng khác.
          </li>
          <li>
            <strong>Xuất PDF:</strong> Tải xuống bản PDF để in hoặc chia sẻ ngoại tuyến.
          </li>
        </ul>
        <p className="mt-2">
          Khi chia sẻ lịch trình, bạn có thể điều chỉnh quyền riêng tư:
        </p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>
            <strong>Chỉ xem:</strong> Người nhận chỉ có thể xem lịch trình.
          </li>
          <li>
            <strong>Chỉnh sửa:</strong> Người nhận có thể đóng góp và chỉnh sửa lịch trình.
          </li>
          <li>
            <strong>Bảo mật bằng mật khẩu:</strong> Yêu cầu mật khẩu để truy cập lịch trình.
          </li>
        </ul>
        <p className="mt-2">
          Lịch trình được chia sẻ sẽ tự động cập nhật cho tất cả người xem khi bạn thực hiện thay đổi.
        </p>
      </div>
    ),
    category: 'trips'
  },
  {
    id: 'trip-suggestions',
    question: 'TravelSense có đề xuất lịch trình cho tôi không?',
    answer: (
      <div>
        <p>
          Có! TravelSense cung cấp đề xuất lịch trình được cá nhân hóa dựa trên sở thích, thời gian và điểm đến của bạn. Để nhận đề xuất lịch trình:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Truy cập phần "Lịch trình" và chọn "Đề xuất lịch trình"</li>
          <li>Chọn điểm đến (thành phố hoặc khu vực)</li>
          <li>Chọn ngày bắt đầu và kết thúc</li>
          <li>Chọn sở thích du lịch (văn hóa, ẩm thực, mua sắm, thiên nhiên, v.v.)</li>
          <li>Tùy chọn: Thêm các địa điểm bạn nhất định muốn ghé thăm</li>
          <li>Nhấp vào "Tạo đề xuất"</li>
        </ol>
        <p className="mt-2">
          TravelSense sẽ tạo một lịch trình được tối ưu hóa dựa trên:
        </p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Các địa điểm phổ biến và được đánh giá cao</li>
          <li>Khoảng cách và thời gian di chuyển hợp lý</li>
          <li>Giờ mở cửa của các địa điểm</li>
          <li>Sở thích du lịch của bạn</li>
          <li>Trải nghiệm của người dùng khác</li>
        </ul>
        <p className="mt-2">
          Bạn có thể chỉnh sửa lịch trình được đề xuất để phù hợp với nhu cầu cụ thể của mình. Cách tiếp cận này tiết kiệm thời gian lập kế hoạch và giúp bạn khám phá những địa điểm mà bạn có thể không biết đến.
        </p>
      </div>
    ),
    category: 'trips'
  },
  
  // Privacy
  {
    id: 'data-privacy',
    question: 'TravelSense xử lý dữ liệu cá nhân của tôi như thế nào?',
    answer: (
      <div>
        <p>
          TravelSense cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng. Chúng tôi xử lý dữ liệu của bạn như sau:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Thu thập:</strong> Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp và cải thiện dịch vụ, bao gồm thông tin tài khoản, vị trí (khi bạn cho phép), lịch sử tìm kiếm và tương tác với ứng dụng.
          </li>
          <li>
            <strong>Sử dụng:</strong> Dữ liệu của bạn được sử dụng để cung cấp các tính năng TravelSense, cá nhân hóa trải nghiệm, và cải thiện dịch vụ của chúng tôi.
          </li>
          <li>
            <strong>Bảo vệ:</strong> Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ dữ liệu của bạn, bao gồm mã hóa, kiểm soát truy cập và giám sát thường xuyên.
          </li>
          <li>
            <strong>Chia sẻ:</strong> Chúng tôi không bán dữ liệu cá nhân của bạn. Dữ liệu chỉ được chia sẻ với các bên thứ ba đáng tin cậy khi cần thiết để cung cấp dịch vụ.
          </li>
          <li>
            <strong>Quyền của bạn:</strong> Bạn có quyền truy cập, sửa đổi, xóa dữ liệu của mình và hạn chế xử lý dữ liệu.
          </li>
        </ul>
        <p className="mt-2">
          Để biết thêm chi tiết, vui lòng xem <Link href="/privacy" className="text-blue-600 hover:underline">Chính sách Bảo mật</Link> của chúng tôi. Nếu bạn có bất kỳ câu hỏi nào về dữ liệu của mình, hãy liên hệ với Nhóm Bảo mật Dữ liệu của chúng tôi tại privacy@travelsense.com.
        </p>
      </div>
    ),
    category: 'privacy'
  },
  {
    id: 'location-data',
    question: 'TravelSense sử dụng dữ liệu vị trí của tôi như thế nào?',
    answer: (
      <div>
        <p>
          Dữ liệu vị trí giúp TravelSense cung cấp trải nghiệm tốt hơn, nhưng chúng tôi luôn tôn trọng quyền riêng tư của bạn. Đây là cách chúng tôi sử dụng dữ liệu vị trí:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Tìm kiếm địa điểm gần đây:</strong> Khi bạn cho phép, chúng tôi sử dụng vị trí hiện tại của bạn để hiển thị các địa điểm gần bạn.
          </li>
          <li>
            <strong>Đề xuất phù hợp:</strong> Hiểu vị trí của bạn giúp chúng tôi đề xuất địa điểm phù hợp với khu vực bạn đang khám phá.
          </li>
          <li>
            <strong>Chỉ đường:</strong> Để cung cấp hướng dẫn chỉ đường chính xác đến các địa điểm.
          </li>
          <li>
            <strong>Lịch trình tối ưu:</strong> Giúp lập lịch trình du lịch hiệu quả dựa trên khoảng cách giữa các địa điểm.
          </li>
        </ul>
        <p className="mt-2">
          <strong>Điều quan trọng cần biết:</strong>
        </p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Bạn luôn có quyền kiểm soát khi nào và liệu TravelSense có thể truy cập vị trí của bạn hay không.</li>
          <li>Bạn có thể tắt quyền truy cập vị trí bất kỳ lúc nào trong cài đặt ứng dụng hoặc thiết bị.</li>
          <li>Chúng tôi không theo dõi liên tục vị trí của bạn, chỉ khi bạn đang tích cực sử dụng ứng dụng và đã cấp quyền.</li>
          <li>Dữ liệu vị trí chi tiết được lưu trữ trong thời gian giới hạn (thường là 90 ngày).</li>
        </ul>
        <p className="mt-2">
          Nếu bạn muốn sử dụng TravelSense mà không chia sẻ vị trí, bạn vẫn có thể tìm kiếm địa điểm bằng cách nhập địa điểm cụ thể hoặc duyệt qua bản đồ.
        </p>
      </div>
    ),
    category: 'privacy'
  },
  
  // Billing
  {
    id: 'pricing-plans',
    question: 'TravelSense có những gói dịch vụ nào?',
    answer: (
      <div>
        <p>
          TravelSense cung cấp các gói dịch vụ sau để phù hợp với nhu cầu khác nhau:
        </p>
        <div className="mt-4 space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Gói miễn phí</h3>
            <p className="text-gray-600 mb-3">Trải nghiệm cơ bản TravelSense, hoàn toàn miễn phí.</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Tìm kiếm và khám phá địa điểm</li>
              <li>Lưu tối đa 20 địa điểm yêu thích</li>
              <li>Tạo tối đa 2 lịch trình du lịch</li>
              <li>Đọc và viết đánh giá</li>
              <li>Trải nghiệm với quảng cáo</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-800">Gói Premium</h3>
              <span className="text-blue-600 font-bold">99.000đ/tháng</span>
            </div>
            <p className="text-gray-600 mb-3">Trải nghiệm đầy đủ tính năng cho người dùng thường xuyên.</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Tất cả tính năng của gói miễn phí</li>
              <li>Không giới hạn số lượng địa điểm yêu thích</li>
              <li>Không giới hạn số lượng lịch trình</li>
              <li>Sử dụng không có quảng cáo</li>
              <li>Tải xuống bản đồ ngoại tuyến</li>
              <li>Đề xuất lịch trình nâng cao</li>
              <li>Ưu tiên hỗ trợ</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-800">Gói Gia đình</h3>
              <span className="text-purple-600 font-bold">199.000đ/tháng</span>
            </div>
            <p className="text-gray-600 mb-3">Dành cho nhiều người dùng trong một gia đình.</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Tất cả tính năng của gói Premium</li>
              <li>Chia sẻ với tối đa 6 thành viên gia đình</li>
              <li>Hợp tác lập kế hoạch lịch trình</li>
              <li>Đồng bộ hóa địa điểm yêu thích giữa các thành viên</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 bg-green-50 border-green-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-gray-800">Gói Doanh nghiệp</h3>
              <span className="text-green-600 font-bold">Liên hệ báo giá</span>
            </div>
            <p className="text-gray-600 mb-3">Dành cho doanh nghiệp và tổ chức du lịch.</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Quản lý nhiều người dùng</li>
              <li>Công cụ lập kế hoạch nhóm</li>
              <li>Phân tích và báo cáo</li>
              <li>API tích hợp</li>
              <li>Hỗ trợ khách hàng chuyên biệt</li>
            </ul>
          </div>
        </div>
        <p className="mt-4">
          Tất cả các gói trả phí đều có giai đoạn dùng thử miễn phí 7 ngày. Bạn có thể nâng cấp hoặc hạ cấp gói của mình bất kỳ lúc nào từ trang Cài đặt tài khoản.
        </p>
        <div className="mt-3">
          <Link href="/pricing" className="text-blue-600 hover:underline font-medium">
            Xem chi tiết gói dịch vụ
          </Link>
        </div>
      </div>
    ),
    category: 'billing'
  },
  {
    id: 'payment-methods',
    question: 'TravelSense chấp nhận những phương thức thanh toán nào?',
    answer: (
      <div>
        <p>
          TravelSense chấp nhận nhiều phương thức thanh toán khác nhau để thuận tiện cho người dùng:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Thẻ tín dụng/ghi nợ:</strong> Visa, MasterCard, American Express, JCB
          </li>
          <li>
            <strong>Ví điện tử:</strong> MoMo, ZaloPay, VNPay, ShopeePay
          </li>
          <li>
            <strong>Chuyển khoản ngân hàng:</strong> Có sẵn cho thanh toán hàng năm
          </li>
          <li>
            <strong>Google Pay / Apple Pay:</strong> Trên các thiết bị và khu vực được hỗ trợ
          </li>
          <li>
            <strong>PayPal:</strong> Cho thanh toán quốc tế
          </li>
        </ul>
        <p className="mt-2">
          Để quản lý phương thức thanh toán của bạn:
        </p>
        <ol className="list-decimal pl-5 mt-1 space-y-1">
          <li>Đăng nhập vào tài khoản TravelSense của bạn</li>
          <li>Truy cập "Cài đặt tài khoản" và chọn "Thanh toán"</li>
          <li>Tại đây, bạn có thể thêm, chỉnh sửa hoặc xóa phương thức thanh toán</li>
        </ol>
        <p className="mt-2">
          Lưu ý quan trọng về bảo mật thanh toán:
        </p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>TravelSense không lưu trữ thông tin thẻ tín dụng của bạn trực tiếp.</li>
          <li>Tất cả giao dịch được xử lý thông qua cổng thanh toán an toàn với mã hóa SSL.</li>
          <li>Chúng tôi tuân thủ các tiêu chuẩn bảo mật PCI DSS để bảo vệ thông tin thanh toán của bạn.</li>
        </ul>
        <p className="mt-2">
          Nếu bạn gặp bất kỳ vấn đề nào với thanh toán, vui lòng liên hệ bộ phận hỗ trợ của chúng tôi tại billing@travelsense.com.
        </p>
      </div>
    ),
    category: 'billing'
  },
  
  // Support
  {
    id: 'contact-support',
    question: 'Làm thế nào để liên hệ với bộ phận hỗ trợ?',
    answer: (
      <div>
        <p>
          Bạn có thể liên hệ với đội ngũ hỗ trợ của TravelSense qua các kênh sau:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <strong>Email hỗ trợ:</strong>{' '}
            <a href="mailto:support@travelsense.com" className="text-blue-600 hover:underline">
              support@travelsense.com
            </a>
          </li>
          <li>
            <strong>Biểu mẫu liên hệ:</strong> Điền vào biểu mẫu trên{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              trang liên hệ
            </Link>{' '}
            của chúng tôi
          </li>
          <li>
            <strong>Trò chuyện trực tiếp:</strong> Có sẵn từ 8:00 đến 22:00 (Giờ Việt Nam) trên ứng dụng và website
          </li>
          <li>
            <strong>Trung tâm trợ giúp:</strong> Duyệt qua{' '}
            <Link href="/help" className="text-blue-600 hover:underline">
              trung tâm trợ giúp
            </Link>{' '}
            của chúng tôi để tìm câu trả lời ngay lập tức
          </li>
          <li>
            <strong>Điện thoại:</strong> +84 28 3812 3456 (Thứ Hai - Thứ Sáu, 9:00 - 18:00 Giờ Việt Nam)
          </li>
        </ul>
        <p className="mt-3">
          <strong>Thời gian phản hồi:</strong>
        </p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Trò chuyện trực tiếp: Phản hồi tức thì trong giờ hỗ trợ</li>
          <li>Email: Trong vòng 24 giờ</li>
          <li>Điện thoại: Trong giờ làm việc</li>
        </ul>
        <p className="mt-2">
          Người dùng Premium và Gia đình được ưu tiên hỗ trợ với thời gian phản hồi nhanh hơn.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Mẹo để được hỗ trợ nhanh chóng</h4>
          <ul className="list-disc pl-5 text-blue-800 space-y-1">
            <li>Cung cấp tên người dùng hoặc địa chỉ email của bạn</li>
            <li>Mô tả chi tiết vấn đề bạn đang gặp phải</li>
            <li>Chia sẻ ảnh chụp màn hình nếu có thể</li>
            <li>Đề cập đến thiết bị và phiên bản ứng dụng bạn đang sử dụng</li>
          </ul>
        </div>
      </div>
    ),
    category: 'support'
  },
  {
    id: 'report-issues',
    question: 'Làm thế nào để báo cáo vấn đề hoặc lỗi?',
    answer: (
      <div>
        <p>
          Nếu bạn gặp phải vấn đề hoặc lỗi khi sử dụng TravelSense, chúng tôi rất cảm kích nếu bạn báo cáo cho chúng tôi biết. Đây là cách báo cáo vấn đề:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>
            <strong>Trong ứng dụng:</strong> Đi đến Menu / Trợ giúp & Hỗ trợ / Báo cáo vấn đề. Sử dụng biểu mẫu này để cung cấp chi tiết về lỗi bạn đang gặp phải.
          </li>
          <li>
            <strong>Trên website:</strong> Nhấp vào biểu tượng "?" ở góc dưới bên phải của bất kỳ trang nào và chọn "Báo cáo lỗi".
          </li>
          <li>
            <strong>Qua email:</strong> Gửi mô tả chi tiết về vấn đề đến bugs@travelsense.com kèm theo ảnh chụp màn hình nếu có thể.
          </li>
        </ol>
        <p className="mt-2">
          Khi báo cáo lỗi, vui lòng cung cấp càng nhiều thông tin càng tốt:
        </p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Mô tả chính xác những gì đã xảy ra</li>
          <li>Các bước để tái hiện lỗi</li>
          <li>Thiết bị, hệ điều hành và phiên bản ứng dụng của bạn</li>
          <li>Ảnh chụp màn hình hoặc video ghi lại vấn đề</li>
          <li>Thời gian xảy ra lỗi</li>
        </ul>
        <p className="mt-2">
          Ngoài ra, bạn cũng có thể báo cáo thông tin không chính xác về một địa điểm cụ thể trực tiếp từ trang chi tiết của địa điểm đó. Chỉ cần cuộn xuống dưới cùng của trang và nhấp vào "Báo cáo thông tin không chính xác".
        </p>
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <p>
            <strong>Lưu ý:</strong> Đội ngũ phát triển của chúng tôi xem xét tất cả các báo cáo lỗi và nỗ lực khắc phục càng nhanh càng tốt. Chúng tôi đánh giá cao phản hồi của bạn và lời cảm ơn trước vì đã giúp chúng tôi cải thiện TravelSense!
          </p>
        </div>
      </div>
    ),
    category: 'support'
  },
  {
    id: 'suggest-feature',
    question: 'Làm thế nào để đề xuất tính năng mới?',
    answer: (
      <div>
        <p>
          Chúng tôi luôn hoan nghênh ý kiến và đề xuất từ cộng đồng người dùng! Nếu bạn có ý tưởng về tính năng mới hoặc cải tiến cho TravelSense, đây là cách để chia sẻ:
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-2">
          <li>
            <strong>Biểu mẫu đề xuất tính năng:</strong> Cách tốt nhất để đề xuất tính năng là thông qua{' '}
            <Link href="/feedback" className="text-blue-600 hover:underline">
              biểu mẫu đề xuất tính năng
            </Link>{' '}
            của chúng tôi, nơi bạn có thể mô tả chi tiết ý tưởng của mình.
          </li>
          <li>
            <strong>Trong ứng dụng:</strong> Đi đến Menu / Trợ giúp & Hỗ trợ / Đề xuất tính năng.
          </li>
          <li>
            <strong>Qua email:</strong> Gửi đề xuất của bạn đến features@travelsense.com với chủ đề "Đề xuất tính năng".
          </li>
          <li>
            <strong>Khảo sát người dùng:</strong> Tham gia các khảo sát người dùng định kỳ của chúng tôi, nơi bạn có thể chia sẻ ý kiến và đề xuất.
          </li>
        </ol>
        <p className="mt-2">
          Khi đề xuất tính năng, hãy cân nhắc bao gồm:
        </p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Mô tả chi tiết về tính năng bạn muốn thấy</li>
          <li>Lý do tại sao tính năng này sẽ hữu ích</li>
          <li>Cách bạn hình dung tính năng này sẽ hoạt động</li>
          <li>Ví dụ về cách tính năng này có thể cải thiện trải nghiệm của bạn</li>
        </ul>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Quy trình xét duyệt đề xuất tính năng</h4>
          <ol className="list-decimal pl-5 text-blue-800 space-y-1">
            <li>Đội ngũ sản phẩm của chúng tôi xem xét tất cả các đề xuất tính năng</li>
            <li>Các đề xuất được ưu tiên dựa trên tiềm năng tác động và tính khả thi</li>
            <li>Những ý tưởng có tiềm năng sẽ được thêm vào lộ trình phát triển của chúng tôi</li>
            <li>Bạn có thể nhận được phản hồi về đề xuất của mình nếu nó được chọn để phát triển</li>
          </ol>
        </div>
        <p className="mt-3">
          Chúng tôi đánh giá cao mọi đề xuất, ngay cả khi chúng tôi không thể triển khai tất cả. Phản hồi của bạn giúp chúng tôi tiếp tục cải thiện TravelSense để đáp ứng nhu cầu của người dùng.
        </p>
      </div>
    ),
    category: 'support'
  }
];

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
  
  // Handle toggle FAQ expansion
  const toggleFAQ = (id: string) => {
    if (expandedFAQs.includes(id)) {
      setExpandedFAQs(expandedFAQs.filter(faqId => faqId !== id));
    } else {
      setExpandedFAQs([...expandedFAQs, id]);
    }
  };
  
  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    // Filter by search query
    const matchesSearch = searchQuery
      ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    // Filter by category
    const matchesCategory = activeCategory ? faq.category === activeCategory : true;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group FAQs by category for display
  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Câu hỏi thường gặp</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Tìm câu trả lời cho các câu hỏi thường gặp về TravelSense. Nếu bạn không thể tìm thấy câu trả lời, hãy liên hệ với chúng tôi.
            </p>
          </div>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              {searchQuery && (
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setSearchQuery('')}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="py-8 border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              <button
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveCategory(null)}
              >
                Tất cả
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className={activeCategory === category.id ? 'text-white' : 'text-blue-600'}>
                    {category.icon}
                  </span>
                  <span className="ml-2">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {searchQuery && filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy kết quả</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Không tìm thấy câu hỏi nào phù hợp với "{searchQuery}". Vui lòng thử tìm kiếm khác hoặc liên hệ với chúng tôi.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              <span>Liên hệ hỗ trợ</span>
            </Link>
          </div>
        ) : (
          <>
            {searchQuery ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                  {filteredFAQs.length} kết quả cho "{searchQuery}"
                </h2>
              </div>
            ) : null}
            
            {/* Display FAQs grouped by category */}
            <div className="space-y-12">
              {Object.entries(groupedFAQs).map(([categoryId, categoryFAQs]) => {
                const category = categories.find(c => c.id === categoryId);
                return (
                  <div key={categoryId}>
                    <div className="flex items-center mb-6">
                      <div className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3`}>
                        <span className="text-blue-600">
                          {category?.icon}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800">{category?.name || categoryId}</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {categoryFAQs.map(faq => (
                        <div 
                          key={faq.id} 
                          className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                        >
                          <button
                            className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
                            onClick={() => toggleFAQ(faq.id)}
                          >
                            <h3 className="text-lg font-medium text-gray-800">{faq.question}</h3>
                            {expandedFAQs.includes(faq.id) ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </button>
                          
                          {expandedFAQs.includes(faq.id) && (
                            <div className="px-6 pb-6 pt-0 text-gray-600">
                              {faq.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      {/* Still need help */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vẫn không tìm thấy câu trả lời?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Nếu bạn không thể tìm thấy câu trả lời cho câu hỏi của mình, hãy liên hệ với đội ngũ hỗ trợ của chúng tôi. Chúng tôi sẵn sàng giúp đỡ bạn!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-5 h-5 mr-2" />
              <span>Liên hệ hỗ trợ</span>
            </Link>
            <Link
              href="/help"
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              <span>Trung tâm trợ giúp</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;