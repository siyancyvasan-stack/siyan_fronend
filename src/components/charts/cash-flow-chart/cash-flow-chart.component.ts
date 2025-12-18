import { Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-cash-flow-chart',
  templateUrl: './cash-flow-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashFlowChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart') private chartContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;

  data = [
    { day: 'Mon', inflow: 5000, outflow: 3000 },
    { day: 'Tue', inflow: 6000, outflow: 2400 },
    { day: 'Wed', inflow: 5500, outflow: 4500 },
    { day: 'Thu', inflow: 7500, outflow: 3000 },
    { day: 'Fri', inflow: 8000, outflow: 5000 },
    { day: 'Sat', inflow: 7000, outflow: 4400 },
    { day: 'Sun', inflow: 7200, outflow: 5500 },
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

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(this.data.map(d => d.day))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => Math.max(d.inflow, d.outflow)) * 1.1])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .selectAll('text')
      .style('font-size', '12px')
      .style('color', '#64748b');
    svg.selectAll('.domain').remove();

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d / 1000}k`).tickSize(-width))
      .selectAll('text')
      .style('font-size', '12px')
      .style('color', '#64748b');
    
    svg.selectAll('.tick line').style('stroke', '#e2e8f0');
    svg.selectAll('.domain').remove();

    const areaInflow = d3.area()
      .x(d => x(d.day))
      .y0(height)
      .y1(d => y(d.inflow));

    const areaOutflow = d3.area()
      .x(d => x(d.day))
      .y0(height)
      .y1(d => y(d.outflow));
      
    svg.append('path')
      .datum(this.data)
      .attr('fill', '#bae6fd') // sky-200
      .attr('d', areaInflow);
      
    svg.append('path')
      .datum(this.data)
      .attr('fill', '#fbcfe8') // pink-200
      .attr('d', areaOutflow);

    const lineInflow = d3.line()
      .x(d => x(d.day))
      .y(d => y(d.inflow));
      
    const lineOutflow = d3.line()
      .x(d => x(d.day))
      .y(d => y(d.outflow));

    svg.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#0ea5e9') // sky-500
      .attr('stroke-width', 2.5)
      .attr('d', lineInflow);
      
    svg.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#ec4899') // pink-500
      .attr('stroke-width', 2.5)
      .attr('d', lineOutflow);

    svg.selectAll('.dot-inflow')
      .data(this.data)
      .enter().append('circle')
      .attr('class', 'dot-inflow')
      .attr('cx', d => x(d.day))
      .attr('cy', d => y(d.inflow))
      .attr('r', 4)
      .attr('fill', '#0ea5e9'); // sky-500

    svg.selectAll('.dot-outflow')
      .data(this.data)
      .enter().append('circle')
      .attr('class', 'dot-outflow')
      .attr('cx', d => x(d.day))
      .attr('cy', d => y(d.outflow))
      .attr('r', 4)
      .attr('fill', '#ec4899'); // pink-500
  }
}