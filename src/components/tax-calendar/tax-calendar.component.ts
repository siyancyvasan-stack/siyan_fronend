import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// 1. Data Model
interface TaxEvent {
  id: number;
  formName: string;
  jurisdiction: string;
  dueDate: Date;
  filedDate?: Date;
  status: 'Filed' | 'Upcoming' | 'Overdue';
  description?: string;
}

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: TaxEvent[];
}

@Component({
  selector: 'app-tax-calendar',
  templateUrl: './tax-calendar.component.html',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaxCalendarComponent {

  constructor(private fb: FormBuilder) {}

  // --- STATE MANAGEMENT ---
  currentDate = signal(new Date());
  selectedDay = signal<CalendarDay | null>(null);
  activeFilters = signal<('Upcoming' | 'Overdue')[]>(['Upcoming', 'Overdue']);
  isAddEventModalOpen = signal(false);
  
  // --- ADD EVENT FORM ---
  addEventForm = this.fb.group({
    formName: ['', Validators.required],
    jurisdiction: ['', Validators.required],
    dueDate: ['', Validators.required],
    description: ['']
  });

  // 2. Mock Data
  taxEvents = signal<TaxEvent[]>([
    { id: 1, formName: 'Form 941', jurisdiction: 'Federal', dueDate: new Date(2024, 6, 31), status: 'Upcoming', description: 'Quarterly Federal Tax Return' },
    { id: 2, formName: 'CA Sales Tax', jurisdiction: 'California', dueDate: new Date(2024, 6, 20), status: 'Upcoming', description: 'Q2 Sales & Use Tax' },
    { id: 3, formName: 'Form W-2', jurisdiction: 'Federal', dueDate: new Date(2024, 5, 28), status: 'Filed', filedDate: new Date(2024, 5, 25), description: 'Annual Wage and Tax Statement' },
    { id: 4, formName: 'VAT Return Q2', jurisdiction: 'United Kingdom', dueDate: new Date(2024, 7, 7), status: 'Upcoming' },
    { id: 5, formName: 'Corporate Tax Est.', jurisdiction: 'Federal', dueDate: new Date(2024, 8, 15), status: 'Upcoming' },
    { id: 6, formName: 'NY IT-204-LL', jurisdiction: 'New York', dueDate: new Date(2024, 2, 15), status: 'Filed', filedDate: new Date(2024, 2, 12)},
    { id: 7, formName: 'TX Franchise Tax', jurisdiction: 'Texas', dueDate: new Date(2024, 4, 15), status: 'Overdue', description: 'Annual franchise tax report.' },
    { id: 8, formName: 'Q1 Payroll Tax', jurisdiction: 'Federal', dueDate: new Date(2024, 3, 30), status: 'Filed', filedDate: new Date(2024, 3, 28)},
    { id: 9, formName: 'Form 1120', jurisdiction: 'Federal', dueDate: new Date(2024, 3, 15), status: 'Filed', filedDate: new Date(2024, 3, 10)},
    { id: 10, formName: 'DE Franchise Tax', jurisdiction: 'Delaware', dueDate: new Date(), status: 'Upcoming'},
    { id: 11, formName: 'Monthly Payroll', jurisdiction: 'Federal', dueDate: new Date(new Date().setDate(new Date().getDate() - 15)), status: 'Filed', filedDate: new Date(new Date().setDate(new Date().getDate() - 15))},
    { id: 12, formName: 'Local Business Tax', jurisdiction: 'City', dueDate: new Date(2024, 4, 1), status: 'Overdue' },
  ]);

  // --- COMPUTED DATA FOR CARDS ---
  upcomingCount = computed(() => this.taxEvents().filter(e => e.status === 'Upcoming').length);
  overdueCount = computed(() => this.taxEvents().filter(e => e.status === 'Overdue').length);
  filingsLast30DaysCount = computed(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.taxEvents().filter(e => e.status === 'Filed' && e.filedDate && e.filedDate > thirtyDaysAgo).length;
  });
  complianceRate = computed(() => {
    const filedCount = this.taxEvents().filter(e => e.status === 'Filed').length;
    const overdueCount = this.taxEvents().filter(e => e.status === 'Overdue').length;
    const total = filedCount + overdueCount;
    if (total === 0) return 100;
    const rate = (filedCount / total) * 100;
    return parseFloat(rate.toFixed(1));
  });

  // --- COMPUTED DATA FOR CALENDAR ---
  private filteredEvents = computed(() => {
    const filters = this.activeFilters();
    return this.taxEvents().filter(event => event.status === 'Filed' || filters.includes(event.status));
  });

  calendarGrid = computed<CalendarDay[]>(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const events = this.filteredEvents();

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
        return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === i;
      });
      grid.push({ date: currentDate, dayOfMonth: i, isCurrentMonth: true, isToday, events: dayEvents });
    }
    
    while (grid.length < 42) {
      const lastDayInGrid = grid[grid.length - 1].date;
      const nextDay = new Date(lastDayInGrid);
      nextDay.setDate(lastDayInGrid.getDate() + 1);
      grid.push({ date: nextDay, dayOfMonth: nextDay.getDate(), isCurrentMonth: false, isToday: false, events: [] });
    }
    
    return grid;
  });

  recentFilings = computed(() => 
    this.taxEvents()
      .filter(e => e.status === 'Filed' && e.filedDate)
      .sort((a, b) => b.filedDate!.getTime() - a.filedDate!.getTime())
      .slice(0, 5)
  );
  
  upcomingForMonth = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    return this.taxEvents()
      .filter(e => e.status !== 'Filed' && e.dueDate.getFullYear() === year && e.dueDate.getMonth() === month)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  });

  // --- USER ACTIONS ---
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

  toggleFilter(filter: 'Upcoming' | 'Overdue'): void {
    this.activeFilters.update(filters => {
      const newFilters = new Set(filters);
      if (newFilters.has(filter)) {
        newFilters.delete(filter);
      } else {
        newFilters.add(filter);
      }
      return Array.from(newFilters) as ('Upcoming' | 'Overdue')[];
    });
  }
  
  closeModals() {
    this.isAddEventModalOpen.set(false);
  }
  
  onAddEventSubmit() {
    if (this.addEventForm.invalid) {
      return;
    }
    const newEvent: TaxEvent = {
      id: Date.now(), // simple unique id
      formName: this.addEventForm.value.formName!,
      jurisdiction: this.addEventForm.value.jurisdiction!,
      dueDate: new Date(this.addEventForm.value.dueDate!),
      description: this.addEventForm.value.description || '',
      status: 'Upcoming'
    };
    this.taxEvents.update(events => [...events, newEvent]);
    this.addEventForm.reset();
    this.closeModals();
  }

  markAsFiled(eventId: number) {
    this.taxEvents.update(events => 
      events.map(event => 
        event.id === eventId 
          ? { ...event, status: 'Filed', filedDate: new Date() } 
          : event
      )
    );
     // Reselect day to update details view
    if (this.selectedDay()) {
       this.selectedDay.update(day => {
        if (!day) return null;
        const updatedEvents = day.events.map(event => 
          event.id === eventId 
            ? { ...event, status: 'Filed', filedDate: new Date() } 
            : event
        );
        return {...day, events: updatedEvents};
      });
    }
  }

  getEventColor(status: TaxEvent['status']): string {
    switch(status) {
      case 'Filed': return 'bg-green-500';
      case 'Upcoming': return 'bg-amber-500';
      case 'Overdue': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  }
}
