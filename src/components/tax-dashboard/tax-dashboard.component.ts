import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TaxLiabilityChartComponent } from '../charts/tax-liability-chart/tax-liability-chart.component';

// Data Models
interface TaxEvent {
  id: number;
  formName: string;
  jurisdiction: string;
  dueDate: Date;
  status: 'Upcoming' | 'Overdue' | 'Filed';
  liabilityType: 'Payroll' | 'Corporate' | 'Expense';
  amount: number;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: TaxEvent[];
}

@Component({
  selector: 'app-tax-dashboard',
  templateUrl: './tax-dashboard.component.html',
  imports: [CurrencyPipe, TaxLiabilityChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaxDashboardComponent {
  // --- STATE MANAGEMENT ---
  currentDate = signal(new Date());
  selectedDay = signal<CalendarDay | null>(null);

  // --- MOCK DATA ---
  taxEvents = signal<TaxEvent[]>([
    { id: 1, formName: 'Form 941', jurisdiction: 'Federal', dueDate: new Date(2024, 6, 31), status: 'Upcoming', liabilityType: 'Payroll', amount: 45000 },
    { id: 2, formName: 'CA Sales Tax', jurisdiction: 'California', dueDate: new Date(2024, 6, 20), status: 'Upcoming', liabilityType: 'Expense', amount: 12500 },
    { id: 3, formName: 'Form W-2', jurisdiction: 'Federal', dueDate: new Date(2024, 5, 28), status: 'Filed', liabilityType: 'Payroll', amount: 0 },
    { id: 4, formName: 'VAT Return Q2', jurisdiction: 'UK', dueDate: new Date(2024, 7, 7), status: 'Upcoming', liabilityType: 'Corporate', amount: 18000 },
    { id: 5, formName: 'Form 1120', jurisdiction: 'Federal', dueDate: new Date(2024, 3, 15), status: 'Filed', liabilityType: 'Corporate', amount: 0 },
    { id: 6, formName: 'TX Franchise Tax', jurisdiction: 'Texas', dueDate: new Date(2024, 4, 15), status: 'Overdue', liabilityType: 'Corporate', amount: 5000 },
    { id: 7, formName: 'Q1 Payroll Tax', jurisdiction: 'Federal', dueDate: new Date(2024, 3, 30), status: 'Filed', liabilityType: 'Payroll', amount: 0 },
    { id: 8, formName: 'DE Franchise Tax', jurisdiction: 'Delaware', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)), status: 'Upcoming', liabilityType: 'Corporate', amount: 350 },
    { id: 9, formName: 'Local Business Tax', jurisdiction: 'City', dueDate: new Date(2024, 4, 1), status: 'Overdue', liabilityType: 'Corporate', amount: 800 },
    { id: 10, formName: 'Form 941', jurisdiction: 'Federal', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'Overdue', liabilityType: 'Payroll', amount: 45000 },
  ]);

  // --- COMPUTED DATA FOR KPIs ---
  upcomingCount = computed(() => this.taxEvents().filter(e => e.status === 'Upcoming').length);
  overdueCount = computed(() => this.taxEvents().filter(e => e.status === 'Overdue').length);
  estimatedLiability = computed(() => this.taxEvents().filter(e => e.status !== 'Filed').reduce((sum, e) => sum + e.amount, 0));
  
  complianceScore = computed(() => {
    const filed = this.taxEvents().filter(e => e.status === 'Filed').length;
    const overdue = this.taxEvents().filter(e => e.status === 'Overdue').length;
    const totalRelevant = filed + overdue;
    if (totalRelevant === 0) return 100;
    return Math.round((filed / totalRelevant) * 100);
  });

  // --- COMPUTED DATA FOR UI ---
  calendarGrid = computed<CalendarDay[]>(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const events = this.taxEvents();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const lastDateOfMonth = lastDayOfMonth.getDate();

    const grid: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDate = new Date(year, month, 1 - i);
      grid.push({ date: prevMonthDate, dayOfMonth: prevMonthDate.getDate(), isCurrentMonth: false, isToday: false, events: [] });
    }

    for (let i = 1; i <= lastDateOfMonth; i++) {
      const currentDate = new Date(year, month, i);
      const isToday = currentDate.getTime() === today.getTime();
      const dayEvents = events.filter(e => {
        const eventDate = new Date(e.dueDate);
        eventDate.setHours(0,0,0,0);
        return eventDate.getTime() === currentDate.getTime();
      });
      grid.push({ date: currentDate, dayOfMonth: i, isCurrentMonth: true, isToday, events: dayEvents });
    }
    
    const nextMonthDays = 42 - grid.length;
    for(let i=1; i<= nextMonthDays; i++) {
       const nextMonthDate = new Date(year, month + 1, i);
       grid.push({ date: nextMonthDate, dayOfMonth: nextMonthDate.getDate(), isCurrentMonth: false, isToday: false, events: [] });
    }
    
    return grid;
  });

  urgentDeadlines = computed(() => 
    this.taxEvents()
      .filter(e => e.status === 'Upcoming' || e.status === 'Overdue')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 4)
  );
  
  recentActivity = computed(() => 
     this.taxEvents()
      .filter(e => e.status === 'Filed')
      .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
      .slice(0, 5)
  );

  // --- UI ACTIONS ---
  previousMonth(): void {
    this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.selectedDay.set(null);
  }

  nextMonth(): void {
    this.currentDate.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.selectedDay.set(null);
  }

  selectDay(day: CalendarDay): void {
    if (day.isCurrentMonth && day.events.length > 0) {
       this.selectedDay.set(day);
    }
  }

  // --- HELPERS ---
  getEventDotColor(status: TaxEvent['status']): string {
    switch(status) {
      case 'Filed': return 'bg-green-500';
      case 'Upcoming': return 'bg-amber-500';
      case 'Overdue': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  }
}