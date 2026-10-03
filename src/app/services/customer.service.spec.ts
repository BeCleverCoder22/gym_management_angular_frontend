import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomerService } from './customer.service';
import { environment } from '../../environments/environment';
import { normalizePageResponse } from '../models/api';

describe('CustomerService', () => {
  let service: CustomerService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CustomerService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requests a filtered server-side page', () => {
    service.getAll({ page: 2, size: 20, sort: 'lastName,asc', q: 'marie', phone: '0123' }).subscribe(response => {
      expect(response.content).toEqual([]);
      expect(response.totalPages).toBe(0);
    });

    const request = httpTesting.expectOne(req => req.url === `${environment.apiBaseUrl}/customers`);
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('20');
    expect(request.request.params.get('sort')).toBe('lastName,asc');
    expect(request.request.params.get('q')).toBe('marie');
    expect(request.request.params.get('phone')).toBe('0123');
    request.flush({ content: [], page: 2, size: 20, totalElements: 0, totalPages: 0, first: true, last: true });
  });

  it('omits empty optional filters', () => {
    service.getAll().subscribe();
    const request = httpTesting.expectOne(req => req.url === `${environment.apiBaseUrl}/customers`);
    expect(request.request.params.has('q')).toBeFalse();
    expect(request.request.params.has('lastName')).toBeFalse();
    expect(request.request.params.has('phone')).toBeFalse();
    request.flush({ content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, first: true, last: true });
  });

  it('normalizes raw array responses into a first page', () => {
    const response = normalizePageResponse([{ id: 1, firstName: 'Awa' }]);
    expect(response.content.length).toBe(1);
    expect(response.totalPages).toBe(1);
    expect(response.first).toBeTrue();
    expect(response.last).toBeTrue();
  });
});
