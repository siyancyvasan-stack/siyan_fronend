import { Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-employee-distribution-chart',
  templateUrl: './employee-distribution-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDistributionChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chart') private chartContainer!: ElementRef;
  private resizeObserver!: ResizeObserver;

  data = [
    { name: 'Engineering', value: 65 },
    { name: 'Sales & Mktg', value: 42 },
    { name: 'HR & Admin', value: 18 },
    { name: 'Operations', value: 33 },
  ];
  
  colors = ['#a855f7', '#0ea5e9', '#ec4899', '#22d3ee']; // purple, sky, pink, cyan

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

    const width = 180;
    const height = 180;
    const margin = 10;

    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const colorScale = d3.scaleOrdinal()
      .domain(this.data.map(d => d.name))
      .range(this.colors);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const data_ready = pie(this.data);

    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);

    svg.selectAll('path')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.name))
      .attr('stroke', 'white')
      .style('stroke-width', '3px');
  }
}