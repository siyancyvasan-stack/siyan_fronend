import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ExpenseMonthlyTrendChartComponent } from '../charts/expense-monthly-trend-chart/expense-monthly-trend-chart.component';
import { ExpenseCategoryPieChartComponent } from '../charts/expense-category-pie-chart/expense-category-pie-chart.component';
import { ExpenseInsightsComponent } from '../expense-insights/expense-insights.component';

interface ExpenseClaim {
  id: number;
  date: string;
  merchant: string;
  category: 'Travel' | 'Food' | 'Software' | 'Office Supplies';
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-expense-dashboard',
  templateUrl: './expense-dashboard.component.html',
  imports: [
    CurrencyPipe,
    ExpenseMonthlyTrendChartComponent,
    ExpenseCategoryPieChartComponent,
    ExpenseInsightsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseDashboardComponent {
  // --- STATE & MOCK DATA ---
  pendingExpenses = signal(7);
  policyViolations = signal(2);
  totalMonthlySpend = signal(145000);
  monthlyBudget = signal(200000);

  recentClaims = signal<ExpenseClaim[]>([
    { id: 1, date: '12 Dec 2024', merchant: 'Uber', category: 'Travel', amount: 45.50, status: 'Pending' },
    { id: 2, date: '12 Dec 2024', merchant: 'Starbucks', category: 'Food', amount: 12.80, status: 'Approved' },
    { id: 3, date: '11 Dec 2024', merchant: 'Adobe Creative Cloud', category: 'Software', amount: 59.99, status: 'Approved' },
    { id: 4, date: '11 Dec 2024', merchant: 'Delta Airlines', category: 'Travel', amount: 850.00, status: 'Pending' },
    { id: 5, date: '10 Dec 2024', merchant: 'Office Depot', category: 'Office Supplies', amount: 125.00, status: 'Rejected' },
    { id: 6, date: '09 Dec 2024', merchant: 'The Corner Bistro', category: 'Food', amount: 85.30, status: 'Approved' },
  ]);

  // --- COMPUTED SIGNALS ---
  budgetUtilization = computed(() => {
    const budget = this.monthlyBudget();
    if (budget === 0) return 0;
    return Math.round((this.totalMonthlySpend() / budget) * 100);
  });

  // --- HELPERS ---
  getStatusClass(status: ExpenseClaim['status']): string {
    switch (status) {
      case 'Approved':
        return 'bg-sky-100 text-sky-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Rejected':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }
}