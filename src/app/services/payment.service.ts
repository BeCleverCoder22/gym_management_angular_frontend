import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse } from '../models/api';
import { CreatePaymentRequest, Payment } from '../models/payment';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly apiUrl = `${environment.apiBaseUrl}/payments`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 20): Observable<PageResponse<Payment>> {
    return this.http.get<PageResponse<Payment>>(this.apiUrl, {
      params: { page, size, sort: 'createdAt,desc' }
    });
  }

  create(request: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, request);
  }

  confirmCash(id: number): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/cash-confirmation`, {});
  }

  refund(id: number, amount: number, reason: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${id}/refunds`, { amount, reason });
  }
}