import { PrismaClient } from '@prisma/client';

// Tạo một biến global cho PrismaClient để tránh tạo nhiều kết nối
// trong môi trường development khi hot-reloading
const globalForPrisma = global as { prisma?: PrismaClient };

// Khởi tạo PrismaClient
export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Trong môi trường phát triển, lưu lại prisma trong global
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;