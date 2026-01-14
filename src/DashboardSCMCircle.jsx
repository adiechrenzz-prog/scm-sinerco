import React, { useEffect, useState } from "react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./DashboardSCMCircle.css";

const menus = [
  { label: "Inventory", path: "/dashboard-inventory"},
  { label: "Instrument Cal.", path: "/dashboard-instrumen"},
  { label: "PM Service", path: "/dashboard-pm"},
  { label: "PSV Asset Reg.", path: "/dashboard-psv"},
  { label: "Asset Locations", path: "/asset-locations-dashboard" },
  { label: "Stock Opname", path: "/dashboard-stock-opname"},
  { label: "Oil Consumption", path: "/oil-dashboard" },
  { label: "Procurement", path: "/procurement-dashboard" },
  { label: "SOP", path: "/sop-scm" },
  { label: "Control Panels", path: "/control-panels" },
  { label: "Field Inventory", path: "/field-inventory-dashboard" },
  { label: "Sasaran Mutu", path: "/sasaran-dashboard"},
  { label: "Quarter Report", path: "/quarter-dashboard" },
  { label: "SCM Perf. (KPI)", path: "/kpi-dashboard" },
];

export default function DashboardSCMCircle() {
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);

  // Proteksi Halaman: Cek status login Firebase
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Jika tidak ada user, arahkan ke login secara paksa
        navigate("/login", { replace: true });
      } else {
        // Jika ada user, matikan loading initializing
        setInitializing(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  // Ukuran kanvas dan proporsi visual
  const size = 1000; 
  const center = size / 2;
  const radius = 380; 
  const angleStep = (2 * Math.PI) / menus.length;

  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      try {
        // Hapus data lokal agar bersih
        localStorage.removeItem("user_field_data");
        // Sign out dari Firebase
        await signOut(auth);
        // Kembali ke login
        navigate("/login", { replace: true });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  if (initializing) return null;

  return (
    <div className="dashboard-container">
      {/* Tombol Logout */}
      <button className="btn-logout-mini" onClick={handleLogout}>
        LOGOUT
      </button>

      <div className="svg-wrapper">
        <svg viewBox={`0 0 ${size} ${size}`} className="main-svg">
          {/* Garis Orbit Putus-putus */}
          <circle cx={center} cy={center} r={radius} className="orbit-path" />

          {/* Garis Penghubung dari Pusat ke Node */}
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

          {/* Pusat Dashboard: Supply Chain Management */}
          <g className="center-hub">
            <circle cx={center} cy={center} r="130" className="hub-circle" />
            <text x={center} y={center} textAnchor="middle" className="hub-text">
              <tspan x={center} dy="-5">SUPPLY CHAIN</tspan>
              <tspan x={center} dy="35" className="hub-subtext">MANAGEMENT</tspan>
            </text>
          </g>

          {/* Node-node Menu Lingkaran */}
          {menus.map((m, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            
            const words = m.label.split(" ");
            const totalLines = words.length;

            return (
              <g 
                key={i} 
                className="menu-node" 
                onClick={() => navigate(m.path)}
                style={{ cursor: "pointer" }}
              >
                <circle cx={x} cy={y} r="75" className="node-circle" />
                <text x={x} y={y} textAnchor="middle" className="node-label">
                  {words.map((word, idx) => {
                    // Kalkulasi posisi baris teks agar tetap di tengah lingkaran node
                    const dyOffset = idx === 0 ? -( (totalLines - 1) * 10 ) + 5 : 20;
                    return (
                      <tspan x={x} dy={dyOffset} key={idx}>
                        {word}
                      </tspan>
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