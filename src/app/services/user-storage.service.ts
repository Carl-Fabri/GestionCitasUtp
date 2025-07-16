import { Injectable } from '@angular/core';
import { LoginResponse } from '../core/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {
  constructor() { }

  saveUser(user: LoginResponse): void {
    localStorage.setItem('user-information', JSON.stringify(user));
  }

  removeOneValue(key: string): void {
    localStorage.removeItem(key);
  }

  getUser(): LoginResponse | null {
    const userJson = localStorage.getItem('user-information');
    if (userJson) {
      return JSON.parse(userJson) as LoginResponse;
    }
    return null;
  }

  getUserInfo(): any{
    return this.getUser()?.user|| null;
  }

  getToken(): string | null{
    return this.getUser()?.accessToken || null;
  }

  removeUser(): void {
    localStorage.removeItem('user-information');
  }

  getRole(): string | null {
    return this.getUser()?.user.role|| null;
  }

  saveOneValue(key: string, value: any): void {
    localStorage.setItem(key, value);
  }

  getOneValue(key: string): any {
    return localStorage.getItem(key);
  }
}
