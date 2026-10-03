import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pack } from '../models/pack';
import { PageQuery, PageResponse } from '../models/api';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PackService {

  private readonly apiUrl = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  getAll(query: PageQuery = {}): Observable<PageResponse<Pack>> {
    return this.http.get<PageResponse<Pack>>(`${this.apiUrl}/packs`, {
      params: { page: query.page ?? 0, size: query.size ?? 20, sort: query.sort ?? 'createdAt,desc' }
    });
  }

  getById(id: number): Observable<Pack> {
    return this.http.get<Pack>(`${this.apiUrl}/packs/${id}`);
  }

  create(pack: Pack): Observable<Pack> {
    return this.http.post<Pack>(`${this.apiUrl}/packs`, pack);
  }

  update(id: number, pack: Pack): Observable<Pack> {
    return this.http.put<Pack>(`${this.apiUrl}/packs/${id}`, pack);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/packs/${id}`);
  }

  setActive(id: number, active: boolean): Observable<Pack> {
    return this.http.patch<Pack>(`${this.apiUrl}/packs/${id}/status`, { active });
  }
}