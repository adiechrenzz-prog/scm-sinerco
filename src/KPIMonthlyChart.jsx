import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { month: "Jan", inventory: 85, procurement: 90 },
  { month: "Feb", inventory: 88, procurement: 92 },
  { month: "Mar", inventory: 90, procurement: 89 },
];

export default function KPIMonthlyChart() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>{" "}
        <button onClick={() => navigate("/kpi-inventory")}>Inventory</button>{" "}
        <button onClick={() => navigate("/kpi-procurement")}>Procurement</button>{" "}
        <button onClick={() => navigate("/kpi-maintenance")}>Maintenance</button>{" "}
        <button onClick={() => navigate("/kpi-target-actual")}>Target vs Actual</button>
      </div>

      <h2>📈 KPI Monthly Trend</h2>

      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="inventory" />
        <Line type="monotone" dataKey="procurement" />
      </LineChart>
    </div>
  );
}
