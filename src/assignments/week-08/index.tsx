
import { useEffect, useMemo, useState } from 'react';

type Point = {
  date: string;
  value: number;
};

type Period = {
  name: string;
  start: string;
  end: string;
};

const periods: Period[] = [
  { name: 'All Years', start: '1947-01-01', end: '2026-12-31' },
  { name: '1970s Inflation', start: '1970-01-01', end: '1982-12-31' },
  { name: '2008 Crisis', start: '2007-01-01', end: '2010-12-31' },
  { name: 'COVID-19', start: '2019-01-01', end: '2021-12-31' },
  { name: 'Post-COVID', start: '2022-01-01', end: '2026-12-31' },
];

const colors = {
  background: '#08111f',
  card: '#111e32',
  border: '#26364d',
  blue: '#38bdf8',
  purple: '#a78bfa',
  green: '#34d399',
  text: '#f8fafc',
  muted: '#9fb0c8',
};

const formatNumber = (n: number) =>
  n.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });

function parseCSV(text: string): Point[] {
  return text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, value] = line.replace(/"/g, '').split(',');

      return {
        date: (date || '').trim(),
        value: Number(value),
      };
    })
    .filter(
      (d) =>
        /^\d{4}-\d{2}-\d{2}$/.test(d.date) &&
        Number.isFinite(d.value) &&
        d.value > 0
    )
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getInflation(data: Point[]): Point[] {
  return data.slice(12).map((d, i) => ({
    date: d.date,
    value: ((d.value / data[i].value) - 1) * 100,
  }));
}

function Chart({
  data,
  color,
  label,
  unit,
  onHover,
}: {
  data: Point[];
  color: string;
  label: string;
  unit: string;
  onHover: (point: Point | null) => void;
}) {
  const width = 850;
  const height = 290;
  const left = 65;
  const right = 25;
  const top = 25;
  const bottom = 45;

  if (data.length < 2) {
    return (
      <p style={{ color: colors.muted, padding: 30 }}>
        Not enough data for this period.
      </p>
    );
  }

  const values = data.map((d) => d.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = Math.max((maximum - minimum) * 0.12, 0.5);

  const minY = minimum - padding;
  const maxY = maximum + padding;

  const x = (i: number) =>
    left + (i / (data.length - 1)) * (width - left - right);

  const y = (value: number) =>
    top +
    ((maxY - value) / (maxY - minY)) *
      (height - top - bottom);

  const path = data
    .map(
      (d, i) =>
        `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`
    )
    .join(' ');

  const ticks = [0, 1, 2, 3, 4];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{
        width: '100%',
        display: 'block',
        cursor: 'crosshair',
      }}
      role="img"
      aria-label={label}
      onMouseMove={(event) => {
        const rect =
          event.currentTarget.getBoundingClientRect();

        const mouseX =
          ((event.clientX - rect.left) / rect.width) *
          width;

        const index = Math.max(
          0,
          Math.min(
            data.length - 1,
            Math.round(
              ((mouseX - left) /
                (width - left - right)) *
                (data.length - 1)
            )
          )
        );

        onHover(data[index]);
      }}
      onMouseLeave={() => onHover(null)}
    >
      {ticks.map((tick) => {
        const value =
          minY + ((maxY - minY) * tick) / 4;

        return (
          <g key={tick}>
            <line
              x1={left}
              x2={width - right}
              y1={y(value)}
              y2={y(value)}
              stroke="#304057"
              strokeDasharray="4 6"
            />
            <text
              x={left - 12}
              y={y(value) + 4}
              textAnchor="end"
              fill={colors.muted}
              fontSize="12"
            >
              {value.toFixed(1)}
            </text>
          </g>
        );
      })}

      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <text
        x={left}
        y={height - 10}
        fill={colors.muted}
        fontSize="13"
      >
        {data[0].date.slice(0, 4)}
      </text>

      <text
        x={width - right}
        y={height - 10}
        fill={colors.muted}
        fontSize="13"
        textAnchor="end"
      >
        {data[data.length - 1].date.slice(0, 4)}
      </text>

      <text
        x={width / 2}
        y={height - 10}
        fill={colors.muted}
        fontSize="12"
        textAnchor="middle"
      >
        {unit}
      </text>
    </svg>
  );
}

export const Week08 = () => {
  const [data, setData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] =
    useState('All Years');
  const [metric, setMetric] =
    useState<'cpi' | 'inflation'>('inflation');
  const [hovered, setHovered] =
    useState<Point | null>(null);
  const [startPercent, setStartPercent] = useState(0);
  const [endPercent, setEndPercent] = useState(100);

  useEffect(() => {
    fetch(
      `${import.meta.env.BASE_URL}data/cpi/CPIAUCSL.csv`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Could not load CPI data (${response.status})`
          );
        }
        return response.text();
      })
      .then((text) => {
        const parsed = parseCSV(text);

        if (parsed.length === 0) {
          throw new Error('The CPI file has no valid rows.');
        }

        setData(parsed);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  const period =
    periods.find((p) => p.name === selectedPeriod) ||
    periods[0];

  const sourceData = useMemo(
    () => (metric === 'inflation' ? getInflation(data) : data),
    [data, metric]
  );

  const periodData = useMemo(
    () =>
      sourceData.filter(
        (d) =>
          d.date >= period.start &&
          d.date <= period.end
      ),
    [sourceData, period]
  );

  const filteredData = useMemo(() => {
    if (!periodData.length) return [];

    const last = periodData.length - 1;

    const start = Math.floor(
      (startPercent / 100) * last
    );

    const end = Math.ceil(
      (endPercent / 100) * last
    );

    return periodData.slice(start, end + 1);
  }, [periodData, startPercent, endPercent]);

  const first = filteredData[0];
  const last = filteredData[filteredData.length - 1];

  const change =
    first && last && first.value !== 0
      ? ((last.value - first.value) /
          Math.abs(first.value)) *
        100
      : null;

  const average = filteredData.length
    ? filteredData.reduce((sum, d) => sum + d.value, 0) /
      filteredData.length
    : null;

  const buttonStyle = (active: boolean) => ({
    padding: '11px 17px',
    borderRadius: 10,
    border: `1px solid ${
      active ? colors.blue : colors.border
    }`,
    background: active ? '#155eaa' : colors.card,
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 600 as const,
  });

  const cardStyle = {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 17,
    padding: 22,
  };

  const stat = (
    label: string,
    value: string,
    accent: string
  ) => (
    <div style={{ ...cardStyle, flex: '1 1 180px' }}>
      <div
        style={{
          fontSize: 12,
          color: colors.muted,
          marginBottom: 12,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 27,
          fontWeight: 750,
          color: accent,
        }}
      >
        {value}
      </div>
    </div>
  );

  const suffix = metric === 'inflation' ? '%' : '';

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${colors.background}, #12213b)`,
        minHeight: '100vh',
        color: colors.text,
        padding: '35px clamp(16px, 4vw, 60px)',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1180, margin: 'auto' }}>
        <div
          style={{
            color: colors.blue,
            letterSpacing: 3,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          WEEK 08 · ECONOMIC DATA EXPLORATION
        </div>

        <h1
          style={{
            fontSize: 'clamp(30px, 4vw, 48px)',
            marginBottom: 8,
          }}
        >
          U.S. Economic Time Machine
        </h1>

        <p
          style={{
            color: colors.muted,
            lineHeight: 1.7,
            maxWidth: 800,
          }}
        >
          Travel through major economic events and explore
          how U.S. consumer prices and inflation have
          changed over time. Filter economic periods,
          adjust the timeline, and interact with the data.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            margin: '27px 0',
          }}
        >
          {periods.map((p) => (
            <button
              key={p.name}
              style={buttonStyle(
                selectedPeriod === p.name
              )}
              onClick={() => {
                setSelectedPeriod(p.name);
                setStartPercent(0);
                setEndPercent(100);
                setHovered(null);
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {loading && <p>Loading economic data...</p>}

        {error && (
          <div
            style={{
              ...cardStyle,
              color: '#fca5a5',
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 15,
                marginBottom: 23,
              }}
            >
              {stat(
                'Selected Economic Period',
                selectedPeriod,
                colors.blue
              )}

              {stat(
                'Starting Value',
                first
                  ? `${formatNumber(first.value)}${suffix}`
                  : '—',
                colors.purple
              )}

              {stat(
                'Latest Value',
                last
                  ? `${formatNumber(last.value)}${suffix}`
                  : '—',
                colors.green
              )}

              {stat(
                metric === 'inflation'
                  ? 'Average Inflation'
                  : 'CPI Change',
                metric === 'inflation'
                  ? average === null
                    ? '—'
                    : `${average.toFixed(2)}%`
                  : change === null
                    ? '—'
                    : `${change.toFixed(2)}%`,
                colors.blue
              )}
            </div>

            <section
              style={{
                ...cardStyle,
                marginBottom: 20,
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Explore the Economic Timeline
              </h2>

              <p
                style={{
                  color: colors.muted,
                  fontSize: 13,
                }}
              >
                Select the economic indicator and adjust
                the timeline to investigate a smaller
                period.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginBottom: 22,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  style={buttonStyle(metric === 'inflation')}
                  onClick={() => {
                    setMetric('inflation');
                    setHovered(null);
                  }}
                >
                  Inflation Rate (%)
                </button>

                <button
                  style={buttonStyle(metric === 'cpi')}
                  onClick={() => {
                    setMetric('cpi');
                    setHovered(null);
                  }}
                >
                  Consumer Price Index
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 25,
                }}
              >
                <label style={{ flex: '1 1 230px' }}>
                  <span style={{ color: colors.muted }}>
                    Start of timeline
                  </span>

                  <input
                    type="range"
                    min="0"
                    max="99"
                    value={startPercent}
                    onChange={(e) =>
                      setStartPercent(
                        Math.min(
                          Number(e.target.value),
                          endPercent - 1
                        )
                      )
                    }
                    style={{
                      display: 'block',
                      width: '100%',
                      marginTop: 14,
                      accentColor: colors.blue,
                    }}
                  />
                </label>

                <label style={{ flex: '1 1 230px' }}>
                  <span style={{ color: colors.muted }}>
                    End of timeline
                  </span>

                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={endPercent}
                    onChange={(e) =>
                      setEndPercent(
                        Math.max(
                          Number(e.target.value),
                          startPercent + 1
                        )
                      )
                    }
                    style={{
                      display: 'block',
                      width: '100%',
                      marginTop: 14,
                      accentColor: colors.purple,
                    }}
                  />
                </label>
              </div>

              <p
                style={{
                  color: colors.blue,
                  fontSize: 13,
                  marginBottom: 0,
                }}
              >
                {first?.date || '—'} to{' '}
                {last?.date || '—'}
              </p>
            </section>

            <section style={cardStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 15,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h2 style={{ marginBottom: 5 }}>
                    {metric === 'inflation'
                      ? 'U.S. Annual Inflation Rate'
                      : 'U.S. Consumer Price Index'}
                  </h2>

                  <p
                    style={{
                      color: colors.muted,
                      fontSize: 13,
                    }}
                  >
                    Move your mouse across the chart to
                    inspect monthly observations.
                  </p>
                </div>

                <span
                  style={{
                    background: '#173c62',
                    color: colors.blue,
                    padding: '9px 14px',
                    borderRadius: 20,
                    fontSize: 12,
                  }}
                >
                  FRED Economic Data
                </span>
              </div>

              <Chart
                data={filteredData}
                color={
                  metric === 'inflation'
                    ? colors.blue
                    : colors.purple
                }
                label={
                  metric === 'inflation'
                    ? 'Annual inflation rate'
                    : 'Consumer Price Index'
                }
                unit="Year"
                onHover={setHovered}
              />

              <div
                style={{
                  background: '#182a45',
                  padding: 17,
                  borderRadius: 12,
                  marginTop: 10,
                  color: colors.text,
                }}
              >
                {hovered ? (
                  <>
                    <strong>{hovered.date}</strong>
                    {' · '}
                    {formatNumber(hovered.value)}
                    {suffix}
                  </>
                ) : (
                  'Hover over the chart to explore a data point.'
                )}
              </div>
            </section>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 17,
                marginTop: 22,
              }}
            >
              <div style={cardStyle}>
                <h3 style={{ color: colors.blue }}>
                  Economic Event Explorer
                </h3>
                <p
                  style={{
                    color: colors.muted,
                    lineHeight: 1.7,
                  }}
                >
                  Compare inflation across the 1970s,
                  the 2008 financial crisis, COVID-19,
                  and the post-COVID period.
                </p>
              </div>

              <div style={cardStyle}>
                <h3 style={{ color: colors.purple }}>
                  Interactive Time Filtering
                </h3>
                <p
                  style={{
                    color: colors.muted,
                    lineHeight: 1.7,
                  }}
                >
                  Adjust the starting and ending dates to
                  focus on specific periods without
                  losing the broader economic context.
                </p>
              </div>

              <div style={cardStyle}>
                <h3 style={{ color: colors.green }}>
                  Data Interpretation
                </h3>
                <p
                  style={{
                    color: colors.muted,
                    lineHeight: 1.7,
                  }}
                >
                  CPI measures the price level, while
                  annual inflation measures the percentage
                  change in CPI over 12 months.
                </p>
              </div>
            </div>

            <div
              style={{
                ...cardStyle,
                marginTop: 22,
                borderLeft: `4px solid ${colors.blue}`,
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                Week 8 Project Development
              </h3>

              <p
                style={{
                  color: colors.muted,
                  lineHeight: 1.8,
                }}
              >
                This iteration builds on my earlier CPI
                visualization by introducing a more
                comprehensive dashboard interface,
                economic event navigation, interactive
                time filtering, and the ability to
                switch between CPI levels and annual
                inflation rates.
              </p>

              <p
                style={{
                  color: colors.muted,
                  lineHeight: 1.8,
                }}
              >
                These improvements support the analytical
                tasks identified in my project proposal,
                particularly comparing economic periods,
                identifying trends, and investigating
                unusual changes.
              </p>
            </div>

            <p
              style={{
                color: colors.muted,
                fontSize: 12,
                marginTop: 25,
              }}
            >
              Source: U.S. Bureau of Labor Statistics
              via Federal Reserve Economic Data (FRED).
              Series: CPIAUCSL. Inflation calculated as
              the 12-month percentage change in CPI.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
