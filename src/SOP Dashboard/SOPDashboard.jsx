import { useNavigate } from "react-router-dom";
import "./SOPDashboard.css";

const sopMenus = [
  { label: "Prosedur SCM", path: "/sop-audit" },
  { label: "Form SCM", path: "/sop-file-list" },
  { label: "Sasaran Target Program", path: "/sop-file-viewer" },
  { label: "Identifikasi Isu & Bahaya", path: "/sop-inventory" },
  { label: "Root Cause SCM", path: "/sop-maintenance" },
  { label: "Audit Inventory SCM", path: "/sop-procurement" },
  { label: "Audit Stock Opname", path: "/sop-scm-detail" },
];

export default function SOPDashboard() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 420; 
  const angleStep = (2 * Math.PI) / sopMenus.length;

  return (
    <div className="sop-wrapper">
      {/* Tombol Back ke Dashboard Utama */}
      <button className="back-button" onClick={() => navigate("/dashboard-ho")}>
        ← BACK TO DASHBOARD
      </button>

      <svg viewBox={`0 0 ${size} ${size}`} className="sop-svg" width="85vmin" height="85vmin">
        {/* Garis Konektor */}
        {sopMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`}
              x1={center} y1={center} x2={x} y2={y} 
              className="sop-connector" 
            />
          );
        })}

        {/* Lingkaran Tengah Khusus SOP */}
        <circle cx={center} cy={center} r="160" className="sop-center-circle" />
        <text x={center} y={center} textAnchor="middle" className="sop-center-text">
          <tspan x={center} dy="5" style={{ fontSize: '45px' }}>SOP</tspan>
          <tspan x={center} dy="40" style={{ fontSize: '18px', opacity: 0.8 }}>SYSTEM</tspan>
        </text>

        {/* Loop Menu SOP */}
        {sopMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          return (
            <g
              key={i}
              className="sop-node"
              onClick={() => navigate(m.path)}
            >
              <circle cx={x} cy={y} r="95" />
              <text x={x} y={y + 8} textAnchor="middle" className="sop-node-text">
                {m.label.split(" ").map((word, idx) => (
                  <tspan x={x} dy={idx === 0 ? 0 : 25} key={idx}>{word}</tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}