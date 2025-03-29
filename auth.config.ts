import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      // Đây là provider đơn giản nhất để bắt đầu
      // Bạn có thể thay thế bằng các provider khác như Google, GitHub, v.v.
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Hàm này xác thực người dùng dựa trên thông tin đăng nhập
        // Bạn cần viết logic xác thực của riêng mình ở đây
        // Ví dụ:
        if (credentials && credentials.email === "user@example.com" && credentials.password === "password") {
          return {
            id: "1",
            name: "Test User",
            email: "user@example.com"
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    authorized({ auth, request }) {
      // Tùy chỉnh logic cho xác thực nếu cần
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = request.nextUrl.pathname.startsWith('/login');
      if (isOnLoginPage) {
        if (isLoggedIn) return Response.redirect(new URL('/', request.nextUrl));
        return true;
      }
      
      if (!isLoggedIn) {
        return false; // Chuyển hướng đến trang đăng nhập
      }
      
      return true;
    },
  },
} satisfies NextAuthConfig;