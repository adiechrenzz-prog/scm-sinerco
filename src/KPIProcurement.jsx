import { useNavigate } from "react-router-dom";

export default function KPIProcurement() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>{" "}
        <button onClick={() => navigate("/kpi-inventory")}>Inventory</button>{" "}
        <button onClick={() => navigate("/kpi-maintenance")}>Maintenance</button>{" "}
        <button onClick={() => navigate("/kpi-monthly-chart")}>Monthly Chart</button>{" "}
        <button onClick={() => navigate("/kpi-target-actual")}>Target vs Actual</button>
      </div>

      <h2>🛒 KPI Procurement</h2>

      <ul>
        <li>PO On-Time (%)</li>
        <li>Supplier Lead Time</li>
        <li>Cost Saving</li>
        <li>Supplier Performance</li>
      </ul>
    </div>
  );
}
