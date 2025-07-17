import { Injectable } from '@angular/core';
import { LoginResponse } from '../core/interfaces/user';
import { Console } from 'console';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {
  private readonly USER_KEY = 'user-information';
  private readonly REFRESH_TOKEN_KEY = 'refresh-token';
  private readonly TOKEN_KEY = 'access-token';

  constructor() { }

  saveUser(loginResponse: LoginResponse): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(loginResponse.user));
    sessionStorage.setItem(this.TOKEN_KEY, loginResponse.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.refreshToken);
  }

  removeOneValue(key: string): void {
    localStorage.removeItem(key);
  }

  getUser(): any | null {
    const userJson = sessionStorage.getItem(this.USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  }

  getUserInfo(): any {
    return this.getUser() || null;
  }

  getToken(): string | null {
    try {
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }

  }

  removeUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing user data:', error);
    }

  }

  getRole(): string | null {
    const user = this.getUser();
    return user?.role || null;
  }

  saveOneValue(key: string, value: any): void {
    localStorage.setItem(key, value);
  }

  getOneValue(key: string): any {
    return localStorage.getItem(key);
  }

  // Método para actualizar solo el token de acceso (útil para refresh token flow)
  updateAccessToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }

  // Método para limpiar solo los tokens (mantener otros datos si es necesario)
  clearTokens(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  // Método para verificar si tenemos algún token disponible
  hasAnyToken(): boolean {
    return this.getToken() !== null || this.getRefreshToken() !== null;
  }

  // Método para verificar si tenemos refresh token válido
  hasValidRefreshToken(): boolean {
    const refreshToken = this.getRefreshToken();
    return refreshToken !== null && refreshToken.length > 0;
  }

  // Método para actualizar solo la información del usuario (sin tocar tokens)
  updateUserInfo(userInfo: any): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
      console.log('Información del usuario actualizada');
    } catch (error) {
      console.error('Error al actualizar información del usuario:', error);
    }
  }

  // Método para obtener información específica del usuario
  getUserId(): number | null {
    const user = this.getUser();
    return user?.id || null;
  }

  getUserEmail(): string | null {
    const user = this.getUser();
    return user?.email || null;
  }

  getUserName(): string | null {
    const user = this.getUser();
    return user?.name || null;
  }

  getRoleId(): number | null {
    const user = this.getUser();
    return user?.role_id || null;
  }
}
