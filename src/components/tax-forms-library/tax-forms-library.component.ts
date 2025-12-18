import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

interface TaxForm {
  id: number;
  formName: string;
  jurisdiction: string;
  taxYear: number;
  status: 'Draft' | 'Ready' | 'Filed' | 'Archived';
  createdDate: Date;
  modifiedDate: Date;
}

@Component({
  selector: 'app-tax-forms-library',
  templateUrl: './tax-forms-library.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class TaxFormsLibraryComponent {
  
  // --- STATE MANAGEMENT ---
  viewMode = signal<'list' | 'card'>('list');
  searchTerm = signal('');
  jurisdictionFilter = signal('All');
  yearFilter = signal('All');
  statusFilter = signal('All');
  isModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  editingFormId = signal<number | null>(null);

  // --- MOCK DATA ---
  taxForms = signal<TaxForm[]>([
    { id: 1, formName: 'Form W-2', jurisdiction: 'US', taxYear: 2023, status: 'Filed', createdDate: new Date(2023, 10, 1), modifiedDate: new Date(2024, 0, 15) },
    { id: 2, formName: 'VAT Return (UK)', jurisdiction: 'UK', taxYear: 2023, status: 'Filed', createdDate: new Date(2023, 11, 5), modifiedDate: new Date(2024, 0, 20) },
    { id: 3, formName: 'Form 1099-NEC', jurisdiction: 'US', taxYear: 2023, status: 'Ready', createdDate: new Date(2024, 0, 1), modifiedDate: new Date(2024, 0, 25) },
    { id: 4, formName: 'Form W-2', jurisdiction: 'US', taxYear: 2022, status: 'Archived', createdDate: new Date(2022, 10, 1), modifiedDate: new Date(2023, 0, 15) },
    { id: 5, formName: 'Corporate/Other-(-18)', jurisdiction: 'India', taxYear: 2023, status: 'Draft', createdDate: new Date(2024, 1, 1), modifiedDate: new Date(2024, 1, 10) },
    { id: 6, formName: 'GST Filing (India)', jurisdiction: 'India', taxYear: 2023, status: 'Filed', createdDate: new Date(2023, 6, 1), modifiedDate: new Date(2023, 6, 20) },
    { id: 7, formName: 'VAT Return (UK)', jurisdiction: 'UK', taxYear: 2022, status: 'Archived', createdDate: new Date(2022, 11, 5), modifiedDate: new Date(2023, 0, 20) },
    { id: 8, formName: 'Form 941', jurisdiction: 'US', taxYear: 2024, status: 'Draft', createdDate: new Date(2024, 3, 1), modifiedDate: new Date(2024, 3, 5) },
    { id: 9, formName: 'CA Form 592-B', jurisdiction: 'California', taxYear: 2023, status: 'Filed', createdDate: new Date(2023, 11, 15), modifiedDate: new Date(2024, 0, 10) },
  ]);

  // --- REACTIVE FORM ---
  taxForm = this.fb.group({
    formName: ['', Validators.required],
    jurisdiction: ['', Validators.required],
    taxYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    status: ['Draft' as TaxForm['status'], Validators.required],
  });

  constructor(private fb: FormBuilder) {}

  // --- COMPUTED DATA ---
  jurisdictions = computed(() => ['All', ...new Set(this.taxForms().map(f => f.jurisdiction))].sort());
  years = computed(() => ['All', ...new Set(this.taxForms().map(f => f.taxYear.toString()))].sort((a: string, b: string) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    return b.localeCompare(a);
  }));
  statuses = ['All', 'Draft', 'Ready', 'Filed', 'Archived'];

  filteredForms = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const jurisdiction = this.jurisdictionFilter();
    const year = this.yearFilter();
    const status = this.statusFilter();

    return this.taxForms().filter(form => 
      form.formName.toLowerCase().includes(term) &&
      (jurisdiction === 'All' || form.jurisdiction === jurisdiction) &&
      (year === 'All' || form.taxYear.toString() === year) &&
      (status === 'All' || form.status === status)
    ).sort((a,b) => b.modifiedDate.getTime() - a.modifiedDate.getTime());
  });

  // --- UI ACTIONS ---
  setViewMode(mode: 'list' | 'card'): void {
    this.viewMode.set(mode);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
  
  onFilterChange(event: Event, filterSignal: (value: string) => void): void {
    filterSignal((event.target as HTMLSelectElement).value);
  }

  // --- CRUD ACTIONS ---
  openAddModal(): void {
    this.modalMode.set('add');
    this.taxForm.reset({
      taxYear: new Date().getFullYear(),
      status: 'Draft'
    });
    this.isModalOpen.set(true);
  }

  openEditModal(form: TaxForm): void {
    this.modalMode.set('edit');
    this.editingFormId.set(form.id);
    this.taxForm.setValue({
      formName: form.formName,
      jurisdiction: form.jurisdiction,
      taxYear: form.taxYear,
      status: form.status,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingFormId.set(null);
  }

  saveForm(): void {
    if (this.taxForm.invalid) {
      return;
    }

    if (this.modalMode() === 'add') {
      const newForm: TaxForm = {
        id: Date.now(),
        ...this.taxForm.value as Omit<TaxForm, 'id' | 'createdDate' | 'modifiedDate'>,
        createdDate: new Date(),
        modifiedDate: new Date(),
      };
      this.taxForms.update(forms => [...forms, newForm]);
    } else { // Edit mode
      const formId = this.editingFormId();
      this.taxForms.update(forms => forms.map(form => 
        form.id === formId 
          ? { 
              ...form,
              ...this.taxForm.value as Omit<TaxForm, 'id' | 'createdDate' | 'modifiedDate'>,
              modifiedDate: new Date() 
            }
          : form
      ));
    }

    this.closeModal();
  }

  deleteForm(formId: number): void {
    if (confirm('Are you sure you want to delete this form?')) {
      this.taxForms.update(forms => forms.filter(form => form.id !== formId));
    }
  }

  // --- HELPERS ---
  getStatusClass(status: TaxForm['status']): string {
    switch(status) {
      case 'Filed': return 'bg-green-100 text-green-800';
      case 'Ready': return 'bg-blue-100 text-blue-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}
