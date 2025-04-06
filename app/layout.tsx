// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/app/ui/global.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Travel Map App',
  description: 'Discover places around you',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Base meta tags only - no scripts or CSS here */}
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}