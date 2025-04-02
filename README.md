# Hệ thống Phát hiện và Giám sát Sạt lở đất

Dự án này là một ứng dụng web toàn diện phục vụ việc phát hiện, giám sát và quản lý các khu vực sạt lở đất. Hệ thống kết hợp phân tích hình ảnh vệ tinh với quan sát mặt đất để cung cấp cảnh báo sớm và giám sát liên tục các khu vực có nguy cơ sạt lở.

## Tính năng chính

### Phát hiện sạt lở
- Phân tích ảnh vệ tinh để xác định các khu vực có dấu hiệu sạt lở
- Nhận diện các đặc điểm địa hình và sự thay đổi theo thời gian
- Phân loại các điểm sạt lở theo mức độ nguy hiểm (cao, trung bình, thấp)

### Giám sát liên tục
- Thiết lập giám sát theo nhu cầu (hàng ngày, hàng tuần, hàng tháng)
- Ghi nhận và cảnh báo các thay đổi về diện tích hoặc mức độ nguy hiểm
- Hệ thống tự động gửi cảnh báo khi phát hiện thay đổi bất thường

### Quy trình xác nhận
- Xác minh các điểm sạt lở được phát hiện
- Bổ sung thông tin chi tiết về địa điểm, mức độ ảnh hưởng
- Lưu trữ lịch sử hoạt động từ phát hiện đến xử lý

### Hệ thống cảnh báo
- Hỗ trợ cảnh báo qua email, SMS
- Phân loại cảnh báo theo mức độ khẩn cấp
- Cài đặt tùy chỉnh ngưỡng cảnh báo và tần suất thông báo

## Công nghệ sử dụng
- **Frontend**: Next.js, React, Tailwind CSS, Leaflet.js
- **Backend**: Next.js API Routes, PostgreSQL, Drizzle ORM
- **Bản đồ**: Leaflet, OpenStreetMap, Esri Satellite
- **Xử lý dữ liệu**: Google Earth Engine (GEE), API Proxy

## Cài đặt và thiết lập

### Yêu cầu hệ thống
- Node.js 16.x trở lên
- PostgreSQL 13.x trở lên
- Git

### Biến môi trường
Tạo file `.env.local` tại thư mục gốc với nội dung:
POSTGRES_URL=postgres://username:password@localhost:5432/landslide_db
NEXT_PUBLIC_COORDINATES_SERVER_URL=https://your-processing-server-url.com/api/landslide
NEXT_PUBLIC_API_KEY=your_api_key

text

Collapse

Wrap

Copy

### Các bước cài đặt
1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/landslide-monitoring.git
   cd landslide-monitoring
Cài đặt dependencies
bash

Collapse

Wrap

Copy
npm install
Khởi tạo cơ sở dữ liệu
bash

Collapse

Wrap

Copy
# Tạo database PostgreSQL
psql -c "CREATE DATABASE landslide_db"

# Thiết lập schema
node app/scripts/init-schema.js

# Thêm dữ liệu mẫu (tùy chọn)
node app/scripts/seed.js
Khởi động ứng dụng
bash

Collapse

Wrap

Copy
# Chế độ phát triển
npm run dev

# Hoặc build và chạy phiên bản production
npm run build
npm start
Ứng dụng sẽ chạy tại http://localhost:3000
Quy trình hoạt động
Phát hiện sạt lở
Chọn vị trí trên bản đồ để phân tích
Xác nhận và chọn mốc thời gian phân tích
Hệ thống phân tích ảnh vệ tinh và hiển thị kết quả
Xác nhận và lưu trữ
Xem xét kết quả phát hiện và nhấp vào "Xác nhận sạt lở"
Điền thông tin chi tiết và chọn mức độ nguy hiểm
Dữ liệu được lưu vào cơ sở dữ liệu
Giám sát liên tục
Thêm khu vực vào danh sách giám sát
Hệ thống tự động kiểm tra theo tần suất đã thiết lập
Khi phát hiện thay đổi, hệ thống gửi thông báo
Khắc phục sự cố
Không thể kết nối đến cơ sở dữ liệu
Kiểm tra thông tin kết nối trong file .env.local
Đảm bảo PostgreSQL đang chạy
Chạy script app/scripts/test-connection.js để kiểm tra kết nối
Lỗi cột không tồn tại
Chạy script app/scripts/fix-columns.js để sửa lỗi cột trong cơ sở dữ liệu
Nếu vẫn không khắc phục được, chạy lại app/scripts/init-schema.js
Không nhận dữ liệu từ máy chủ phân tích
Kiểm tra NEXT_PUBLIC_COORDINATES_SERVER_URL và NEXT_PUBLIC_API_KEY
Đảm bảo máy chủ phân tích đang hoạt động
Kiểm tra logs trong console trình duyệt
Đóng góp và phát triển
Để đóng góp vào dự án:

Fork repository
Tạo nhánh mới (git checkout -b feature/your-feature)
Commit thay đổi (git commit -m 'Add some feature')
Push lên nhánh của bạn (git push origin feature/your-feature)
Tạo Pull Request
Liên hệ
Nếu có bất kỳ câu hỏi hoặc góp ý, vui lòng liên hệ:

Email: support@landslide-monitoring.com
Issue Tracker: https://github.com/nhdandnz/landslide-monitoring/issues
Hệ thống giám sát sạt lở này cung cấp một công cụ mạnh mẽ cho việc phòng ngừa và quản lý thiên tai, giúp các cơ quan và tổ chức bảo vệ cộng đồng trong các khu vực có nguy cơ sạt lở cao.
