import { Component, ChangeDetectionStrategy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

declare var d3: any;

@Component({
  selector: 'app-budget-chart',
  templateUrl: './budget-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetChartComponent implements AfterViewInit {
  @ViewChild('chart') private chartContainer!: ElementRef;

  data = [
    { category: 'Marketing', budget: 100, actual: 80 },
    { category: 'IT', budget: 120, actual: 110 },
    { category: 'Sales', budget: 90, actual: 95 },
    { category: 'Ops', budget: 110, actual: 70 },
  ];

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    const element = this.chartContainer.nativeElement;
    const margin = { top: 20, right: 20, bottom: 20, left: 80 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand()
      .range([0, height])
      .domain(this.data.map(d => d.category))
      .padding(0.4);

    svg.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll('text')
      .style('font-size', '12px')
      .style('color', '#64748b');
    svg.select('.domain').remove();

    const x = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.budget)])
      .range([0, width]);

    svg.selectAll('budgetBars')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('y', d => y(d.category))
      .attr('x', x(0))
      .attr('width', d => x(d.budget))
      .attr('height', y.bandwidth())
      .attr('fill', '#38bdf8')
      .attr('opacity', 0.2);

    svg.selectAll('actualBars')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('y', d => y(d.category))
      .attr('x', x(0))
      .attr('width', d => x(d.actual))
      .attr('height', y.bandwidth())
      .attr('fill', '#38bdf8');
  }
}