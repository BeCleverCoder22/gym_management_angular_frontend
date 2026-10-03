import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, switchMap, tap, throwError } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth';
import { User } from '../models/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly apiUrl = environment.apiBaseUrl;
  private token: string | null = null;

  constructor(private http: HttpClient) {}

  get accessToken(): string | null {
    return this.token;
  }

  get currentUserSubjectValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.token = response.token;
        }),
        switchMap(response => this.http.get<User>(`${this.apiUrl}/users/me`).pipe(
          tap(user => this.currentUserSubject.next(user)),
          map(() => response)
        )),
        catchError(error => {
          this.clearSession();
          return throwError(() => error);
        })
      );
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/register`, request);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  clearSession(): void {
    this.token = null;
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}
