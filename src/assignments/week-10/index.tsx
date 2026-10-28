
import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';

type Observation = {
  year: number;
  cpi: number;
  inflation: number;
};

type Metric = 'cpi' | 'inflation';

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

// Illustrative data for demonstrating interaction.
// These are NOT official economic observations.
const data: Observation[] = Array.from(
  { length: 56 },
  (_, i): Observation => {
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
  }
);

const colors = {
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
  metric: Metric;
  highlightedYear: number | null;
  onHighlight: (year: number | null) => void;
};

function EconomicChart({
  observations,
  metric,
  highlightedYear,
  onHighlight,
}: ChartProps) {
  const width = 700;
  const height = 300;

  const margin = {
    top: 25,
    right: 25,
    bottom: 45,
    left: 65,
  };

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const title =
    metric === 'cpi'
      ? 'U.S. Consumer Price Index'
      : 'U.S. Annual Inflation Rate';

  const color =
    metric === 'cpi' ? colors.cyan : colors.purple;

  const years = observations.map((d) => d.year);
  const values = observations.map((d) => d[metric]);

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(...values);

  const yMaximum = maxValue > 0 ? maxValue * 1.12 : 1;

  const x = (year: number): number =>
    margin.left +
    ((year - minYear) / Math.max(1, maxYear - minYear)) *
      plotWidth;

  const y = (value: number): number =>
    height -
    margin.bottom -
    ((value - minValue) /
      Math.max(1, yMaximum - minValue)) *
      plotHeight;

  const linePath = observations
    .map(
      (d, i) =>
        `${i === 0 ? 'M' : 'L'} ${x(d.year)} ${y(d[metric])}`
    )
    .join(' ');

  const selected = observations.find(
    (d) => d.year === highlightedYear
  );

  const format = (value: number): string =>
    metric === 'cpi'
      ? value.toFixed(1)
      : `${value.toFixed(1)}%`;

  const yTicks = Array.from(
    { length: 5 },
    (_, i) =>
      minValue + ((yMaximum - minValue) * i) / 4
  );

  const xTicks = Array.from(
    { length: 5 },
    (_, i) =>
      Math.round(minYear + ((maxYear - minYear) * i) / 4)
  );

  const handleMove = (
    event: MouseEvent<SVGRectElement>
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const relativeX =
      (event.clientX - rect.left) / rect.width;

    const targetYear =
      minYear + relativeX * (maxYear - minYear);

    const closest = observations.reduce(
      (best, current) =>
        Math.abs(current.year - targetYear) <
        Math.abs(best.year - targetYear)
          ? current
          : best,
      observations[0]
    );

    onHighlight(closest.year);
  };

  return (
    <div
      style={{
        background: colors.panel,
        border: `1px solid ${colors.border}`,
        borderRadius: 18,
        padding: 20,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: colors.white,
              fontSize: 18,
            }}
          >
            {title}
          </h3>

          <p
            style={{
              color: colors.muted,
              fontSize: 12,
              marginTop: 7,
            }}
          >
            Hover to explore linked economic values.
          </p>
        </div>

        <span
          style={{
            color,
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          {metric === 'cpi' ? 'INDEX' : 'PERCENT'}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          display: 'block',
          marginTop: 14,
        }}
        role="img"
        aria-label={title}
      >
        {yTicks.map((tick: number, i: number) => (
          <g key={i}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="#30445f"
              strokeDasharray="4 6"
            />

            <text
              x={margin.left - 12}
              y={y(tick) + 4}
              fill={colors.muted}
              fontSize={11}
              textAnchor="end"
            >
              {format(tick)}
            </text>
          </g>
        ))}

        {xTicks.map((tick: number, i: number) => (
          <text
            key={i}
            x={x(tick)}
            y={height - 12}
            fill={colors.muted}
            fontSize={11}
            textAnchor="middle"
          >
            {tick}
          </text>
        ))}

        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {selected && (
          <g>
            <line
              x1={x(selected.year)}
              x2={x(selected.year)}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke={colors.white}
              strokeDasharray="5 5"
              opacity={0.7}
            />

            <circle
              cx={x(selected.year)}
              cy={y(selected[metric])}
              r={7}
              fill={color}
              stroke={colors.white}
              strokeWidth={3}
            />

            <text
              x={x(selected.year)}
              y={Math.max(
                margin.top + 10,
                y(selected[metric]) - 18
              )}
              textAnchor="middle"
              fill={colors.white}
              fontSize={13}
              fontWeight={700}
            >
              {format(selected[metric])}
            </text>
          </g>
        )}

        <rect
          x={margin.left}
          y={margin.top}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onMouseMove={handleMove}
          onMouseLeave={() => onHighlight(null)}
        />
      </svg>

      <div
        style={{
          background: '#192d4a',
          padding: 14,
          borderRadius: 10,
          fontSize: 13,
          color: selected
            ? colors.white
            : colors.muted,
        }}
      >
        {selected
          ? `${selected.year} | ${title}: ${format(
              selected[metric]
            )}`
          : 'Move your cursor across the chart to inspect a year.'}
      </div>
    </div>
  );
}

export function Week10() {
  const [activePeriod, setActivePeriod] =
    useState('All Years');

  const [highlightedYear, setHighlightedYear] =
    useState<number | null>(null);

  const period =
    periods.find((p) => p.label === activePeriod) ??
    periods[0];

  const filtered = useMemo(
    () =>
      data.filter(
        (d) =>
          d.year >= period.start &&
          d.year <= period.end
      ),
    [period.start, period.end]
  );

  const first = filtered[0];
  const last = filtered[filtered.length - 1];

  const cpiChange =
    first && last
      ? ((last.cpi / first.cpi - 1) * 100).toFixed(1)
      : '0';

  const highlighted = filtered.find(
    (d) => d.year === highlightedYear
  );

  const card = (
    label: string,
    value: string,
    color: string
  ) => (
    <div
      style={{
        background: colors.panel,
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        padding: 20,
      }}
    >
      <div
        style={{
          color: colors.muted,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {label}
      </div>

      <div
        style={{
          color,
          fontSize: 25,
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
        background: colors.background,
        color: colors.white,
        minHeight: '100vh',
        padding: '38px 24px 70px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            color: colors.cyan,
            letterSpacing: 2,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          WEEK 10 · INTERACTIVE DATA VISUALIZATION
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            margin: '12px 0',
          }}
        >
          U.S. Economic Explorer
        </h1>

        <p
          style={{
            color: colors.muted,
            lineHeight: 1.7,
            maxWidth: 850,
            marginBottom: 24,
          }}
        >
          Travel through major economic periods and
          explore changes in consumer prices and inflation.
          This iteration introduces linked highlighting,
          interactive tooltips, and synchronized economic
          insights across two visualizations.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          {periods.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setActivePeriod(p.label);
                setHighlightedYear(null);
              }}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 9,
                padding: '12px 16px',
                cursor: 'pointer',
                background:
                  activePeriod === p.label
                    ? '#1766c5'
                    : colors.panel,
                color: colors.white,
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
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 13,
            marginTop: 24,
          }}
        >
          {card(
            'SELECTED PERIOD',
            activePeriod,
            colors.cyan
          )}

          {card(
            'STARTING CPI',
            first?.cpi.toFixed(1) ?? '—',
            colors.purple
          )}

          {card(
            'ENDING CPI',
            last?.cpi.toFixed(1) ?? '—',
            colors.green
          )}

          {card(
            'CPI CHANGE',
            `${cpiChange}%`,
            colors.cyan
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
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
            border: `1px solid ${colors.border}`,
            borderLeft: `4px solid ${colors.cyan}`,
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
            <p
              style={{
                color: colors.muted,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              In {highlighted.year}, the illustrative
              Consumer Price Index was{' '}
              <strong style={{ color: colors.cyan }}>
                {highlighted.cpi.toFixed(1)}
              </strong>
              , while the illustrative inflation rate was{' '}
              <strong style={{ color: colors.purple }}>
                {highlighted.inflation.toFixed(1)}%
              </strong>
              . Both visualizations highlight the same
              year to make comparisons easier.
            </p>
          ) : (
            <p
              style={{
                color: colors.muted,
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Hover over either chart to activate linked
              highlighting. The same year will be marked
              on both visualizations, and this economic
              snapshot will update automatically.
            </p>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(230px, 1fr))',
            gap: 14,
            marginTop: 22,
          }}
        >
          {[
            {
              heading: '01 · LINKED HIGHLIGHTING',
              description:
                'Hovering over one chart highlights the corresponding year in both charts.',
            },
            {
              heading: '02 · INTERACTIVE TOOLTIPS',
              description:
                'The selected year and economic value update as users explore the timeline.',
            },
            {
              heading: '03 · PERIOD EXPLORATION',
              description:
                'Users can compare different historical periods using interactive filters.',
            },
          ].map((item) => (
            <div
              key={item.heading}
              style={{
                background: colors.panel,
                border: `1px solid ${colors.border}`,
                borderRadius: 13,
                padding: 20,
              }}
            >
              <div
                style={{
                  color: colors.cyan,
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {item.heading}
              </div>

              <p
                style={{
                  color: colors.muted,
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            padding: 18,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            color: colors.muted,
            fontSize: 12,
            lineHeight: 1.8,
          }}
        >
          <strong style={{ color: colors.white }}>
            Data and methodology note
          </strong>

          <p style={{ marginBottom: 0 }}>
            This prototype uses simulated annual economic
            observations to demonstrate interactive
            visualization techniques. The values are
            illustrative and should not be interpreted
            as official economic statistics.
            For official U.S. consumer price data,
            see the Federal Reserve Economic Data
            series CPIAUCSL.
          </p>

          <a
            href="https://fred.stlouisfed.org/series/CPIAUCSL"
            target="_blank"
            rel="noreferrer"
            style={{ color: colors.cyan }}
          >
            View official CPI data on FRED
          </a>
        </div>
      </div>
    </div>
  );
}

export default Week10;
