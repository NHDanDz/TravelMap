// app/privacy/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Shield, Lock, Eye, Clock, Database, 
  Globe, CreditCard, UserCheck, BookOpen 
} from 'lucide-react';

const PrivacyPolicyPage = () => {
  const lastUpdated = '15/03/2025';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold">Chính sách bảo mật</h1>
          </div>
          <p className="text-blue-100 max-w-2xl">
            Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
            Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ 
            thông tin của bạn khi sử dụng dịch vụ TravelSense.
          </p>
          <p className="mt-4 text-blue-200 text-sm">
            Cập nhật lần cuối: {lastUpdated}
          </p>
        </div>
      </div>
      
      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Mục lục
            </h2>
          </div>
          
          <div className="p-6">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'collection', title: 'Thông tin chúng tôi thu thập', icon: <Database className="w-5 h-5 text-blue-600" /> },
                { id: 'usage', title: 'Cách chúng tôi sử dụng thông tin', icon: <Eye className="w-5 h-5 text-blue-600" /> },
                { id: 'sharing', title: 'Chia sẻ thông tin với bên thứ ba', icon: <Globe className="w-5 h-5 text-blue-600" /> },
                { id: 'security', title: 'Bảo mật thông tin', icon: <Lock className="w-5 h-5 text-blue-600" /> },
                { id: 'retention', title: 'Thời gian lưu trữ dữ liệu', icon: <Clock className="w-5 h-5 text-blue-600" /> },
                { id: 'payments', title: 'Bảo mật thanh toán', icon: <CreditCard className="w-5 h-5 text-blue-600" /> },
                { id: 'rights', title: 'Quyền của người dùng', icon: <UserCheck className="w-5 h-5 text-blue-600" /> },
                { id: 'updates', title: 'Thay đổi chính sách bảo mật', icon: <BookOpen className="w-5 h-5 text-blue-600" /> }
              ].map(item => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`} 
                    className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 space-y-10">
            {/* Information Collection */}
            <section id="collection" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Thông tin chúng tôi thu thập</h2>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p>
                  TravelSense có thể thu thập các loại thông tin sau từ người dùng:
                </p>
                
                <h3>Thông tin cá nhân</h3>
                <p>
                  Khi bạn đăng ký hoặc sử dụng dịch vụ của chúng tôi, chúng tôi có thể thu thập:
                </p>
                <ul>
                  <li>Họ tên</li>
                  <li>Địa chỉ email</li>
                  <li>Số điện thoại</li>
                  <li>Ảnh đại diện</li>
                  <li>Thông tin đăng nhập và mật khẩu (được mã hóa)</li>
                </ul>
                
                <h3>Thông tin vị trí</h3>
                <p>
                  Chúng tôi thu thập:
                </p>
                <ul>
                  <li>Vị trí của bạn khi sử dụng tính năng bản đồ</li>
                  <li>Lịch sử tìm kiếm địa điểm</li>
                  <li>Các địa điểm đã lưu hoặc đã đánh giá</li>
                </ul>
                
                <h3>Thông tin sử dụng</h3>
                <p>
                  Chúng tôi cũng thu thập thông tin về cách bạn sử dụng dịch vụ:
                </p>
                <ul>
                  <li>Thời gian và thời lượng sử dụng</li>
                  <li>Các tính năng bạn tương tác</li>
                  <li>Thiết bị và trình duyệt bạn sử dụng</li>
                  <li>Dữ liệu lịch trình và kế hoạch du lịch</li>
                </ul>
              </div>
            </section>
            
            {/* Usage of Information */}
            <section id="usage" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Cách chúng tôi sử dụng thông tin</h2>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p>
                  TravelSense sử dụng thông tin thu thập được để:
                </p>
                
                <h3>Cung cấp và cải thiện dịch vụ</h3>
                <ul>
                  <li>Cung cấp tính năng tìm kiếm và khám phá địa điểm phù hợp</li>
                  <li>Tạo và quản lý tài khoản người dùng</li>
                  <li>Cá nhân hóa trải nghiệm của bạn</li>
                  <li>Cải thiện tính năng và giao diện người dùng</li>
                </ul>
                
                <h3>Liên lạc với bạn</h3>
                <ul>
                  <li>Gửi thông báo về dịch vụ</li>
                  <li>Phản hồi yêu cầu hỗ trợ</li>
                  <li>Cung cấp thông tin cập nhật</li>
                  <li>Gửi tin tức và khuyến mãi (nếu bạn đồng ý)</li>
                </ul>
                
                <h3>Nghiên cứu và phân tích</h3>
                <ul>
                  <li>Phân tích hành vi người dùng để cải thiện dịch vụ</li>
                  <li>Nghiên cứu xu hướng du lịch và tìm kiếm địa điểm</li>
                  <li>Tạo các báo cáo thống kê ẩn danh</li>
                </ul>
                
                <h3>Bảo mật và tuân thủ</h3>
                <ul>
                  <li>Bảo vệ tài khoản người dùng</li>
                  <li>Ngăn chặn gian lận và lạm dụng</li>
                  <li>Tuân thủ nghĩa vụ pháp lý</li>
                </ul>
              </div>
            </section>
            
            {/* Information Sharing */}
            <section id="sharing" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Chia sẻ thông tin với bên thứ ba</h2>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p>
                  TravelSense có thể chia sẻ thông tin người dùng trong các trường hợp sau:
                </p>
                
                <h3>Đối tác cung cấp dịch vụ</h3>
                <p>
                  Chúng tôi làm việc với các đối tác cung cấp dịch vụ để hỗ trợ hoạt động của chúng tôi:
                </p>
                <ul>
                  <li>Nhà cung cấp dịch vụ lưu trữ đám mây</li>
                  <li>Đối tác thanh toán (chỉ khi bạn mua dịch vụ trả phí)</li>
                  <li>Đối tác cung cấp dữ liệu bản đồ và địa điểm</li>
                  <li>Dịch vụ phân tích và theo dõi lỗi</li>
                </ul>
                <p>
                  Các đối tác này đều phải tuân thủ các tiêu chuẩn bảo mật và chỉ được phép sử dụng thông tin cho mục đích cung cấp dịch vụ.
                </p>
                
                <h3>Khi có yêu cầu pháp lý</h3>
                <p>
                  Chúng tôi có thể chia sẻ thông tin khi:
                </p>
                <ul>
                  <li>Có yêu cầu từ cơ quan chức năng theo quy định pháp luật</li>
                  <li>Cần bảo vệ quyền lợi, tài sản hoặc an toàn của TravelSense, người dùng hoặc công chúng</li>
                  <li>Phát hiện, ngăn chặn hoặc điều tra các hoạt động gian lận, vi phạm điều khoản sử dụng hoặc hành vi bất hợp pháp</li>
                </ul>
                
                <h3>Khi được sự đồng ý của bạn</h3>
                <p>
                  Chúng tôi sẽ chỉ chia sẻ thông tin cá nhân với bên thứ ba khác khi có sự đồng ý rõ ràng từ bạn.
                </p>
                
                <h3>Thông tin ẩn danh hoặc tổng hợp</h3>
                <p>
                  Chúng tôi có thể chia sẻ dữ liệu ẩn danh hoặc đã được tổng hợp không thể nhận dạng cá nhân cho mục đích kinh doanh và nghiên cứu.
                </p>
              </div>
            </section>
            
            {/* Security */}
            <section id="security" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Lock className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Bảo mật thông tin</h2>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p>
                  TravelSense cam kết bảo vệ thông tin của bạn. Chúng tôi áp dụng các biện pháp bảo mật sau:
                </p>
                
                <h3>Bảo mật kỹ thuật</h3>
                <ul>
                  <li>Mã hóa dữ liệu truyền đi bằng giao thức SSL/TLS</li>
                  <li>Mã hóa mật khẩu và dữ liệu nhạy cảm</li>
                  <li>Hệ thống tường lửa và phát hiện xâm nhập</li>
                  <li>Kiểm tra bảo mật định kỳ</li>
                </ul>
                
                <h3>Kiểm soát truy cập</h3>
                <ul>
                  <li>Hạn chế quyền truy cập vào dữ liệu người dùng</li>
                  <li>Xác thực hai yếu tố cho nhân viên</li>
                  <li>Kiểm soát và ghi nhật ký truy cập</li>
                </ul>
                
                <h3>Quy trình và đào tạo</h3>
                <ul>
                  <li>Đào tạo nhân viên về bảo mật thông tin</li>
                  <li>Quy trình xử lý sự cố bảo mật</li>
                  <li>Đánh giá rủi ro bảo mật thường xuyên</li>
                </ul>
                
                <p>
                  Mặc dù chúng tôi nỗ lực bảo vệ thông tin của bạn, không có phương pháp truyền dữ liệu qua internet hoặc phương pháp lưu trữ điện tử nào là an toàn 100%. Vì vậy, chúng tôi không thể đảm bảo an ninh tuyệt đối.
                </p>
              </div>
            </section>
            
            {/* Data Retention */}
            <section id="retention" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Thời gian lưu trữ dữ liệu</h2>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p>
                  TravelSense sẽ lưu trữ thông tin của bạn trong các khoảng thời gian sau:
                </p>
                
                <h3>Thông tin tài khoản</h3>
                <p>
                  Chúng tôi lưu trữ thông tin tài khoản người dùng trong suốt thời gian tài khoản còn hoạt động. Sau khi bạn xóa tài khoản, chúng tôi có thể giữ lại một số thông tin cần thiết trong thời gian hợp lý để:
                </p>
                <ul>
                  <li>Tuân thủ nghĩa vụ pháp lý</li>
                  <li>Giải quyết tranh chấp</li>
                  <li>Ngăn chặn gian lận</li>
                  <li>Thực thi các điều khoản của chúng tôi</li>
                </ul>
                
                <h3>Dữ liệu vị trí và sử dụng</h3>
                <p>
                  Dữ liệu vị trí chi tiết sẽ được lưu trữ trong khoảng thời gian giới hạn (thường là 90 ngày) trước khi được tổng hợp hoặc ẩn danh hóa. Dữ liệu sử dụng được tổng hợp có thể được lưu trữ lâu hơn cho mục đích phân tích và cải thiện dịch vụ.
                </p>
                
                <h3>Lịch trình và đánh giá</h3>
                <p>
                  Lịch trình du lịch và đánh giá địa điểm của bạn sẽ được lưu trữ trong tài khoản cho đến khi bạn quyết định xóa chúng hoặc xóa tài khoản.
                </p>
                
                <h3>Thông tin liên lạc</h3>
                <p>
                  Lịch sử liên lạc với bộ phận hỗ trợ có thể được lưu trữ trong thời gian lên đến 2 năm để nâng cao chất lượng dịch vụ và đào tạo.
                </p>
              </div>
            </section>
            
            {/* Payment Security */}
            <section id="payments" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Bảo mật thanh toán</h2>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p>
                  Đối với các dịch vụ trả phí, TravelSense áp dụng các biện pháp bảo mật thanh toán sau:
                </p>
                
                <h3>Xử lý thanh toán</h3>
                <p>
                  Chúng tôi không lưu trữ thông tin thẻ tín dụng và sử dụng các cổng thanh toán được mã hóa an toàn từ các đối tác uy tín như PayPal, Stripe, và VNPay.
                </p>
                
                <h3>Tiêu chuẩn PCI DSS</h3>
                <p>
                  Tất cả các giao dịch thanh toán đều tuân thủ Tiêu chuẩn Bảo mật Dữ liệu của Ngành Thẻ Thanh toán (PCI DSS).
                </p>
                
                <h3>Biện pháp phòng chống gian lận</h3>
                <p>
                  Chúng tôi sử dụng các công cụ phát hiện gian lận để bảo vệ bạn và TravelSense khỏi các giao dịch trái phép.
                </p>
                
                <h3>Thông báo và xác nhận</h3>
                <p>
                  Bạn sẽ nhận được xác nhận chi tiết cho mọi giao dịch thanh toán thực hiện trên tài khoản của mình.
                </p>
              </div>
            </section>
            
            {/* User Rights */}
            <section id="rights" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <UserCheck className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Quyền của người dùng</h2>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p>
                  Bạn có các quyền sau đối với thông tin cá nhân của mình:
                </p>
                
                <h3>Quyền truy cập và cập nhật</h3>
                <p>
                  Bạn có thể truy cập và cập nhật thông tin cá nhân của mình bất kỳ lúc nào thông qua trang Tài khoản trên ứng dụng TravelSense.
                </p>
                
                <h3>Quyền xóa dữ liệu</h3>
                <p>
                  Bạn có thể yêu cầu xóa tài khoản và dữ liệu cá nhân của mình. Chúng tôi sẽ xóa thông tin của bạn trừ khi chúng tôi phải giữ lại một số thông tin nhất định vì lý do pháp lý.
                </p>
                
                <h3>Quyền giới hạn xử lý</h3>
                <p>
                  Bạn có thể yêu cầu hạn chế việc xử lý thông tin của mình trong một số trường hợp. Ví dụ, khi bạn cho rằng thông tin không chính xác hoặc việc xử lý không hợp pháp.
                </p>
                
                <h3>Quyền phản đối</h3>
                <p>
                  Bạn có quyền phản đối việc xử lý dữ liệu cá nhân của mình vì các mục đích tiếp thị trực tiếp hoặc vì lý do liên quan đến tình huống riêng của bạn.
                </p>
                
                <h3>Quyền di chuyển dữ liệu</h3>
                <p>
                  Bạn có thể yêu cầu nhận dữ liệu cá nhân của mình trong định dạng có cấu trúc, thường được sử dụng và có thể đọc được bằng máy.
                </p>
                
                <h3>Thực hiện quyền của bạn</h3>
                <p>
                  Để thực hiện bất kỳ quyền nào trong số này, vui lòng liên hệ với chúng tôi qua email: privacy@travelsense.com hoặc qua trang Liên hệ trên website của chúng tôi.
                </p>
              </div>
            </section>
            
            {/* Policy Updates */}
            <section id="updates" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Thay đổi chính sách bảo mật</h2>
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p>
                  TravelSense có thể cập nhật Chính sách Bảo mật này theo thời gian để phản ánh những thay đổi về các hoạt động của chúng tôi hoặc vì các lý do hoạt động, pháp lý hoặc quy định khác.
                </p>
                
                <h3>Thông báo thay đổi</h3>
                <p>
                  Khi có thay đổi quan trọng đối với Chính sách Bảo mật, chúng tôi sẽ thông báo cho bạn thông qua:
                </p>
                <ul>
                  <li>Thông báo qua ứng dụng</li>
                  <li>Email (nếu bạn đã cung cấp địa chỉ email)</li>
                  <li>Thông báo nổi bật trên trang web của chúng tôi</li>
                </ul>
                
                <h3>Phiên bản trước</h3>
                <p>
                  Bạn có thể yêu cầu xem các phiên bản trước của Chính sách Bảo mật bằng cách liên hệ với chúng tôi.
                </p>
                
                <h3>Tiếp tục sử dụng</h3>
                <p>
                  Việc bạn tiếp tục sử dụng dịch vụ của chúng tôi sau khi có thay đổi về Chính sách Bảo mật đồng nghĩa với việc bạn chấp nhận những thay đổi đó.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn có câu hỏi về chính sách bảo mật?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Vui lòng liên hệ với Nhóm Bảo mật Dữ liệu của chúng tôi nếu bạn có bất kỳ thắc mắc hoặc lo ngại nào về cách chúng tôi xử lý thông tin cá nhân của bạn.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/contact"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Liên hệ chúng tôi
              </Link>
              <Link
                href="/terms"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;