import { useNavigate } from "react-router-dom";

export default function KPITargetActual() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>{" "}
        <button onClick={() => navigate("/kpi-inventory")}>Inventory</button>{" "}
        <button onClick={() => navigate("/kpi-procurement")}>Procurement</button>{" "}
        <button onClick={() => navigate("/kpi-maintenance")}>Maintenance</button>{" "}
        <button onClick={() => navigate("/kpi-monthly-chart")}>Monthly Chart</button>
      </div>

      <h2>🎯 KPI Target vs Actual</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>KPI</th>
            <th>Target</th>
            <th>Actual</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Stock Accuracy</td>
            <td>98%</td>
            <td>95%</td>
            <td>⚠️</td>
          </tr>
          <tr>
            <td>PO On-Time</td>
            <td>95%</td>
            <td>97%</td>
            <td>✅</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
