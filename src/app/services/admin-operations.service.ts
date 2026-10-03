import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditRecord, NotificationOutboxItem } from '../models/admin';
import { PageResponse } from '../models/api';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminOperationsService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getAudit(page = 0, size = 20): Observable<PageResponse<AuditRecord>> {
    return this.http.get<PageResponse<AuditRecord>>(`${this.apiUrl}/audit`, {
      params: { page, size, sort: 'occurredAt,desc' }
    });
  }

  getOutbox(page = 0, size = 20): Observable<PageResponse<NotificationOutboxItem>> {
    return this.http.get<PageResponse<NotificationOutboxItem>>(`${this.apiUrl}/notifications/outbox`, {
      params: { page, size, sort: 'id,desc' }
    });
  }

  retryNotification(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/notifications/outbox/${id}/retry`, {});
  }
}