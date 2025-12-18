import { Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-payroll-cost-by-dept-chart',
  templateUrl: './payroll-cost-by-dept-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayrollCostByDeptChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart') private chartContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;

  data = [
    { department: 'Engineering', cost: 95000 },
    { department: 'Sales & Mktg', cost: 72000 },
    { department: 'HR & Admin', cost: 30000 },
    { department: 'Operations', cost: 51500 }
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

    const x = d3.scaleBand()
      .domain(this.data.map(d => d.department))
      .range([0, width])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.cost) * 1.1])
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

    svg.selectAll('.bar')
      .data(this.data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.department))
      .attr('y', d => y(d.cost))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.cost))
      .attr('fill', '#a855f7');
  }
}