// app/terms/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FileText, Info, AlertTriangle, Shield, User, 
  Globe, Scale, Mail, Clock, BookOpen 
} from 'lucide-react';

const TermsOfServicePage = () => {
  const lastUpdated = '15/03/2025';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-center mb-4">
            <FileText className="h-8 w-8 mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold">Điều khoản sử dụng</h1>
          </div>
          <p className="text-indigo-100 max-w-2xl">
            Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ TravelSense. 
            Bằng cách truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân theo các điều khoản này.
          </p>
          <p className="mt-4 text-indigo-200 text-sm">
            Cập nhật lần cuối: {lastUpdated}
          </p>
        </div>
      </div>
      
      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
              Mục lục
            </h2>
          </div>
          
          <div className="p-6">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'acceptance', title: 'Chấp nhận điều khoản', icon: <Info className="w-5 h-5 text-indigo-600" /> },
                { id: 'services', title: 'Dịch vụ của chúng tôi', icon: <Globe className="w-5 h-5 text-indigo-600" /> },
                { id: 'accounts', title: 'Tài khoản người dùng', icon: <User className="w-5 h-5 text-indigo-600" /> },
                { id: 'content', title: 'Nội dung người dùng', icon: <FileText className="w-5 h-5 text-indigo-600" /> },
                { id: 'intellectual', title: 'Quyền sở hữu trí tuệ', icon: <Scale className="w-5 h-5 text-indigo-600" /> },
                { id: 'privacy', title: 'Chính sách bảo mật', icon: <Shield className="w-5 h-5 text-indigo-600" /> },
                { id: 'prohibited', title: 'Hoạt động bị cấm', icon: <AlertTriangle className="w-5 h-5 text-indigo-600" /> },
                { id: 'termination', title: 'Chấm dứt sử dụng', icon: <Clock className="w-5 h-5 text-indigo-600" /> },
                { id: 'liability', title: 'Giới hạn trách nhiệm', icon: <Scale className="w-5 h-5 text-indigo-600" /> },
                { id: 'contact', title: 'Liên hệ', icon: <Mail className="w-5 h-5 text-indigo-600" /> }
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
            {/* Acceptance of Terms */}
            <section id="acceptance" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Info className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">1. Chấp nhận điều khoản</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <p>
                  Bằng việc truy cập hoặc sử dụng dịch vụ TravelSense ("Dịch vụ"), bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân theo các Điều khoản Sử dụng này ("Điều khoản") cũng như Chính sách Bảo mật của chúng tôi.
                </p>
                <p>
                  Nếu bạn không đồng ý với bất kỳ điều khoản nào, bạn không được phép truy cập hoặc sử dụng Dịch vụ của chúng tôi.
                </p>
                <p>
                  Chúng tôi có thể sửa đổi các Điều khoản này vào bất kỳ lúc nào. Bạn đồng ý rằng việc tiếp tục sử dụng Dịch vụ sau khi có thay đổi về Điều khoản đồng nghĩa với việc bạn chấp nhận những thay đổi đó.
                </p>
              </div>
            </section>
            
            {/* Our Services */}
            <section id="services" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">2. Dịch vụ của chúng tôi</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <p>
                  TravelSense cung cấp nền tảng để người dùng tìm kiếm, khám phá và đánh giá các địa điểm, tạo và quản lý lịch trình du lịch, và chia sẻ trải nghiệm với cộng đồng.
                </p>
                
                <h3>2.1. Thay đổi về Dịch vụ</h3>
                <p>
                  TravelSense có quyền thay đổi, tạm ngừng hoặc ngừng bất kỳ khía cạnh nào của Dịch vụ vào bất kỳ lúc nào, bao gồm tính khả dụng của các tính năng, cơ sở dữ liệu hoặc nội dung.
                </p>
                
                <h3>2.2. Độ chính xác của thông tin</h3>
                <p>
                  Mặc dù chúng tôi nỗ lực cung cấp thông tin chính xác, nhưng TravelSense không đảm bảo tính chính xác, đầy đủ hoặc hữu ích của bất kỳ thông tin nào trên nền tảng, bao gồm địa chỉ, giờ mở cửa, đánh giá, và các chi tiết khác về địa điểm.
                </p>
                
                <h3>2.3. Dịch vụ miễn phí và trả phí</h3>
                <p>
                  TravelSense cung cấp cả dịch vụ miễn phí và trả phí. Đối với các dịch vụ trả phí, bạn đồng ý thanh toán tất cả các khoản phí theo mức giá hiện hành cho dịch vụ bạn đã đăng ký. Chúng tôi có thể thay đổi mức giá sau khi thông báo trước.
                </p>
              </div>
            </section>
            
            {/* User Accounts */}
            <section id="accounts" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">3. Tài khoản người dùng</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <h3>3.1. Đăng ký tài khoản</h3>
                <p>
                  Để sử dụng một số tính năng của Dịch vụ, bạn cần tạo tài khoản. Bạn đồng ý cung cấp thông tin chính xác, đầy đủ và cập nhật trong quá trình đăng ký và cam kết cập nhật thông tin này khi cần thiết.
                </p>
                
                <h3>3.2. Bảo mật tài khoản</h3>
                <p>
                  Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình, và bạn đồng ý chịu trách nhiệm cho tất cả các hoạt động diễn ra dưới tài khoản của mình. Bạn phải thông báo cho TravelSense ngay lập tức về bất kỳ hành vi sử dụng trái phép tài khoản của bạn hoặc bất kỳ vi phạm bảo mật nào khác.
                </p>
                
                <h3>3.3. Yêu cầu về độ tuổi</h3>
                <p>
                  Bạn phải từ 13 tuổi trở lên để tạo tài khoản và sử dụng Dịch vụ. Nếu bạn dưới 18 tuổi, bạn phải có sự đồng ý của cha mẹ hoặc người giám hộ hợp pháp và họ phải đồng ý bị ràng buộc bởi các Điều khoản này.
                </p>
                
                <h3>3.4. Tạm ngưng và chấm dứt tài khoản</h3>
                <p>
                  TravelSense có quyền tạm ngưng hoặc chấm dứt tài khoản của bạn và quyền truy cập vào Dịch vụ vì bất kỳ lý do gì, bao gồm nhưng không giới hạn ở việc vi phạm các Điều khoản này.
                </p>
              </div>
            </section>
            
            {/* User Content */}
            <section id="content" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">4. Nội dung người dùng</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <h3>4.1. Nội dung bạn cung cấp</h3>
                <p>
                  "Nội dung người dùng" bao gồm bất kỳ thông tin, dữ liệu, văn bản, hình ảnh, đánh giá, bình luận, lịch trình, hoặc nội dung khác mà bạn đăng tải, tải lên, chia sẻ, lưu trữ hoặc cung cấp trên hoặc thông qua Dịch vụ.
                </p>
                
                <h3>4.2. Cấp phép cho nội dung của bạn</h3>
                <p>
                  Bằng cách đăng tải Nội dung người dùng, bạn cấp cho TravelSense một giấy phép toàn cầu, không độc quyền, miễn phí bản quyền, có thể chuyển nhượng và có thể cấp phép lại để sử dụng, sao chép, sửa đổi, tạo các tác phẩm phái sinh, phân phối, xuất bản và hiển thị công khai Nội dung người dùng đó liên quan đến việc vận hành và cung cấp Dịch vụ.
                </p>
                
                <h3>4.3. Trách nhiệm về nội dung</h3>
                <p>
                  Bạn chịu hoàn toàn trách nhiệm về Nội dung người dùng mà bạn đăng tải và hậu quả của việc đăng tải hoặc xuất bản nội dung đó. Bạn xác nhận rằng Nội dung người dùng của bạn không vi phạm quyền sở hữu trí tuệ, quyền riêng tư, hoặc bất kỳ quyền hợp pháp nào khác của bên thứ ba.
                </p>
                
                <h3>4.4. Nội dung bị cấm</h3>
                <p>
                  Bạn đồng ý không đăng tải Nội dung người dùng:
                </p>
                <ul>
                  <li>Bất hợp pháp, đe dọa, lạm dụng, quấy rối, phỉ báng, bôi nhọ, xúc phạm, khiêu dâm, tục tĩu, thô tục, xâm phạm quyền riêng tư của người khác</li>
                  <li>Xâm phạm bất kỳ bằng sáng chế, nhãn hiệu, bí mật thương mại, bản quyền hoặc quyền sở hữu khác</li>
                  <li>Vi phạm bất kỳ luật hoặc quy định hiện hành nào</li>
                  <li>Mạo danh bất kỳ người hoặc tổ chức nào, hoặc xuyên tạc mối quan hệ của bạn với một người hoặc tổ chức</li>
                  <li>Chứa virus, mã độc, hoặc bất kỳ mã, tệp hoặc chương trình nào được thiết kế để gián đoạn, phá hủy hoặc giới hạn chức năng của phần mềm, phần cứng hoặc thiết bị viễn thông</li>
                </ul>
                
                <h3>4.5. Giám sát nội dung</h3>
                <p>
                  TravelSense có quyền, nhưng không có nghĩa vụ, theo dõi hoặc xem xét Nội dung người dùng. TravelSense có quyền loại bỏ, sửa đổi hoặc chặn bất kỳ Nội dung người dùng nào vào bất kỳ lúc nào và vì bất kỳ lý do gì, bao gồm nội dung vi phạm các Điều khoản này hoặc có thể gây hại hoặc xúc phạm.
                </p>
              </div>
            </section>
            
            {/* Intellectual Property */}
            <section id="intellectual" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Scale className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">5. Quyền sở hữu trí tuệ</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <h3>5.1. Quyền của TravelSense</h3>
                <p>
                  Dịch vụ và tất cả nội dung, tính năng và chức năng của nó (bao gồm nhưng không giới hạn ở tất cả thông tin, phần mềm, văn bản, hiển thị, hình ảnh, video, âm thanh, thiết kế, lựa chọn, sắp xếp và giao diện người dùng), đều thuộc sở hữu của TravelSense, các bên cấp phép hoặc các nhà cung cấp nội dung khác và được bảo vệ bởi luật pháp Việt Nam và quốc tế về bản quyền, nhãn hiệu, bằng sáng chế, bí mật thương mại và quyền sở hữu trí tuệ hoặc độc quyền khác.
                </p>
                
                <h3>5.2. Giấy phép hạn chế</h3>
                <p>
                  TravelSense cấp cho bạn giấy phép hạn chế, có thể thu hồi, không độc quyền để truy cập và sử dụng Dịch vụ cho mục đích cá nhân, phi thương mại của bạn. Giấy phép này không bao gồm:
                </p>
                <ul>
                  <li>Bất kỳ việc bán hoặc sử dụng thương mại nào của Dịch vụ hoặc nội dung của nó</li>
                  <li>Bất kỳ việc sao chép, phân phối, biểu diễn công khai hoặc hiển thị công khai nào</li>
                  <li>Bất kỳ việc sử dụng bất kỳ phương pháp khai thác dữ liệu, robot hoặc các phương pháp thu thập và trích xuất dữ liệu tương tự</li>
                  <li>Bất kỳ việc sử dụng Dịch vụ hoặc nội dung của nó ngoại trừ khi được cho phép rõ ràng</li>
                </ul>
              </div>
            </section>
            
            {/* Privacy Policy */}
            <section id="privacy" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">6. Chính sách bảo mật</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <p>
                  Vui lòng tham khảo <Link href="/privacy" className="text-indigo-600 hover:text-indigo-800">Chính sách Bảo mật</Link> của chúng tôi để biết thông tin về cách chúng tôi thu thập, sử dụng và chia sẻ thông tin cá nhân của bạn. Bằng cách sử dụng Dịch vụ, bạn đồng ý với việc thu thập và sử dụng thông tin của mình như được mô tả trong Chính sách Bảo mật.
                </p>
              </div>
            </section>
            
            {/* Prohibited Activities */}
            <section id="prohibited" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">7. Hoạt động bị cấm</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <p>
                  Bạn đồng ý không:
                </p>
                <ul>
                  <li>Sử dụng Dịch vụ vì bất kỳ mục đích bất hợp pháp hoặc vi phạm bất kỳ luật hoặc quy định nào</li>
                  <li>Vi phạm hoặc khuyến khích bất kỳ bên thứ ba nào vi phạm quyền của TravelSense hoặc của người khác</li>
                  <li>Tham gia vào bất kỳ hành vi nào có thể vô hiệu hóa, quá tải, làm suy yếu hoặc làm tổn hại đến Dịch vụ hoặc máy chủ hoặc mạng kết nối đến Dịch vụ</li>
                  <li>Sử dụng robot, spider, scraper hoặc các phương tiện tự động khác để truy cập Dịch vụ</li>
                  <li>Thu thập hoặc lưu trữ dữ liệu cá nhân về bất kỳ người dùng nào khác</li>
                  <li>Giả mạo header hoặc thao túng định danh để che giấu nguồn gốc của bất kỳ nội dung nào được truyền qua Dịch vụ</li>
                  <li>Cố gắng giải mã, dịch ngược, tháo rời hoặc đảo ngược bất kỳ phần nào của Dịch vụ</li>
                  <li>Tải lên, đăng, gửi email, truyền hoặc cung cấp bất kỳ nội dung nào bị cấm</li>
                </ul>
              </div>
            </section>
            
            {/* Termination */}
            <section id="termination" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">8. Chấm dứt sử dụng</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <p>
                  TravelSense có thể, theo quyết định riêng của mình, chấm dứt hoặc tạm ngừng quyền truy cập của bạn vào tất cả hoặc một phần của Dịch vụ, ngay lập tức, có hoặc không thông báo, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn nếu TravelSense tin rằng bạn đã vi phạm bất kỳ điều khoản nào của Thỏa thuận này.
                </p>
                
                <p>
                  Việc chấm dứt quyền truy cập của bạn sẽ không khiến TravelSense phải chịu trách nhiệm pháp lý đối với bạn hoặc bất kỳ bên thứ ba nào. TravelSense sẽ không có nghĩa vụ hoàn lại bất kỳ khoản tiền nào đối với dịch vụ đã thanh toán trong trường hợp chấm dứt do vi phạm các Điều khoản này.
                </p>
                
                <p>
                  Tất cả các điều khoản của Thỏa thuận này sẽ tiếp tục có hiệu lực sau khi chấm dứt, bao gồm, nhưng không giới hạn, các tuyên bố bảo hành và giới hạn trách nhiệm.
                </p>
              </div>
            </section>
            
            {/* Limitation of Liability */}
            <section id="liability" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Scale className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">9. Giới hạn trách nhiệm</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <p>
                  TRONG MỨC ĐỘ TỐI ĐA ĐƯỢC PHÁP LUẬT CHO PHÉP, TRAVELSENSE VÀ CÁC GIÁM ĐỐC, NHÂN VIÊN, ĐỐI TÁC, ĐẠI LÝ VÀ NHÀ CUNG CẤP CỦA TRAVELSENSE SẼ KHÔNG CHỊU TRÁCH NHIỆM ĐỐI VỚI BẤT KỲ THIỆT HẠI TRỰC TIẾP, GIÁN TIẾP, NGẪU NHIÊN, ĐẶC BIỆT, HÌNH PHẠT HOẶC TẤT YẾU, BAO GỒM NHƯNG KHÔNG GIỚI HẠN, THIỆT HẠI VỀ LỢI NHUẬN, DỮ LIỆU, VIỆC SỬ DỤNG, UY TÍN HOẶC BẤT KỲ THIỆT HẠI VÔ HÌNH NÀO KHÁC, PHÁT SINH TỪ VIỆC:
                </p>
                <ul>
                  <li>SỬ DỤNG HOẶC KHÔNG THỂ SỬ DỤNG DỊCH VỤ;</li>
                  <li>BẤT KỲ THAY ĐỔI NÀO ĐỐI VỚI DỊCH VỤ;</li>
                  <li>TRUY CẬP TRÁI PHÉP HOẶC THAY ĐỔI THÔNG TIN TRUYỀN TẢI HOẶC DỮ LIỆU CỦA BẠN;</li>
                  <li>XÓA, HỎNG HOẶC KHÔNG LƯU TRỮ BẤT KỲ NỘI DUNG HOẶC THÔNG TIN LIÊN LẠC NÀO ĐƯỢC DUY TRÌ HOẶC TRUYỀN TẢI BẰNG HOẶC THÔNG QUA DỊCH VỤ;</li>
                  <li>TUYÊN BỐ HOẶC HÀNH VI CỦA BẤT KỲ BÊN THỨ BA NÀO TRÊN DỊCH VỤ;</li>
                  <li>BẤT KỲ VẤN ĐỀ NÀO KHÁC LIÊN QUAN ĐẾN DỊCH VỤ.</li>
                </ul>
                
                <p>
                  TẠI MỘT SỐ QUỐC GIA, CÁC GIỚI HẠN TRÁCH NHIỆM PHÁP LÝ KHÔNG ĐƯỢC PHÉP LOẠI TRỪ TRÁCH NHIỆM PHÁP LÝ CHO MỘT SỐ LOẠI THIỆT HẠI. NẾU LUẬT PHÁP CỦA QUỐC GIA BẠN ÁP DỤNG CHO THỎA THUẬN NÀY, MỘT SỐ HOẶC TẤT CẢ CÁC GIỚI HẠN TRÁCH NHIỆM PHÁP LÝ NÊU TRÊN CÓ THỂ KHÔNG ÁP DỤNG CHO BẠN.
                </p>
              </div>
            </section>
            
            {/* Contact */}
            <section id="contact" className="scroll-mt-16">
              <div className="flex items-center mb-4">
                <Mail className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">10. Liên hệ</h2>
              </div>
              
              <div className="prose prose-indigo max-w-none">
                <p>
                  Nếu bạn có bất kỳ câu hỏi hoặc quan ngại nào về các Điều khoản Sử dụng này, vui lòng liên hệ với chúng tôi qua:
                </p>
                <ul>
                  <li>Email: terms@travelsense.com</li>
                  <li>Trang web: <Link href="/contact" className="text-indigo-600 hover:text-indigo-800">Liên hệ TravelSense</Link></li>
                  <li>Địa chỉ: Tòa nhà Innovation, 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh, Việt Nam</li>
                </ul>
                <p>
                  Chúng tôi sẽ cố gắng phản hồi trong thời gian sớm nhất.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      {/* Acceptance Section */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đồng ý với điều khoản sử dụng</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Bằng cách tiếp tục sử dụng TravelSense, bạn xác nhận rằng bạn đã đọc và đồng ý với các Điều khoản Sử dụng này. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/dashboard/Map"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Bắt đầu khám phá
              </Link>
              <Link
                href="/privacy"
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;