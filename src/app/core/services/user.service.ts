import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { User } from '../../shared/modules/User';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface UsersPageResDto {
  results: User[];
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.baseUrl;
  public userSignal = signal<User | null>(null);
  public usersSignal = signal<User[]>([]);

  constructor(private http: HttpClient) {}

  getUser(): Observable<User> {
    return this.http
      .get<User>(this.apiUrl + 'user')
      .pipe(tap(response => this.userSignal.set(response)));
  }

  getUsers(page: number = 1, size: number = 10000): Observable<User[]> {
    return this.http
      .get<UsersPageResDto>(this.apiUrl + 'user/users', {
        params: { page, size },
      })
      .pipe(
        map(res => res.results),
        tap(res => this.usersSignal.set(res))
      );
  }

  removeUser(): void {
    this.userSignal.set(null);
  }
}
