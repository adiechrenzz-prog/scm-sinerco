import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./DashboardSCMCircle.css";

const menus = [
  { label: "Inventory", path: "/inventory" },
  { label: "Instrument Cal.", path: "/instrument-list" },
  { label: "PM Service", path: "/pm-unit" },
  { label: "PSV Asset Reg.", path: "/psv" },
  { label: "Asset Locations", path: "/asset-locations" },
  { label: "Stock Opname", path: "/stock-opname" },
  { label: "Oil Consumption", path: "/oil-usage" },
  { label: "Procurement", path: "/purchase-request" },
  { label: "SOP", path: "/sop-scm" },
  { label: "Control Panels", path: "/control-panels" },
  { label: "Field Inventory", path: "/field-inventory" },
  { label: "Quarter Report", path: "/quarter-inventory" },
  { label: "SCM Perf. (KPI)", path: "/kpi-inventory" },
];

export default function DashboardSCMCircle() {
  const navigate = useNavigate();

  /* 🔒 AUTH GUARD (TAMBAHAN AMAN) */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
      }
    });
    return () => unsub();
  }, [navigate]);

  const size = 1400;
  const center = size / 2;
  const radius = 520;
  const angleStep = (2 * Math.PI) / menus.length;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  return (
    <div className="scm-wrapper">
      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        style={{
          position: "fixed",
          top: "12px",
          right: "20px",
          zIndex: 999999,
          padding: "10px 18px",
          background: "#7b003f",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {/* DASHBOARD */}
      <svg viewBox={`0 0 ${size} ${size}`} width="98vmin" height="98vmin">
        {/* CENTER */}
        <circle cx={center} cy={center} r="230" className="center-circle" />

        <text
          x={center}
          y={center - 18}
          textAnchor="middle"
          className="center-text"
        >
          SUPPLY CHAIN
        </text>
        <text
          x={center}
          y={center + 30}
          textAnchor="middle"
          className="center-text"
        >
          MANAGEMENT
        </text>

        {/* MENU */}
        {menus.map((m, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          return (
            <g
              key={i}
              className="menu-node"
              onClick={() => navigate(m.path)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={x} cy={y} r="125" />
              <text x={x} y={y + 8} textAnchor="middle">
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
