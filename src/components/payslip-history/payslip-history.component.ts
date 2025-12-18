import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

interface Payslip {
  id: number;
  employeeId: number;
  payPeriod: string;
  paymentDate: string;
  netPayAmount: number;
  status: 'Paid' | 'Processing';
  documentURL: string;
}

interface Employee {
  id: number;
  name: string;
}

@Component({
  selector: 'app-payslip-history',
  templateUrl: './payslip-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
})
export class PayslipHistoryComponent {

  // --- STATE MANAGEMENT ---
  searchTerm = signal('');
  yearFilter = signal('2025');
  monthFilter = signal('All');
  selectedEmployeeId = signal(1);
  currentPage = signal(1);
  itemsPerPage = 6;

  // --- MOCK DATA ---
  employees = signal<Employee[]>([
    { id: 1, name: 'Sarah Johnson' },
    { id: 2, name: 'Michael Chen' },
    { id: 3, name: 'Emily Davis' }
  ]);

  payslips = signal<Payslip[]>([
    { id: 1, employeeId: 1, payPeriod: 'Mar 2025', paymentDate: '31 Mar 2025', netPayAmount: 75500.00, status: 'Paid', documentURL: '#' },
    { id: 2, employeeId: 1, payPeriod: 'Feb 2025', paymentDate: '28 Feb 2025', netPayAmount: 75500.00, status: 'Paid', documentURL: '#' },
    { id: 3, employeeId: 1, payPeriod: 'Jan 2025', paymentDate: '31 Jan 2025', netPayAmount: 75500.00, status: 'Paid', documentURL: '#' },
    { id: 4, employeeId: 1, payPeriod: 'Dec 2024', paymentDate: '31 Dec 2024', netPayAmount: 74950.00, status: 'Paid', documentURL: '#' },
    { id: 5, employeeId: 1, payPeriod: 'Nov 2024', paymentDate: '30 Nov 2024', netPayAmount: 74950.00, status: 'Paid', documentURL: '#' },
    { id: 6, employeeId: 1, payPeriod: 'Oct 2024', paymentDate: '31 Oct 2024', netPayAmount: 74950.00, status: 'Paid', documentURL: '#' },
    { id: 7, employeeId: 2, payPeriod: 'Mar 2025', paymentDate: '31 Mar 2025', netPayAmount: 82000.00, status: 'Paid', documentURL: '#' },
    { id: 8, employeeId: 2, payPeriod: 'Feb 2025', paymentDate: '28 Feb 2025', netPayAmount: 82000.00, status: 'Paid', documentURL: '#' },
    { id: 9, employeeId: 2, payPeriod: 'Jan 2025', paymentDate: '31 Jan 2025', netPayAmount: 81500.00, status: 'Paid', documentURL: '#' },
    { id: 10, employeeId: 3, payPeriod: 'Mar 2025', paymentDate: '31 Mar 2025', netPayAmount: 68000.00, status: 'Paid', documentURL: '#' },
    { id: 11, employeeId: 3, payPeriod: 'Feb 2025', paymentDate: '28 Feb 2025', netPayAmount: 68000.00, status: 'Paid', documentURL: '#' },
    { id: 12, employeeId: 1, payPeriod: 'Apr 2024', paymentDate: '30 Apr 2024', netPayAmount: 73800.00, status: 'Processing', documentURL: '#' },
  ]);

  years = computed(() => ['2025', '2024']);
  months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // --- COMPUTED DATA ---
  filteredPayslips = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const year = this.yearFilter();
    const month = this.monthFilter();
    const employeeId = this.selectedEmployeeId();

    return this.payslips().filter(p => {
      const employeeMatch = p.employeeId === employeeId;
      const yearMatch = year === 'All' || p.payPeriod.includes(year);
      const monthMatch = month === 'All' || p.payPeriod.startsWith(month);
      const termMatch = term === '' || p.payPeriod.toLowerCase().includes(term) || p.netPayAmount.toString().includes(term);
      return employeeMatch && yearMatch && monthMatch && termMatch;
    });
  });

  totalPages = computed(() => Math.ceil(this.filteredPayslips().length / this.itemsPerPage));
  
  paginatedPayslips = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredPayslips().slice(start, end);
  });

  // --- UI ACTIONS ---
  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  onYearChange(event: Event) {
    this.yearFilter.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  onMonthChange(event: Event) {
    this.monthFilter.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  onEmployeeChange(event: Event) {
    this.selectedEmployeeId.set(Number((event.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    const newPage = Math.max(1, Math.min(page, this.totalPages()));
    this.currentPage.set(newPage);
  }

  // --- HELPERS ---
  getStatusClass(status: Payslip['status']): string {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-amber-100 text-amber-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}