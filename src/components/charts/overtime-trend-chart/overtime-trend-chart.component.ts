import { Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-overtime-trend-chart',
  templateUrl: './overtime-trend-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OvertimeTrendChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart') private chartContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;

  data = [
    { month: 'Jan', hours: 450 },
    { month: 'Feb', hours: 420 },
    { month: 'Mar', hours: 480 },
    { month: 'Apr', hours: 460 },
    { month: 'May', hours: 500 },
    { month: 'Jun', hours: 512 }
  ];

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
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
    if (!element || element.offsetWidth === 0) return;
    
    d3.select(element).selectAll('svg').remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
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
      .domain([d3.min(this.data, d => d.hours) * 0.9, d3.max(this.data, d => d.hours) * 1.05])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .selectAll('text').style('font-size', '12px').style('color', '#64748b');
    svg.selectAll('.domain').remove();

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}h`).tickSize(-width))
      .selectAll('text').style('font-size', '12px').style('color', '#64748b');
    
    svg.selectAll('.tick line').style('stroke', '#e2e8f0');
    svg.selectAll('.domain').remove();

    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.hours))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', '#f472b6')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    svg.selectAll('.dot')
      .data(this.data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.month))
      .attr('cy', d => y(d.hours))
      .attr('r', 4)
      .attr('fill', '#f472b6');
  }
}