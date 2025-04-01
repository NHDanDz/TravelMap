import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { PgTable } from 'drizzle-orm/pg-core';

// Tạo cơ sở dữ liệu giả với một interface đơn giản hơn
// nhưng vẫn đủ để trả về giá trị thích hợp và tránh lỗi TypeScript
const createMockDb = () => {
  console.warn('⚠️ Đang sử dụng cơ sở dữ liệu giả. Thiết lập biến môi trường POSTGRES_URL để kết nối đến cơ sở dữ liệu thực.');
  
  // Tạo một đối tượng giả có các phương thức tương tự với cơ sở dữ liệu thật
  const mockDb = {
    
    // Đối tượng select() phải trả về một đối tượng có phương thức from()
    // mà từ đó có thể gọi where()
    select: (...args: any[]) => {
      const fromObj = {
        from: (table: any) => {
          // Trả về đối tượng có phương thức where() trả về mảng rỗng
          return {
            where: () => [],
            orderBy: () => []
          };
        }
      };
      return fromObj;
    },
    
    insert: (table: any) => ({
      values: (values: any) => ({})
    }),
    
    update: (table: any) => ({
      set: (values: any) => ({
        where: () => ({})
      })
    }),
    
    delete: (table: any) => ({
      where: () => ({})
    })
  };

  return mockDb;
};

// Khởi tạo db với một đối tượng cơ sở dữ liệu thật hoặc giả
let db: any;
 

try {
  if (!process.env.POSTGRES_URL) {
    db = createMockDb();
  } else {
    console.log('🔄 Đang kết nối đến PostgreSQL...');
    try {
      // Cấu hình tốt hơn cho postgres client
      const client = postgres(process.env.POSTGRES_URL, { 
        ssl: process.env.POSTGRES_URL.includes('localhost') ? false : 'require',
        idle_timeout: 20, // giảm timeout cho các kết nối không hoạt động
        max_lifetime: 60 * 30, // thời gian sống tối đa của connection (30 phút)
        connect_timeout: 10, // thời gian timeout khi kết nối (10 giây)
        max: 10, // số lượng kết nối tối đa trong pool
        connection: {
          application_name: 'landslide-app' // tên ứng dụng để dễ theo dõi
        }
      });
      
      db = drizzle(client, { schema });
      console.log('✅ Kết nối PostgreSQL thành công!');
    } catch (connectionError) {
      console.error('❌ Lỗi kết nối PostgreSQL:', connectionError);
      console.warn('⚠️ Chuyển sang sử dụng cơ sở dữ liệu giả.');
      db = createMockDb();
    }
  }
} catch (error) {
  console.error('Lỗi kết nối cơ sở dữ liệu:', error);
  db = createMockDb();
}

export { db };