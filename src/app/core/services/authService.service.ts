import { computed, Injectable, signal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UserRoleEnum } from '../../shared/modules/RolesEnum';
import { User } from '../../shared/modules/User';
import { UserService } from './user.service';

interface registerReq {
  email: string;
  password: string;
  fullName: string;
  role: UserRoleEnum;
}

interface loginReq {
  email: string;
  password: string;
}

interface loginRes {
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.baseUrl;
  private storageTokenKey = 'authToken'
  public accessTokenSignal = signal<string | null>(this.getTokenFromStorage());
  public isLoggedIn = computed(() => !!this.accessTokenSignal());

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {}

  get token(): Signal<string | null> {
    return this.accessTokenSignal;
  }

  register(userData: registerReq): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}user/register`, userData);
  }

  login(credentials: loginReq): Observable<loginRes> {
    return this.http
      .post<loginRes>(`${this.apiUrl}auth/login`, credentials)
      .pipe(tap(response => this.setToken(response.access_token)));
  }

  logout(): void {
    this.setToken(null);
    localStorage.removeItem(this.storageTokenKey);
    this.userService.removeUser();
    this.router.navigate(['/login']);
  }

  private setToken(token: string | null): void {
    this.accessTokenSignal.set(token);
    if (token) {
      localStorage.setItem(this.storageTokenKey, token);
    } else {
      localStorage.removeItem(this.storageTokenKey);
    }
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem(this.storageTokenKey);
  }
}
