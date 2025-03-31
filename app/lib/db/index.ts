import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Kiểm tra xem database URL có tồn tại không
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined');
}

// Tạo kết nối PostgreSQL
const client = postgres(process.env.POSTGRES_URL, { ssl: 'require' });

// Khởi tạo Drizzle với schema đã định nghĩa
export const db = drizzle(client, { schema });