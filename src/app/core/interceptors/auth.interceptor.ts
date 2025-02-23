import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/authService.service';
import { catchError } from 'rxjs';
import { NavigationService } from '../services/navService.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const navService = inject(NavigationService);

  const clonedReq = authService.accessTokenSignal()
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${authService.accessTokenSignal()}`,
        },
      })
    : req;

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error?.message === 'Unauthorized') {
        authService.logout();
      }
      throw error;
    })
  );
};
