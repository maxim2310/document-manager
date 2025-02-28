import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      let errorMessage = 'An unknown error occurred';

      if (error.status === 0) {
        errorMessage = 'No Internet Connection';
      } else {
        errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }

      snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error'],
      });

      return throwError(() => error);
    })
  );
};
