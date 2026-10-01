import { assignmentsMap, defaultAssignment } from './assignments';

export const App = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const example = searchParams.get('example');

  const assignment =
    (example ? assignmentsMap.get(example) : undefined) ?? defaultAssignment;

  const AssignmentComponent = assignment.component;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        minHeight: '100vh',
      }}
    >
      <nav
        style={{
          borderRight: '1px solid #ddd',
          padding: '20px 14px',
          background: '#fff',
        }}
      >
        <h3 style={{ marginTop: 0 }}>Assignments</h3>

        {Array.from(assignmentsMap.values()).map((item) => (
          <a
            key={item.id}
            href={`?example=${item.id}`}
            style={{
              display: 'block',
              padding: '12px 10px',
              marginBottom: '4px',
              textDecoration: 'none',
              color: '#111',
              borderRadius: '6px',
              background:
                assignment.id === item.id ? '#f0f1f3' : 'transparent',
              fontWeight: assignment.id === item.id ? 700 : 400,
            }}
          >
            {item.name}
          </a>
        ))}
      </nav>

      <main style={{ minWidth: 0 }}>
        <AssignmentComponent />
      </main>
    </div>
  );
};
