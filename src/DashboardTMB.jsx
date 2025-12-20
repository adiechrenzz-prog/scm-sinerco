import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./DashboardTMB.css"; 

// Konfigurasi Menu
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

export default function DashboardTMB() {
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

  const size = 1000; 
  const center = size / 2;
  const radius = 380; 
  const angleStep = (2 * Math.PI) / menus.length;

  const handleLogout = async () => {
    try {
      // 1. Bersihkan cache data field untuk keamanan navigasi antar akun
      localStorage.removeItem("user_field_data");

      // 2. Sign out dari Firebase
      await signOut(auth);

      // 3. Kembali ke login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (initializing) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="field-title">FIELD TMB</h2>
      </div>

      <button className="btn-logout-mini" onClick={handleLogout}>LOGOUT</button>

      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${size} ${size}`} className="main-svg">
          {/* Jalur Lingkaran Luar */}
          <circle cx={center} cy={center} r={radius} className="orbit-path" />

          {/* Garis-garis Penghubung ke Pusat */}
          {menus.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return <line key={i} x1={center} y1={center} x2={x} y2={y} className="connector-line" />;
          })}

          {/* Lingkaran Pusat (Logo/Hub) */}
          <g className="center-hub">
            <circle cx={center} cy={center} r="145" className="hub-circle" />
            <text x={center} y={center} textAnchor="middle" className="hub-text">
              <tspan x={center} dy="-5">SUPPLY CHAIN</tspan>
              <tspan x={center} dy="35" className="hub-subtext">MANAGEMENT</tspan>
            </text>
          </g>

          {/* Item Menu Berbentuk Lingkaran */}
          {menus.map((m, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            
            const words = m.label.split(" ");
            const totalLines = words.length;

            return (
              <g key={i} className="menu-node" onClick={() => navigate(m.path)}>
                <circle cx={x} cy={y} r="75" className="node-circle" />
                <text x={x} y={y} textAnchor="middle" className="node-label">
                  {words.map((word, idx) => {
                    // Kalkulasi posisi vertikal teks agar simetris di tengah lingkaran
                    const dyOffset = idx === 0 ? -( (totalLines - 1) * 10 ) + 5 : 22;
                    return (
                      <tspan x={x} dy={dyOffset} key={idx}>{word}</tspan>
                    );
                  })}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}