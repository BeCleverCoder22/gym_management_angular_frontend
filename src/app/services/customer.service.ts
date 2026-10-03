import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer';
import { PageQuery, PageResponse } from '../models/api';
import { environment } from '../../environments/environment';

export interface CustomerQuery extends PageQuery {
  q?: string;
  lastName?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly apiUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getAll(query: CustomerQuery = {}): Observable<PageResponse<Customer>> {
    let params = new HttpParams()
      .set('page', query.page ?? 0)
      .set('size', query.size ?? 20)
      .set('sort', query.sort ?? 'registrationDate,desc');

    for (const [key, value] of Object.entries({ q: query.q, lastName: query.lastName, phone: query.phone })) {
      if (value?.trim()) params = params.set(key, value.trim());
    }

    return this.http.get<PageResponse<Customer>>(`${this.apiUrl}/customers`, {
      params
    });
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/customers/${id}`);
  }

  create(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}/customers`, customer);
  }

  update(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/customers/${id}`, customer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/customers/${id}`);
  }

  searchByName(lastName: string, page = 0, size = 20): Observable<PageResponse<Customer>> {
    return this.http.get<PageResponse<Customer>>(`${this.apiUrl}/customers/search`, {
      params: { lastName, page, size, sort: 'registrationDate,desc' }
    });
  }
}