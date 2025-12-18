import { Component, ChangeDetectionStrategy, input, output, computed, effect, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Employee } from '../employee-management/employee-management.component';

export interface SalaryDetails {
  structureTemplate: 'Tech Standard' | 'Sales Commission' | 'Custom';
  baseSalary: number;
  paymentFrequency: 'Monthly' | 'Bi-weekly';
  effectiveDate: string; // YYYY-MM-DD
  allowances: {
    housing: number;
    transport: number;
    bonus: number;
  };
  deductions: {
    federalTax: number;
    stateTax: number;
    healthInsurance: number;
    other: number;
  };
}

const TEMPLATES: { [key: string]: Partial<SalaryDetails> } = {
  'Tech Standard': {
    baseSalary: 90000,
    allowances: { housing: 15000, transport: 5000, bonus: 10000 },
    deductions: { federalTax: 12000, stateTax: 4000, healthInsurance: 6000, other: 1000 },
  },
  'Sales Commission': {
    baseSalary: 60000,
    allowances: { housing: 10000, transport: 5000, bonus: 25000 },
    deductions: { federalTax: 8000, stateTax: 3000, healthInsurance: 5000, other: 500 },
  },
  'Custom': {}
};

@Component({
  selector: 'app-assign-salary-modal',
  templateUrl: './assign-salary-modal.component.html',
  imports: [ReactiveFormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignSalaryModalComponent implements OnInit {
  employee = input.required<Employee>();
  close = output<void>();
  save = output<Employee>();

  salaryForm = this.fb.group({
    structureTemplate: ['Tech Standard' as SalaryDetails['structureTemplate'], Validators.required],
    baseSalary: [0, [Validators.required, Validators.min(0)]],
    paymentFrequency: ['Monthly' as SalaryDetails['paymentFrequency'], Validators.required],
    effectiveDate: ['', Validators.required],
    allowances: this.fb.group({
      housing: [0, [Validators.required, Validators.min(0)]],
      transport: [0, [Validators.required, Validators.min(0)]],
      bonus: [0, [Validators.required, Validators.min(0)]],
    }),
    deductions: this.fb.group({
      federalTax: [0, [Validators.required, Validators.min(0)]],
      stateTax: [0, [Validators.required, Validators.min(0)]],
      healthInsurance: [0, [Validators.required, Validators.min(0)]],
      other: [0, [Validators.required, Validators.min(0)]],
    }),
  });

  constructor(private fb: FormBuilder) {
    // Effect to handle template changes
    this.salaryForm.get('structureTemplate')?.valueChanges.subscribe(template => {
        if (template && template !== 'Custom') {
            const templateData = TEMPLATES[template];
            this.salaryForm.patchValue(templateData as any, { emitEvent: false });
        }
    });
  }

  ngOnInit(): void {
    if (this.employee().salaryDetails) {
        this.salaryForm.patchValue(this.employee().salaryDetails);
    }
  }

  // Live calculations
  grossPay = computed(() => {
    const formValue = this.salaryForm.getRawValue();
    const base = formValue.baseSalary ?? 0;
    const housing = formValue.allowances.housing ?? 0;
    const transport = formValue.allowances.transport ?? 0;
    const bonus = formValue.allowances.bonus ?? 0;
    return base + housing + transport + bonus;
  });

  totalDeductions = computed(() => {
    const formValue = this.salaryForm.getRawValue();
    const federal = formValue.deductions.federalTax ?? 0;
    const state = formValue.deductions.stateTax ?? 0;
    const health = formValue.deductions.healthInsurance ?? 0;
    const other = formValue.deductions.other ?? 0;
    return federal + state + health + other;
  });
  
  netPay = computed(() => this.grossPay() - this.totalDeductions());
  
  onSave(): void {
    if (this.salaryForm.invalid) {
      return;
    }
    const updatedEmployee: Employee = {
      ...this.employee(),
      salaryDetails: this.salaryForm.getRawValue() as SalaryDetails,
      salaryStructure: this.salaryForm.value.structureTemplate || 'Custom'
    };
    this.save.emit(updatedEmployee);
  }

  onClose(): void {
    this.close.emit();
  }
}