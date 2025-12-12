// src/KPITargetActual.jsx
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function KPITargetActual() {
  const navigate = useNavigate();
  const [target, setTarget] = useState({});
  const [actual, setActual] = useState({});

  useEffect(() => {
    onValue(ref(database, "kpiTarget"), snap => setTarget(snap.val() || {}));
    onValue(ref(database, "kpiActual"), snap => setActual(snap.val() || {}));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🎯 KPI Target vs Actual</h2>
      <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>

      <table border="1" width="100%" cellPadding="6" style={{ marginTop: 20 }}>
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
            <td>Procurement Cost</td>
            <td>Rp {target.procurementCost?.toLocaleString()}</td>
            <td>Rp {actual.procurementCost?.toLocaleString()}</td>
            <td>{actual.procurementCost <= target.procurementCost ? "OK" : "Over"}</td>
          </tr>

          <tr>
            <td>PM Completion Rate</td>
            <td>{target.pmRate}%</td>
            <td>{actual.pmRate}%</td>
            <td>{actual.pmRate >= target.pmRate ? "OK" : "LOW"}</td>
          </tr>

          <tr>
            <td>Stock Accuracy</td>
            <td>{target.stockAcc}%</td>
            <td>{actual.stockAcc}%</td>
            <td>{actual.stockAcc >= target.stockAcc ? "OK" : "LOW"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
