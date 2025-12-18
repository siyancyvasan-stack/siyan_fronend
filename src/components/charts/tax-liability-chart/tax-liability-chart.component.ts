import { Component, ChangeDetectionStrategy, signal, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-tax-liability-chart',
  templateUrl: './tax-liability-chart.component.html',
  // FIX: Added OnPush change detection strategy for performance.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaxLiabilityChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart') private chartContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;
  
  data = signal([
    { type: 'Payroll Taxes', value: 60 },
    { type: 'Expense-related Taxes', value: 25 },
    { type: 'Corporate/Other', value: 15 },
  ]);
  
  colors = signal(['#6366f1', '#a5b4fc', '#e0e7ff']);

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
        this.createChart();
      });
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;
     if (!element || element.offsetWidth === 0) {
      return;
    }
    d3.select(element).selectAll('svg').remove();

    const width = 150;
    const height = 150;
    const margin = 10;

    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const colorScale = d3.scaleOrdinal()
      .domain(this.data().map(d => d.type))
      .range(this.colors());

    const pie = d3.pie()
      .value((d: any) => d.value)
      .sort(null);

    const data_ready = pie(this.data());

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    svg.selectAll('path')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => colorScale(d.data.type))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');
  }
}
