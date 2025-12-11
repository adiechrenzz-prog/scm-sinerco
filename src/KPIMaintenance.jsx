import { useNavigate } from "react-router-dom";

export default function KPIMaintenance() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>{" "}
        <button onClick={() => navigate("/kpi-inventory")}>Inventory</button>{" "}
        <button onClick={() => navigate("/kpi-procurement")}>Procurement</button>{" "}
        <button onClick={() => navigate("/kpi-monthly-chart")}>Monthly Chart</button>{" "}
        <button onClick={() => navigate("/kpi-target-actual")}>Target vs Actual</button>
      </div>

      <h2>🛠 KPI Maintenance</h2>

      <ul>
        <li>PM Compliance (%)</li>
        <li>Breakdown Frequency</li>
        <li>MTTR</li>
        <li>Maintenance Cost</li>
      </ul>
    </div>
  );
}
