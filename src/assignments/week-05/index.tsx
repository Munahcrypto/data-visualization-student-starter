import { useEffect, useState } from 'react';

type CPIData = {
  observation_date: string;
  CPIAUCSL: number;
};

type Period = {
  label: string;
  start: string;
  end: string;
};

const periods: Period[] = [
  { label: 'All Years', start: '1947-01-01', end: '2026-12-31' },
  { label: '1970s Inflation', start: '1970-01-01', end: '1982-12-31' },
  { label: '2008 Crisis', start: '2007-01-01', end: '2010-12-31' },
  { label: 'COVID-19', start: '2020-01-01', end: '2021-12-31' },
  { label: 'Post-COVID', start: '2022-01-01', end: '2026-12-31' },
];

export const Week05 = () => {
  const [data, setData] = useState<CPIData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('All Years');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

  const activePeriod =
    periods.find((period) => period.label === selectedPeriod) ?? periods[0];

  const filteredData = data.filter(
    (d) =>
      d.observation_date >= activePeriod.start &&
      d.observation_date <= activePeriod.end,
  );

  if (filteredData.length === 0) {
    return <div>No CPI data available for this period.</div>;
  }

  const width = 1000;
  const height = 560;

  const margin = {
    top: 60,
    right: 45,
    bottom: 80,
    left: 85,
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const values = filteredData.map((d) => d.CPIAUCSL);

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  const padding = Math.max((rawMax - rawMin) * 0.1, 5);

  const minValue = Math.max(0, rawMin - padding);
  const maxValue = rawMax + padding;

  const xScale = (index: number) => {
    if (filteredData.length === 1) {
      return margin.left + chartWidth / 2;
    }

    return (
      margin.left +
      (index / (filteredData.length - 1)) * chartWidth
    );
  };

  const yScale = (value: number) =>
    margin.top +
    chartHeight -
    ((value - minValue) / (maxValue - minValue)) * chartHeight;

  const linePoints = filteredData
    .map((d, index) => `${xScale(index)},${yScale(d.CPIAUCSL)}`)
    .join(' ');

  const yTicks = Array.from({ length: 6 }, (_, i) => {
    return minValue + ((maxValue - minValue) / 5) * i;
  });

  const xTickCount = Math.min(8, filteredData.length);

  const xTicks = Array.from({ length: xTickCount }, (_, i) => {
    const index =
      xTickCount === 1
        ? 0
        : Math.round(
            (i / (xTickCount - 1)) * (filteredData.length - 1),
          );

    return {
      index,
      label: filteredData[index].observation_date.slice(0, 4),
    };
  });

  const handleMouseMove = (
    event: React.MouseEvent<SVGRectElement>,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX =
      ((event.clientX - rect.left) / rect.width) * width;

    const relativeX = mouseX - margin.left;

    const percentage = relativeX / chartWidth;

    const index = Math.round(
      percentage * (filteredData.length - 1),
    );

    const safeIndex = Math.max(
      0,
      Math.min(filteredData.length - 1, index),
    );

    setHoveredIndex(safeIndex);
  };

  const hoveredData =
    hoveredIndex !== null ? filteredData[hoveredIndex] : null;

  const hoveredX =
    hoveredIndex !== null ? xScale(hoveredIndex) : 0;

  const hoveredY =
    hoveredData !== null ? yScale(hoveredData.CPIAUCSL) : 0;

  const firstValue = filteredData[0].CPIAUCSL;
  const lastValue =
    filteredData[filteredData.length - 1].CPIAUCSL;

  const percentChange =
    ((lastValue - firstValue) / firstValue) * 100;

  return (
    <div
      style={{
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1150px',
        margin: '0 auto',
      }}
    >
      <h2 style={{ marginBottom: '8px' }}>
        Interactive U.S. Consumer Price Index Explorer
      </h2>

      <p
        style={{
          maxWidth: '900px',
          lineHeight: 1.6,
          marginTop: 0,
        }}
      >
        Explore how U.S. consumer prices have changed over time.
        Select an economic period below, then move your mouse across
        the chart to inspect individual monthly CPI observations.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginTop: '22px',
          marginBottom: '20px',
        }}
      >
        {periods.map((period) => (
          <button
            key={period.label}
            onClick={() => {
              setSelectedPeriod(period.label);
              setHoveredIndex(null);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border:
                selectedPeriod === period.label
                  ? '2px solid #2563eb'
                  : '1px solid #bbb',
              background:
                selectedPeriod === period.label
                  ? '#2563eb'
                  : 'white',
              color:
                selectedPeriod === period.label
                  ? 'white'
                  : '#222',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        >
          <strong>Period:</strong> {selectedPeriod}
        </div>

        <div
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        >
          <strong>Start CPI:</strong> {firstValue.toFixed(1)}
        </div>

        <div
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        >
          <strong>End CPI:</strong> {lastValue.toFixed(1)}
        </div>

        <div
          style={{
            padding: '10px 15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        >
          <strong>Change:</strong>{' '}
          {percentChange >= 0 ? '+' : ''}
          {percentChange.toFixed(1)}%
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          maxWidth: '1000px',
        }}
      >
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{
            display: 'block',
            overflow: 'visible',
          }}
        >
          {/* Horizontal reference lines */}
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
                {tick.toFixed(0)}
              </text>
            </g>
          ))}

          {/* X-axis year labels */}
          {xTicks.map((tick) => (
            <g key={`${tick.index}-${tick.label}`}>
              <line
                x1={xScale(tick.index)}
                y1={height - margin.bottom}
                x2={xScale(tick.index)}
                y2={height - margin.bottom + 6}
                stroke="#555"
              />

              <text
                x={xScale(tick.index)}
                y={height - margin.bottom + 25}
                textAnchor="middle"
                fontSize="13"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Y-axis */}
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={height - margin.bottom}
            stroke="#333"
            strokeWidth="1.5"
          />

          {/* X-axis */}
          <line
            x1={margin.left}
            y1={height - margin.bottom}
            x2={width - margin.right}
            y2={height - margin.bottom}
            stroke="#333"
            strokeWidth="1.5"
          />

          {/* CPI line */}
          <polyline
            points={linePoints}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Interactive hover elements */}
          {hoveredData && hoveredIndex !== null && (
            <>
              <line
                x1={hoveredX}
                y1={margin.top}
                x2={hoveredX}
                y2={height - margin.bottom}
                stroke="#555"
                strokeWidth="1"
                strokeDasharray="5 5"
                pointerEvents="none"
              />

              <circle
                cx={hoveredX}
                cy={hoveredY}
                r="7"
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth="4"
                pointerEvents="none"
              />

              <g
                transform={`translate(${
                  hoveredX > width - 260
                    ? hoveredX - 185
                    : hoveredX + 15
                }, ${Math.max(
                  margin.top + 5,
                  hoveredY - 75,
                )})`}
                pointerEvents="none"
              >
                <rect
                  width="170"
                  height="62"
                  rx="8"
                  fill="#111827"
                  opacity="0.95"
                />

                <text
                  x="12"
                  y="24"
                  fill="white"
                  fontSize="13"
                  fontWeight="bold"
                >
                  {new Date(
                    `${hoveredData.observation_date}T00:00:00`,
                  ).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </text>

                <text
                  x="12"
                  y="46"
                  fill="white"
                  fontSize="14"
                >
                  CPI: {hoveredData.CPIAUCSL.toFixed(2)}
                </text>
              </g>
            </>
          )}

          {/* Transparent interaction layer */}
          <rect
            x={margin.left}
            y={margin.top}
            width={chartWidth}
            height={chartHeight}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
          />

          {/* X-axis title */}
          <text
            x={margin.left + chartWidth / 2}
            y={height - 20}
            textAnchor="middle"
            fontSize="15"
            fontWeight="bold"
          >
            Year
          </text>

          {/* Y-axis title */}
          <text
            transform={`translate(22 ${
              margin.top + chartHeight / 2
            }) rotate(-90)`}
            textAnchor="middle"
            fontSize="15"
            fontWeight="bold"
          >
            Consumer Price Index (CPI)
          </text>
        </svg>
      </div>

      <div
        style={{
          maxWidth: '900px',
          marginTop: '15px',
          padding: '16px',
          background: '#f5f7fa',
          borderRadius: '8px',
          lineHeight: 1.5,
        }}
      >
        <strong>How to explore:</strong> Choose one of the economic
        periods above to zoom into that part of U.S. inflation
        history. Hover anywhere over the line to see the CPI value
        for a specific month. The summary cards automatically update
        to show how prices changed during the selected period.
      </div>

      <p
        style={{
          marginTop: '18px',
          fontSize: '14px',
        }}
      >
        Source: U.S. Bureau of Labor Statistics via FRED.
      </p>
    </div>
  );
};
