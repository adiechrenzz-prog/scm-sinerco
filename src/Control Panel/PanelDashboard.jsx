import { useNavigate } from "react-router-dom";
import "./PanelDashboard.css";

const panelMenus = [
  { label: "Panel Location", path: "/panel-location" },
  { label: "Panel Master", path: "/panel-master" },
  { label: "Panel Specification", path: "/panel-spec" },
  { label: "Panel Status", path: "/panel-status" },
  { label: "Wiring Diagram", path: "/panel-wiring" },
];

export default function PanelDashboard() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 400; 
  const angleStep = (2 * Math.PI) / panelMenus.length;

  return (
    <div className="panel-wrapper">
      {/* PERBAIKAN: Navigasi diubah ke /dashboard-scm agar tidak logout */}
      <button className="back-btn" onClick={() => navigate("/dashboard-scm")}>
        ← BACK
      </button>

      <svg viewBox={`0 0 ${size} ${size}`} className="panel-svg" width="85vmin" height="85vmin">
        {/* Connector Lines */}
        {panelMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`}
              x1={center} y1={center} x2={x} y2={y} 
              className="panel-connector" 
            />
          );
        })}

        {/* Center Hub */}
        <circle cx={center} cy={center} r="160" className="panel-center-circle" />
        <text x={center} y={center} textAnchor="middle" className="panel-center-text">
          <tspan x={center} dy="-5" style={{ fontSize: '35px' }}>CONTROL</tspan>
          <tspan x={center} dy="45" style={{ fontSize: '35px' }}>PANEL</tspan>
        </text>

        {/* Menu Nodes */}
        {panelMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          return (
            <g key={i} className="panel-node" onClick={() => navigate(m.path)}>
              <circle cx={x} cy={y} r="100" />
              <text x={x} y={y + 8} textAnchor="middle" className="panel-node-text">
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