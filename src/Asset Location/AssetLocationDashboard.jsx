import React from "react";
import { useNavigate } from "react-router-dom";
import "./AssetLocationDashboard.css";

const locationMenus = [
  { label: "Asset By Location", path: "/asset-by-location" },
  { label: "Location Master", path: "/location-master" },
];

export default function AssetLocationDashboard() {
  const navigate = useNavigate();

  const size = 1000;
  const center = size / 2;
  const radius = 300;
  const angleStep = (2 * Math.PI) / locationMenus.length;

  return (
    <div className="asset-loc-wrapper">
      <button 
        className="back-btn" 
        onClick={() => navigate("/dashboard-ho")}
        style={{ zIndex: 10, cursor: "pointer" }}
      >
        ← BACK TO HOME
      </button>

      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="asset-loc-svg" 
        width="80vmin" 
        height="80vmin"
        style={{ overflow: "visible" }}
      >
        {/* 1. Connector Lines (Ditaruh paling belakang + pointerEvents none) */}
        {locationMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`} 
              x1={center} y1={center} x2={x} y2={y} 
              className="connector-line" 
              style={{ pointerEvents: "none" }}
            />
          );
        })}

        {/* 2. Center Hub (pointerEvents none agar tidak menutupi klik area lain) */}
        <g style={{ pointerEvents: "none" }}>
          <circle cx={center} cy={center} r="140" className="hub-circle" />
          <text x={center} y={center} textAnchor="middle" className="hub-text">
            <tspan x={center} dy="0">ASSET</tspan>
            <tspan x={center} dy="40">LOCATIONS</tspan>
          </text>
        </g>

        {/* 3. Menu Nodes (Ditaruh paling depan agar prioritas klik) */}
        {locationMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g 
              key={`node-${i}`} 
              className="menu-node" 
              onClick={() => {
                console.log("Navigating to:", m.path);
                navigate(m.path);
              }} 
              style={{ cursor: "pointer" }}
            >
              <circle cx={x} cy={y} r="100" />
              <text 
                x={x} 
                y={y} 
                textAnchor="middle" 
                className="node-text"
                style={{ pointerEvents: "none" }} // Teks tidak menghalangi klik ke lingkaran
              >
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