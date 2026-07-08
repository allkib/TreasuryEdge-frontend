import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateLadderHoldingRequest,
  LadderDashboard,
  LadderHolding,
  TaxSettings,
} from '../models/ladder.model';

@Injectable({
  providedIn: 'root',
})
export class LadderService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHoldings(): Observable<LadderHolding[]> {
    return this.http.get<LadderHolding[]>(`${this.apiUrl}/ladder/holdings`);
  }

  addHolding(holding: CreateLadderHoldingRequest): Observable<LadderHolding> {
    return this.http.post<LadderHolding>(`${this.apiUrl}/ladder/holdings`, holding);
  }

  deleteHolding(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ladder/holdings/${id}`);
  }

  getDashboard(): Observable<LadderDashboard> {
    return this.http.get<LadderDashboard>(`${this.apiUrl}/ladder/dashboard`);
  }

  getTaxSettings(): Observable<TaxSettings> {
    return this.http.get<TaxSettings>(`${this.apiUrl}/tax-settings`);
  }

  updateTaxSettings(settings: TaxSettings): Observable<TaxSettings> {
    return this.http.put<TaxSettings>(`${this.apiUrl}/tax-settings`, settings);
  }
}
