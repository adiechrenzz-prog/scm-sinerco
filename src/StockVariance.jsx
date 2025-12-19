import { useState, useEffect } from "react";
import { database } from "./firebase";
import { ref, onValue } from "firebase/database";

export default function StockVariance() {
  const [variance, setVariance] = useState([]);

  useEffect(() => {
    const r = ref(database, "stockVariance");
    onValue(r, (snap) => {
      const val = snap.val() || {};
      setVariance(Object.values(val));
    });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📉 Stock Variance Report</h2>
      <table style={{ width: "100%", background: "#fff" }}>
        <thead>
          <tr>
            <th>Part Number</th>
            <th>System Stock</th>
            <th>Actual Stock</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          {variance.map((v, i) => (
            <tr key={i}>
              <td>{v.partNo}</td>
              <td>{v.system}</td>
              <td>{v.actual}</td>
              <td style={{ color: "red" }}>{v.actual - v.system}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}