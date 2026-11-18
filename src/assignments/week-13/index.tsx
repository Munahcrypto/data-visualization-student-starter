
import { useMemo, useState } from 'react';

type Metric = 'cpi' | 'inflation' | 'rate' | 'retail';
type DataPoint = {
  year: number;
  cpi: number;
  inflation: number;
  rate: number;
  retail: number;
};

type Period = {
  name: string;
  start: number;
  end: number;
  description: string;
};

const periods: Period[] = [
  {
    name: 'Full Timeline',
    start: 1970,
    end: 2025,
    description: 'Explore long-term economic changes.',
  },
  {
    name: '1970s Inflation',
    start: 1970,
    end: 1985,
    description: 'Inflation accelerated and monetary policy tightened.',
  },
  {
    name: '2008 Financial Crisis',
    start: 2005,
    end: 2013,
    description: 'Financial instability led to sharp policy changes.',
  },
  {
    name: 'COVID-19',
    start: 2018,
    end: 2022,
    description: 'The pandemic disrupted spending and economic activity.',
  },
  {
    name: 'Post-COVID',
    start: 2020,
    end: 2025,
    description: 'Explore the inflation surge and policy response.',
  },
];

const metrics: {
  key: Metric;
  title: string;
  unit: string;
  color: string;
  description: string;
}[] = [
  {
    key: 'cpi',
    title: 'Consumer Price Index',
    unit: 'Index',
    color: '#38bdf8',
    description: 'Illustrative consumer price level',
  },
  {
    key: 'inflation',
    title: 'Annual Inflation',
    unit: '%',
    color: '#c4a1ff',
    description: 'Illustrative year-over-year price growth',
  },
  {
    key: 'rate',
    title: 'Federal Funds Rate',
    unit: '%',
    color: '#34d399',
    description: 'Illustrative monetary policy rate',
  },
  {
    key: 'retail',
    title: 'Retail Spending',
    unit: 'Index',
    color: '#fbbf77',
    description: 'Illustrative retail spending index',
  },
];

function gaussian(x: number, center: number, width: number) {
  return Math.exp(-Math.pow((x - center) / width, 2));
}

// Illustrative annual data, NOT official FRED observations.
const data: DataPoint[] = Array.from({ length: 56 }, (_, i) => {
  const year = 1970 + i;
  const t = i / 55;

  const inflation =
    2.2 +
    8 * gaussian(year, 1980, 5) +
    1.4 * gaussian(year, 1990, 3) +
    1.3 * gaussian(year, 2008, 2) -
    1.5 * gaussian(year, 2009, 1.5) +
    5.8 * gaussian(year, 2022, 1.6) +
    0.35 * Math.sin(i * 0.6);

  const rate =
    2.5 +
    11 * gaussian(year, 1981, 4) +
    3.2 * gaussian(year, 2007, 2.8) +
    3.1 * gaussian(year, 2023, 1.9) -
    2 * gaussian(year, 2013, 5);

  const cpi = 38 + 285 * Math.pow(t, 1.65);
  const retail =
    85 + 355 * Math.pow(t, 1.5) -
    15 * gaussian(year, 2009, 1.4) -
    25 * gaussian(year, 2020, 0.9);

  return {
    year,
    cpi,
    inflation: Math.max(0, inflation),
    rate: Math.max(0, rate),
    retail,
  };
});

function formatValue(value: number, metric: Metric) {
  return `${value.toFixed(1)}${
    metric === 'inflation' || metric === 'rate' ? '%' : ''
  }`;
}

function average(points: DataPoint[], metric: Metric) {
  if (!points.length) return 0;
  return points.reduce((sum, point) => sum + point[metric], 0) /
    points.length;
}

function Chart({
  points,
  metric,
  selectedYear,
  onSelect,
}: {
  points: DataPoint[];
  metric: Metric;
  selectedYear: number | null;
  onSelect: (year: number | null) => void;
}) {
  const config = metrics.find(item => item.key === metric)!;

  const w = 540;
  const h = 230;
  const left = 48;
  const right = 18;
  const top = 18;
  const bottom = 34;

  const values = points.map(point => point[metric]);
  const min = Math.min(0, ...values);
  const max = Math.max(...values) * 1.12 || 1;

  const x = (index: number) =>
    left + (index / Math.max(1, points.length - 1)) *
      (w - left - right);

  const y = (value: number) =>
    top + (1 - (value - min) / (max - min)) *
      (h - top - bottom);

  const path = points
    .map((point, i) =>
      `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(point[metric])}`
    )
    .join(' ');

  const activeIndex = points.findIndex(
    point => point.year === selectedYear
  );

  return (
    <div className="economic-chart">
      <div className="economic-chart-heading">
        <div>
          <strong>{config.title}</strong>
          <small>{config.description}</small>
        </div>
        <span style={{ color: config.color }}>{config.unit}</span>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: '100%', display: 'block' }}
        onMouseLeave={() => onSelect(null)}
        role="img"
        aria-label={`${config.title} interactive time series`}
      >
        {[0, 1, 2, 3, 4].map(i => {
          const value = min + (max - min) * (1 - i / 4);
          const yy = y(value);

          return (
            <g key={i}>
              <line
                x1={left}
                x2={w - right}
                y1={yy}
                y2={yy}
                stroke="#29415e"
                strokeDasharray="3 5"
              />
              <text
                x={left - 7}
                y={yy + 4}
                fill="#9db0c9"
                fontSize="10"
                textAnchor="end"
              >
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        <path
          d={path}
          fill="none"
          stroke={config.color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {activeIndex >= 0 && (
          <g>
            <line
              x1={x(activeIndex)}
              x2={x(activeIndex)}
              y1={top}
              y2={h - bottom}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <circle
              cx={x(activeIndex)}
              cy={y(points[activeIndex][metric])}
              r="6"
              fill={config.color}
              stroke="#ffffff"
              strokeWidth="2"
            />
          </g>
        )}

        {points.map((point, i) => (
          <rect
            key={point.year}
            x={x(i) - (w - left - right) /
              Math.max(1, points.length - 1) / 2}
            y={top}
            width={(w - left - right) /
              Math.max(1, points.length - 1)}
            height={h - top - bottom}
            fill="transparent"
            onMouseEnter={() => onSelect(point.year)}
            onClick={() => onSelect(point.year)}
            style={{ cursor: 'crosshair' }}
          />
        ))}

        {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
          const index = Math.round(
            fraction * (points.length - 1)
          );

          return (
            <text
              key={i}
              x={x(index)}
              y={h - 9}
              fill="#9db0c9"
              fontSize="11"
              textAnchor="middle"
            >
              {points[index]?.year}
            </text>
          );
        })}
      </svg>

      <div className="economic-chart-footer">
        {activeIndex >= 0 ? (
          <span>
            {points[activeIndex].year} ·{' '}
            <strong style={{ color: config.color }}>
              {formatValue(points[activeIndex][metric], metric)}
            </strong>
          </span>
        ) : (
          <span>Hover to explore and link all four charts</span>
        )}
      </div>
    </div>
  );
}

export function Week13() {
  const [periodIndex, setPeriodIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [compare, setCompare] = useState(false);
  const [secondPeriod, setSecondPeriod] = useState(2);

  const period = periods[periodIndex];

  const filtered = useMemo(
    () => data.filter(point =>
      point.year >= period.start && point.year <= period.end
    ),
    [period.start, period.end]
  );

  const comparisonPoints = useMemo(() => {
    const p = periods[secondPeriod];
    return data.filter(point =>
      point.year >= p.start && point.year <= p.end
    );
  }, [secondPeriod]);

  const current = selectedYear === null
    ? filtered[filtered.length - 1]
    : filtered.find(point => point.year === selectedYear) ||
      filtered[filtered.length - 1];

  const start = filtered[0];
  const cpiChange = start
    ? (current.cpi / start.cpi - 1) * 100
    : 0;

  const insight = useMemo(() => {
    const first = filtered[0];
    const last = filtered[filtered.length - 1];
    if (!first || !last) return '';

    const peak = filtered.reduce((a, b) =>
      a.inflation > b.inflation ? a : b
    );

    return `Between ${first.year} and ${last.year}, the
      illustrative CPI index increased by
      ${((last.cpi / first.cpi - 1) * 100).toFixed(1)}%.
      The highest modeled inflation rate in this window
      occurred in ${peak.year}, at
      ${peak.inflation.toFixed(1)}%.
      Compare the charts to explore how these indicators
      moved during the same period.`;
  }, [filtered]);

  return (
    <div className="economic-app">
      <style>{`
        .economic-app {
          background: #071321;
          color: #f3f8ff;
          min-height: 100vh;
          padding: 28px;
          font-family: Inter, Arial, sans-serif;
        }
        .economic-inner {
          max-width: 1200px;
          margin: auto;
        }
        .economic-eyebrow {
          color: #38bdf8;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }
        .economic-title {
          font-size: clamp(28px, 4vw, 48px);
          margin: 12px 0;
          letter-spacing: -1.5px;
        }
        .economic-muted {
          color: #a8bdd5;
          line-height: 1.6;
        }
        .economic-controls {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
          margin: 22px 0;
        }
        .economic-button {
          background: #142740;
          border: 1px solid #36506e;
          color: #f3f8ff;
          padding: 11px 15px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
        }
        .economic-button.active {
          background: #1767c3;
          border-color: #60a5fa;
        }
        .economic-panel {
          background: #10233a;
          border: 1px solid #2a4665;
          border-radius: 14px;
          padding: 20px;
          margin: 16px 0;
        }
        .economic-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin: 18px 0;
        }
        .economic-kpi {
          background: #10233a;
          border: 1px solid #2a4665;
          border-radius: 14px;
          padding: 20px;
        }
        .economic-kpi-label {
          color: #a8bdd5;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .economic-kpi-value {
          font-size: clamp(22px, 3vw, 34px);
          font-weight: 800;
          margin-top: 12px;
        }
        .economic-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }
        .economic-chart {
          background: #10233a;
          border: 1px solid #2a4665;
          border-radius: 14px;
          padding: 18px;
          min-width: 0;
        }
        .economic-chart-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .economic-chart-heading strong {
          display: block;
          font-size: 15px;
        }
        .economic-chart-heading small {
          display: block;
          color: #9db0c9;
          margin-top: 6px;
        }
        .economic-chart-footer {
          background: #1b3553;
          padding: 11px;
          border-radius: 7px;
          color: #b9cde4;
          font-size: 12px;
          min-height: 16px;
        }
        .economic-compare-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 18px;
        }
        .economic-compare-card {
          background: #172d48;
          padding: 17px;
          border-radius: 10px;
        }
        .economic-compare-card h3 {
          margin-top: 0;
        }
        .economic-select {
          background: #172d48;
          color: white;
          padding: 10px;
          border: 1px solid #527398;
          border-radius: 8px;
          max-width: 100%;
        }
        .economic-note {
          font-size: 12px;
          color: #b9cde4;
        }
        @media (max-width: 850px) {
          .economic-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .economic-grid,
          .economic-compare-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .economic-app { padding: 14px; }
          .economic-kpis { gap: 8px; }
          .economic-kpi { padding: 12px; }
        }
      `}</style>

      <main className="economic-inner">
        <div className="economic-eyebrow">
          WEEK 13 · INTERACTIVE ECONOMIC STORYTELLING
        </div>

        <h1 className="economic-title">
          U.S. Economic Time Machine{' '}
          <span style={{ color: '#38bdf8' }}>3.0</span>
        </h1>

        <p className="economic-muted">
          Travel through major economic periods, examine
          four synchronized indicators, and compare
          historical windows in one interactive dashboard.
        </p>

        <div className="economic-controls">
          {periods.map((item, i) => (
            <button
              key={item.name}
              className={`economic-button ${
                periodIndex === i ? 'active' : ''
              }`}
              onClick={() => {
                setPeriodIndex(i);
                setSelectedYear(null);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        <section className="economic-panel">
          <div className="economic-eyebrow">
            HISTORICAL LENS · {period.start}–{period.end}
          </div>
          <h2 style={{ marginBottom: 6 }}>{period.name}</h2>
          <p className="economic-muted" style={{ margin: 0 }}>
            {period.description}
          </p>
        </section>

        <div className="economic-kpis">
          {[
            {
              label: 'CPI Change in Window',
              value: `${cpiChange.toFixed(1)}%`,
              color: '#38bdf8',
            },
            {
              label: 'Selected Inflation',
              value: formatValue(current.inflation, 'inflation'),
              color: '#c4a1ff',
            },
            {
              label: 'Selected Policy Rate',
              value: formatValue(current.rate, 'rate'),
              color: '#34d399',
            },
            {
              label: 'Retail Spending Index',
              value: formatValue(current.retail, 'retail'),
              color: '#fbbf77',
            },
          ].map(item => (
            <div className="economic-kpi" key={item.label}>
              <div className="economic-kpi-label">
                {item.label}
              </div>
              <div
                className="economic-kpi-value"
                style={{ color: item.color }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <section className="economic-panel">
          <div className="economic-eyebrow">
            SELECTED YEAR
          </div>
          <h2 style={{ margin: '8px 0' }}>
            {current.year}
          </h2>
          <p className="economic-muted" style={{ margin: 0 }}>
            Move your cursor across any chart to highlight
            the same year on all four charts.
          </p>
        </section>

        <div className="economic-grid">
          {metrics.map(item => (
            <Chart
              key={item.key}
              points={filtered}
              metric={item.key}
              selectedYear={selectedYear}
              onSelect={setSelectedYear}
            />
          ))}
        </div>

        <section className="economic-panel">
          <div className="economic-eyebrow">
            AUTOMATED ECONOMIC INSIGHTS
          </div>
          <h2>What changed during this period?</h2>
          <p className="economic-muted">{insight}</p>
          <p className="economic-note">
            Insights are calculated from illustrative
            observations and are not official economic findings.
          </p>
        </section>

        <section className="economic-panel">
          <div className="economic-eyebrow">
            HISTORICAL COMPARISON LAB
          </div>
          <h2>Compare economic periods</h2>
          <p className="economic-muted">
            Compare average modeled inflation and policy
            rates across two historical windows.
          </p>

          <label style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={compare}
              onChange={event => setCompare(event.target.checked)}
            />
            {' '}Enable period comparison
          </label>

          {compare && (
            <>
              <div style={{ marginTop: 18 }}>
                <label htmlFor="second-period">
                  Comparison period:{' '}
                </label>
                <select
                  id="second-period"
                  className="economic-select"
                  value={secondPeriod}
                  onChange={event =>
                    setSecondPeriod(Number(event.target.value))
                  }
                >
                  {periods.map((item, i) => (
                    <option key={item.name} value={i}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="economic-compare-grid">
                {[
                  { name: period.name, points: filtered },
                  {
                    name: periods[secondPeriod].name,
                    points: comparisonPoints,
                  },
                ].map((item, i) => (
                  <div className="economic-compare-card" key={i}>
                    <h3>{item.name}</h3>
                    <p className="economic-muted">
                      Average inflation:{' '}
                      <strong style={{ color: '#c4a1ff' }}>
                        {average(item.points, 'inflation').toFixed(2)}%
                      </strong>
                    </p>
                    <p className="economic-muted">
                      Average policy rate:{' '}
                      <strong style={{ color: '#34d399' }}>
                        {average(item.points, 'rate').toFixed(2)}%
                      </strong>
                    </p>
                    <p className="economic-note">
                      {item.points.length} annual observations
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="economic-panel">
          <div className="economic-eyebrow">
            DATA TRANSPARENCY
          </div>
          <p className="economic-note">
            This version uses simulated annual observations
            from 1970 to 2025 for interaction prototyping.
            Values are not official historical measurements.
            Planned real-data sources include FRED series
            CPIAUCSL, FEDFUNDS, and RSAFS.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Week13;
