import { useMemo, useState } from 'react';

type NodeData = {
  name: string;
  value?: number;
  children?: NodeData[];
};

type Segment = {
  name: string;
  value: number;
  depth: number;
  startAngle: number;
  endAngle: number;
  color: string;
  path: string[];
};

const data: NodeData = {
  name: 'Global Economy',
  children: [
    {
      name: 'Americas',
      children: [
        { name: 'United States', value: 26 },
        { name: 'Canada', value: 8 },
        { name: 'Brazil', value: 10 },
        { name: 'Mexico', value: 7 },
      ],
    },
    {
      name: 'Europe',
      children: [
        { name: 'Germany', value: 12 },
        { name: 'United Kingdom', value: 10 },
        { name: 'France', value: 9 },
        { name: 'Italy', value: 7 },
        { name: 'Spain', value: 6 },
      ],
    },
    {
      name: 'Asia',
      children: [
        { name: 'China', value: 22 },
        { name: 'Japan', value: 11 },
        { name: 'India', value: 15 },
        { name: 'South Korea', value: 7 },
        { name: 'Indonesia', value: 6 },
      ],
    },
    {
      name: 'Africa',
      children: [
        { name: 'Nigeria', value: 7 },
        { name: 'South Africa', value: 6 },
        { name: 'Egypt', value: 5 },
        { name: 'Kenya', value: 4 },
        { name: 'Zimbabwe', value: 3 },
      ],
    },
    {
      name: 'Oceania',
      children: [
        { name: 'Australia', value: 8 },
        { name: 'New Zealand', value: 4 },
      ],
    },
  ],
};

const colors = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#059669',
  '#0891b2',
  '#4f46e5',
];

const getValue = (node: NodeData): number => {
  if (node.value !== undefined) return node.value;

  return (
    node.children?.reduce((sum, child) => sum + getValue(child), 0) ?? 0
  );
};

const polar = (angle: number, radius: number) => ({
  x: Math.cos(angle - Math.PI / 2) * radius,
  y: Math.sin(angle - Math.PI / 2) * radius,
});

const arcPath = (
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
) => {
  const startOuter = polar(startAngle, outerRadius);
  const endOuter = polar(endAngle, outerRadius);
  const startInner = polar(startAngle, innerRadius);
  const endInner = polar(endAngle, innerRadius);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return `
    M ${startOuter.x} ${startOuter.y}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}
    L ${endInner.x} ${endInner.y}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}
    Z
  `;
};

const findNode = (node: NodeData, path: string[]): NodeData => {
  if (path.length === 0) return node;

  const next = node.children?.find((child) => child.name === path[0]);

  if (!next) return node;

  return findNode(next, path.slice(1));
};

const buildSegments = (
  node: NodeData,
  startAngle = 0,
  endAngle = Math.PI * 2,
  depth = 1,
  path: string[] = [],
  colorOffset = 0,
): Segment[] => {
  if (!node.children) return [];

  const total = node.children.reduce(
    (sum, child) => sum + getValue(child),
    0,
  );

  let currentAngle = startAngle;
  const segments: Segment[] = [];

  node.children.forEach((child, index) => {
    const childValue = getValue(child);
    const angle =
      ((endAngle - startAngle) * childValue) / total;

    const childStart = currentAngle;
    const childEnd = currentAngle + angle;

    segments.push({
      name: child.name,
      value: childValue,
      depth,
      startAngle: childStart,
      endAngle: childEnd,
      color: colors[(colorOffset + index) % colors.length],
      path: [...path, child.name],
    });

    if (child.children) {
      segments.push(
        ...buildSegments(
          child,
          childStart,
          childEnd,
          depth + 1,
          [...path, child.name],
          colorOffset + index,
        ),
      );
    }

    currentAngle = childEnd;
  });

  return segments;
};

export const Week07 = () => {
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [hovered, setHovered] = useState<Segment | null>(null);

  const currentNode = useMemo(
    () => findNode(data, selectedPath),
    [selectedPath],
  );

  const segments = useMemo(
    () => buildSegments(currentNode),
    [currentNode],
  );

  const currentValue = getValue(currentNode);

  const handleCenterClick = () => {
    if (selectedPath.length > 0) {
      setSelectedPath(selectedPath.slice(0, -1));
      setHovered(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #fdf2f8 100%)',
        padding: '40px 28px',
        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: '#0f172a',
      }}
    >
      <div
        style={{
          maxWidth: '1180px',
          margin: '0 auto',
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '7px 12px',
              borderRadius: '999px',
              background: '#dbeafe',
              color: '#1d4ed8',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            WEEK 7 • INSPIRATION RECREATION
          </div>

          <h1
            style={{
              margin: '14px 0 8px',
              fontSize: '36px',
              lineHeight: 1.1,
            }}
          >
            Interactive Zoomable Sunburst
          </h1>

          <p
            style={{
              maxWidth: '760px',
              color: '#475569',
              fontSize: '16px',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            This visualization recreates the idea of a zoomable sunburst:
            hierarchical information is represented through nested circular
            segments. Click a region to explore its countries and use the
            center circle to return to the previous level.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)',
            gap: '22px',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.94)',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 18px 50px rgba(15,23,42,0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '18px',
                  }}
                >
                  Global Economy Explorer
                </div>

                <div
                  style={{
                    color: '#64748b',
                    fontSize: '13px',
                    marginTop: '4px',
                  }}
                >
                  Click a segment to zoom into the hierarchy
                </div>
              </div>

              <div
                style={{
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#475569',
                }}
              >
                {selectedPath.length === 0
                  ? 'Global View'
                  : selectedPath.join(' → ')}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '600px',
              }}
            >
              <svg
                viewBox="-320 -320 640 640"
                style={{
                  width: '100%',
                  maxWidth: '650px',
                  overflow: 'visible',
                }}
              >
                {segments.map((segment, index) => {
                  const innerRadius =
                    segment.depth === 1 ? 95 : 190;

                  const outerRadius =
                    segment.depth === 1 ? 185 : 285;

                  return (
                    <path
                      key={`${segment.name}-${index}`}
                      d={arcPath(
                        segment.startAngle,
                        segment.endAngle,
                        innerRadius,
                        outerRadius,
                      )}
                      fill={segment.color}
                      opacity={
                        hovered === null ||
                        hovered.name === segment.name
                          ? 0.92
                          : 0.45
                      }
                      stroke="white"
                      strokeWidth="3"
                      style={{
                        cursor: 'pointer',
                        transition: 'opacity 0.2s ease',
                      }}
                      onMouseEnter={() => setHovered(segment)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => {
                        const clicked = findNode(
                          currentNode,
                          segment.path,
                        );

                        if (clicked.children) {
                          setSelectedPath([
                            ...selectedPath,
                            ...segment.path,
                          ]);
                          setHovered(null);
                        }
                      }}
                    />
                  );
                })}

                <circle
                  cx="0"
                  cy="0"
                  r="82"
                  fill="#0f172a"
                  style={{
                    cursor:
                      selectedPath.length > 0
                        ? 'pointer'
                        : 'default',
                  }}
                  onClick={handleCenterClick}
                />

                <text
                  x="0"
                  y="-12"
                  textAnchor="middle"
                  fill="white"
                  fontSize="15"
                  fontWeight="700"
                  pointerEvents="none"
                >
                  {hovered?.name ?? currentNode.name}
                </text>

                <text
                  x="0"
                  y="14"
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="13"
                  pointerEvents="none"
                >
                  {hovered
                    ? `${hovered.value} units`
                    : `${currentValue} total`}
                </text>

                {selectedPath.length > 0 && (
                  <text
                    x="0"
                    y="38"
                    textAnchor="middle"
                    fill="#93c5fd"
                    fontSize="11"
                    pointerEvents="none"
                  >
                    Click center to go back
                  </text>
                )}
              </svg>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div
              style={{
                background: '#0f172a',
                color: 'white',
                borderRadius: '22px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#93c5fd',
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                CURRENT SELECTION
              </div>

              <div
                style={{
                  fontSize: '25px',
                  fontWeight: 700,
                  marginTop: '10px',
                }}
              >
                {hovered?.name ?? currentNode.name}
              </div>

              <div
                style={{
                  fontSize: '38px',
                  fontWeight: 800,
                  marginTop: '16px',
                }}
              >
                {hovered?.value ?? currentValue}
              </div>

              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                }}
              >
                Relative economic value
              </div>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '22px',
                padding: '24px',
              }}
            >
              <h3 style={{ marginTop: 0 }}>
                How to explore
              </h3>

              <p
                style={{
                  color: '#475569',
                  lineHeight: 1.65,
                  fontSize: '14px',
                }}
              >
                Hover over a segment to identify the category and
                its value.
              </p>

              <p
                style={{
                  color: '#475569',
                  lineHeight: 1.65,
                  fontSize: '14px',
                }}
              >
                Click a region to zoom into its countries. Click the
                dark center circle to return to the previous level.
              </p>
            </div>

            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '22px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  color: '#1d4ed8',
                  fontWeight: 700,
                  marginBottom: '8px',
                }}
              >
                Why this inspired me
              </div>

              <div
                style={{
                  color: '#334155',
                  fontSize: '14px',
                  lineHeight: 1.65,
                }}
              >
                I liked how the sunburst combines hierarchy and
                interaction in one compact visualization. Instead of
                showing every detail at once, users can progressively
                explore the data by clicking into categories.
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '22px',
            color: '#64748b',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          Week 7 • Recreated as an interactive React visualization
        </div>
      </div>
    </div>
  );
};
