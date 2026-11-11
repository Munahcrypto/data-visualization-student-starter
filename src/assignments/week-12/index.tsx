
import { useEffect, useMemo, useState } from 'react';

type RecordRow = {
  diabetes: number;
  bmi: number;
  age: number;
};

type Cell = {
  age: number;
  bin: number;
  n: number;
  hits: number;
  share: number;
};

const AGE_LABELS = [
  '18–24', '25–29', '30–34', '35–39', '40–44',
  '45–49', '50–54', '55–59', '60–64', '65–69',
  '70–74', '75–79', '80+',
];

const BMI_START = 15;
const BMI_STEP = 2.5;
const BMI_BINS = 18;
const MIN_N = 30;

function bmiBin(value: number) {
  return Math.max(
    0,
    Math.min(BMI_BINS - 1, Math.floor(
      (value - BMI_START) / BMI_STEP
    ))
  );
}

function binLabel(index: number) {
  const low = BMI_START + index * BMI_STEP;
  return index === BMI_BINS - 1
    ? `${low}+`
    : `${low}–${low + BMI_STEP}`;
}

function colorForShare(value: number) {
  const stops = [
    [255, 255, 204],
    [161, 218, 180],
    [65, 182, 196],
    [44, 127, 184],
    [37, 52, 148],
    [8, 29, 88],
  ];

  const scaled = Math.min(0.9999, value / 0.5) * 5;
  const i = Math.floor(scaled);
  const t = scaled - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, 5)];

  return `rgb(${a.map((v, j) =>
    Math.round(v + (b[j] - v) * t)
  ).join(',')})`;
}

export function Week12() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [metric, setMetric] = useState('diabetes');
  const [selected, setSelected] = useState<Cell | null>(null);
  const [hovered, setHovered] = useState<Cell | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    fetch(`${base}data/diabetes_health_indicators_vizhub_sample.csv`)
      .then(response => {
        if (!response.ok) throw new Error('CSV file not found');
        return response.text();
      })
      .then(text => {
        const lines = text.trim().split(/\r?\n/);
        const headers = lines[0].split(',');
        const statusIndex = headers.indexOf('Diabetes_012');
        const bmiIndex = headers.indexOf('BMI');
        const ageIndex = headers.indexOf('Age');

        if ([statusIndex, bmiIndex, ageIndex].includes(-1)) {
          throw new Error('Required CSV columns are missing');
        }

        const parsed = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            diabetes: Number(values[statusIndex]),
            bmi: Number(values[bmiIndex]),
            age: Number(values[ageIndex]),
          };
        }).filter(row =>
          Number.isFinite(row.diabetes) &&
          Number.isFinite(row.bmi) &&
          Number.isInteger(row.age) &&
          row.age >= 1 && row.age <= 13
        );

        setRows(parsed);
      })
      .catch(err => setError(String(err)));
  }, []);

  const cells = useMemo(() => {
    const map = new Map<string, Cell>();
    const target = metric === 'diabetes' ? 2 : 1;

    for (const row of rows) {
      const bin = bmiBin(row.bmi);
      const key = `${row.age}-${bin}`;
      let cell = map.get(key);

      if (!cell) {
        cell = {
          age: row.age, bin,
          n: 0, hits: 0, share: 0,
        };
        map.set(key, cell);
      }

      cell.n++;
      if (row.diabetes === target) cell.hits++;
    }

    return Array.from(map.values()).map(cell => ({
      ...cell,
      share: cell.n ? cell.hits / cell.n : 0,
    }));
  }, [rows, metric]);

  const selectedCell = selected
    ? cells.find(c =>
        c.age === selected.age && c.bin === selected.bin
      ) || null
    : null;

  const active = hovered || selectedCell;
  const width = 1100;
  const height = 610;
  const left = 100;
  const top = 48;
  const plotWidth = 860;
  const plotHeight = 425;
  const cellWidth = plotWidth / BMI_BINS;
  const cellHeight = plotHeight / 13;

  const styles: Record<string, React.CSSProperties> = {
    page: {
      maxWidth: 1200,
      margin: '0 auto',
      padding: 24,
      fontFamily: 'Arial, sans-serif',
      color: '#182438',
    },
    panel: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 14,
      padding: 20,
      marginTop: 18,
    },
    select: {
      padding: '9px 12px',
      borderRadius: 8,
      border: '1px solid #cbd5e1',
      background: 'white',
      marginLeft: 10,
    },
    button: {
      padding: '9px 12px',
      borderRadius: 8,
      border: '1px solid #cbd5e1',
      background: '#f8fafc',
      marginLeft: 10,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.page}>
      <div style={{
        color: '#0891b2',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 2,
      }}>
        WEEK 12 · VIZHUB AI EXPLORATION
      </div>

      <h1 style={{ marginBottom: 8 }}>
        Diabetes Risk Factors: Age × BMI Heatmap
      </h1>

      <p style={{ color: '#475569', lineHeight: 1.6 }}>
        Explore how diabetes status varies across age groups
        and body mass index using a sample of CDC BRFSS
        2015 survey responses.
      </p>

      <div style={styles.panel}>
        <label htmlFor="diabetes-metric">
          <strong>Metric:</strong>
        </label>

        <select
          id="diabetes-metric"
          style={styles.select}
          value={metric}
          onChange={e => {
            setMetric(e.target.value);
            setSelected(null);
            setHovered(null);
          }}
        >
          <option value="diabetes">
            Diabetes share
          </option>
          <option value="prediabetes">
            Prediabetes share
          </option>
        </select>

        <button
          style={styles.button}
          disabled={!selected}
          onClick={() => setSelected(null)}
        >
          Clear selection
        </button>

        <p style={{
          color: '#64748b',
          fontSize: 13,
          lineHeight: 1.6,
        }}>
          This is an adjusted sample with deliberately
          increased representation of prediabetes and
          diabetes. Percentages describe this sample only,
          not U.S. population prevalence. Relationships
          are associations, not evidence of causation.
        </p>

        {error && (
          <p style={{ color: '#b91c1c' }}>{error}</p>
        )}

        {!error && rows.length === 0 && (
          <p>Loading healthcare dataset...</p>
        )}

        {rows.length > 0 && (
          <>
            <div style={{
              display: 'flex',
              gap: 20,
              flexWrap: 'wrap',
              marginBottom: 12,
              color: '#334155',
              fontSize: 14,
            }}>
              <span>
                <strong>{rows.length.toLocaleString()}</strong>
                {' '}respondents
              </span>
              <span>
                <strong>{cells.length}</strong>
                {' '}populated age–BMI groups
              </span>
              <span>
                <strong>{metric === 'diabetes'
                  ? 'Diabetes'
                  : 'Prediabetes'}</strong>
                {' '}selected metric
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                style={{
                  width: '100%',
                  minWidth: 650,
                  height: 'auto',
                }}
                role="img"
                aria-label="Interactive heatmap comparing diabetes share by age and BMI"
              >
                <defs>
                  <pattern
                    id="week12-hatch"
                    width="7"
                    height="7"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(45)"
                  >
                    <line
                      x1="0" y1="0" x2="0" y2="7"
                      stroke="#334155"
                      strokeWidth="1.5"
                    />
                  </pattern>
                </defs>

                <text
                  x={left + plotWidth / 2}
                  y="24"
                  textAnchor="middle"
                  fontSize="18"
                  fontWeight="700"
                  fill="#182438"
                >
                  {metric === 'diabetes'
                    ? 'Diabetes share'
                    : 'Prediabetes share'}
                  {' '}by age band and BMI bin
                </text>

                {AGE_LABELS.map((label, i) => (
                  <text
                    key={label}
                    x={left - 12}
                    y={top + i * cellHeight + cellHeight / 2 + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#334155"
                  >
                    {label}
                  </text>
                ))}

                {Array.from({ length: BMI_BINS }, (_, i) => (
                  <text
                    key={i}
                    transform={`translate(${
                      left + i * cellWidth + cellWidth / 2
                    },${top + plotHeight + 13}) rotate(-48)`}
                    textAnchor="end"
                    fontSize="10"
                    fill="#475569"
                  >
                    {binLabel(i)}
                  </text>
                ))}

                {cells.map(cell => {
                  const x = left + cell.bin * cellWidth;
                  const y = top + (cell.age - 1) * cellHeight;
                  const isActive = active?.age === cell.age &&
                    active?.bin === cell.bin;

                  return (
                    <g
                      key={`${cell.age}-${cell.bin}`}
                      onMouseEnter={() => setHovered(cell)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(cell)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect
                        x={x + 1}
                        y={y + 1}
                        width={cellWidth - 2}
                        height={cellHeight - 2}
                        rx="2"
                        fill={colorForShare(cell.share)}
                        stroke={isActive ? '#f97316' : '#ffffff'}
                        strokeWidth={isActive ? 3 : 1}
                      />

                      {cell.n < MIN_N && (
                        <rect
                          x={x + 1}
                          y={y + 1}
                          width={cellWidth - 2}
                          height={cellHeight - 2}
                          fill="url(#week12-hatch)"
                          pointerEvents="none"
                        />
                      )}

                      <text
                        x={x + cellWidth / 2}
                        y={y + cellHeight / 2 + 4}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={isActive ? 700 : 400}
                        fill={cell.share > 0.32
                          ? '#ffffff' : '#172033'}
                        pointerEvents="none"
                      >
                        {cell.n}
                      </text>
                    </g>
                  );
                })}

                <text
                  x={left + plotWidth / 2}
                  y={height - 22}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#334155"
                >
                  BMI (2.5-unit bins; values outside 15–60 clipped)
                </text>

                <text
                  transform={`translate(25,${
                    top + plotHeight / 2
                  }) rotate(-90)`}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#334155"
                >
                  Age band
                </text>

                <text
                  x="1000" y="40"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#334155"
                >
                  Share
                </text>

                {Array.from({ length: 50 }, (_, i) => (
                  <rect
                    key={i}
                    x="986"
                    y={top + i * 7}
                    width="23"
                    height="7.2"
                    fill={colorForShare((49 - i) / 49 * 0.5)}
                  />
                ))}

                {[0, 10, 20, 30, 40, 50].map(p => (
                  <text
                    key={p}
                    x="1017"
                    y={top + (50 - p) / 50 * 343 + 5}
                    fontSize="11"
                    fill="#334155"
                  >
                    {p}%
                  </text>
                ))}

                <rect
                  x="983"
                  y="435"
                  width="18"
                  height="18"
                  fill="url(#week12-hatch)"
                  stroke="#94a3b8"
                />
                <text
                  x="1007" y="449"
                  fontSize="12"
                  fill="#475569"
                >
                  n &lt; 30
                </text>
              </svg>
            </div>

            <div style={{
              background: '#eff6ff',
              padding: 15,
              borderRadius: 10,
              marginTop: 12,
              minHeight: 72,
            }}>
              {active ? (
                <>
                  <strong>
                    Age {AGE_LABELS[active.age - 1]}
                    {' '}· BMI {binLabel(active.bin)}
                  </strong>
                  <div style={{ marginTop: 6 }}>
                    {active.n} respondents · {active.hits} in
                    selected category ·{' '}
                    <strong>
                      {(active.share * 100).toFixed(1)}%
                    </strong>
                  </div>
                  {active.n < MIN_N && (
                    <div style={{
                      color: '#9a3412',
                      marginTop: 6,
                    }}>
                      Small group: interpret cautiously
                      (fewer than 30 respondents).
                    </div>
                  )}
                </>
              ) : (
                <>
                  <strong>Explore the heatmap</strong>
                  <div style={{ marginTop: 6 }}>
                    Hover over or click a cell to inspect
                    its respondent count and category share.
                    Numbers inside cells show sample counts.
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <p style={{
        fontSize: 12,
        color: '#64748b',
        lineHeight: 1.6,
      }}>
        Source: CDC Behavioral Risk Factor Surveillance
        System, 2015, via the UCI Diabetes Health Indicators
        dataset. Visualization adapted from a VizHub
        AI-generated prototype. The 9,000-record sample
        is not representative of population prevalence.
      </p>
    </div>
  );
}

export default Week12;
