import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { AssignSalaryModalComponent, SalaryDetails } from '../assign-salary-modal/assign-salary-modal.component';

export interface Employee {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  salaryStructure: string;
  startDate: Date;
  profileImageUrl?: string;
  salaryDetails: SalaryDetails;
}

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, NgOptimizedImage, AssignSalaryModalComponent],
})
export class EmployeeManagementComponent {
  
  constructor(private fb: FormBuilder) {}

  // --- STATE MANAGEMENT ---
  searchTerm = signal('');
  isModalOpen = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  editingEmployeeId = signal<number | null>(null);
  openActionsMenuId = signal<number | null>(null);
  isAssignSalaryModalOpen = signal(false);
  selectedEmployeeForSalary = signal<Employee | null>(null);

  // --- MOCK DATA ---
  employees = signal<Employee[]>([
    { id: 1, employeeId: 'EMP-001', name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'Software Engineer', department: 'Engineering', status: 'Active', salaryStructure: 'Tech Standard', startDate: new Date('2022-03-15'), profileImageUrl: 'https://picsum.photos/id/1011/100/100', salaryDetails: { structureTemplate: 'Tech Standard', baseSalary: 120000, paymentFrequency: 'Monthly', effectiveDate: '2024-01-01', allowances: { housing: 20000, transport: 6000, bonus: 15000 }, deductions: { federalTax: 18000, stateTax: 7000, healthInsurance: 6000, other: 1000 } } },
    { id: 2, employeeId: 'EMP-002', name: 'Michael Chen', email: 'm.chen@company.com', role: 'Product Manager', department: 'Product', status: 'Active', salaryStructure: 'Management', startDate: new Date('2021-08-01'), profileImageUrl: 'https://picsum.photos/id/1012/100/100', salaryDetails: { structureTemplate: 'Custom', baseSalary: 140000, paymentFrequency: 'Monthly', effectiveDate: '2024-01-01', allowances: { housing: 25000, transport: 7000, bonus: 20000 }, deductions: { federalTax: 22000, stateTax: 9000, healthInsurance: 6500, other: 1500 } } },
    { id: 3, employeeId: 'EMP-003', name: 'Emily Davis', email: 'emily.d@company.com', role: 'UX Designer', department: 'Design', status: 'On Leave', salaryStructure: 'Design Standard', startDate: new Date('2023-01-20'), profileImageUrl: 'https://picsum.photos/id/1013/100/100', salaryDetails: { structureTemplate: 'Custom', baseSalary: 95000, paymentFrequency: 'Bi-weekly', effectiveDate: '2023-01-20', allowances: { housing: 18000, transport: 5000, bonus: 5000 }, deductions: { federalTax: 13000, stateTax: 5000, healthInsurance: 5500, other: 800 } } },
    { id: 4, employeeId: 'EMP-004', name: 'James Wilson', email: 'j.wilson@company.com', role: 'DevOps Engineer', department: 'Engineering', status: 'Active', salaryStructure: 'Tech Standard', startDate: new Date('2022-09-10'), profileImageUrl: 'https://picsum.photos/id/1014/100/100', salaryDetails: { structureTemplate: 'Tech Standard', baseSalary: 130000, paymentFrequency: 'Monthly', effectiveDate: '2022-09-10', allowances: { housing: 22000, transport: 6000, bonus: 10000 }, deductions: { federalTax: 20000, stateTax: 8000, healthInsurance: 6000, other: 1200 } } },
    { id: 5, employeeId: 'EMP-005', name: 'Amanda Foster', email: 'a.foster@company.com', role: 'HR Manager', department: 'Human Resources', status: 'Active', salaryStructure: 'Management', startDate: new Date('2020-05-30'), profileImageUrl: 'https://picsum.photos/id/1015/100/100', salaryDetails: { structureTemplate: 'Custom', baseSalary: 110000, paymentFrequency: 'Monthly', effectiveDate: '2020-05-30', allowances: { housing: 20000, transport: 5000, bonus: 8000 }, deductions: { federalTax: 16000, stateTax: 6000, healthInsurance: 6000, other: 1000 } } },
    { id: 6, employeeId: 'EMP-006', name: 'Robert Martinez', email: 'r.martinez@company.com', role: 'Sales Executive', department: 'Sales', status: 'Terminated', salaryStructure: 'Sales Commission', startDate: new Date('2021-11-01'), profileImageUrl: 'https://picsum.photos/id/1016/100/100', salaryDetails: { structureTemplate: 'Sales Commission', baseSalary: 70000, paymentFrequency: 'Monthly', effectiveDate: '2021-11-01', allowances: { housing: 10000, transport: 5000, bonus: 40000 }, deductions: { federalTax: 15000, stateTax: 5000, healthInsurance: 5000, other: 500 } } },
    { id: 7, employeeId: 'EMP-007', name: 'Lisa Thompson', email: 'l.thompson@company.com', role: 'Marketing Lead', department: 'Marketing', status: 'Active', salaryStructure: 'Management', startDate: new Date('2022-02-18'), profileImageUrl: 'https://picsum.photos/id/1018/100/100', salaryDetails: { structureTemplate: 'Custom', baseSalary: 115000, paymentFrequency: 'Monthly', effectiveDate: '2022-02-18', allowances: { housing: 20000, transport: 5500, bonus: 12000 }, deductions: { federalTax: 17000, stateTax: 6500, healthInsurance: 6000, other: 1000 } } },
    { id: 8, employeeId: 'EMP-008', name: 'David Kim', email: 'd.kim@company.com', role: 'Data Analyst', department: 'Analytics', status: 'Active', salaryStructure: 'Tech Standard', startDate: new Date('2023-06-05'), profileImageUrl: 'https://picsum.photos/id/1019/100/100', salaryDetails: { structureTemplate: 'Tech Standard', baseSalary: 90000, paymentFrequency: 'Monthly', effectiveDate: '2023-06-05', allowances: { housing: 15000, transport: 5000, bonus: 5000 }, deductions: { federalTax: 12000, stateTax: 4000, healthInsurance: 5500, other: 800 } } },
  ]);
  
  // --- REACTIVE FORM ---
  employeeForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],
    department: ['', Validators.required],
    status: ['Active' as Employee['status'], Validators.required],
    salaryStructure: ['Tech Standard', Validators.required],
  });

  // --- COMPUTED DATA ---
  filteredEmployees = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.employees();

    return this.employees().filter(emp => 
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.employeeId.toLowerCase().includes(term)
    );
  });

  // --- UI ACTIONS ---
  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  toggleActionsMenu(employeeId: number): void {
    this.openActionsMenuId.update(id => id === employeeId ? null : employeeId);
  }

  // --- CRUD ACTIONS ---
  openAddModal(): void {
    this.modalMode.set('add');
    this.employeeForm.reset({
        status: 'Active',
        salaryStructure: 'Tech Standard'
    });
    this.isModalOpen.set(true);
  }

  openEditModal(employee: Employee): void {
    this.modalMode.set('edit');
    this.editingEmployeeId.set(employee.id);
    this.employeeForm.setValue({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      status: employee.status,
      salaryStructure: employee.salaryStructure,
    });
    this.isModalOpen.set(true);
    this.openActionsMenuId.set(null);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingEmployeeId.set(null);
  }

  saveEmployee(): void {
    if (this.employeeForm.invalid) {
      return;
    }

    if (this.modalMode() === 'add') {
      const nextId = Math.max(...this.employees().map(e => e.id)) + 1;
      const newEmployee: Employee = {
        id: nextId,
        employeeId: `EMP-${String(nextId).padStart(3, '0')}`,
        ...(this.employeeForm.value as Omit<Employee, 'id' | 'employeeId' | 'startDate' | 'profileImageUrl' | 'salaryDetails'>),
        startDate: new Date(),
        profileImageUrl: `https://picsum.photos/id/10${nextId}/100/100`,
        salaryDetails: {
            structureTemplate: 'Custom',
            baseSalary: 0,
            paymentFrequency: 'Monthly',
            effectiveDate: new Date().toISOString().split('T')[0],
            allowances: { housing: 0, transport: 0, bonus: 0 },
            deductions: { federalTax: 0, stateTax: 0, healthInsurance: 0, other: 0 }
        }
      };
      this.employees.update(employees => [...employees, newEmployee]);
    } else { // Edit mode
      const empId = this.editingEmployeeId();
      this.employees.update(employees => employees.map(emp => 
        emp.id === empId 
          ? { ...emp, ...this.employeeForm.value as Omit<Employee, 'id' | 'employeeId' | 'startDate' | 'profileImageUrl' | 'salaryDetails'> } 
          : emp
      ));
    }
    this.closeModal();
  }
  
  assignSalary(employee: Employee): void {
    this.selectedEmployeeForSalary.set(employee);
    this.isAssignSalaryModalOpen.set(true);
    this.openActionsMenuId.set(null);
  }

  closeAssignSalaryModal(): void {
    this.isAssignSalaryModalOpen.set(false);
    this.selectedEmployeeForSalary.set(null);
  }

  handleSalarySave(updatedEmployee: Employee): void {
    this.employees.update(employees => 
      employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
    );
    this.closeAssignSalaryModal();
  }

  deleteEmployee(employeeId: number): void {
    if (confirm('Are you sure you want to terminate this employee\'s profile?')) {
      this.employees.update(employees => 
        employees.map(emp => emp.id === employeeId ? { ...emp, status: 'Terminated' } : emp)
      );
    }
    this.openActionsMenuId.set(null);
  }

  // --- HELPERS ---
  getStatusClass(status: Employee['status']): string {
    switch (status) {
      case 'Active': return 'bg-sky-100 text-sky-800';
      case 'On Leave': return 'bg-purple-100 text-purple-800';
      case 'Terminated': return 'bg-pink-100 text-pink-800';
    }
  }
}