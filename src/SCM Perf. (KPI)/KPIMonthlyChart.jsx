export default function KPIMonthlyChart() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Monthly Performance Trend</h2>
      <div style={{ height: '300px', width: '100%', background: '#f1f5f9', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px', borderRadius: '12px' }}>
        {/* Simulasi Grafik Batang Sederhana */}
        {[60, 80, 45, 90, 70, 85].map((height, i) => (
          <div key={i} style={{ width: '40px', height: `${height}%`, background: '#fbbf24', borderRadius: '4px 4px 0 0' }}>
            <span style={{ fontSize: '10px', display: 'block', textAlign: 'center', marginTop: '-20px' }}>M-{i+1}</span>
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', marginTop: '10px', color: '#64748b' }}>Monthly KPI Achievement Trend (Last 6 Months)</p>
    </div>
  );
}