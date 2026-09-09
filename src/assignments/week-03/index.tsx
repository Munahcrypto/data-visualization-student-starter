import { useEffect, useState } from 'react';

type CPIData = {
  observation_date: string;
  CPIAUCSL: number;
};

export const Week03 = () => {
  const [data, setData] = useState<CPIData[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/cpi/CPIAUCSL.csv`)
      .then((response) => response.text())
      .then((text) => {
        const lines = text.trim().split('\n');

        const rows = lines
          .slice(1)
          .map((line) => {
            const [observation_date, value] = line.split(',');

            return {
              observation_date,
              CPIAUCSL: Number(value),
            };
          })
          .filter(
            (row) =>
              row.observation_date &&
              !Number.isNaN(row.CPIAUCSL) &&
              row.CPIAUCSL > 0,
          );

        setData(rows);
      });
  }, []);

  if (data.length === 0) {
    return <div>Loading CPI data...</div>;
  }

  const width = 900;
  const height = 500;
  const margin = {
    top: 40,
    right: 30,
    bottom: 60,
    left: 70,
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const values = data.map((d) => d.CPIAUCSL);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const xScale = (index: number) =>
    margin.left + (index / (data.length - 1)) * chartWidth;

  const yScale = (value: number) =>
    margin.top +
    chartHeight -
    ((value - minValue) / (maxValue - minValue)) * chartHeight;

  const linePoints = data
    .map((d, index) => `${xScale(index)},${yScale(d.CPIAUCSL)}`)
    .join(' ');

  return (
    <div>
      <h2>U.S. Consumer Price Index Over Time</h2>

      <p>
        This line chart shows how the U.S. Consumer Price Index (CPI) has
        changed over time using monthly data from FRED.
      </p>

      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: '900px' }}
      >
        {/* Y axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="black"
        />

        {/* X axis */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="black"
        />

        {/* CPI line */}
        <polyline
          points={linePoints}
          fill="none"
          stroke="steelblue"
          strokeWidth="3"
        />

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 15}
          textAnchor="middle"
        >
          Year
        </text>

        <text
          x="20"
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90 20 ${height / 2})`}
        >
          Consumer Price Index (CPI)
        </text>

        {/* Start date */}
        <text
          x={margin.left}
          y={height - margin.bottom + 25}
          textAnchor="middle"
          fontSize="14"
        >
          {data[0].observation_date.substring(0, 4)}
        </text>

        {/* End date */}
        <text
          x={width - margin.right}
          y={height - margin.bottom + 25}
          textAnchor="middle"
          fontSize="14"
        >
          {data[data.length - 1].observation_date.substring(0, 4)}
        </text>

        {/* Minimum CPI */}
        <text
          x={margin.left - 10}
          y={height - margin.bottom}
          textAnchor="end"
          fontSize="14"
        >
          {minValue.toFixed(0)}
        </text>

        {/* Maximum CPI */}
        <text
          x={margin.left - 10}
          y={margin.top + 5}
          textAnchor="end"
          fontSize="14"
        >
          {maxValue.toFixed(0)}
        </text>
      </svg>

      <p>
        Source: U.S. Bureau of Labor Statistics via FRED.
      </p>
    </div>
  );
};
