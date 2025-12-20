import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; 
import "./AssetLocationDashboard.css";

const locationMenus = [
  { label: "Asset By Location", path: "/asset-by-location" },
  { label: "Location Master", path: "/location-master" },
];

export default function AssetLocationDashboard() {
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

  if (initializing) return null;

  const size = 1000;
  const center = size / 2;
  const radius = 330; 

  return (
    <div className="asset-loc-wrapper">
      <button onClick={() => navigate("/dashboard-ho")} className="back-btn">
        ← BACK TO HOME
      </button>

      <div className="svg-container">
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
          {/* Garis */}
          {locationMenus.map((_, i) => (
            <line 
              key={i}
              x1={center} y1={center} 
              x2={center} y2={i === 0 ? center - radius : center + radius} 
              className="connector-line"
            />
          ))}

          {/* Hub Pusat */}
          <g>
            <circle cx={center} cy={center} r="140" className="hub-circle" />
            <text x={center} y={center} textAnchor="middle" className="hub-text">
              <tspan x={center} dy="-5">GASJACK</tspan>
              <tspan x={center} dy="55">ASSETS</tspan>
            </text>
          </g>

          {/* Tombol Menu */}
          {locationMenus.map((m, i) => {
            const isTop = i === 0;
            const x = center;
            const y = isTop ? center - radius : center + radius;
            const words = m.label.split(" ");

            return (
              <g key={i} className="menu-node" onClick={() => navigate(m.path)}>
                <circle cx={x} cy={y} r="120" className="node-circle" />
                <text x={x} y={y} textAnchor="middle" className="node-text" pointerEvents="none">
                  {words.map((word, idx) => (
                    <tspan 
                      x={x} 
                      key={idx}
                      dy={words.length === 3 
                        ? (idx === 0 ? "-35" : "45") 
                        : (idx === 0 ? "-5" : "50")
                      }
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
    </div>
  );
}