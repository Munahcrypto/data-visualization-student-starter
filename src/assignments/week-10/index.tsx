
import { useMemo, useState } from 'react';
import * as d3 from 'd3';

type Observation = {
  year: number;
  cpi: number;
  inflation: number;
};

type Period = {
  label: string;
  start: number;
  end: number;
};

const periods: Period[] = [
  { label: 'All Years', start: 1970, end: 2025 },
  { label: '1970s Inflation', start: 1970, end: 1983 },
  { label: '2008 Crisis', start: 2005, end: 2012 },
  { label: 'COVID-19', start: 2018, end: 2022 },
  { label: 'Post-COVID', start: 2021, end: 2025 },
];

// Illustrative annual observations for demonstrating linked interaction.
// These are not official FRED observations.
const data: Observation[] = Array.from({ length: 56 }, (_, i) => {
  const year = 1970 + i;
  const t = i / 55;

  const cpi =
    38.8 +
    275 * Math.pow(t, 1.55) +
    5 * Math.sin(i * 0.34) +
    (year >= 2021 ? (year - 2020) * 2.2 : 0);

  const inflation =
    2.8 +
    8.2 * Math.exp(-Math.pow((year - 1980) / 4.2, 2)) +
    3.5 * Math.exp(-Math.pow((year - 2022) / 1.7, 2)) -
    2.4 * Math.exp(-Math.pow((year - 2009) / 1.5, 2)) +
    0.8 * Math.sin(i * 0.65);

  return {
    year,
    cpi: Math.round(cpi * 10) / 10,
    inflation: Math.round(inflation * 10) / 10,
  };
});

const palette = {
  background: '#071326',
  panel: '#102039',
  border: '#253a58',
  cyan: '#38cfff',
  purple: '#b69aff',
  green: '#3ee5b2',
  muted: '#9eb3cf',
  white: '#f5f8ff',
};

type ChartProps = {
  observations: Observation[];
  metric: 'cpi' | 'inflation';
  highlightedYear: number | null;
  onHighlight: (year: number | null) => void;
};

function EconomicChart({
  observations,
  metric,
  highlightedYear,
  onHighlight,
}: ChartProps) {
  const width = 760;
  const height = 270;
  const margin = { top: 20, right: 30, bottom: 38, left: 58 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const color = metric === 'cpi' ? palette.cyan : palette.purple;
  const title =
    metric === 'cpi' ? 'Consumer Price Index' : 'Annual Inflation Rate';

  const x = d3
    .scaleLinear()
    .domain(d3.extent(observations, d => d.year) as [number, number])
    .range([margin.left, width - margin.right]);

  const maxValue = d3.max(observations, d => d[metric]) ?? 10;
  const minValue = Math.min(0, d3.min(observations, d => d[metric]) ?? 0);

  const y = d3
    .scaleLinear()
    .domain([minValue, maxValue * 1.12])
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line<Observation>()
    .x(d => x(d.year))
    .y(d => y(d[metric]))
    .curve(d3.curveMonotoneX);

  const selected = observations.find(d => d.year === highlightedYear);

  const format = (value: number) =>
    metric === 'cpi' ? value.toFixed(1) : `${value.toFixed(1)}%`;

  const handleMove = (event: React.MouseEvent<SVGRectElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * width;
    const year = x.invert(mouseX);
    const closest = d3.least(
      observations,
      d => Math.abs(d.year - year)
    );
    onHighlight(closest?.year ?? null);
  };

  return (
    <div
      style={{
        background: palette.panel,
        border: `1px solid ${palette.border}`,
        borderRadius: 18,
        padding: 20,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ color: palette.white, fontWeight: 700, fontSize: 17 }}>
            {title}
          </div>
          <div style={{ color: palette.muted, fontSize: 12, marginTop: 5 }}>
            Hover over either chart to highlight the same year in both.
          </div>
        </div>
        <span style={{ color, fontSize: 12, fontWeight: 700 }}>
          {metric === 'cpi' ? 'INDEX' : 'PERCENT'}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', marginTop: 18, overflow: 'visible' }}
        role="img"
        aria-label={`${title} interactive line chart`}
      >
        {y.ticks(5).map(tick => (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#2a405c"
              strokeDasharray="4 6"
            />
            <text
              x={margin.left - 12}
              y={y(tick) + 4}
              textAnchor="end"
              fill={palette.muted}
              fontSize="11"
            >
              {format(tick)}
            </text>
          </g>
        ))}

        {x.ticks(6).map(tick => (
          <text
            key={tick}
            x={x(tick)}
            y={height - 12}
            textAnchor="middle"
            fill={palette.muted}
            fontSize="11"
          >
            {Math.round(tick)}
          </text>
        ))}

        <path
          d={line(observations) ?? ''}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {selected && (
          <g>
            <line
              x1={x(selected.year)}
              x2={x(selected.year)}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke={palette.white}
              strokeDasharray="5 5"
              opacity={0.65}
            />
            <circle
              cx={x(selected.year)}
              cy={y(selected[metric])}
              r={7}
              fill={color}
              stroke={palette.white}
              strokeWidth={3}
            />
          </g>
        )}

        <rect
          x={margin.left}
          y={margin.top}
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onMouseMove={handleMove}
          onMouseLeave={() => onHighlight(null)}
        />
      </svg>

      <div
        style={{
          background: '#192d4a',
          padding: '12px 14px',
          borderRadius: 10,
          color: selected ? palette.white : palette.muted,
          fontSize: 13,
          minHeight: 20,
        }}
      >
        {selected
          ? `${selected.year}  |  ${title}: ${format(selected[metric])}`
          : 'Move your cursor across the chart to inspect a year.'}
      </div>
    </div>
  );
}

export function Week10() {
  const [activePeriod, setActivePeriod] = useState('All Years');
  const [highlightedYear, setHighlightedYear] = useState<number | null>(null);

  const period = periods.find(p => p.label === activePeriod) ?? periods[0];

  const filtered = useMemo(
    () => data.filter(d => d.year >= period.start && d.year <= period.end),
    [period.start, period.end]
  );

  const first = filtered[0];
  const last = filtered[filtered.length - 1];

  const cpiChange = first && last
    ? ((last.cpi / first.cpi - 1) * 100).toFixed(1)
    : '0';

  const highlighted = filtered.find(d => d.year === highlightedYear);

  const card = (label: string, value: string, color: string) => (
    <div
      style={{
        background: palette.panel,
        border: `1px solid ${palette.border}`,
        borderRadius: 14,
        padding: 19,
      }}
    >
      <div style={{ color: palette.muted, fontSize: 12 }}>{label}</div>
      <div style={{ color, fontSize: 25, fontWeight: 800, marginTop: 9 }}>
        {value}
      </div>
    </div>
  );

  return (
    <div
      style={{
        background: palette.background,
        color: palette.white,
        minHeight: '100vh',
        padding: '38px 24px 70px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1150, margin: '0 auto' }}>
        <div
          style={{
            color: palette.cyan,
            letterSpacing: 2,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          WEEK 10 · INTERACTIVE DATA VISUALIZATION
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', margin: '12px 0' }}>
          U.S. Economic Explorer
        </h1>

        <p
          style={{
            color: palette.muted,
            lineHeight: 1.7,
            maxWidth: 780,
            marginBottom: 24,
          }}
        >
          Explore how consumer prices and inflation evolve across major
          economic periods. This iteration introduces linked highlighting:
          hovering over either visualization reveals the corresponding year
          across both charts.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
          {periods.map(p => (
            <button
              key={p.label}
              onClick={() => {
                setActivePeriod(p.label);
                setHighlightedYear(null);
              }}
              style={{
                border: `1px solid ${palette.border}`,
                borderRadius: 9,
                padding: '11px 15px',
                cursor: 'pointer',
                background:
                  activePeriod === p.label ? '#1766c5' : palette.panel,
                color: palette.white,
                fontWeight: 700,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 13,
            marginTop: 24,
          }}
        >
          {card('SELECTED PERIOD', activePeriod, palette.cyan)}
          {card('STARTING CPI', first?.cpi.toFixed(1) ?? '—', palette.purple)}
          {card('ENDING CPI', last?.cpi.toFixed(1) ?? '—', palette.green)}
          {card('CPI CHANGE', `${cpiChange}%`, palette.cyan)}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
            gap: 18,
            marginTop: 22,
          }}
        >
          <EconomicChart
            observations={filtered}
            metric="cpi"
            highlightedYear={highlightedYear}
            onHighlight={setHighlightedYear}
          />
          <EconomicChart
            observations={filtered}
            metric="inflation"
            highlightedYear={highlightedYear}
            onHighlight={setHighlightedYear}
          />
        </div>

        <div
          style={{
            background: '#142b48',
            border: `1px solid ${palette.border}`,
            borderLeft: `4px solid ${palette.cyan}`,
            borderRadius: 14,
            padding: 22,
            marginTop: 22,
          }}
        >
          <h3 style={{ margin: '0 0 10px' }}>
            {highlighted
              ? `Economic Snapshot · ${highlighted.year}`
              : 'Linked Highlighting · How It Works'}
          </h3>

          {highlighted ? (
            <p style={{ color: palette.muted, lineHeight: 1.7, margin: 0 }}>
              In {highlighted.year}, the illustrative CPI is{' '}
              <strong style={{ color: palette.cyan }}>
                {highlighted.cpi.toFixed(1)}
              </strong>{' '}
              and the illustrative annual inflation rate is{' '}
              <strong style={{ color: palette.purple }}>
                {highlighted.inflation.toFixed(1)}%
              </strong>
              . Both charts highlight the same year, allowing direct
              comparison of price levels and annual inflation.
            </p>
          ) : (
            <p style={{ color: palette.muted, lineHeight: 1.7, margin: 0 }}>
              Move your cursor across either line chart. The corresponding
              year is highlighted simultaneously in both charts, and the
              economic snapshot updates automatically. Select an economic
              period above to explore a different historical window.
            </p>
          )}
        </div>

        <div
          style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 14,
          }}
        >
          {[
            ['01 · LINKED HIGHLIGHTING', 'Both charts share the same highlighted year, helping users compare economic indicators.'],
            ['02 · INTERACTIVE TOOLTIPS', 'Hover interactions reveal the year and corresponding economic value.'],
            ['03 · PERIOD EXPLORATION', 'Filter the dashboard to examine major economic events and historical patterns.'],
          ].map(([heading, description]) => (
            <div
              key={heading}
              style={{
                padding: 19,
                border: `1px solid ${palette.border}`,
                borderRadius: 13,
                background: palette.panel,
              }}
            >
              <div style={{ color: palette.cyan, fontSize: 12, fontWeight: 800 }}>
                {heading}
              </div>
              <p style={{ color: palette.muted, lineHeight: 1.6, fontSize: 13 }}>
                {description}
              </p>
            </div>
          ))}
        </div>

        <p
          style={{
            color: palette.muted,
            fontSize: 11,
            marginTop: 25,
            lineHeight: 1.6,
          }}
        >
          Data note: This prototype uses illustrative annual values to
          demonstrate interaction. Values should not be interpreted as
          official economic statistics. Official reference series:
          FRED CPIAUCSL and the U.S. Bureau of Labor Statistics.
        </p>
      </div>
    </div>
  );
}

export default Week10;
