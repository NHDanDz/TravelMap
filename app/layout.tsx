// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TravelSense - Khám phá địa điểm tuyệt vời',
  description: 'Nền tảng du lịch thông minh giúp bạn khám phá những địa điểm tuyệt vời xung quanh bạn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        {/* Base meta tags only - no scripts or CSS here */}
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}