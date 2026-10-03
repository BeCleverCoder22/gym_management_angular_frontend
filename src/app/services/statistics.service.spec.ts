import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { StatisticsService } from './statistics.service';
import { DashboardStatistics } from './statistics.service';
import { environment } from '../../environments/environment';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(StatisticsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('maps the Spring dashboard response into the UI model', () => {
    let result: DashboardStatistics | undefined;
    service.getStatistics().subscribe(data => result = data);

    httpTesting.expectOne(`${environment.apiBaseUrl}/statistics/dashboard`).flush({
      totalCustomers: 14,
      activeCustomers: 9,
      newCustomersThisMonth: 3,
      activeSubscriptions: 8,
      expiredSubscriptions: 2,
      expiringSubscriptionsNext30Days: 1,
      subscriptionsSoldThisMonth: 4,
      estimatedMonthlyRevenue: 125000,
      subscriptionsByPack: [{ packName: 'Premium', subscriptions: 5 }]
    });

    expect(result?.newCustomers).toBe(3);
    expect(result?.subscriptionsDue).toBe(1);
    expect(result?.packDistribution).toEqual([{ packName: 'Premium', count: 5 }]);
  });

  it('defaults missing dashboard fields and distribution safely', () => {
    let result: DashboardStatistics | undefined;
    service.getStatistics().subscribe(data => result = data);
    httpTesting.expectOne(`${environment.apiBaseUrl}/statistics/dashboard`).flush({
      subscriptionsByPack: null
    });

    expect(result?.activeCustomers).toBe(0);
    expect(result?.packDistribution).toEqual([]);
  });
});
