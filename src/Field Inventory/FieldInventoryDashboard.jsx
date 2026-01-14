import React from "react";
import { useNavigate } from "react-router-dom";
import "./FieldInventoryDashboard.css";

const fieldMenus = [
  { label: "Field Assets", path: "/field-assets" },
  { label: "Critical Stock", path: "/field-critical-stock" },
  { label: "Inventory List", path: "/field-inventory-list" },
  { label: "Stock Movement", path: "/field-movement" },
  { label: "Field Request", path: "/field-request" },
  { label: "Field Stock", path: "/field-stock-status" },
];

export default function FieldInventoryDashboard() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 380;
  const angleStep = (2 * Math.PI) / fieldMenus.length;

  return (
    <div className="field-inv-wrapper">
      {/* PERBAIKAN: Navigasi diubah ke /dashboard-scm */}
      <button 
        className="field-inv-back-btn" 
        onClick={() => navigate("/dashboard-scm")}
        style={{ zIndex: 1000, cursor: "pointer", position: "relative" }}
      >
        ← BACK TO HOME
      </button>

      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="field-inv-svg" 
        width="85vmin" 
        height="85vmin"
        style={{ overflow: "visible", display: "block", margin: "auto" }}
      >
        {/* Connector Lines */}
        {fieldMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`} 
              x1={center} y1={center} x2={x} y2={y} 
              className="field-inv-line" 
              style={{ pointerEvents: "none", stroke: "#800000", strokeWidth: 2, opacity: 0.3 }}
            />
          );
        })}

        {/* Center Hub */}
        <g style={{ pointerEvents: "none" }}>
          <circle cx={center} cy={center} r="160" className="field-inv-center-circle" fill="#800000" />
          <text x={center} y={center} textAnchor="middle" className="field-inv-center-text" fill="white">
            <tspan x={center} dy="-5" style={{ fontWeight: "bold", fontSize: "32px" }}>FIELD</tspan>
            <tspan x={center} dy="45" style={{ fontWeight: "bold", fontSize: "32px" }}>INVENTORY</tspan>
          </text>
        </g>

        {/* Menu Nodes */}
        {fieldMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g 
              key={`node-${i}`} 
              className="field-inv-node" 
              onClick={() => {
                console.log("Navigating to:", m.path);
                navigate(m.path);
              }}
              style={{ cursor: "pointer" }}
            >
              {/* Lingkaran sebagai area klik utama */}
              <circle cx={x} cy={y} r="110" fill="white" stroke="#800000" strokeWidth="3" className="node-circle" />
              
              {/* Teks */}
              <text 
                x={x} 
                y={y} 
                textAnchor="middle" 
                className="field-inv-node-text"
                style={{ pointerEvents: "none", userSelect: "none", fill: "#800000", fontWeight: "600" }}
              >
                {words.map((word, idx) => (
                  <tspan 
                    x={x} 
                    dy={idx === 0 ? "5" : "25"} 
                    key={idx}
                  >
                    {word}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}