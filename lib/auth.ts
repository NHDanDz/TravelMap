// lib/auth.ts - Temporary authentication solution

export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
}

// Temporary user cho development
// NOTE: Sau khi chạy create-test-user.js, update ID này
const TEMP_USER: User = {
  id: "1", // TODO: Update này sau khi tạo user trong DB
  username: "testuser",
  email: "test@example.com",
  fullName: "Test User"
};

export class AuthService {
  // Lấy current user (temporary)
  static getCurrentUser(): User {
    // TODO: Implement real authentication
    // Có thể lấy từ JWT token, session, etc.
    return TEMP_USER;
  }

  // Lấy user ID
  static getUserId(): string {
    return this.getCurrentUser().id;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    // TODO: Implement real authentication check
    return true;
  }

  // Tạo user mới (để test)
  static async createUser(userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }): Promise<User> {
    // TODO: Implement real user creation
    console.log('Creating user:', userData);
    return TEMP_USER;
  }
}