import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';

interface Submission {
  id: number;
  taxName: string;
  filingPeriod: string;
  submissionDate: string;
  amount: string;
  status: 'Accepted' | 'Processing' | 'Rejected/Error' | 'Submitted';
  transactionId?: string;
  isPaid?: boolean;
}

@Component({
  selector: 'app-filing-history',
  templateUrl: './filing-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilingHistoryComponent {
  
  // --- STATE MANAGEMENT ---
  searchTerm = signal('');
  taxTypeFilter = signal('All');
  periodFilter = signal('All');
  currentPage = signal(1);
  itemsPerPage = 7;

  // --- MOCK DATA ---
  submissions = signal<Submission[]>([
    { id: 1, taxName: 'Annual Income Tax - FY 2024-25', filingPeriod: '10 Oct 2025', submissionDate: '10 Oct 2025', amount: '1,50,000', status: 'Accepted', transactionId: 'TXN-2025-A8B9C1D4', isPaid: true },
    { id: 2, taxName: 'GST M-3', filingPeriod: '01 Apr 2024 - Period - 30 Sep 2025', submissionDate: '01 Sep 2025', amount: '1,50,000 - X7Y6Z5W2', status: 'Accepted', transactionId: 'PROP-2025-P9S0', isPaid: false },
    { id: 3, taxName: 'GST M-3', filingPeriod: '05 Oct 2025', submissionDate: '25,000', amount: '25,000', status: 'Accepted', isPaid: true },
    { id: 4, taxName: 'Property Tax - H1 2025', filingPeriod: '01 Apr 2024-2025 - 30 Sep 2025', submissionDate: '31 Oct 2024', amount: '12,000', status: 'Processing', isPaid: true },
    { id: 5, taxName: 'TDS Q2 FY24-25', filingPeriod: 'TDS-29M8N706', submissionDate: 'TDS-29M8N706', amount: 'N/A', status: 'Rejected/Error' },
    { id: 6, taxName: 'Annual Income Tax - FY 2023-24', filingPeriod: 'N/A', submissionDate: 'N/A', amount: '8,000', status: 'Accepted', isPaid: false },
    { id: 7, taxName: 'Annual Income Tax - 31 Mar 2024', filingPeriod: 'N/A', submissionDate: 'N/A', amount: 'N/A', status: 'Submitted' },
    { id: 8, taxName: 'VAT Return Q1 2024', filingPeriod: '01 Jan 2024 - 31 Mar 2024', submissionDate: '15 Apr 2024', amount: '5,600', status: 'Accepted', isPaid: true },
    { id: 9, taxName: 'Corporate Tax 2023', filingPeriod: '01 Jan 2023 - 31 Dec 2023', submissionDate: '10 Mar 2024', amount: '45,000', status: 'Accepted', isPaid: true },
  ]);

  // --- COMPUTED DATA ---
  filteredSubmissions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.submissions().filter(s => 
      s.taxName.toLowerCase().includes(term) || 
      (s.transactionId && s.transactionId.toLowerCase().includes(term))
    );
  });
  
  totalPages = computed(() => Math.ceil(this.filteredSubmissions().length / this.itemsPerPage));

  paginatedSubmissions = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredSubmissions().slice(start, end);
  });

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));


  // --- UI ACTIONS ---
  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // --- HELPERS ---
  getStatusClasses(status: Submission['status']): string {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-700';
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected/Error': return 'bg-red-100 text-red-700';
      case 'Submitted': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}
