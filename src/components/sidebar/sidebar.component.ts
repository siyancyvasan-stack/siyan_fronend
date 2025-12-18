import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';

interface NavItem {
  id: string;
  title: string;
  subItems?: {id: string, name: string, view: string}[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  viewChanged = output<string>();
  
  activeViewId = signal<string>('dashboard'); 
  openSectionId = signal<string>('tax-compliance');

  navSections = signal<NavSection[]>([
     {
      title: 'FINANCE & ACCOUNTING',
      items: [
        {
          id: 'the-ledger',
          title: 'The Ledger',
        },
        {
          id: 'payables',
          title: 'Payables',
        },
        {
          id: 'receivables',
          title: 'Receivables',
        }
      ]
    },
    {
      title: 'COMPLIANCE & HR FINANCE',
      items: [
        {
          id: 'tax-compliance',
          title: 'Tax Compliance & Filing',
          subItems: [
            { id: 'tax-calendar', name: 'Tax Calendar', view: 'tax-calendar' },
            { id: 'tax-forms', name: 'Tax Forms Library', view: 'tax-forms' },
            { id: 'tax-history', name: 'Filing History', view: 'tax-history' }
          ]
        },
        {
          id: 'payroll',
          title: 'Payroll (Global)',
          subItems: [
            { id: 'employee-mgmt', name: 'Employee Management', view: 'payroll-employee-mgmt' },
            { id: 'run-payroll', name: 'Run Payroll', view: 'payroll-run' },
            { id: 'payslip-history', name: 'Payslip History', view: 'payroll-history' }
          ]
        },
        {
          id: 'expense-management',
          title: 'Expense Management',
          subItems: [
            { id: 'submit-expense', name: 'Submit Expense', view: 'expense-submit' },
            { id: 'my-expenses', name: 'My Expenses', view: 'expense-my' },
            { id: 'approval-queue', name: 'Approval Queue', view: 'expense-approval' },
            { id: 'corp-cards', name: 'Corporate Cards', view: 'expense-cards' }
          ]
        }
      ]
    }
  ]);
  
  handleTopLevelClick(viewId: string, viewTarget: string) {
    this.activeViewId.set(viewId);
    this.openSectionId.set('');
    this.viewChanged.emit(viewTarget);
  }
  
  toggleSection(sectionId: string) {
    this.openSectionId.update(currentId => (currentId === sectionId ? '' : sectionId));

    if (sectionId === 'tax-compliance') {
        this.handleSubItemClick('tax-dashboard', 'tax-dashboard', 'tax-compliance');
    }
    
    // Always navigate to payroll dashboard when payroll section header is clicked.
    if (sectionId === 'payroll') {
        this.handleSubItemClick('payroll-dashboard', 'payroll-dashboard', 'payroll');
    }

    if (sectionId === 'expense-management') {
        this.handleSubItemClick('expense-dashboard', 'expense-dashboard', 'expense-management');
    }
  }

  handleSubItemClick(subItemId: string, view: string, parentId: string) {
    this.activeViewId.set(subItemId);
    this.openSectionId.set(parentId);
    this.viewChanged.emit(view);
  }

  handleLogoClick() {
    this.handleTopLevelClick('dashboard', 'executive');
  }
}