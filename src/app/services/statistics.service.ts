import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStatistics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  subscriptionsDue: number;
  subscriptionsSoldThisMonth: number;
  estimatedMonthlyRevenue: number;
  packDistribution?: { packName: string; count: number }[] | null;
}

interface DashboardStatisticsResponse {
  totalCustomers?: number;
  activeCustomers?: number;
  totalActiveCustomers?: number;
  newCustomersThisMonth?: number;
  newCustomers?: number;
  activeSubscriptions?: number;
  expiredSubscriptions?: number;
  expiringSubscriptionsNext30Days?: number;
  subscriptionsDue?: number;
  subscriptionsSoldThisMonth?: number;
  estimatedMonthlyRevenue?: number;
  subscriptionsByPack?: { packName: string; subscriptions?: number }[] | null;
  packDistribution?: { packName: string; count?: number }[] | null;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface PeriodRevenue {
  startDate: string;
  endDate: string;
  estimatedMonthlyValue: number;
}

interface MonthlyRevenueResponse {
  month: string;
  monthlyValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private readonly apiUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getStatistics(): Observable<DashboardStatistics> {
    return this.http.get<DashboardStatisticsResponse | null>(`${this.apiUrl}/statistics/dashboard`).pipe(
      map(response => {
        const packDistribution = response?.subscriptionsByPack?.map(pack => ({
          packName: pack.packName,
          count: pack.subscriptions ?? 0
        })) ?? response?.packDistribution?.map(pack => ({
          packName: pack.packName,
          count: pack.count ?? 0
        })) ?? [];

        return {
          totalCustomers: response?.totalCustomers ?? 0,
          activeCustomers: response?.activeCustomers ?? response?.totalActiveCustomers ?? 0,
          newCustomers: response?.newCustomersThisMonth ?? response?.newCustomers ?? 0,
          activeSubscriptions: response?.activeSubscriptions ?? 0,
          expiredSubscriptions: response?.expiredSubscriptions ?? 0,
          subscriptionsDue: response?.expiringSubscriptionsNext30Days ?? response?.subscriptionsDue ?? 0,
          subscriptionsSoldThisMonth: response?.subscriptionsSoldThisMonth ?? 0,
          estimatedMonthlyRevenue: response?.estimatedMonthlyRevenue ?? 0,
          packDistribution
        };
      })
    );
  }

  getRevenue(startDate: string, endDate: string): Observable<PeriodRevenue> {
    return this.http.get<PeriodRevenue>(`${this.apiUrl}/statistics/revenue`, { params: { startDate, endDate } });
  }

  getMonthlyRevenue(startDate: string, endDate: string): Observable<RevenuePoint[]> {
    return this.http.get<MonthlyRevenueResponse[]>(`${this.apiUrl}/statistics/revenue/monthly`, { params: { startDate, endDate } }).pipe(
      map(points => points.map(point => ({ month: point.month, revenue: point.monthlyValue })))
    );
  }

  exportSubscriptions(startDate: string, endDate: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/statistics/export`, {
      params: {
        startDate,
        endDate
      },
      responseType: 'blob'
    });
  }
}