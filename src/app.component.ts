import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { KpiCardComponent, KpiCard } from './components/kpi-card/kpi-card.component';
import { ActionRequiredComponent } from './components/action-required/action-required.component';
import { CashFlowChartComponent } from './components/charts/cash-flow-chart/cash-flow-chart.component';
import { BudgetChartComponent } from './components/charts/budget-chart/budget-chart.component';
import { ExpenseChartComponent } from './components/charts/expense-chart/expense-chart.component';
import { LoginComponent } from './components/login/login.component';
import { TaxCalendarComponent } from './components/tax-calendar/tax-calendar.component';
import { TaxDashboardComponent } from './components/tax-dashboard/tax-dashboard.component';
import { TaxFormsLibraryComponent } from './components/tax-forms-library/tax-forms-library.component';
import { FilingHistoryComponent } from './components/filing-history/filing-history.component';
import { PayrollDashboardComponent } from './components/payroll-dashboard/payroll-dashboard.component';
import { EmployeeManagementComponent } from './components/employee-management/employee-management.component';
import { RunPayrollComponent } from './components/run-payroll/run-payroll.component';
import { PayslipHistoryComponent } from './components/payslip-history/payslip-history.component';
import { ExpenseDashboardComponent } from './components/expense-dashboard/expense-dashboard.component';
import { ExpenseInsightsComponent } from './components/expense-insights/expense-insights.component';
import { ExpenseCategoryPieChartComponent } from './components/charts/expense-category-pie-chart/expense-category-pie-chart.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LoginComponent,
    SidebarComponent,
    HeaderComponent,
    KpiCardComponent,
    ActionRequiredComponent,
    CashFlowChartComponent,
    BudgetChartComponent,
    ExpenseChartComponent,
    TaxCalendarComponent,
    TaxDashboardComponent,
    TaxFormsLibraryComponent,
    FilingHistoryComponent,
    PayrollDashboardComponent,
    EmployeeManagementComponent,
    RunPayrollComponent,
    PayslipHistoryComponent,
    ExpenseDashboardComponent,
    ExpenseInsightsComponent,
    ExpenseCategoryPieChartComponent
  ],
})
export class AppComponent {
  isLoggedIn = signal(false);
  activeView = signal<'executive' | 'reports' | 'tax-dashboard' | 'tax-calendar' | 'tax-forms' | 'tax-history' | 'payroll-dashboard' | 'payroll-employee-mgmt' | 'payroll-run' | 'payroll-history' | 'expense-dashboard' | 'expense-submit' | 'expense-my' | 'expense-approval' | 'expense-cards'>('executive');

  activeTitle = computed(() => {
    switch (this.activeView()) {
        case 'executive': return 'Executive Dashboard';
        case 'reports': return 'Reports';
        case 'tax-dashboard':
        case 'tax-calendar':
        case 'tax-forms':
        case 'tax-history':
            return 'Tax Compliance & Filing';
        case 'payroll-dashboard':
        case 'payroll-employee-mgmt':
        case 'payroll-run':
        case 'payroll-history':
            return 'Payroll (Global)';
        case 'expense-dashboard':
        case 'expense-submit':
        case 'expense-my':
        case 'expense-approval':
        case 'expense-cards':
            return 'Expense Management';
        default: return 'Dashboard';
    }
  });

  handleLogin(): void {
    this.isLoggedIn.set(true);
  }

  handleViewChange(view: string): void {
    const validViews = [
        'executive', 'reports', 
        'tax-dashboard', 'tax-calendar', 'tax-forms', 'tax-history',
        'payroll-dashboard', 'payroll-employee-mgmt', 'payroll-run', 'payroll-history',
        'expense-dashboard', 'expense-submit', 'expense-my', 'expense-approval', 'expense-cards'
    ];
    if (validViews.includes(view)) {
      this.activeView.set(view as any);
    }
  }

  kpiCards = signal<KpiCard[]>([
    {
      title: 'Cash on Hand',
      value: '$1,250,400',
      change: 12.5,
      changeType: 'positive',
      icon: 'cash',
      color: 'sky'
    },
    {
      title: 'Accounts Receivable',
      value: '$450,200',
      subtitle: '32 invoices pending',
      change: 0.0,
      changeType: 'neutral',
      icon: 'document-download',
      color: 'purple'
    },
    {
      title: 'Accounts Payable',
      value: '$128,500',
      subtitle: 'Due within 7 days',
      change: -5.2,
      changeType: 'negative',
      icon: 'document-upload',
      color: 'pink'
    },
    {
      title: 'Net Profit (YTD)',
      value: '$840,000',
      change: 8.4,
      changeType: 'positive',
      icon: 'chart-pie',
      color: 'cyan'
    }
  ]);
}