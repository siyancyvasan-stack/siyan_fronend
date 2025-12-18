import { Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-expense-monthly-trend-chart',
  templateUrl: './expense-monthly-trend-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseMonthlyTrendChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart') private chartContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;

  data = [
    { month: 'Jul', expenses: 110000 },
    { month: 'Aug', expenses: 135000 },
    { month: 'Sep', expenses: 120000 },
    { month: 'Oct', expenses: 155000 },
    { month: 'Nov', expenses: 140000 },
    { month: 'Dec', expenses: 145000 },
  ];

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

    const margin = { top: 10, right: 0, bottom: 20, left: 40 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(this.data.map(d => d.month))
      .range([0, width])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.expenses) * 1.1])
      .range([height, 0]);

    // Gradient definition
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', y(0))
      .attr('x2', 0).attr('y2', y(d3.max(this.data, d => d.expenses) * 1.1));
    
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#87CEEB'); // Sky Blue
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#00BCD4'); // Cyan

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .selectAll('text').style('font-size', '12px').style('color', '#64748b');
    svg.select('.domain').remove();

    svg.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => `₹${d / 1000}k`).tickSize(0).tickPadding(10))
      .selectAll('text').style('font-size', '12px').style('color', '#64748b');
    svg.select('.domain').remove();

    svg.selectAll('.bar')
      .data(this.data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.month))
      .attr('y', d => y(d.expenses))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.expenses))
      .attr('fill', 'url(#bar-gradient)')
      .attr('rx', 4);
  }
}