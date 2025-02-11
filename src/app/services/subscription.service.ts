import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Subscription } from '../models/subscription';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private apiUrl = 'http://localhost:8080/api';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions`);
  }

  getById(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/subscriptions/${id}`);
  }

  create(subscription: Subscription): Observable<Subscription> {
    const formattedSubscription = {
      startDate: subscription.startDate instanceof Date 
        ? subscription.startDate.toISOString().split('T')[0] // Supprime l'heure
        : subscription.startDate,
      customer: { id: subscription.customerId },  // Transforme en objet
      pack: { id: subscription.packId }           // Transforme en objet
    };
    console.log('Données envoyées :', subscription);
    return this.http.post<Subscription>(`${this.apiUrl}/subscriptions`, formattedSubscription);
  }

  update(id: number, subscription: Subscription): Observable<Subscription> {
    const formattedSubscription = {
      startDate: subscription.startDate instanceof Date 
        ? subscription.startDate.toISOString().split('T')[0] // Supprime l'heure
        : subscription.startDate,
      customer: { id: subscription.customerId },  // Transforme en objet
      pack: { id: subscription.packId }           // Transforme en objet
    };
    return this.http.put<Subscription>(`${this.apiUrl}/subscriptions/${id}`, formattedSubscription);
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subscriptions/${id}`, {});
  }

  getByCustomerId(customerId: number): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/subscriptions/customer/${customerId}`);
  }
}