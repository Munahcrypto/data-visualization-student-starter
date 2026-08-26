import { useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { useDimensions } from './useDimensions';

interface DataPoint {
  x: number;
  y: number;
}

const data: DataPoint[] = [
  { x: 132, y: 391 },
  { x: 330, y: 349 },
  { x: 410, y: 192 },
  { x: 527, y: 257 },
  { x: 688, y: 119 },
  { x: 878, y: 55 },
];

const ORIGINAL_WIDTH = 960;
const ORIGINAL_HEIGHT = 500;

export function ResponsivePseudoScatterPlot() {
  const svgRef = useRef<SVGSVGElement>(null);
  const { ref: divRef, dimensions } = useDimensions();

  useEffect(() => {
    const svg = svgRef.current;

    if (!svg || dimensions.width === 0 || dimensions.height === 0) {
      return;
    }

    const xScale = scaleLinear()
      .domain([0, ORIGINAL_WIDTH])
      .range([0, dimensions.width]);

    const yScale = scaleLinear()
      .domain([0, ORIGINAL_HEIGHT])
      .range([0, dimensions.height]);

    const colors = [
      '#ff6b6b',
      '#4ecdc4',
      '#ffd166',
      '#6c5ce7',
      '#00b894',
      '#fd79a8',
    ];

    select(svg)
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d: DataPoint) => xScale(d.x) - 30)
      .attr('y', (d: DataPoint) => yScale(d.y) - 20)
      .attr('width', 60)
      .attr('height', 40)
      .attr('rx', 10)
      .attr('fill', (_d: DataPoint, i: number) => colors[i % colors.length]);
  }, [dimensions]);

  return (
    <div ref={divRef} className="relative w-full h-full">
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Responsive visualization showing six colorful rounded rectangles"
      ></svg>
    </div>
  );
}