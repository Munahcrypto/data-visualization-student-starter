import { assignmentsMap, defaultAssignment } from './assignments';

const App = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const example = searchParams.get('example');

  const assignment =
    (example ? assignmentsMap.get(example) : undefined) ?? defaultAssignment;

  const AssignmentComponent = assignment.component;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px minmax(0, 1fr)',
        minHeight: '100vh',
        fontFamily: 'Arial, Helvetica, sans-serif',
        background: '#ffffff',
      }}
    >
      {/* Sidebar */}
      <nav
        style={{
          borderRight: '1px solid #e5e7eb',
          padding: '22px 14px',
          background: '#ffffff',
          minHeight: '100vh',
        }}
      >
        <h3
          style={{
            margin: '0 0 20px 6px',
            fontSize: '18px',
            fontWeight: 700,
            color: '#111827',
          }}
        >
          Assignments
        </h3>

        {Array.from(assignmentsMap.values()).map((item) => {
          const isActive = assignment.id === item.id;

          return (
            <a
              key={item.id}
              href={`?example=${item.id}`}
              style={{
                display: 'block',
                padding: '12px 14px',
                marginBottom: '6px',
                textDecoration: 'none',
                color: isActive ? '#111827' : '#374151',
                borderRadius: '8px',
                background: isActive ? '#f3f4f6' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                transition: 'background 0.2s ease',
              }}
            >
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* Assignment Content */}
      <main
        style={{
          minWidth: 0,
          width: '100%',
          overflowX: 'auto',
        }}
      >
        <AssignmentComponent />
      </main>
    </div>
  );
};

export default App;
