export default function KPIProcurement() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>KPI Procurement</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '20px' }}>
        <div style={{ flex: '1', minWidth: '250px', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '10px' }}>
          <h4>PO Cycle Time</h4>
          <h2 style={{ color: '#0f172a' }}>2.5 Days</h2>
          <small style={{ color: '#10b981' }}>↓ 12% from last month</small>
        </div>
        <div style={{ flex: '1', minWidth: '250px', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '10px' }}>
          <h4>Supplier Lead Time</h4>
          <h2 style={{ color: '#0f172a' }}>14.2 Days</h2>
          <small style={{ color: '#ef4444' }}>↑ 2% from last month</small>
        </div>
      </div>
    </div>
  );
}