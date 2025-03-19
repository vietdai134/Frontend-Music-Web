import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { LoginService } from '../services/LoginServices/login.service';

// Định nghĩa interceptor như một hàm
export const authInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const loginService = inject(LoginService); // Inject LoginService trong hàm

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
    if ((err.status === 401 || err.status === 403) && loginService.isLoggedIn()) {
        // Chỉ refresh nếu đã đăng nhập
        return loginService.refreshToken().pipe(
          switchMap(() => next(req)),
          catchError(refreshErr => {
            loginService.handleLogout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};