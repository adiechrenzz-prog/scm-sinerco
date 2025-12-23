import React from "react";
import { useNavigate } from "react-router-dom";
import "./SasaranDashboard.css";

export default function SasaranFormula() {
  const navigate = useNavigate();

  const formulaData = [
    { id: 1, sasaran: "Purchase request urgent", formula: "(Jumlah PR Urgent / Total PR) x 100%", standar: "Max 4x per bulan" },
    { id: 2, sasaran: "Sparepart tidak cacat produk", formula: "Jumlah temuan cacat produk", standar: "0 Kasus" },
    { id: 3, sasaran: "Akurasi Stok Warehouse", formula: "(Jumlah Item Sesuai / Total Item Cek) x 100%", standar: "100%" },
    { id: 4, sasaran: "Ketepatan Waktu Delivery", formula: "(Jumlah Delivery Tepat Waktu / Total Delivery) x 100%", standar: "Min 95%" }
  ];

  return (
    <div className="sasaran-container">
      <div className="sasaran-nav">
        <div className="nav-left">
          <button className="btn-home" onClick={() => navigate("/dashboard-ho")}>← HOME</button>
          <button className="btn-formula" onClick={() => navigate("/sasaran-dashboard")}>📊 Dashboard Sasaran</button>
        </div>
      </div>

      <h2 className="main-title">FORMULA PERHITUNGAN KPI SCM</h2>

      <div className="table-responsive">
        <table className="kpi-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}>No</th>
              <th>Sasaran Mutu</th>
              <th>Formula Perhitungan</th>
              <th>Standar / Target</th>
            </tr>
          </thead>
          <tbody>
            {formulaData.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td className="text-left">{item.sasaran}</td>
                <td className="text-left" style={{ color: "#2563eb", fontWeight: "bold" }}>{item.formula}</td>
                <td>{item.standar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "20px", padding: "15px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
        <p style={{ fontSize: "12px", color: "#64748b" }}>
          <strong>Info:</strong> Halaman ini berisi acuan perhitungan untuk mengisi data realisasi bulanan pada Dashboard Sasaran Mutu.
        </p>
      </div>
    </div>
  );
}