import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { PayrollCostByDeptChartComponent } from '../charts/payroll-cost-by-dept-chart/payroll-cost-by-dept-chart.component';
import { MonthlyPayrollTrendChartComponent } from '../charts/monthly-payroll-trend-chart/monthly-payroll-trend-chart.component';
import { EmployeeDistributionChartComponent } from '../charts/employee-distribution-chart/employee-distribution-chart.component';
import { OvertimeTrendChartComponent } from '../charts/overtime-trend-chart/overtime-trend-chart.component';

interface PayrollKpi {
  title: string;
  value: string;
  subtext: string;
  icon: 'calendar' | 'dollar' | 'people' | 'pending';
  bgColor: string;
  iconBgColor: string;
  iconTextColor: string;
  trend?: {
    value: string;
    color: string;
  };
}

interface PayrollRun {
  runId: string;
  payPeriod: string;
  processDate: string;
  status: 'Completed' | 'Processing' | 'Failed' | 'Scheduled';
  employeeCount: number;
  totalCost: string;
  grossPay: string;
  deductions: string;
  netPay: string;
  overtimeHours: number;
}


@Component({
  selector: 'app-payroll-dashboard',
  templateUrl: './payroll-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PayrollCostByDeptChartComponent, 
    MonthlyPayrollTrendChartComponent,
    EmployeeDistributionChartComponent,
    OvertimeTrendChartComponent
  ],
})
export class PayrollDashboardComponent {
  currentDate = signal(new Date());
  searchTerm = signal('');
  expandedRunId = signal<string | null>(null);

  payrollKpis = signal<PayrollKpi[]>([
    {
      title: 'Next Payroll Date',
      value: 'Dec 31, 2024',
      subtext: 'In 19 days',
      icon: 'calendar',
      bgColor: 'bg-sky-50',
      iconBgColor: 'bg-sky-100',
      iconTextColor: 'text-sky-600',
    },
    {
      title: 'Total Payroll Cost',
      value: '$248,500',
      subtext: 'Estimated for this run',
      icon: 'dollar',
      bgColor: 'bg-purple-50',
      iconBgColor: 'bg-purple-100',
      iconTextColor: 'text-purple-600',
      trend: {
        value: '↑ 2.4% vs last month',
        color: 'text-green-600',
      },
    },
    {
      title: 'Active Employees',
      value: '158',
      subtext: 'in this payroll run',
      icon: 'people',
      bgColor: 'bg-white',
      iconBgColor: 'bg-cyan-100',
      iconTextColor: 'text-cyan-600',
      trend: {
        value: '↑ 4 new this month',
        color: 'text-green-600',
      },
    },
    {
      title: 'Pending Approvals',
      value: '3',
      subtext: 'Awaiting review',
      icon: 'pending',
      bgColor: 'bg-pink-50',
      iconBgColor: 'bg-pink-100',
      iconTextColor: 'text-pink-600',
    },
  ]);

  recentRuns = signal<PayrollRun[]>([
    { runId: 'PR-2024-001', payPeriod: '12/01/24 - 12/15/24', processDate: 'Dec 15, 2024', status: 'Completed', employeeCount: 156, totalCost: '$245,890.00', grossPay: '$260,100.00', deductions: '$14,210.00', netPay: '$245,890.00', overtimeHours: 512 },
    { runId: 'PR-2024-002', payPeriod: '11/16/24 - 11/30/24', processDate: 'Nov 30, 2024', status: 'Completed', employeeCount: 154, totalCost: '$243,120.50', grossPay: '$258,000.00', deductions: '$14,879.50', netPay: '$243,120.50', overtimeHours: 480 },
    { runId: 'PR-2024-003', payPeriod: '11/01/24 - 11/15/24', processDate: 'Nov 15, 2024', status: 'Processing', employeeCount: 152, totalCost: '$241,500.00', grossPay: '$255,000.00', deductions: '$13,500.00', netPay: '$241,500.00', overtimeHours: 450 },
    { runId: 'PR-2024-004', payPeriod: '10/16/24 - 10/31/24', processDate: 'Oct 31, 2024', status: 'Failed', employeeCount: 150, totalCost: '$238,750.75', grossPay: '$252,000.00', deductions: '$13,249.25', netPay: '$238,750.75', overtimeHours: 420 },
    { runId: 'PR-2024-005', payPeriod: '10/01/24 - 10/15/24', processDate: 'Oct 15, 2024', status: 'Completed', employeeCount: 148, totalCost: '$235,200.00', grossPay: '$248,000.00', deductions: '$12,800.00', netPay: '$235,200.00', overtimeHours: 390 },
    { runId: 'PR-2024-006', payPeriod: '12/16/24 - 12/31/24', processDate: 'Dec 31, 2024', status: 'Scheduled', employeeCount: 158, totalCost: '$248,500.00', grossPay: '$262,000.00', deductions: '$13,500.00', netPay: '$248,500.00', overtimeHours: 0 },
  ]);

  filteredRuns = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.recentRuns();
    }
    return this.recentRuns().filter(run => 
      run.runId.toLowerCase().includes(term) ||
      run.payPeriod.toLowerCase().includes(term)
    );
  });

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  toggleRow(runId: string): void {
    this.expandedRunId.update(currentId => currentId === runId ? null : runId);
  }

  getStatusClass(status: PayrollRun['status']): string {
    switch(status) {
      case 'Completed': return 'bg-cyan-100 text-cyan-800';
      case 'Processing': return 'bg-sky-100 text-sky-800';
      case 'Failed': return 'bg-pink-100 text-pink-800';
      case 'Scheduled': return 'bg-slate-100 text-slate-800';
    }
  }
}