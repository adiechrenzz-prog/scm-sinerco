import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./DashboardSCMCircle.css";

const menus = [
  { label: "Inventory", path: "/inventory" },
  { label: "Instrument Cal.", path: "/instrument-list" },
  { label: "PM Service", path: "/pm-unit" },
  { label: "PSV Asset Reg.", path: "/psv-list" },
  { label: "Asset Locations", path: "/asset-locations-dashboard" },
  { label: "Stock Opname", path: "/stock-opname" },
  { label: "Oil Consumption", path: "/oil-dashboard" },
  { label: "Procurement", path: "/procurement-dashboard" },
  { label: "SOP", path: "/sop-scm" },
  { label: "Control Panels", path: "/control-panels" },
  { label: "Field Inventory", path: "/field-inventory-dashboard" },
  { label: "Sasaran Mutu", path: "/quarter-inventory" },
  { label: "Quarter Report", path: "/quarter-dashboard" },
  { label: "SCM Perf. (KPI)", path: "/kpi-dashboard" },
];

export default function DashboardSCMCircle() {
  const navigate = useNavigate();

  // Ukuran kanvas dan proporsi yang pas agar tidak terlalu besar di layar
  const size = 1000; 
  const center = size / 2;
  const radius = 380; 
  const angleStep = (2 * Math.PI) / menus.length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <button className="btn-logout-mini" onClick={handleLogout}>
        LOGOUT
      </button>

      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${size} ${size}`} className="main-svg">
          {/* Garis Orbit Halus */}
          <circle cx={center} cy={center} r={radius} className="orbit-path" />

          {/* Garis Penghubung dari Tengah */}
          {menus.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return (
              <line 
                key={i} 
                x1={center} y1={center} x2={x} y2={y} 
                className="connector-line" 
              />
            );
          })}

          {/* Pusat: Supply Chain Management */}
          <g className="center-hub">
            <circle cx={center} cy={center} r="130" className="hub-circle" />
            <text x={center} y={center} textAnchor="middle" className="hub-text">
              <tspan x={center} dy="-5">SUPPLY CHAIN</tspan>
              <tspan x={center} dy="35" className="hub-subtext">MANAGEMENT</tspan>
            </text>
          </g>

          {/* Node Menu */}
          {menus.map((m, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const words = m.label.split(" ");

            return (
              <g key={i} className="menu-node" onClick={() => navigate(m.path)}>
                <circle cx={x} cy={y} r="75" className="node-circle" />
                <text x={x} y={y} textAnchor="middle" className="node-label">
                  {words.map((word, idx) => (
                    <tspan x={x} dy={idx === 0 ? "5" : "20"} key={idx}>
                      {word}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}