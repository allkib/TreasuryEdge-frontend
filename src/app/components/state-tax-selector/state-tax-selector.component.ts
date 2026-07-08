import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { US_STATES } from '../../data/us-states';
import { CompareSelection } from '../../models/tax.model';
import { TaxService } from '../../services/tax.service';

export const DEFAULT_INCOME_ESTIMATE = 75_000;

@Component({
  selector: 'app-state-tax-selector',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './state-tax-selector.component.html',
  styleUrl: './state-tax-selector.component.css',
})
export class StateTaxSelectorComponent implements OnInit, OnDestroy {
  @Output() selectionChange = new EventEmitter<CompareSelection>();

  readonly states = US_STATES;
  readonly defaultIncome = DEFAULT_INCOME_ESTIMATE;

  stateControl = new FormControl('CA', { nonNullable: true });
  incomeControl = new FormControl(DEFAULT_INCOME_ESTIMATE, { nonNullable: true });

  selectedStateName = '';
  marginalRatePercent = 0;
  hasStateIncomeTax = true;
  loadingLocation = false;
  loadingTax = false;
  usingFallbackTax = false;
  locationError = '';

  private readonly destroy$ = new Subject<void>();

  constructor(private taxService: TaxService) {}

  ngOnInit(): void {
    this.fetchTaxRate(this.stateControl.value, this.incomeControl.value);

    this.stateControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((code) => {
      if (code) {
        this.fetchTaxRate(code, this.incomeControl.value);
      }
    });

    this.incomeControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((income) => {
        this.fetchTaxRate(this.stateControl.value, income);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  useMyLocation(): void {
    this.loadingLocation = true;
    this.locationError = '';

    this.taxService.detectStateFromLocation().subscribe({
      next: ({ stateCode, stateName }) => {
        this.loadingLocation = false;
        this.selectedStateName = stateName;
        this.stateControl.setValue(stateCode, { emitEvent: true });
      },
      error: (err: Error) => {
        this.loadingLocation = false;
        this.locationError =
          err.message || 'Location access denied. Please select your state manually below.';
      },
    });
  }

  private fetchTaxRate(stateCode: string, income: number | string): void {
    const normalizedIncome = Math.max(Number(income) || 0, 0);
    const state = this.states.find((s) => s.code === stateCode);
    this.selectedStateName = state?.name ?? stateCode;
    this.loadingTax = true;
    this.usingFallbackTax = false;

    this.taxService.getTaxRate(stateCode, normalizedIncome).subscribe({
      next: ({ tax, isFallback }) => {
        this.loadingTax = false;
        this.usingFallbackTax = isFallback;
        this.marginalRatePercent = tax.marginalRate * 100;
        this.hasStateIncomeTax = tax.hasStateIncomeTax;

        this.selectionChange.emit({
          stateCode,
          stateName: this.selectedStateName,
          income: normalizedIncome,
          marginalRate: tax.marginalRate,
          hasStateIncomeTax: tax.hasStateIncomeTax,
          isFallbackTax: isFallback,
        });
      },
      error: () => {
        this.loadingTax = false;
        this.usingFallbackTax = true;
      },
    });
  }
}
