import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pack } from '../models/pack';


@Injectable({
  providedIn: 'root'
})
export class PackService {

  private apiUrl = 'http://localhost:8080/api';
  constructor(private http: HttpClient) {}

  getAll(): Observable<Pack[]> {
    return this.http.get<Pack[]>(`${this.apiUrl}/packs`);
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
}