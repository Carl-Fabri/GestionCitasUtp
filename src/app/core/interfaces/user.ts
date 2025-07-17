import { UserStorageService } from '../../services/user-storage.service';

export interface User {
  id: number;
  name: string;
  email: string;
  dni: string;
  role_id?: number;
  role: string;
}

export interface AuthMeResponse extends ApiResponse {
  data: User;
}

export interface UserAuthMeResponse {
  message: string;
  data: User;
}

export interface AuthResponse extends ApiResponse {
  data: LoginResponse;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse extends ApiResponse {
  data: {
    token: string;
  };
}

export interface RegisterResponse extends ApiResponse {
  data: LoginResponse
}

export interface RegisterRequest {
  dni: string;
  name: string;
  surname: string;
  birth_date: string;
  phone: string;
  email: string;
  password: string;
}

export interface DataAuth
{
  tokenType: string;
  token: string;
}

export interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
}
