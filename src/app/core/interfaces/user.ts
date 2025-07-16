
export interface User {
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse extends ApiResponse {
  data: LoginResponse;
}

export interface LoginResponse extends DataAuth{
  user: User;
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
  accessToken: string;
}

export interface ApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
}
