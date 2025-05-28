export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
}

export class AuthService {
  // Key để lưu user trong localStorage
  private static readonly USER_STORAGE_KEY = 'user';

  // Lấy current user từ localStorage
  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_STORAGE_KEY);
      if (!userData) {
        return null;
      }
      const user: User = JSON.parse(userData);
      // Kiểm tra định dạng user
      if (!user.id || !user.username || !user.email) {
        console.warn('Invalid user data in localStorage');
        this.logout(); // Xóa dữ liệu không hợp lệ
        return null;
      }
      return user;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      this.logout(); // Xóa dữ liệu nếu lỗi
      return null;
    }
  }

  // Lấy user ID
  static getUserId(): string {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    return user.id;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  // Lưu user vào localStorage sau khi đăng nhập
  static login(user: User): void {
    try {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }

  // Xóa user khỏi localStorage khi đăng xuất
  static logout(): void {
    localStorage.removeItem(this.USER_STORAGE_KEY);
  }

  // Tạo user mới (cho test hoặc đăng ký)
  static async createUser(userData: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }): Promise<User> {
    // TODO: Thay bằng API call thực tế tới backend
    console.log('Creating user:', userData);
    
    // Tạo user giả lập để test
    const newUser: User = {
      id: `user_${Date.now()}`, // Tạo ID tạm thời
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
    };

    // Lưu user mới vào localStorage (giả lập đăng nhập)
    this.login(newUser);
    return newUser;
  }
}