import { Injectable, signal, Signal } from '@angular/core';
import { Router } from '@angular/router';

export enum RouteEnum {
  Login = '/login',
  Register = '/register',
  DocManager = '/manager'
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor(private router: Router) {}

  toLogin() {
    this.router.navigate([RouteEnum.Login]);
  }
  toRegister() {
    this.router.navigate([RouteEnum.Register]);
  }
  toManager() {
    this.router.navigate([RouteEnum.DocManager]);
  }
}
