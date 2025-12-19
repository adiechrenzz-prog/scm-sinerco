import { useNavigate } from "react-router-dom";
import "./OilDashboard.css";

const oilMenus = [
  { label: "Oil Analysis", path: "/oil-analysis" },
  { label: "Oil Location", path: "/oil-location" },
  { label: "Monthly Recap", path: "/oil-monthly-recap" },
  { label: "Oil Price", path: "/oil-price" },
  { label: "Oil Usage", path: "/oil-usage" },
];

export default function OilDashboard() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 380; 
  const angleStep = (2 * Math.PI) / oilMenus.length;

  return (
    <div className="oil-wrapper">
      <button className="oil-back-btn" onClick={() => navigate("/dashboard-ho")}>
        ← BACK
      </button>

      <svg viewBox={`0 0 ${size} ${size}`} className="oil-svg" width="85vmin" height="85vmin">
        {/* Connector Lines */}
        {oilMenus.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} className="oil-line" />;
        })}

        {/* Center Hub */}
        <circle cx={center} cy={center} r="160" className="oil-center-circle" />
        <text x={center} y={center} textAnchor="middle" className="oil-center-text">
          <tspan x={center} dy="-5" style={{ fontSize: '35px' }}>OIL</tspan>
          <tspan x={center} dy="45" style={{ fontSize: '35px' }}>CONSUMPTION</tspan>
        </text>

        {/* Menu Nodes */}
        {oilMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g key={i} className="oil-node" onClick={() => navigate(m.path)}>
              <circle cx={x} cy={y} r="110" />
              <text x={x} y={y} textAnchor="middle" className="oil-node-text">
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