import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardPM.css";

const pmMenus = [
  { label: "PM Unit List", path: "/pm-unit-list" },
  { label: "PM Schedule", path: "/pm-schedule" },
  { label: "PM Checklist", path: "/pm-checklist" },
  { label: "PM Reminder", path: "/pm-reminder" },
  { label: "PM History", path: "/pm-history" },
];

export default function DashboardPM() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 380;
  const angleStep = (2 * Math.PI) / pmMenus.length;

  return (
    <div className="pm-dashboard-wrapper">
      {/* Tombol Back */}
      <button 
        className="pm-dashboard-back-btn" 
        onClick={() => navigate("/dashboard-ho")}
        style={{ zIndex: 1000, cursor: "pointer", position: "relative" }}
      >
        ← BACK TO HOME
      </button>

      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="pm-dashboard-svg" 
        width="85vmin" 
        height="85vmin"
        style={{ overflow: "visible", display: "block", margin: "auto" }}
      >
        {/* Connector Lines */}
        {pmMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`} 
              x1={center} y1={center} x2={x} y2={y} 
              className="pm-dashboard-line" 
            />
          );
        })}

        {/* Center Hub */}
        <g style={{ pointerEvents: "none" }}>
          <circle cx={center} cy={center} r="160" className="pm-dashboard-center-circle" />
          <text x={center} y={center} textAnchor="middle" className="pm-dashboard-center-text">
            <tspan x={center} dy="-5">PREVENTIVE</tspan>
            <tspan x={center} dy="45">MAINTENANCE</tspan>
          </text>
        </g>

        {/* Menu Nodes */}
        {pmMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g 
              key={`node-${i}`} 
              className="pm-dashboard-node" 
              onClick={() => navigate(m.path)}
            >
              <circle cx={x} cy={y} r="110" className="pm-node-circle" />
              
              <text 
                x={x} 
                y={y} 
                textAnchor="middle" 
                className="pm-dashboard-node-text"
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