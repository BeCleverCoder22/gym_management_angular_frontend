import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization } from '../models/organization';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(private http: HttpClient) {}

  getCurrent(): Observable<Organization> {
    return this.http.get<Organization>(`${environment.apiBaseUrl}/organizations/me`);
  }
}