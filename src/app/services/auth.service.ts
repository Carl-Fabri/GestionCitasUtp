import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AuthResponse, RegisterRequest, RegisterResponse } from '../core/interfaces/user';
import { Observable, of, tap } from 'rxjs';
import { UserStorageService } from './user-storage.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _jwtHelper = inject(JwtHelperService);
  _apiUrl: string = environment.apiUrl;
  private _storage = inject(UserStorageService);
  constructor(private http: HttpClient) { }

  login(data:any): Observable<AuthResponse>{
    //Fabri-pruebas

    return of({} as AuthResponse);
    // return this.http.post<AuthResponse>(`${this._apiUrl}auth/login`, data)
    // .pipe(
    //   tap((Response) => {
    //     if(Response.success){
    //       this._storage.saveUser(Response.data);
    //     }
    //   })
    // );
  }

  isAuthenticated(): boolean {
    const token = this._storage.getToken();
    if (!this._jwtHelper.isTokenExpired(this._storage.getToken())) {
      return true;
    }
    return false;
  }

  register(data:RegisterRequest): Observable<RegisterResponse>{
    //Fabri-pruebas

    return of({} as RegisterResponse);
    // return this.http.post<any>(`${this._apiUrl}auth/register`, data)
    // .pipe(
    //   tap((Response) => {
    //     if(Response.success){
    //       this._storage.saveUser(Response.data);
    //     }
    //   })
    // );
  }

  // publicAlbum(id:number): Observable<AlbumResponse> {
  //   return this.http.patch<AlbumResponse>(`${this._apiUrl}auth/login${id}`, null);
  // }
}
