export interface User {
  id: number;
  name: string;
  nickname: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
