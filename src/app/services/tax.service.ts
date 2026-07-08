import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { getFallbackTaxRate } from '../data/fallback-tax.data';
import { FilingStatus, TaxRateResponse } from '../models/tax.model';
import { ApiCacheService } from './api-cache.service';

export interface TaxRateResult {
  tax: TaxRateResponse;
  isFallback: boolean;
}

export interface StateSelection {
  stateCode: string;
  stateName: string;
}

interface ReverseGeocodeResponse {
  principalSubdivision?: string;
  principalSubdivisionCode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaxService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private cache: ApiCacheService,
  ) {}

  detectStateFromLocation(): Observable<StateSelection> {
    if (!navigator.geolocation) {
      return throwError(() => new Error('Geolocation is not supported by your browser.'));
    }

    return from(
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        });
      }),
    ).pipe(
      switchMap((position) =>
        this.reverseGeocode(position.coords.latitude, position.coords.longitude),
      ),
    );
  }

  reverseGeocode(latitude: number, longitude: number): Observable<StateSelection> {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

    return this.http.get<ReverseGeocodeResponse>(url).pipe(
      map((data) => {
        const code = this.extractStateCode(data.principalSubdivisionCode);
        const name = data.principalSubdivision ?? code ?? 'Unknown';

        if (!code) {
          throw new Error('Could not determine your US state from location.');
        }

        return { stateCode: code, stateName: name };
      }),
    );
  }

  getTaxRate(
    stateCode: string,
    income: number,
    filingStatus: FilingStatus = 'single',
  ): Observable<TaxRateResult> {
    const normalizedIncome = Math.max(Number(income) || 0, 0);
    const cacheKey = `tax:${stateCode}:${normalizedIncome}:${filingStatus}`;
    const cached = this.cache.get<TaxRateResponse>(cacheKey);

    if (cached) {
      return of({ tax: cached, isFallback: false });
    }

    const params = new HttpParams()
      .set('income', normalizedIncome.toString())
      .set('filingStatus', filingStatus);

    return this.http
      .get<TaxRateResponse>(`${this.apiUrl}/tax-rate/${stateCode}`, { params })
      .pipe(
        tap((response) => this.cache.set(cacheKey, response)),
        map((tax) => ({ tax, isFallback: false })),
        catchError((error) => {
          console.warn(
            `[TaxService] Live tax rate unavailable for ${stateCode} at $${normalizedIncome}; using bracket fallback.`,
            error,
          );

          return of({
            tax: getFallbackTaxRate(stateCode, normalizedIncome, filingStatus),
            isFallback: true,
          });
        }),
      );
  }

  private extractStateCode(principalSubdivisionCode?: string): string | null {
    if (!principalSubdivisionCode) {
      return null;
    }

    const match = principalSubdivisionCode.match(/^US-([A-Z]{2})$/);
    return match ? match[1] : null;
  }
}
