import { useNavigate } from "react-router-dom";

export default function KPIInventory() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      {/* NAV */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>{" "}
        <button onClick={() => navigate("/kpi-procurement")}>Procurement</button>{" "}
        <button onClick={() => navigate("/kpi-maintenance")}>Maintenance</button>{" "}
        <button onClick={() => navigate("/kpi-monthly-chart")}>Monthly Chart</button>{" "}
        <button onClick={() => navigate("/kpi-target-actual")}>Target vs Actual</button>
      </div>

      <h2>📦 KPI Inventory</h2>

      <ul>
        <li>Stock Accuracy (%)</li>
        <li>Stock Availability (%)</li>
        <li>Dead Stock Value</li>
        <li>Inventory Turnover</li>
      </ul>
    </div>
  );
}
