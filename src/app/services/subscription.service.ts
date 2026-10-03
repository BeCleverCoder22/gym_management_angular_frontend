import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subscription } from '../models/subscription';
import { PageQuery, PageResponse } from '../models/api';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private readonly apiUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getAll(query: PageQuery = {}): Observable<PageResponse<Subscription>> {
    return this.http.get<PageResponse<Subscription>>(`${this.apiUrl}/subscriptions`, {
      params: { page: query.page ?? 0, size: query.size ?? 20, sort: query.sort ?? 'startDate,desc' }
    });
  }

  getById(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/subscriptions/${id}`);
  }

  create(subscription: Subscription): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/subscriptions`, this.toRequest(subscription));
  }

  update(id: number, subscription: Subscription): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.apiUrl}/subscriptions/${id}`, this.toRequest(subscription));
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subscriptions/${id}`, {});
  }

  getByCustomerId(customerId: number, page = 0, size = 20): Observable<PageResponse<Subscription>> {
    return this.http.get<PageResponse<Subscription>>(`${this.apiUrl}/subscriptions/customer/${customerId}`, {
      params: { page, size, sort: 'startDate,desc' }
    });
  }

  renew(id: number): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/subscriptions/${id}/renew`, {});
  }

  private toRequest(subscription: Subscription): Pick<Subscription, 'customerId' | 'packId' | 'startDate'> {
    const startDate = subscription.startDate instanceof Date
      ? `${subscription.startDate.getFullYear()}-${String(subscription.startDate.getMonth() + 1).padStart(2, '0')}-${String(subscription.startDate.getDate()).padStart(2, '0')}`
      : subscription.startDate;
    return { customerId: subscription.customerId, packId: subscription.packId, startDate };
  }
}