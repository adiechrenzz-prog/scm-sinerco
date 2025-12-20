import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

// Konfigurasi Menu (Sama dengan Jatibarang)
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

export default function DashboardJatiasri() {
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
      } else {
        setInitializing(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  // Pengaturan Dimensi SVG
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

  if (initializing) return null;

  // Identitas Khusus Jatiasri
  const displayTitle = "JATIASRI";

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container {
          width: 100vw;
          height: 100vh;
          background: #f1f5f9;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          overflow: hidden;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .dashboard-header {
          position: absolute;
          top: 15px; 
          width: 100%;
          text-align: center;
          z-index: 5;
        }
        .field-title {
          color: #1e293b;
          font-size: clamp(22px, 5vw, 36px);
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .svg-wrapper {
          width: 88vmin;
          height: 88vmin;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 40px;
        }
        .main-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .orbit-path {
          fill: none;
          stroke: #cbd5e1;
          stroke-width: 1.5;
          stroke-dasharray: 8 4;
        }
        .connector-line {
          stroke: #941b4c;
          stroke-width: 1.2;
          opacity: 0.2;
        }
        .hub-circle {
          fill: #941b4c;
          stroke: #fff;
          stroke-width: 6;
          filter: drop-shadow(0 6px 12px rgba(148, 27, 76, 0.3));
        }
        .hub-text {
          fill: #fff;
          font-size: 24px;
          font-weight: bold;
        }
        .hub-subtext {
          font-size: 16px;
          font-weight: 300;
        }
        .menu-node {
          cursor: pointer;
        }
        .node-circle {
          fill: #fff;
          stroke: #941b4c;
          stroke-width: 3;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .menu-node:hover .node-circle {
          fill: #941b4c;
          r: 85;
          stroke: #fff;
        }
        .node-label {
          fill: #334155;
          font-size: 13px;
          font-weight: 700;
          pointer-events: none;
        }
        .menu-node:hover .node-label {
          fill: #fff;
        }
        .btn-logout-mini {
          position: absolute;
          top: 20px;
          right: 25px;
          padding: 10px 18px;
          background: #941b4c;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
          z-index: 10;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .btn-logout-mini:hover {
          background: #7a163e;
        }
      `}</style>

      <div className="dashboard-header">
        <h2 className="field-title">FIELD {displayTitle}</h2>
      </div>

      <button className="btn-logout-mini" onClick={handleLogout}>LOGOUT</button>

      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${size} ${size}`} className="main-svg">
          <circle cx={center} cy={center} r={radius} className="orbit-path" />

          {menus.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return <line key={i} x1={center} y1={center} x2={x} y2={y} className="connector-line" />;
          })}

          <g className="center-hub">
            <circle cx={center} cy={center} r="145" className="hub-circle" />
            <text x={center} y={center} textAnchor="middle" className="hub-text">
              <tspan x={center} dy="-5">SUPPLY CHAIN</tspan>
              <tspan x={center} dy="35" className="hub-subtext">MANAGEMENT</tspan>
            </text>
          </g>

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
                    <tspan x={x} dy={idx === 0 ? "5" : "22"} key={idx}>{word}</tspan>
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