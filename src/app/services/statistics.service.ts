import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Statistics {
  totalActiveCustomers: number;
  monthlyRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private apiUrl = 'http://localhost:8080/api';
  constructor(private http: HttpClient) {}

  getStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/statistics`);
  }

  exportSubscriptions(startDate: Date, endDate: Date): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/statistics/export`, {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      },
      responseType: 'blob'
    });
  }
}