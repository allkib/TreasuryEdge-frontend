import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InViewDirective } from '../../directives/in-view.directive';

interface ProConItem {
  title: string;
  detail: string;
}

interface GuideSection {
  id: string;
  title: string;
  summary: string;
}

@Component({
  selector: 'app-tbills-guide',
  imports: [RouterLink, InViewDirective],
  templateUrl: './tbills-guide.component.html',
  styleUrl: './tbills-guide.component.css',
})
export class TbillsGuideComponent {
  readonly sections: GuideSection[] = [
    { id: 'what', title: 'What they are', summary: 'Short-term IOUs from the U.S. government.' },
    { id: 'banks', title: 'Banks & your savings', summary: 'Why your APY is 0.01% while they earn 4%+.' },
    { id: 'backing', title: 'Full faith & credit', summary: 'What “backed by the U.S. government” actually means.' },
    { id: 'pros-cons', title: 'Pros & cons', summary: 'Trade-offs vs. leaving cash at a big bank.' },
    { id: 'buying', title: 'How to buy', summary: 'TreasuryDirect, brokers, and money-market funds.' },
    { id: 'laddering', title: 'Laddering', summary: 'Stagger maturities for liquidity and yield.' },
  ];

  readonly pros: ProConItem[] = [
    {
      title: 'Minimal credit risk',
      detail:
        'T-bills are direct obligations of the U.S. Treasury — backed by the full faith and credit of the federal government, not a private company’s balance sheet.',
    },
    {
      title: 'State-tax exempt interest',
      detail:
        'Interest is exempt from state and local income taxes in most cases, which raises your effective after-tax yield vs. fully taxable bank interest.',
    },
    {
      title: 'Deep liquidity',
      detail:
        'There is an active secondary market. You can usually sell before maturity if you need cash, though the price may move with interest rates.',
    },
    {
      title: 'Predictable, short terms',
      detail:
        'Maturities run from 4 to 52 weeks. You know exactly when principal returns — useful for cash you need on a known timeline.',
    },
    {
      title: 'No credit check or bank gatekeeping',
      detail:
        'Anyone can buy via TreasuryDirect or a brokerage. You are lending to the government, not applying for a loan.',
    },
  ];

  readonly cons: ProConItem[] = [
    {
      title: 'Not FDIC “insurance” — different mechanism',
      detail:
        'Bank deposits are insured up to $250K by the FDIC. T-bills are not insured; they are direct Treasury securities. The risk profile is government default, not bank failure.',
    },
    {
      title: 'Federal income tax still applies',
      detail:
        'Interest is subject to federal income tax (and AMT in some cases). The state-tax break helps, but T-bills are not tax-free like municipal bonds.',
    },
    {
      title: 'Price risk if you sell early',
      detail:
        'Hold to maturity and you receive face value. Sell before maturity and market prices move inversely to rate changes — you could realize a gain or loss.',
    },
    {
      title: 'Inflation can erode real returns',
      detail:
        'In high-inflation periods, a 4–5% nominal yield may not keep pace with rising prices. T-bills preserve nominal dollars, not purchasing power.',
    },
    {
      title: 'More effort than a savings account',
      detail:
        'Buying, rolling maturities, and tracking a ladder takes more attention than parking cash at a bank — even if the yield difference is large.',
    },
  ];
}
