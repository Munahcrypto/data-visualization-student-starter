import { useEffect, useState } from 'react';

type CPIData = {
  observation_date: string;
  CPIAUCSL: number;
};

export const Week04 = () => {
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
  const height = 520;

  const margin = {
    top: 70,
    right: 40,
    bottom: 70,
    left: 80,
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

  const yTicks = [50, 100, 150, 200, 250, 300];

  const yearTicks = [
    { year: '1950', index: 36 },
    { year: '1960', index: 156 },
    { year: '1970', index: 276 },
    { year: '1980', index: 396 },
    { year: '1990', index: 516 },
    { year: '2000', index: 636 },
    { year: '2010', index: 756 },
    { year: '2020', index: 876 },
  ];

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
      <h2>U.S. Consumer Price Index Over Time</h2>

      <p style={{ maxWidth: '800px' }}>
        This chart shows the long-term rise in the U.S. Consumer Price Index
        from 1947 to 2026. The added axis labels, year markers, and reference
        lines make it easier to understand how consumer prices have changed
        over time.
      </p>

      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: '900px' }}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={margin.left}
              y1={yScale(tick)}
              x2={width - margin.right}
              y2={yScale(tick)}
              stroke="#dddddd"
              strokeWidth="1"
            />

            <text
              x={margin.left - 12}
              y={yScale(tick) + 4}
              textAnchor="end"
              fontSize="13"
            >
              {tick}
            </text>
          </g>
        ))}

        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="black"
        />

        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="black"
        />

        <polyline
          points={linePoints}
          fill="none"
          stroke="steelblue"
          strokeWidth="3"
        />

        {yearTicks.map((tick) => (
          <g key={tick.year}>
            <line
              x1={xScale(tick.index)}
              y1={height - margin.bottom}
              x2={xScale(tick.index)}
              y2={height - margin.bottom + 6}
              stroke="black"
            />

            <text
              x={xScale(tick.index)}
              y={height - margin.bottom + 24}
              textAnchor="middle"
              fontSize="13"
            >
              {tick.year}
            </text>
          </g>
        ))}

        <text
          x={width / 2}
          y={height - 20}
          textAnchor="middle"
          fontSize="15"
        >
          Year
        </text>

        <text
          x="22"
          y={height / 2}
          textAnchor="middle"
          fontSize="15"
          transform={`rotate(-90 22 ${height / 2})`}
        >
          Consumer Price Index (CPI)
        </text>

        <text
          x={margin.left}
          y={margin.top - 25}
          fontSize="13"
        >
          Higher values indicate higher average consumer prices.
        </text>
      </svg>

      <p>
        Source: U.S. Bureau of Labor Statistics via FRED.
      </p>
    </div>
  );
};
