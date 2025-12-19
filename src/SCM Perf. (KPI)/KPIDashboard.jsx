import { useNavigate } from "react-router-dom";
import "./KPIDashboard.css";

const kpiMenus = [
  { label: "KPI Inventory", path: "/kpi-inventory" },
  { label: "KPI Maintenance", path: "/kpi-maintenance" },
  { label: "Monthly Performance Chart", path: "/kpi-monthly-chart" },
  { label: "KPI Procurement", path: "/kpi-procurement" },
  { label: "Target vs Actual", path: "/kpi-target-actual" },
];

export default function KPIDashboard() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 400; 
  const angleStep = (2 * Math.PI) / kpiMenus.length;

  return (
    <div className="kpi-wrapper">
      <button className="back-btn-kpi" onClick={() => navigate("/dashboard-ho")}>
        ← BACK TO MAIN
      </button>

      <svg viewBox={`0 0 ${size} ${size}`} className="kpi-svg" width="85vmin" height="85vmin">
        {/* Connector Lines */}
        {kpiMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`}
              x1={center} y1={center} x2={x} y2={y} 
              className="kpi-connector" 
            />
          );
        })}

        {/* Center Hub KPI */}
        <circle cx={center} cy={center} r="160" className="kpi-center-circle" />
        <text x={center} y={center} textAnchor="middle" className="kpi-center-text">
          <tspan x={center} dy="-5" style={{ fontSize: '38px' }}>SCM</tspan>
          <tspan x={center} dy="45" style={{ fontSize: '32px', fill: '#fbbf24' }}>PERFORMANCE</tspan>
        </text>

        {/* Menu Nodes KPI */}
        {kpiMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          const words = m.label.split(" ");

          return (
            <g key={i} className="kpi-node" onClick={() => navigate(m.path)}>
              <circle cx={x} cy={y} r="105" />
              <text x={x} y={y} textAnchor="middle" className="kpi-node-text">
                {words.length > 2 ? (
                  <>
                    <tspan x={x} dy="-15">{words[0]} {words[1]}</tspan>
                    <tspan x={x} dy="30">{words.slice(2).join(" ")}</tspan>
                  </>
                ) : words.length === 2 ? (
                  <>
                    <tspan x={x} dy="-10">{words[0]}</tspan>
                    <tspan x={x} dy="30">{words[1]}</tspan>
                  </>
                ) : (
                  <tspan x={x} dy="10">{m.label}</tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}