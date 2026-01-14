import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardInstrumen.css";

const instMenus = [
  { label: "Instrument List", path: "/instrument-list" },
  { label: "Calibration Certificate", path: "/calibration-certificate" },
  { label: "Calibration History", path: "/calibration-history" },
  { label: "Calibration Schedule", path: "/calibration-schedule" },
  { label: "Calibration Reminder", path: "/calibration-reminder" },
];

export default function DashboardInstrumen() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 380;
  const angleStep = (2 * Math.PI) / instMenus.length;

  return (
    <div className="inst-dash-wrapper">
      {/* PERBAIKAN: Navigasi diubah ke /dashboard-scm agar tetap login */}
      <button 
        className="inst-dash-back-btn" 
        onClick={() => navigate("/dashboard-scm")}
      >
        ← BACK TO HOME
      </button>

      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="inst-dash-svg" 
        width="85vmin" 
        height="85vmin"
        style={{ overflow: "visible", display: "block", margin: "auto" }}
      >
        {/* Connector Lines */}
        {instMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`} 
              x1={center} y1={center} x2={x} y2={y} 
              className="inst-dash-line" 
            />
          );
        })}

        {/* Center Hub */}
        <g style={{ pointerEvents: "none" }}>
          <circle cx={center} cy={center} r="160" className="inst-dash-center-circle" />
          <text x={center} y={center} textAnchor="middle" className="inst-dash-center-text">
            <tspan x={center} dy="-5">INSTRUMENT</tspan>
            <tspan x={center} dy="45">CALIBRATION</tspan>
          </text>
        </g>

        {/* Menu Nodes */}
        {instMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g 
              key={`node-${i}`} 
              className="inst-dash-node" 
              onClick={() => navigate(m.path)}
            >
              <circle cx={x} cy={y} r="110" className="inst-node-circle" />
              
              <text 
                x={x} 
                y={y} 
                textAnchor="middle" 
                className="inst-dash-node-text"
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