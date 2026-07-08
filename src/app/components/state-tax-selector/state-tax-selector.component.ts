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
  locationError = '';
  taxError = '';

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

  private fetchTaxRate(stateCode: string, income: number): void {
    const state = this.states.find((s) => s.code === stateCode);
    this.selectedStateName = state?.name ?? stateCode;
    this.loadingTax = true;
    this.taxError = '';

    this.taxService.getTaxRate(stateCode, income).subscribe({
      next: (tax) => {
        this.loadingTax = false;
        this.marginalRatePercent = tax.marginalRate * 100;
        this.hasStateIncomeTax = tax.hasStateIncomeTax;

        this.selectionChange.emit({
          stateCode,
          stateName: this.selectedStateName,
          income: Math.max(income, 0),
          marginalRate: tax.marginalRate,
          hasStateIncomeTax: tax.hasStateIncomeTax,
        });
      },
      error: (err: Error) => {
        this.loadingTax = false;
        this.taxError = err.message || 'Unable to load state tax rate.';
      },
    });
  }
}
