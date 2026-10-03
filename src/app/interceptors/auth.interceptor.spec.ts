import { HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  const router = { navigate: jasmine.createSpy('navigate') };
  const authService = { accessToken: 'access-token', clearSession: jasmine.createSpy('clearSession') };
  let zoneDepth = 0;
  const ngZone = {
    run: <T>(callback: () => T): T => {
      zoneDepth++;
      try {
        return callback();
      } finally {
        zoneDepth--;
      }
    }
  };
  const interceptor = new AuthInterceptor(
    router as unknown as Router,
    authService as AuthService,
    ngZone as unknown as NgZone
  );

  it('adds bearer authorization only to API requests', () => {
    let apiRequest: HttpRequest<unknown> | undefined;
    let externalRequest: HttpRequest<unknown> | undefined;
    let responseReceivedInZone = false;
    const apiNext: HttpHandler = { handle: request => { apiRequest = request; return of(new HttpResponse()); } };
    const externalNext: HttpHandler = { handle: request => { externalRequest = request; return of(new HttpResponse()); } };

    interceptor.intercept(new HttpRequest('GET', `${environment.apiBaseUrl}/customers`), apiNext).subscribe(() => {
      responseReceivedInZone = zoneDepth > 0;
    });
    interceptor.intercept(new HttpRequest('GET', 'https://example.com/resource'), externalNext).subscribe();

    expect(apiRequest?.headers.get('Authorization')).toBe('Bearer access-token');
    expect(externalRequest?.headers.has('Authorization')).toBeFalse();
    expect(responseReceivedInZone).toBeTrue();
  });

  it('clears session and redirects on API 401', () => {
    const next: HttpHandler = { handle: () => throwError(() => new HttpErrorResponse({ status: 401 })) };
    interceptor.intercept(new HttpRequest('GET', `${environment.apiBaseUrl}/customers`), next).subscribe({ error: () => undefined });
    expect(authService.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
