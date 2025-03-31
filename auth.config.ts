import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { users } from './app/lib/placeholder-data';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Kiểm tra thông tin đăng nhập từ placeholder-data
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const user = users.find(user => user.email === credentials.email);
        
        if (!user) {
          return null;
        }

        // Đơn giản hóa việc kiểm tra mật khẩu - không hash trong môi trường này
        const isPasswordValid = user.password === credentials.password;

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email
        };
      }
    })
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = request.nextUrl.pathname.startsWith('/login');
      
      if (isOnLoginPage) {
        return isLoggedIn ? Response.redirect(new URL('/', request.nextUrl)) : true;
      }
      
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;