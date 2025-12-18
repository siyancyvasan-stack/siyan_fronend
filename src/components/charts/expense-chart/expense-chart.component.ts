import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-expense-chart',
  templateUrl: './expense-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseChartComponent implements AfterViewInit {
  @ViewChild('chart') private chartContainer!: ElementRef;

  data = [
    { category: 'Operations', value: 40 },
    { category: 'IT Infrastructure', value: 25 },
    { category: 'Marketing', value: 20 },
    { category: 'Human Resources', value: 15 },
  ];
  
  colors = ['#0ea5e9', '#a855f7', '#ec4899', '#22d3ee']; // sky, purple, pink, cyan

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    const width = 250;
    const height = 250;
    const margin = 20;

    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const colorScale = d3.scaleOrdinal()
      .domain(this.data.map(d => d.category))
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
      .attr('fill', d => colorScale(d.data.category))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');
  }
}