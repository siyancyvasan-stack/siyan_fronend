import { Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-monthly-payroll-trend-chart',
  templateUrl: './monthly-payroll-trend-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyPayrollTrendChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart') private chartContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;

  data = [
    { month: 'Jan', cost: 220000 },
    { month: 'Feb', cost: 235000 },
    { month: 'Mar', cost: 230000 },
    { month: 'Apr', cost: 245000 },
    { month: 'May', cost: 240000 },
    { month: 'Jun', cost: 248500 }
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

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(this.data.map(d => d.month))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(this.data, d => d.cost) * 0.95, d3.max(this.data, d => d.cost) * 1.02])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .selectAll('text')
      .style('font-size', '12px')
      .style('color', '#64748b');
    svg.selectAll('.domain').remove();

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d / 1000}k`).tickSize(-width))
      .selectAll('text')
      .style('font-size', '12px')
      .style('color', '#64748b');
    
    svg.selectAll('.tick line').style('stroke', '#e2e8f0');
    svg.selectAll('.domain').remove();

    const area = d3.area()
      .x(d => x(d.month))
      .y0(height)
      .y1(d => y(d.cost))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(this.data)
      .attr('fill', '#ecfeff')
      .attr('d', area);

    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.cost))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    svg.selectAll('.dot')
      .data(this.data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.month))
      .attr('cy', d => y(d.cost))
      .attr('r', 4)
      .attr('fill', '#06b6d4');
  }
}
