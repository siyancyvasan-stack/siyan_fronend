import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-run-payroll',
  templateUrl: './run-payroll.component.html',
  imports: [ReactiveFormsModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunPayrollComponent {
  
  constructor(private fb: FormBuilder) {}

  // --- STATE MANAGEMENT ---
  isCalculating = signal(false);
  calculationDone = signal(false);
  isApproving = signal(false);
  isApproved = signal(false);
  toastMessage = signal<string | null>(null);

  computationSummary = signal({
    grossSalary: 0,
    allowances: 0,
    statutoryDeductions: 0,
    otherDeductions: 0,
    netPay: 0,
  });

  runDetails = signal({
    payDate: '',
    employees: 0,
    totalCost: 0
  });

  // --- REACTIVE FORM ---
  payrollRunForm = this.fb.group({
    payPeriod: ['', Validators.required],
    country: ['', Validators.required],
    currency: ['USD'],
    salaryStructure: ['All'],
  });

  // --- ACTIONS ---
  calculatePayroll(): void {
    if (this.payrollRunForm.invalid) {
      this.payrollRunForm.markAllAsTouched();
      return;
    }

    this.isCalculating.set(true);
    this.calculationDone.set(false);

    // Simulate API call and calculation
    setTimeout(() => {
      this.computationSummary.set({
        grossSalary: 312450.00,
        allowances: 48750.00,
        statutoryDeductions: 62450.00,
        otherDeductions: 12350.00,
        netPay: 286400.00,
      });

      this.runDetails.set({
        payDate: 'Dec 31, 2024',
        employees: 158,
        totalCost: 298750.00
      });
      
      this.isCalculating.set(false);
      this.calculationDone.set(true);
    }, 1500);
  }

  saveAsDraft(): void {
    this.showToast('Payroll run has been saved as a draft.');
  }
  
  approvePayroll(): void {
    this.isApproving.set(true);
    setTimeout(() => {
        this.isApproving.set(false);
        this.isApproved.set(true);
    }, 2000);
  }

  sendForApproval(): void {
    this.showToast('Payroll has been sent for approval.');
  }

  downloadPayslips(): void {
    this.showToast('Downloading payslips...');
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3000);
  }

  resetPayrollRun(): void {
    this.isCalculating.set(false);
    this.calculationDone.set(false);
    this.isApproving.set(false);
    this.isApproved.set(false);
    this.payrollRunForm.reset({
        payPeriod: '',
        country: '',
        currency: 'USD',
        salaryStructure: 'All',
    });
  }
}