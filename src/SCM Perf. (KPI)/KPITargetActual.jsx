export default function KPITargetActual() {
  const data = [
    { label: 'Procurement Saving', target: 500, actual: 480 },
    { label: 'Inventory Level', target: 1200, actual: 1150 },
    { label: 'Asset Reliability', target: 99, actual: 97.5 },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Target vs Actual Achievement</h2>
      {data.map((item, idx) => (
        <div key={idx} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>{item.label}</span>
            <span>{((item.actual / item.target) * 100).toFixed(1)}%</span>
          </div>
          <div style={{ width: '100%', height: '15px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${(item.actual / item.target) * 100}%`, height: '100%', background: '#0f172a' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}