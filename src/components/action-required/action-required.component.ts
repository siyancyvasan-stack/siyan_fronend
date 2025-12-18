import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

interface ActionItem {
  title: string;
  subtitle: string;
  icon: string;
  color: 'pink' | 'cyan' | 'slate';
}

@Component({
  selector: 'app-action-required',
  templateUrl: './action-required.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionRequiredComponent {
  actions = signal<ActionItem[]>([
    {
      title: 'Approve Payroll Batch #4092',
      subtitle: 'Due today at 5:00 PM',
      icon: 'time',
      color: 'pink'
    },
    {
      title: 'New Vendor Application',
      subtitle: 'TechSolutions LLC waiting review',
      icon: 'vendor',
      color: 'cyan'
    },
    {
      title: 'Close Period 03',
      subtitle: 'Scheduled for Apr 5th',
      icon: 'calendar',
      color: 'slate'
    }
  ]);
}
