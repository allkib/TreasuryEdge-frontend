import { Component } from '@angular/core';
import { CompareSelection } from '../../models/tax.model';
import { ComparisonPanelComponent } from '../comparison-panel/comparison-panel.component';
import { StateTaxSelectorComponent } from '../state-tax-selector/state-tax-selector.component';

@Component({
  selector: 'app-compare',
  imports: [StateTaxSelectorComponent, ComparisonPanelComponent],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.css',
})
export class CompareComponent {
  selection: CompareSelection | null = null;

  onSelectionChange(selection: CompareSelection): void {
    this.selection = selection;
  }
}
