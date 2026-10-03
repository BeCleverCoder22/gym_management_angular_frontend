import { Injectable, NgZone } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.accessToken;
    const isApiRequest = request.url.startsWith(environment.apiBaseUrl);

    if (token && isApiRequest) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    const response$ = new Observable<HttpEvent<any>>(observer => {
      const subscription = next.handle(request).subscribe({
        next: event => this.ngZone.run(() => observer.next(event)),
        error: error => this.ngZone.run(() => observer.error(error)),
        complete: () => this.ngZone.run(() => observer.complete())
      });
      return () => subscription.unsubscribe();
    });

    return response$.pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && isApiRequest) {
          this.authService.clearSession();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}