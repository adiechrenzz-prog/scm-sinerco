// src/StockOpname/DashboardStockOpname.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardStockOpname.css"; // Mengimpor file CSS yang baru dibuat

const opnameMenus = [
  { label: "Opname Field", path: "/stock-opname-field" },
  { label: "Opname Report", path: "/stock-opname-report" },
  { label: "Opname Schedule", path: "/stock-opname-schedule" },
  { label: "Opname Workshop", path: "/stock-opname-workshop" },
  { label: "Stock Variance", path: "/stock-variance" },
];

export default function DashboardStockOpname() {
  const navigate = useNavigate();
  const size = 1200;
  const center = size / 2;
  const radius = 380;
  const angleStep = (2 * Math.PI) / opnameMenus.length;

  return (
    <div className="opname-dash-wrapper">
      <button className="opname-dash-back-btn" onClick={() => navigate("/dashboard-ho")}>
        ← BACK TO HOME
      </button>

      <svg viewBox={`0 0 ${size} ${size}`} className="opname-dash-svg" width="85vmin" height="85vmin">
        {opnameMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return <line key={`line-${i}`} x1={center} y1={center} x2={x} y2={y} className="opname-dash-line" />;
        })}

        <g style={{ pointerEvents: "none" }}>
          <circle cx={center} cy={center} r="160" className="opname-dash-center-circle" />
          <text x={center} y={center} textAnchor="middle" className="opname-dash-center-text">
            <tspan x={center} dy="-5">STOCK</tspan>
            <tspan x={center} dy="45">OPNAME</tspan>
          </text>
        </g>

        {opnameMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g key={`node-${i}`} className="opname-dash-node" onClick={() => navigate(m.path)}>
              <circle cx={x} cy={y} r="110" className="opname-node-circle" />
              <text x={x} y={y} textAnchor="middle" className="opname-dash-node-text">
                {words.map((word, idx) => (
                  <tspan x={x} dy={idx === 0 ? "5" : "25"} key={idx}>{word}</tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}