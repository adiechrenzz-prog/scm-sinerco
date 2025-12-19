import { useNavigate } from "react-router-dom";
import "./QuarterDashboard.css";

const quarterMenus = [
  { label: "Inventory Report", path: "/quarter-inventory" },
  { label: "KPI Report", path: "/quarter-kpi" },
  { label: "Maintenance Report", path: "/quarter-maintenance" },
  { label: "Procurement Report", path: "/quarter-procurement" },
  { label: "Quarter Presentation", path: "/quarter-presentation" },
];

export default function QuarterDashboard() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 380; 
  const angleStep = (2 * Math.PI) / quarterMenus.length;

  return (
    <div className="q-wrapper">
      <button className="q-back-btn" onClick={() => navigate("/dashboard-ho")}>
        ← BACK
      </button>

      <svg viewBox={`0 0 ${size} ${size}`} className="q-svg" width="85vmin" height="85vmin">
        {/* Connector Lines */}
        {quarterMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} className="q-line" />;
        })}

        {/* Center Hub */}
        <circle cx={center} cy={center} r="160" className="q-center-circle" />
        <text x={center} y={center} textAnchor="middle" className="q-center-text">
          <tspan x={center} dy="-5" style={{ fontSize: '35px' }}>QUARTERLY</tspan>
          <tspan x={center} dy="45" style={{ fontSize: '35px' }}>REPORTS</tspan>
        </text>

        {/* Menu Nodes */}
        {quarterMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g key={i} className="q-node" onClick={() => navigate(m.path)}>
              <circle cx={x} cy={y} r="110" />
              <text x={x} y={y} textAnchor="middle" className="q-node-text">
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