export interface AdminUser {
  username: string;
  role: 'admin';
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}
