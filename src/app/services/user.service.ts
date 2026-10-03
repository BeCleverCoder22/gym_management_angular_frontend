// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { PageQuery, PageResponse } from '../models/api';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiBaseUrl}/users`;
  constructor(private http: HttpClient) {}

  getUsers(query: PageQuery = {}): Observable<PageResponse<User>> {
    return this.http.get<PageResponse<User>>(this.apiUrl, {
      params: { page: query.page ?? 0, size: query.size ?? 20, sort: query.sort ?? 'createdAt,desc' }
    });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { enabled: false });
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateProfile(email: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, { email });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    });
  }
}