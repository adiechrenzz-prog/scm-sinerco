import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPSV.css";

const psvMenus = [
  { label: "PSV List", path: "/psv-list" },
  { label: "PSV Status", path: "/psv-status" },
  { label: "PSV Location", path: "/psv-location" },
  { label: "Serial Number", path: "/psv-serial-number" },
  { label: "Set Pressure", path: "/psv-set-pressure" },
  { label: "Certificate", path: "/psv-certificate" },
];

export default function DashboardPSV() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 380;
  const angleStep = (2 * Math.PI) / psvMenus.length;

  return (
    <div className="psv-dash-wrapper">
      {/* PERBAIKAN: Mengarahkan kembali ke dashboard utama SCM */}
      <button 
        className="psv-dash-back-btn" 
        onClick={() => navigate("/dashboard-scm")}
      >
        ← BACK TO HOME
      </button>

      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="psv-dash-svg" 
        width="85vmin" 
        height="85vmin"
        style={{ overflow: "visible", display: "block", margin: "auto" }}
      >
        {/* Garis Penghubung (Connector) */}
        {psvMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`} 
              x1={center} y1={center} x2={x} y2={y} 
              className="psv-dash-line" 
            />
          );
        })}

        {/* Lingkaran Pusat (Center Hub) */}
        <g style={{ pointerEvents: "none" }}>
          <circle cx={center} cy={center} r="160" className="psv-dash-center-circle" />
          <text x={center} y={center} textAnchor="middle" className="psv-dash-center-text">
            <tspan x={center} dy="-5">PSV</tspan>
            <tspan x={center} dy="45">MANAGEMENT</tspan>
          </text>
        </g>

        {/* Menu Nodes (Lingkaran Menu) */}
        {psvMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g 
              key={`node-${i}`} 
              className="psv-dash-node" 
              onClick={() => navigate(m.path)}
            >
              <circle cx={x} cy={y} r="110" className="psv-node-circle" />
              
              <text 
                x={x} 
                y={y} 
                textAnchor="middle" 
                className="psv-dash-node-text"
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