import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { User } from '../../shared/modules/User';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.baseUrl;
  public userSignal = signal<User | null>(null);

  constructor(private http: HttpClient) {}

  getUser(): Observable<User> {
    return this.http
      .get<User>(this.apiUrl + 'user')
      .pipe(tap(response => this.userSignal.set(response)));
  }

  removeUser(): void {
    this.userSignal.set(null);
  }
}
