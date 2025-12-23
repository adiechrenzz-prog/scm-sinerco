import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardInventory.css";

const invMenus = [
  { label: "Inventory List", path: "/inventory" },
  { label: "Barang Masuk", path: "/barang-masuk" },
  { label: "Barang Keluar", path: "/barang-keluar" },
  { label: "Approval Keluar", path: "/approval-barang-keluar" },
  { label: "Data Part", path: "/data-part" },
  { label: "Supplier", path: "/supplier" },
  { label: "Tujuan", path: "/tujuan" },
  { label: "DO Print", path: "/do-print" },
  { label: "Stock Opname", path: "/stock-opname"},
];

export default function DashboardInventory() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 380;
  const angleStep = (2 * Math.PI) / invMenus.length;

  return (
    <div className="inv-dash-wrapper">
      {/* Tombol Back */}
      <button 
        className="inv-dash-back-btn" 
        onClick={() => navigate("/dashboard-ho")}
      >
        ← BACK TO HOME
      </button>

      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="inv-dash-svg" 
        width="85vmin" 
        height="85vmin"
        style={{ overflow: "visible", display: "block", margin: "auto" }}
      >
        {/* Connector Lines */}
        {invMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`} 
              x1={center} y1={center} x2={x} y2={y} 
              className="inv-dash-line" 
            />
          );
        })}

        {/* Center Hub */}
        <g style={{ pointerEvents: "none" }}>
          <circle cx={center} cy={center} r="160" className="inv-dash-center-circle" />
          <text x={center} y={center} textAnchor="middle" className="inv-dash-center-text">
            <tspan x={center} dy="-5">INVENTORY</tspan>
            <tspan x={center} dy="45">WAREHOUSE</tspan>
          </text>
        </g>

        {/* Menu Nodes */}
        {invMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g 
              key={`node-${i}`} 
              className="inv-dash-node" 
              onClick={() => navigate(m.path)}
            >
              <circle cx={x} cy={y} r="110" className="inv-node-circle" />
              
              <text 
                x={x} 
                y={y} 
                textAnchor="middle" 
                className="inv-dash-node-text"
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