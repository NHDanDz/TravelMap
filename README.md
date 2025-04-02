Hệ thống Phát hiện và Giám sát Sạt lở đất
Dự án này là một ứng dụng web toàn diện phục vụ việc phát hiện, giám sát và quản lý các khu vực sạt lở đất. Hệ thống kết hợp phân tích hình ảnh vệ tinh với quan sát mặt đất để cung cấp cảnh báo sớm và giám sát liên tục các khu vực có nguy cơ sạt lở.
🌟 Tính năng chính
Phát hiện sạt lở

Phân tích ảnh vệ tinh: Hệ thống sử dụng thuật toán tiên tiến để phân tích ảnh vệ tinh và xác định các khu vực có dấu hiệu sạt lở
Xác định tự động: Nhận diện các đặc điểm địa hình và sự thay đổi theo thời gian
Phân loại rủi ro: Tự động phân loại các điểm sạt lở theo mức độ nguy hiểm (cao, trung bình, thấp)

Giám sát liên tục

Tần suất tùy chỉnh: Thiết lập giám sát theo nhu cầu (hàng ngày, hàng tuần, hàng tháng)
Theo dõi thay đổi: Ghi nhận và cảnh báo các thay đổi về diện tích hoặc mức độ nguy hiểm
Thông báo tự động: Hệ thống tự động gửi cảnh báo khi phát hiện thay đổi bất thường

Bản đồ tương tác

Hai chế độ xem: Bản đồ thông thường và bản đồ vệ tinh
Điểm sạt lở trực quan: Hiển thị các điểm sạt lở với chỉ báo màu sắc theo mức độ rủi ro
Vùng phân tích 5km x 5km: Tạo vùng phân tích toàn diện khi chọn điểm kiểm tra
Thông tin chi tiết: Hiển thị đầy đủ thông tin khi nhấp vào các điểm sạt lở

Quy trình xác nhận

Xác minh phát hiện: Cho phép người dùng xác nhận các điểm sạt lở được phát hiện
Bổ sung thông tin: Thêm các thông tin chi tiết về địa điểm, mức độ ảnh hưởng
Lịch sử hoạt động: Ghi lại toàn bộ hoạt động từ phát hiện đến xử lý

Hệ thống cảnh báo

Đa phương thức: Hỗ trợ cảnh báo qua email, SMS
Phân cấp cảnh báo: Phân loại cảnh báo theo mức độ khẩn cấp
Cài đặt tùy chỉnh: Cho phép người dùng thiết lập ngưỡng cảnh báo và tần suất thông báo

🔧 Công nghệ sử dụng
Frontend

Next.js: Framework React hiện đại với hỗ trợ SSR và API routes
React: Thư viện xây dựng giao diện người dùng
Tailwind CSS: Framework CSS tiện lợi cho phát triển nhanh
Leaflet.js: Thư viện bản đồ tương tác mã nguồn mở
Headless UI: Components trung lập về giao diện và dễ tùy biến

Backend

Next.js API Routes: Xử lý các yêu cầu API từ frontend
PostgreSQL: Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ
Drizzle ORM: ORM hiệu suất cao cho PostgreSQL
Server Actions: Xử lý form và validation trên máy chủ

Bản đồ và Dữ liệu địa lý

Leaflet: Thư viện bản đồ tương tác mã nguồn mở
OpenStreetMap: Dữ liệu bản đồ mã nguồn mở
Esri Satellite: Dịch vụ ảnh vệ tinh chất lượng cao
Proj4js: Thư viện chuyển đổi hệ tọa độ địa lý

Xử lý dữ liệu

Google Earth Engine (GEE): Xử lý và phân tích ảnh vệ tinh
API Proxy: Trung gian kết nối với các dịch vụ bên ngoài
Cơ chế cache: Lưu trữ kết quả để tối ưu hiệu suất

📂 Cấu trúc dự án
Ứng dụng tuân theo cấu trúc Next.js hiện đại với các API route cho chức năng backend:
Thư mục chính

/app: Mã nguồn chính của ứng dụng

/api: API routes cho các thao tác dữ liệu
/components: Components UI có thể tái sử dụng
/dashboard: Các trang và tính năng bảng điều khiển
/lib: Các hàm tiện ích, kết nối cơ sở dữ liệu và định nghĩa kiểu


/public: Tài nguyên tĩnh và hình ảnh

API Routes

/api/landslide: Xử lý yêu cầu phát hiện sạt lở
/api/landslide-confirmation: Xác nhận và lưu trữ điểm sạt lở
/api/landslide-detail: Lấy thông tin chi tiết điểm sạt lở
/api/monitoring/check: Kiểm tra khu vực giám sát định kỳ

Các components chính

MapComponent: Hiển thị bản đồ tương tác
SatelliteMapComponent: Hiển thị bản đồ vệ tinh
LandslideConfirmationForm: Form xác nhận thông tin sạt lở
LandslideMarkerLayer: Hiển thị các điểm sạt lở trên bản đồ
MonitoringTable: Quản lý danh sách khu vực giám sát

🗃️ Cấu trúc cơ sở dữ liệu
Hệ thống sử dụng nhiều bảng liên kết với nhau:
Bảng landslides

id: Định danh điểm sạt lở
name: Tên địa điểm sạt lở
lat, lng: Tọa độ địa lý
status: Trạng thái (high_risk, active, stabilized, monitored, remediated)
affected_area: Diện tích ảnh hưởng
potential_impact: Tác động tiềm tàng
history: Lịch sử sự kiện dạng JSON
created_at, updated_at: Thời gian tạo và cập nhật

Bảng monitoring_areas

id: Định danh khu vực giám sát
name: Tên khu vực
north_bound, south_bound, east_bound, west_bound: Ranh giới tọa độ
monitor_frequency: Tần suất giám sát (daily, weekly, biweekly, monthly)
last_checked: Lần kiểm tra gần nhất
detected_points: Số điểm sạt lở được phát hiện
risk_level: Mức độ rủi ro (high, medium, low)
landslide_id: Liên kết đến điểm sạt lở (nếu có)

Bảng inspection_events

id: Định danh sự kiện kiểm tra
monitoring_area_id: Liên kết đến khu vực giám sát
method: Phương pháp kiểm tra (satellite, drone, ground, sensors, mixed)
status: Trạng thái kiểm tra (scheduled, in_progress, completed, cancelled)
findings: Phát hiện chi tiết
landslide_count: Số điểm sạt lở được phát hiện

Bảng landslide_observations

landslide_id: Liên kết đến điểm sạt lở
inspection_event_id: Liên kết đến sự kiện kiểm tra
movement_detected: Có phát hiện chuyển động hay không
movement_rate: Tốc độ chuyển động
risk_level: Đánh giá mức độ rủi ro
notes: Ghi chú chi tiết

Bảng sensors

id: Định danh cảm biến
type: Loại cảm biến (độ ẩm, chuyển động, rung chấn...)
location: Vị trí lắp đặt
last_reading: Dữ liệu đọc gần nhất
battery_level: Mức pin hiện tại

Bảng alerts

id: Định danh cảnh báo
type: Loại cảnh báo (danger, warning, info, success)
title: Tiêu đề cảnh báo
description: Mô tả chi tiết
landslide_id: Liên kết đến điểm sạt lở (nếu có)
read: Trạng thái đã đọc hay chưa

Bảng notification_settings

user_id: Định danh người dùng
email: Bật/tắt thông báo email
sms: Bật/tắt thông báo SMS
threshold: Ngưỡng cảnh báo (low, medium, high)
update_frequency: Tần suất cập nhật (immediate, daily, weekly)

🌐 Chức năng bản đồ
Giao diện bản đồ cung cấp:
Hiển thị

Hai chế độ xem: Bản đồ thông thường và bản đồ vệ tinh
Điểm sạt lở trực quan: Hiển thị các điểm và vòng tròn cảnh báo với màu sắc theo mức độ rủi ro
Chuyển đổi chế độ xem: Dễ dàng chuyển đổi giữa chế độ thông thường và chế độ phát hiện sạt lở

Tương tác

Chọn vị trí: Người dùng có thể nhấp vào bất kỳ vị trí nào để phân tích
Vùng phân tích: Hiển thị hình vuông 5km × 5km để phân tích khu vực
Tìm kiếm tọa độ: Nhập tọa độ để di chuyển đến vị trí cụ thể
Popup thông tin: Hiển thị thông tin chi tiết khi nhấp vào điểm sạt lở

Chức năng nâng cao

Chế độ toàn màn hình: Mở rộng bản đồ để xem chi tiết hơn
Xác nhận sạt lở: Quy trình xác nhận và thêm điểm sạt lở vào hệ thống
Chuyển đổi tọa độ: Hỗ trợ chuyển đổi giữa tọa độ địa lý và tọa độ UTM

🔄 Quy trình hoạt động
Phát hiện sạt lở

Người dùng chọn một vị trí trên bản đồ để phân tích
Hệ thống hiển thị hộp thoại xác nhận với tùy chọn thời gian
Sau khi xác nhận, tọa độ được gửi đến máy chủ xử lý
Hệ thống phân tích ảnh vệ tinh trong vùng 5km × 5km xung quanh điểm đã chọn
Kết quả phân tích được hiển thị trên bản đồ với các điểm sạt lở tiềm ẩn

Xác nhận và lưu trữ

Người dùng xem xét kết quả phát hiện và nhấp vào "Xác nhận sạt lở"
Form xác nhận hiển thị với các trường thông tin chi tiết
Người dùng nhập thông tin bổ sung và lựa chọn mức độ nguy hiểm
Hệ thống kiểm tra trùng lặp với các điểm sạt lở đã có
Dữ liệu được lưu vào cơ sở dữ liệu và tạo cảnh báo mới

Giám sát liên tục

Khu vực có điểm sạt lở được thêm vào danh sách giám sát
Hệ thống tự động kiểm tra theo tần suất đã thiết lập
Khi phát hiện thay đổi, hệ thống gửi thông báo và cập nhật trạng thái
Người dùng có thể xem chi tiết và lịch sử thay đổi của từng điểm sạt lở

Cảnh báo và thông báo

Khi phát hiện sạt lở mới hoặc thay đổi đáng kể, hệ thống tạo cảnh báo
Cảnh báo được phân loại theo mức độ nguy hiểm
Thông báo được gửi qua email hoặc SMS tùy theo cài đặt người dùng
Người dùng có thể xem và quản lý tất cả cảnh báo trong hệ thống

⚙️ Cấu hình và thiết lập
Hệ thống hỗ trợ nhiều biến môi trường để cấu hình:
Biến môi trường cơ bản

POSTGRES_URL: Chuỗi kết nối đến cơ sở dữ liệu PostgreSQL
NEXT_PUBLIC_COORDINATES_SERVER_URL: URL máy chủ xử lý tọa độ
NEXT_PUBLIC_API_KEY: Khóa API cho xác thực

Thiết lập dự án

Clone repository từ git
Cài đặt các gói phụ thuộc với npm install
Thiết lập biến môi trường trong file .env.local
Khởi tạo cơ sở dữ liệu với npm run db:setup
Chạy máy chủ phát triển với npm run dev

Khởi tạo và di chuyển dữ liệu

Script init-schema.js: Tạo schema cơ sở dữ liệu ban đầu
Script seed.js: Thêm dữ liệu mẫu vào cơ sở dữ liệu
Script update-schema.js: Cập nhật schema khi có thay đổi
Script fix-columns.js: Sửa các vấn đề về cột trong cơ sở dữ liệu

📊 Phân tích và báo cáo
Hệ thống cung cấp phân tích toàn diện về:
Thống kê sạt lở

Tần suất và phân bố: Phân tích số lượng và vị trí các điểm sạt lở
Thay đổi mức độ rủi ro: Theo dõi sự thay đổi mức độ nguy hiểm theo thời gian
Hiệu quả giám sát: Đánh giá hiệu quả của các biện pháp theo dõi

Báo cáo

Báo cáo hàng tháng: Tổng hợp tình hình sạt lở trong tháng
Báo cáo theo khu vực: Phân tích chi tiết cho từng khu vực giám sát
Báo cáo hiệu suất: Đánh giá hiệu suất của hệ thống cảnh báo sớm

🔍 Tính năng nâng cao
Tích hợp cảm biến

Hỗ trợ dữ liệu cảm biến mặt đất: Kết hợp dữ liệu từ cảm biến thực địa
Đồng bộ hóa dữ liệu: Tự động cập nhật thông tin từ các cảm biến được triển khai
Cảnh báo thời gian thực: Phát hiện và cảnh báo ngay khi có dữ liệu bất thường

Tích hợp thời tiết

Kết hợp dự báo thời tiết: Sử dụng dữ liệu thời tiết để đánh giá rủi ro
Cảnh báo mưa lớn: Tự động cảnh báo khi có dự báo mưa lớn tại khu vực sạt lở
Phân tích tương quan: Tìm mối liên hệ giữa lượng mưa và hoạt động sạt lở

Hỗ trợ đa ngôn ngữ

Giao diện tiếng Việt: Hệ thống được thiết kế với giao diện tiếng Việt mặc định
Hỗ trợ ngôn ngữ khác: Khả năng mở rộng để hỗ trợ nhiều ngôn ngữ

Responsive

Hoạt động đầy đủ trên thiết bị di động: Giao diện tự điều chỉnh theo kích thước màn hình
Chế độ xem tối ưu: Bố cục được tối ưu hóa cho cả máy tính và điện thoại

Khả năng ngoại tuyến

Chức năng cơ bản khi mất kết nối: Vẫn có thể xem dữ liệu đã tải trước
Đồng bộ hóa khi có kết nối: Tự động cập nhật dữ liệu khi kết nối được khôi phục

Hệ thống giám sát sạt lở này cung cấp một công cụ mạnh mẽ cho việc phòng ngừa và quản lý thiên tai, giúp các cơ quan và tổ chức bảo vệ cộng đồng trong các khu vực có nguy cơ sạt lở cao.
