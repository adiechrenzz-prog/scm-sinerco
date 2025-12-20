export default function KPIInventory() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2 style={{ borderBottom: '2px solid #0f172a', paddingBottom: '10px' }}>KPI Inventory</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h4>Stock Accuracy</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>98.5%</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h4>Inventory Turnover</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>4.2x</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h4>Dead Stock Ratio</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>2.1%</p>
        </div>
      </div>
    </div>
  );
}