import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, interval, Observable, switchMap, tap } from 'rxjs';
import { User } from '../../models/user.module';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private baseUrl = environment.baseUrl;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  // private refreshInterval = 50 * 1000;
  private refreshInterval = 15 * 60 * 1000; // 15 minutes
  private refreshSubscription: any;

  constructor(private http: HttpClient) {
  }

  // Phương thức khởi tạo thủ công, gọi từ component
  initialize() {
    this.restoreSession();
  }

  private restoreSession() {
    console.log('Attempting to restore session');
    // Nếu chưa từng đăng nhập (userSubject chưa có giá trị trước đó), không làm gì
    // if (!this.userSubject.value) {
    //   console.log('No previous login detected, skipping session restore');
    //   return;
    // }
    this.refreshToken().subscribe({
      next: (res) => {
        console.log('Refresh token successful, response:', res);
        this.getUserInfo().subscribe({
          next: (user) => {
            console.log('Session restored, user info:', user);
            this.startTokenRefresh();
          },
          error: (err) => {
            console.error('Failed to fetch user info after refresh:', err);
            // this.userSubject.next(null);
            this.handleExpiredSession();
          }
        });
      },
      error: (err) => {
        console.error('Refresh token failed:', err);
        // this.userSubject.next(null);
        this.handleExpiredSession();
      }
    });
  }

  userLogin(email: string, password: string) {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password }, { withCredentials: true }).pipe(
      tap(() => {
        console.log('Login successful, fetching user info');
        this.getUserInfo().subscribe({
          next: (user) => {
            console.log('User info fetched:', user);
            this.startTokenRefresh();
          },
          error: (err) => console.error('Failed to fetch user info:', err)
        });
      })
    );
  }

  getUserInfo() {
    console.log('Fetching user info');
    return this.http.get<User>(`${this.baseUrl}/user/me`, { withCredentials: true }).pipe(
      tap(user => {
        console.log('Updating userSubject with:', user);
        this.userSubject.next(user);
      }),
      catchError(err => {
        console.error('Get user info failed:', err);
        this.userSubject.next(null);
        throw err;
      })
    );
  }

  logout() {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        console.log('Logout successful');
        this.userSubject.next(null);
        this.stopTokenRefresh();
      })
    );
  }

  refreshToken(): Observable<any> {
    console.log('Sending refresh token request');
    return this.http.post(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true });
  }

  private startTokenRefresh() {
    this.stopTokenRefresh();
    console.log('startTokenRefresh called, user:', this.userSubject.value);
    if (this.userSubject.value) {
      this.refreshSubscription = interval(this.refreshInterval)
        .pipe(
          switchMap(() => {
            console.log('Interval triggered, calling refreshToken');
            return this.refreshToken();
          }),
          catchError(err => {
            console.error('Refresh token failed:', err);
            this.handleLogout();
            throw err;
          })
        )
        .subscribe({
          next: () => console.log('Token refreshed successfully'),
          error: (err) => console.error('Subscription error:', err)
        });
    } else {
      console.log('No user logged in, skipping token refresh');
    }
  }

  private stopTokenRefresh() {
    if (this.refreshSubscription) {
      console.log('Stopping token refresh');
      this.refreshSubscription.unsubscribe();
    }
  }

  public handleLogout() {
    this.logout().subscribe({
      next: () => {
        console.log('Handle logout: redirecting to /login');
        window.location.href = '/login';
      },
      error: () => {
        console.log('Handle logout error: redirecting to /login');
        window.location.href = '/login';
      }
    });
  }

  public isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  private handleExpiredSession() {
    if (this.userSubject.value) {
      // Nếu đã đăng nhập trước đó, thông báo và chuyển hướng
      console.log('Session expired for logged-in user, redirecting to login');
      alert('Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.');
      this.userSubject.next(null);
      window.location.href = '/login';
    } else {
      // Nếu chưa đăng nhập, không làm gì
      console.log('No active session, no redirect needed');
      this.userSubject.next(null);
    }
  }
}

