import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { FilingStatus, TaxRateResponse } from '../models/tax.model';
import { BankRate, ComparisonResponse, TBillRate } from '../models/rates.model';
import { ApiCacheService } from './api-cache.service';
import { TaxService } from './tax.service';

export interface CompareData {
  tax: TaxRateResponse;
  banks: BankRate[];
  tbills: TBillRate[];
  compare: ComparisonResponse;
}

@Injectable({
  providedIn: 'root',
})
export class RatesService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cache: ApiCacheService,
    private taxService: TaxService,
  ) {}

  getTBillRates(): Observable<TBillRate[]> {
    const cacheKey = 'tbills';
    const cached = this.cache.get<TBillRate[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<TBillRate[]>(`${this.apiUrl}/rates/tbills`).pipe(
      tap((data) => this.cache.set(cacheKey, data, ApiCacheService.TTL_4H)),
    );
  }

  getBankRates(): Observable<BankRate[]> {
    const cacheKey = 'banks:national';
    const cached = this.cache.get<BankRate[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<BankRate[]>(`${this.apiUrl}/rates/banks`).pipe(
      tap((data) => this.cache.set(cacheKey, data)),
    );
  }

  getComparison(stateTaxRate: number): Observable<ComparisonResponse> {
    const cacheKey = `compare:${stateTaxRate}`;
    const cached = this.cache.get<ComparisonResponse>(cacheKey);

    if (cached) {
      return of(cached);
    }

    const params = new HttpParams().set('stateTaxRate', stateTaxRate.toString());

    return this.http.get<ComparisonResponse>(`${this.apiUrl}/rates/compare`, { params }).pipe(
      tap((data) => this.cache.set(cacheKey, data)),
    );
  }

  loadCompareData(
    state: string,
    income: number,
    filingStatus: FilingStatus = 'single',
  ): Observable<CompareData> {
    return this.taxService.getTaxRate(state, income, filingStatus).pipe(
      switchMap(({ tax }) => {
        const marginalRate = tax.marginalRate;

        return forkJoin({
          tax: of(tax),
          banks: this.getBankRates(),
          tbills: this.getTBillRates(),
          compare: this.getComparison(marginalRate),
        });
      }),
    );
  }
}
