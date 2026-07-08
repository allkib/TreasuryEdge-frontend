import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

interface BalancePreset {
  label: string;
  value: number;
}

@Component({
  selector: 'app-savings-gap-chart',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './savings-gap-chart.component.html',
  styleUrl: './savings-gap-chart.component.css',
})
export class SavingsGapChartComponent {
  readonly typicalApy = 0.1;
  readonly topApy = 4;
  readonly maxBalance = 500_000;

  readonly presets: BalancePreset[] = [
    { label: '$25K', value: 25_000 },
    { label: '$50K', value: 50_000 },
    { label: '$100K', value: 100_000 },
  ];

  balanceControl = new FormControl(50_000, { nonNullable: true });

  get balance(): number {
    return Math.min(Math.max(this.balanceControl.value, 0), this.maxBalance);
  }

  get typicalAnnual(): number {
    return this.balance * (this.typicalApy / 100);
  }

  get topAnnual(): number {
    return this.balance * (this.topApy / 100);
  }

  get yearlyGap(): number {
    return this.topAnnual - this.typicalAnnual;
  }

  get rateGapPoints(): number {
    return this.topApy - this.typicalApy;
  }

  get typicalBarWidth(): number {
    const max = Math.max(this.topAnnual, 1);
    return (this.typicalAnnual / max) * 100;
  }

  get topBarWidth(): number {
    const max = Math.max(this.topAnnual, 1);
    return (this.topAnnual / max) * 100;
  }

  setPreset(value: number): void {
    this.balanceControl.setValue(value);
  }
}
