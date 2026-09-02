import { useEffect, useState } from 'react';

type CPIData = {
  observation_date: string;
  CPIAUCSL: number;
};

export const Week02 = () => {
  const [data, setData] = useState<CPIData[]>([]);

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
  .filter((row) => row.observation_date && row.CPIAUCSL > 0);

        setData(rows);
      });
  }, []);

  if (data.length === 0) {
    return <div>Loading CPI data...</div>;
  }

  const values = data.map((d) => d.CPIAUCSL);

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>U.S. Consumer Price Index (CPI)</h1>

      <p>
        This page summarizes monthly Consumer Price Index data from the
        Federal Reserve Economic Data (FRED) database.
      </p>

      <h2>Dataset Summary</h2>

      <p><strong>Rows:</strong> {data.length}</p>
      <p><strong>Columns:</strong> 2</p>
      <p><strong>First observation:</strong> {data[0].observation_date}</p>
      <p>
        <strong>Latest observation:</strong>{' '}
        {data[data.length - 1].observation_date}
      </p>
      <p>
        <strong>Minimum CPI:</strong> {Math.min(...values).toFixed(2)}
      </p>
      <p>
        <strong>Maximum CPI:</strong> {Math.max(...values).toFixed(2)}
      </p>

      <h2>First 10 Observations</h2>

      <table
        style={{
          borderCollapse: 'collapse',
          width: '500px',
        }}
      >
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>
              Date
            </th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>
              CPI
            </th>
          </tr>
        </thead>

        <tbody>
          {data.slice(0, 10).map((d) => (
            <tr key={d.observation_date}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {d.observation_date}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {d.CPIAUCSL}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        Source: U.S. Bureau of Labor Statistics via FRED.
      </p>
    </div>
  );
};
