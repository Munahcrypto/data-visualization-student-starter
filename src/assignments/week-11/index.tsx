
import { useMemo, useState } from 'react';

type Metric = 'cpi' | 'inflation' | 'rate' | 'spending';

type RecordPoint = {
  year: number;
  cpi: number;
  inflation: number;
  rate: number;
  spending: number;
};

const theme = {
  bg: '#07111f',
  panel: '#111f33',
  border: '#263b56',
  text: '#f2f7ff',
  muted: '#9db0ca',
  cyan: '#42d7ff',
  purple: '#b79aff',
  green: '#4ee3ac',
  orange: '#ffbd70',
};

const metricInfo: Record<
  Metric,
  { label: string; unit: string; color: string }
> = {
  cpi: {
    label: 'Consumer Price Index',
    unit: 'Index',
    color: theme.cyan,
  },
  inflation: {
    label: 'Annual Inflation',
    unit: '%',
    color: theme.purple,
  },
  rate: {
    label: 'Federal Funds Rate',
    unit: '%',
    color: theme.green,
  },
  spending: {
    label: 'Retail Spending',
    unit: 'Illustrative index',
    color: theme.orange,
  },
};

const events = [
  {
    name: 'Full Timeline',
    start: 1970,
    end: 2025,
    note: 'Explore long-run changes across the full timeline.',
  },
  {
    name: '1970s Inflation',
    start: 1970,
    end: 1983,
    note: 'Explore the high-inflation era of the 1970s and early 1980s.',
  },
  {
    name: '2008 Financial Crisis',
    start: 2005,
    end: 2012,
    note: 'Examine the period surrounding the global financial crisis.',
  },
  {
    name: 'COVID-19',
    start: 2018,
    end: 2022,
    note: 'Explore the period before and during the pandemic.',
  },
  {
    name: 'Post-COVID',
    start: 2021,
    end: 2025,
    note: 'Examine economic changes in the recovery period.',
  },
];

const observations: RecordPoint[] = Array.from(
  { length: 56 },
  (_, i) => {
    const year = 1970 + i;
    const t = i / 55;

    const inflation =
      2.8 +
      8 * Math.exp(-Math.pow((year - 1980) / 4, 2)) +
      5 * Math.exp(-Math.pow((year - 2022) / 1.7, 2)) -
      2 * Math.exp(-Math.pow((year - 2009) / 1.6, 2)) +
      Math.sin(i * 0.5);

    const rate =
      2.5 +
      10 * Math.exp(-Math.pow((year - 1981) / 4, 2)) +
      3 * Math.exp(-Math.pow((year - 2007) / 3, 2)) +
      3 * Math.exp(-Math.pow((year - 2023) / 2, 2));

    return {
      year,
      cpi: 39 + 285 * Math.pow(t, 1.55),
      inflation,
      rate,
      spending:
        65 +
        360 * Math.pow(t, 1.4) -
        15 * Math.exp(-Math.pow((year - 2009) / 2, 2)) -
        24 * Math.exp(-Math.pow((year - 2020) / 1.5, 2)),
    };
  }
);

// All values above are illustrative, not official statistics.

function Chart({
  data,
  metric,
  selectedYear,
  onSelect,
}: {
  data: RecordPoint[];
  metric: Metric;
  selectedYear: number | null;
  onSelect: (year: number | null) => void;
}) {
  const width = 650;
  const height = 245;
  const left = 52;
  const right = 18;
  const top = 22;
  const bottom = 34;

  const values = data.map((d) => d[metric]);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values) * 1.12;
  const first = data[0].year;
  const last = data[data.length - 1].year;

  const x = (year: number) =>
    left +
    ((year - first) / Math.max(1, last - first)) *
      (width - left - right);

  const y = (value: number) =>
    height -
    bottom -
    ((value - min) / (max - min)) *
      (height - top - bottom);

  const path = data
    .map(
      (d, i) =>
        `${i === 0 ? 'M' : 'L'}${x(d.year)},${y(d[metric])}`
    )
    .join(' ');

  const selected = data.find((d) => d.year === selectedYear);
  const info = metricInfo[metric];

  const format = (value: number) =>
    `${value.toFixed(1)}${info.unit === '%' ? '%' : ''}`;

  return (
    <div
      style={{
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: 20,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <strong style={{ color: theme.text }}>
          {info.label}
        </strong>
        <span style={{ color: info.color, fontSize: 12 }}>
          {info.unit}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', marginTop: 12 }}
        aria-label={`${info.label} line chart`}
        role="img"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const value = min + ((max - min) * i) / 4;

          return (
            <g key={i}>
              <line
                x1={left}
                x2={width - right}
                y1={y(value)}
                y2={y(value)}
                stroke={theme.border}
                strokeDasharray="4 6"
              />
              <text
                x={left - 9}
                y={y(value) + 4}
                fill={theme.muted}
                fontSize={11}
                textAnchor="end"
              >
                {format(value)}
              </text>
            </g>
          );
        })}

        {Array.from({ length: 5 }, (_, i) => {
          const year = Math.round(
            first + ((last - first) * i) / 4
          );
          return (
            <text
              key={i}
              x={x(year)}
              y={height - 9}
              fill={theme.muted}
              fontSize={11}
              textAnchor="middle"
            >
              {year}
            </text>
          );
        })}

        <path
          d={path}
          fill="none"
          stroke={info.color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {selected && (
          <g>
            <line
              x1={x(selected.year)}
              x2={x(selected.year)}
              y1={top}
              y2={height - bottom}
              stroke={theme.text}
              strokeDasharray="5 5"
              opacity={0.7}
            />
            <circle
              cx={x(selected.year)}
              cy={y(selected[metric])}
              r={6}
              fill={info.color}
              stroke={theme.text}
              strokeWidth={2}
            />
          </g>
        )}

        <rect
          x={left}
          y={top}
          width={width - left - right}
          height={height - top - bottom}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onMouseMove={(event) => {
            const rect =
              event.currentTarget.getBoundingClientRect();
            const fraction =
              (event.clientX - rect.left) / rect.width;
            const target = first + fraction * (last - first);
            const closest = data.reduce((a, b) =>
              Math.abs(a.year - target) <
              Math.abs(b.year - target)
                ? a
                : b
            );
            onSelect(closest.year);
          }}
          onMouseLeave={() => onSelect(null)}
        />
      </svg>

      <div
        style={{
          color: selected ? theme.text : theme.muted,
          background: '#1a2c45',
          borderRadius: 9,
          padding: 11,
          fontSize: 12,
        }}
      >
        {selected
          ? `${selected.year} · ${format(selected[metric])}`
          : 'Hover to inspect and highlight the same year across all charts.'}
      </div>
    </div>
  );
}

export function Week11() {
  const [eventName, setEventName] = useState('Full Timeline');
  const [year, setYear] = useState<number | null>(null);
  const [compare, setCompare] = useState(false);
  const [comparisonName, setComparisonName] =
    useState('2008 Financial Crisis');

  const active =
    events.find((e) => e.name === eventName) ?? events[0];

  const comparison =
    events.find((e) => e.name === comparisonName) ?? events[2];

  const filtered = useMemo(
    () =>
      observations.filter(
        (d) => d.year >= active.start && d.year <= active.end
      ),
    [active.start, active.end]
  );

  const comparisonData = observations.filter(
    (d) =>
      d.year >= comparison.start && d.year <= comparison.end
  );

  const first = filtered[0];
  const last = filtered[filtered.length - 1];
  const selected = filtered.find((d) => d.year === year);

  const cpiChange =
    ((last.cpi / first.cpi - 1) * 100).toFixed(1);

  const average = (data: RecordPoint[], metric: Metric) =>
    data.reduce((sum, d) => sum + d[metric], 0) /
    data.length;

  const card = (
    label: string,
    value: string,
    color: string
  ) => (
    <div
      style={{
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        borderRadius: 15,
        padding: 20,
      }}
    >
      <div style={{ color: theme.muted, fontSize: 12 }}>
        {label}
      </div>
      <div
        style={{
          color,
          fontSize: 27,
          fontWeight: 800,
          marginTop: 10,
        }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.text,
        minHeight: '100vh',
        padding: '34px 24px 70px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1250, margin: '0 auto' }}>
        <div
          style={{
            color: theme.cyan,
            letterSpacing: 2,
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          WEEK 11 · PROJECT ITERATION
        </div>

        <h1
          style={{
            fontSize: 'clamp(30px, 4vw, 48px)',
            margin: '12px 0',
          }}
        >
          U.S. Economic Time Machine
          <span style={{ color: theme.cyan }}> 2.0</span>
        </h1>

        <p
          style={{
            color: theme.muted,
            maxWidth: 850,
            lineHeight: 1.7,
          }}
        >
          Explore how U.S. economic indicators move together
          across major historical events. Compare inflation,
          consumer prices, interest rates, and retail spending
          using synchronized interactive charts.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 9,
            marginTop: 22,
          }}
        >
          {events.map((event) => (
            <button
              key={event.name}
              onClick={() => {
                setEventName(event.name);
                setYear(null);
              }}
              style={{
                background:
                  eventName === event.name
                    ? '#1767c5'
                    : theme.panel,
                border: `1px solid ${theme.border}`,
                borderRadius: 9,
                padding: '11px 14px',
                color: theme.text,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {event.name}
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            background: '#132842',
            borderLeft: `4px solid ${theme.cyan}`,
            padding: 17,
            borderRadius: 10,
            color: theme.muted,
          }}
        >
          <strong style={{ color: theme.text }}>
            Historical lens: {active.name}
          </strong>
          <div style={{ marginTop: 6 }}>
            {active.note}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 13,
            marginTop: 22,
          }}
        >
          {card(
            'CPI CHANGE',
            `${cpiChange}%`,
            theme.cyan
          )}
          {card(
            'LATEST INFLATION',
            `${last.inflation.toFixed(1)}%`,
            theme.purple
          )}
          {card(
            'LATEST POLICY RATE',
            `${last.rate.toFixed(1)}%`,
            theme.green
          )}
          {card(
            'RETAIL SPENDING INDEX',
            last.spending.toFixed(1),
            theme.orange
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
            gap: 18,
            marginTop: 24,
          }}
        >
          {(
            ['cpi', 'inflation', 'rate', 'spending'] as Metric[]
          ).map((metric) => (
            <Chart
              key={metric}
              data={filtered}
              metric={metric}
              selectedYear={year}
              onSelect={setYear}
            />
          ))}
        </div>

        <div
          style={{
            background: theme.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            padding: 22,
            marginTop: 22,
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            {selected
              ? `Economic Snapshot · ${selected.year}`
              : 'Linked Economic Insights'}
          </h2>

          {selected ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 22,
                color: theme.muted,
              }}
            >
              <span>CPI: {selected.cpi.toFixed(1)}</span>
              <span>
                Inflation: {selected.inflation.toFixed(1)}%
              </span>
              <span>
                Federal Funds Rate: {selected.rate.toFixed(1)}%
              </span>
              <span>
                Retail Index: {selected.spending.toFixed(1)}
              </span>
            </div>
          ) : (
            <p style={{ color: theme.muted }}>
              Move your cursor over any chart. The same year
              will be highlighted across all four economic
              indicators, making relationships easier to
              explore.
            </p>
          )}
        </div>

        <div
          style={{
            background: theme.panel,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            padding: 22,
            marginTop: 22,
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Economic Period Comparison
          </h2>

          <p style={{ color: theme.muted }}>
            Compare average inflation and policy interest
            rates across two historical windows.
          </p>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 18,
            }}
          >
            <input
              type="checkbox"
              checked={compare}
              onChange={(e) =>
                setCompare(e.target.checked)
              }
            />
            Enable period comparison
          </label>

          {compare && (
            <div>
              <select
                value={comparisonName}
                onChange={(e) =>
                  setComparisonName(e.target.value)
                }
                style={{
                  padding: 12,
                  background: '#1a304d',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 9,
                  color: theme.text,
                  marginBottom: 20,
                }}
              >
                {events.map((event) => (
                  <option
                    key={event.name}
                    value={event.name}
                  >
                    {event.name}
                  </option>
                ))}
              </select>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 15,
                }}
              >
                {card(
                  `${active.name} · AVG INFLATION`,
                  `${average(filtered, 'inflation').toFixed(1)}%`,
                  theme.purple
                )}
                {card(
                  `${comparison.name} · AVG INFLATION`,
                  `${average(comparisonData, 'inflation').toFixed(1)}%`,
                  theme.purple
                )}
                {card(
                  `${active.name} · AVG RATE`,
                  `${average(filtered, 'rate').toFixed(1)}%`,
                  theme.green
                )}
                {card(
                  `${comparison.name} · AVG RATE`,
                  `${average(comparisonData, 'rate').toFixed(1)}%`,
                  theme.green
                )}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: 24,
            padding: 18,
            borderRadius: 12,
            background: '#132842',
            border: `1px solid ${theme.border}`,
            color: theme.muted,
            fontSize: 12,
            lineHeight: 1.8,
          }}
        >
          <strong style={{ color: theme.text }}>
            Data transparency
          </strong>
          <p style={{ marginBottom: 0 }}>
            This version currently uses illustrative annual
            data to demonstrate interactive design and
            historical comparisons. These values are not
            official economic observations. The next data
            integration stage will use FRED series CPIAUCSL,
            FEDFUNDS, and RSAFS.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Week11;
