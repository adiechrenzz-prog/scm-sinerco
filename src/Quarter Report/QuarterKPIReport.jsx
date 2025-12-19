import { useState, useEffect } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";

export default function QuarterKPIReport() {
  const [kpiData, setKpiData] = useState({ inventory: 0, procurement: 0, maintenance: 0 });

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#7b003f" }}>📊 Quarterly KPI Summary 2025</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={cardStyle}><h3>Inventory</h3><p>95% Achievement</p></div>
        <div style={cardStyle}><h3>Procurement</h3><p>88% Achievement</p></div>
        <div style={cardStyle}><h3>Maintenance</h3><p>92% Achievement</p></div>
      </div>
    </div>
  );
}
const cardStyle = { flex: 1, background: "#fff", padding: "20px", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" };