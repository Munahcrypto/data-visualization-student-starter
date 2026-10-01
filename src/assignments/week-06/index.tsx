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

export const Week06 = () => {
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
    return <div style={{ padding: '40px' }}>Loading economic data...</div>;
  }

  const activePeriod =
    periods.find((period) => period.label === selectedPeriod) ?? periods[0];

  const filteredData = data.filter(
    (d) =>
      d.observation_date >= activePeriod.start &&
      d.observation_date <= activePeriod.end,
  );

  if (filteredData.length === 0) {
    return <div>No data available for this period.</div>;
  }

  const width = 1000;
  const height = 500;

  const margin = {
    top: 40,
    right: 40,
    bottom: 70,
    left: 80,
  };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const values = filteredData.map((d) => d.CPIAUCSL);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const xScale = (index: number) =>
    margin.left +
    (index / Math.max(filteredData.length - 1, 1)) * chartWidth;

  const yScale = (value: number) =>
    margin.top +
    chartHeight -
    ((value - minValue) / Math.max(maxValue - minValue, 1)) * chartHeight;

  const linePoints = filteredData
    .map((d, index) => `${xScale(index)},${yScale(d.CPIAUCSL)}`)
    .join(' ');

  const startCPI = filteredData[0].CPIAUCSL;
  const endCPI = filteredData[filteredData.length - 1].CPIAUCSL;
  const change = ((endCPI - startCPI) / startCPI) * 100;

  const hoveredData =
    hoveredIndex !== null ? filteredData[hoveredIndex] : null;

  const xTicks = Array.from({ length: 6 }, (_, i) => {
    const index = Math.round(
      (i / 5) * Math.max(filteredData.length - 1, 0),
    );

    return {
      index,
      year: filteredData[index]?.observation_date.slice(0, 4),
    };
  });

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    return minValue + ((maxValue - minValue) / 4) * i;
  });

  const cardStyle = {
    flex: '1',
    minWidth: '180px',
    padding: '20px',
    border: '1px solid #d9dee7',
    borderRadius: '12px',
    background: '#ffffff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  };

  const buttonStyle = (active: boolean) => ({
    padding: '10px 16px',
    borderRadius: '8px',
    border: active ? '1px solid #2563eb' : '1px solid #d1d5db',
    background: active ? '#2563eb' : '#ffffff',
    color: active ? '#ffffff' : '#111827',
    cursor: 'pointer',
    fontWeight: 600,
  });

  return (
    <div
      style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '36px',
        fontFamily: 'Arial, sans-serif',
        color: '#111827',
      }}
    >
      <div style={{ marginBottom: '30px' }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '1.5px',
            color: '#2563eb',
            marginBottom: '8px',
          }}
        >
          PROJECT V1 · WEEK 6
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: '34px',
          }}
        >
          U.S. Economic Conditions Dashboard
        </h1>

        <p
          style={{
            maxWidth: '850px',
            lineHeight: 1.6,
            color: '#4b5563',
            fontSize: '16px',
          }}
        >
          Explore how U.S. economic conditions have changed over time.
          This first version builds on the interactive CPI explorer and
          begins developing a broader dashboard for studying inflation,
          interest rates, and consumer spending.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '25px',
        }}
      >
        {periods.map((period) => (
          <button
            key={period.label}
            onClick={() => {
              setSelectedPeriod(period.label);
              setHoveredIndex(null);
            }}
            style={buttonStyle(selectedPeriod === period.label)}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div style={cardStyle}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#6b7280',
              marginBottom: '8px',
            }}
          >
            SELECTED PERIOD
          </div>

          <div style={{ fontSize: '22px', fontWeight: 700 }}>
            {selectedPeriod}
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#6b7280',
              marginBottom: '8px',
            }}
          >
            START CPI
          </div>

          <div style={{ fontSize: '26px', fontWeight: 700 }}>
            {startCPI.toFixed(1)}
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#6b7280',
              marginBottom: '8px',
            }}
          >
            END CPI
          </div>

          <div style={{ fontSize: '26px', fontWeight: 700 }}>
            {endCPI.toFixed(1)}
          </div>
        </div>

        <div style={cardStyle}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#6b7280',
              marginBottom: '8px',
            }}
          >
            CPI CHANGE
          </div>

          <div style={{ fontSize: '26px', fontWeight: 700 }}>
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}%
          </div>
        </div>
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
          padding: '24px',
          background: '#ffffff',
        }}
      >
        <div style={{ marginBottom: '5px' }}>
          <h2 style={{ marginBottom: '6px' }}>
            Consumer Price Index
          </h2>

          <p
            style={{
              marginTop: 0,
              color: '#6b7280',
            }}
          >
            Move your mouse across the chart to inspect monthly
            observations.
          </p>
        </div>

        <svg
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          style={{
            maxWidth: '1000px',
            display: 'block',
          }}
          onMouseMove={(event) => {
            const svg = event.currentTarget;
            const rect = svg.getBoundingClientRect();

            const mouseX =
              ((event.clientX - rect.left) / rect.width) * width;

            const relativeX = mouseX - margin.left;

            if (relativeX < 0 || relativeX > chartWidth) {
              setHoveredIndex(null);
              return;
            }

            const index = Math.round(
              (relativeX / chartWidth) *
                Math.max(filteredData.length - 1, 0),
            );

            setHoveredIndex(
              Math.max(
                0,
                Math.min(index, filteredData.length - 1),
              ),
            );
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#e5e7eb"
              />

              <text
                x={margin.left - 12}
                y={yScale(tick) + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {tick.toFixed(0)}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g key={`${tick.index}-${tick.year}`}>
              <line
                x1={xScale(tick.index)}
                x2={xScale(tick.index)}
                y1={height - margin.bottom}
                y2={height - margin.bottom + 6}
                stroke="#6b7280"
              />

              <text
                x={xScale(tick.index)}
                y={height - margin.bottom + 25}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {tick.year}
              </text>
            </g>
          ))}

          <line
            x1={margin.left}
            x2={margin.left}
            y1={margin.top}
            y2={height - margin.bottom}
            stroke="#374151"
          />

          <line
            x1={margin.left}
            x2={width - margin.right}
            y1={height - margin.bottom}
            y2={height - margin.bottom}
            stroke="#374151"
          />

          <polyline
            points={linePoints}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {hoveredIndex !== null && hoveredData && (
            <>
              <line
                x1={xScale(hoveredIndex)}
                x2={xScale(hoveredIndex)}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="#9ca3af"
                strokeDasharray="5 5"
              />

              <circle
                cx={xScale(hoveredIndex)}
                cy={yScale(hoveredData.CPIAUCSL)}
                r="6"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="3"
              />

              <g
                transform={`translate(${Math.min(
                  xScale(hoveredIndex) + 15,
                  width - 220,
                )}, ${Math.max(
                  yScale(hoveredData.CPIAUCSL) - 70,
                  20,
                )})`}
              >
                <rect
                  width="190"
                  height="60"
                  rx="8"
                  fill="#111827"
                  opacity="0.95"
                />

                <text
                  x="12"
                  y="23"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="bold"
                >
                  {hoveredData.observation_date}
                </text>

                <text
                  x="12"
                  y="45"
                  fill="#ffffff"
                  fontSize="13"
                >
                  CPI: {hoveredData.CPIAUCSL.toFixed(1)}
                </text>
              </g>
            </>
          )}

          <text
            x={width / 2}
            y={height - 12}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
          >
            Year
          </text>

          <text
            transform={`translate(22 ${height / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
          >
            Consumer Price Index
          </text>
        </svg>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '18px',
          marginTop: '28px',
        }}
      >
        <div
          style={{
            padding: '22px',
            background: '#f8fafc',
            borderRadius: '12px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Inflation</h3>

          <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
            CPI provides the first layer of the dashboard and shows how
            average consumer prices changed during the selected period.
          </p>
        </div>

        <div
          style={{
            padding: '22px',
            background: '#f8fafc',
            borderRadius: '12px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Interest Rates</h3>

          <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
            The next stage of the project will integrate the Federal
            Funds Rate so users can compare monetary policy with
            inflation.
          </p>
        </div>

        <div
          style={{
            padding: '22px',
            background: '#f8fafc',
            borderRadius: '12px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Consumer Spending</h3>

          <p style={{ lineHeight: 1.6, color: '#4b5563' }}>
            Retail Sales will provide a measure of consumer spending,
            allowing the final dashboard to explore how spending
            changes alongside inflation and interest rates.
          </p>
        </div>
      </div>

      <div
        style={{
          marginTop: '28px',
          padding: '24px',
          borderLeft: '5px solid #2563eb',
          background: '#eff6ff',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>V1 Project Direction</h3>

        <p
          style={{
            marginBottom: 0,
            lineHeight: 1.7,
          }}
        >
          This version establishes the structure of the final economic
          dashboard. It combines period-based exploration, summary
          indicators, detailed hover interaction, and contextual
          explanations. Future iterations will connect CPI with
          interest-rate and consumer-spending data so users can examine
          relationships between multiple economic indicators.
        </p>
      </div>

      <p
        style={{
          marginTop: '25px',
          color: '#6b7280',
          fontSize: '13px',
        }}
      >
        Source: U.S. Bureau of Labor Statistics via Federal Reserve
        Economic Data (FRED).
      </p>
    </div>
  );
};
