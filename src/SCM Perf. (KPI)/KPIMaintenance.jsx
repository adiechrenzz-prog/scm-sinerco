export default function KPIMaintenance() {
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#0f172a' }}>KPI Maintenance</h2>
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#0f172a', color: 'white' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>Metric</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Target</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Actual</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '12px' }}>PM Compliance</td>
            <td style={{ padding: '12px' }}>100%</td>
            <td style={{ padding: '12px' }}>95%</td>
            <td style={{ padding: '12px', color: 'orange' }}>On Track</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ padding: '12px' }}>MTBF (Hours)</td>
            <td style={{ padding: '12px' }}>&gt; 500</td>
            <td style={{ padding: '12px' }}>540</td>
            <td style={{ padding: '12px', color: 'green' }}>Good</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}