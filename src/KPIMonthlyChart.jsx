// src/KPIMonthlyChart.jsx
import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { ref, onValue } from "firebase/database";
import { database } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function KPIMonthlyChart() {
  const navigate = useNavigate();
  const chartRef = useRef(null);

  const loadChart = (data) => {
    const ctx = chartRef.current.getContext("2d");

    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Total Pengeluaran",
            data: data.cost,
            backgroundColor: "rgba(0,123,255,0.6)",
          },
          {
            label: "PM Completion (%)",
            data: data.pmRate,
            backgroundColor: "rgba(40,167,69,0.6)",
          },
        ],
      },
    });
  };

  useEffect(() => {
    onValue(ref(database, "kpiMonthly"), snap => {
      const v = snap.val() || {};
      loadChart(v);
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 KPI Monthly Chart</h2>
      <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>

      <canvas ref={chartRef} width={900} height={400} style={{ marginTop: 20 }}></canvas>
    </div>
  );
}
