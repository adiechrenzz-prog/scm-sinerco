import { useNavigate } from "react-router-dom";
import "./ProcurementDashboard.css";

const procurementMenus = [
  { label: "Purchase Request", path: "/purchase-request" },
  { label: "Purchase Order", path: "/purchase-order" },
  { label: "Goods Receiving", path: "/goods-receiving" },
  { label: "Supplier List", path: "/supplier-list" },
  { label: "Supplier Evaluation", path: "/supplier-evaluation" },
];

export default function ProcurementDashboard() {
  const navigate = useNavigate();

  const size = 1200;
  const center = size / 2;
  const radius = 400; 
  const angleStep = (2 * Math.PI) / procurementMenus.length;

  return (
    <div className="proc-wrapper">
      <button className="proc-back-btn" onClick={() => navigate("/dashboard-ho")}>
        ← BACK TO MAIN
      </button>

      <svg viewBox={`0 0 ${size} ${size}`} className="proc-svg" width="85vmin" height="85vmin">
        <circle cx={center} cy={center} r="160" className="proc-center-circle" />
        <text x={center} y={center} textAnchor="middle" className="proc-center-text">
          <tspan x={center} dy="10">PROCUREMENT</tspan>
        </text>

        {procurementMenus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          const words = m.label.split(" ");

          return (
            <g key={i} className="proc-node" onClick={() => navigate(m.path)}>
              <line x1={center} y1={center} x2={x} y2={y} className="proc-line" />
              <circle cx={x} cy={y} r="110" />
              <text x={x} y={y} textAnchor="middle" className="proc-node-text">
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