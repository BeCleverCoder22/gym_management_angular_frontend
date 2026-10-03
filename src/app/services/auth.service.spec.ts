import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends tenant-aware credentials and loads the current user', () => {
    const credentials = { organizationSlug: 'gym-exemple', username: 'admin', password: 'mot-de-passe-long' };
    const currentUser: User = { id: 3, username: 'admin', email: 'admin@example.com', role: 'ADMIN' };
    let result: unknown;

    service.login(credentials).subscribe(response => result = response);

    const loginRequest = httpTesting.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(loginRequest.request.method).toBe('POST');
    expect(loginRequest.request.body).toEqual(credentials);
    loginRequest.flush({ token: 'access-token', type: 'Bearer', role: 'ADMIN' });

    expect(service.accessToken).toBe('access-token');
    const profileRequest = httpTesting.expectOne(`${environment.apiBaseUrl}/users/me`);
    expect(profileRequest.request.method).toBe('GET');
    profileRequest.flush(currentUser);
    expect(service.currentUserSubjectValue).toEqual(currentUser);
    expect(result).toEqual({ token: 'access-token', type: 'Bearer', role: 'ADMIN' });
  });
});
