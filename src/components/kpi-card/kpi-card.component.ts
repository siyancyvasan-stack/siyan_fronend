import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export interface KpiCard {
  title: string;
  value: string;
  subtitle?: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: 'sky' | 'purple' | 'pink' | 'cyan';
}

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCardComponent {
  card = input.required<KpiCard>();
}