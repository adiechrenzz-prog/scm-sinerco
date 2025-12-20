import React from 'react';
import { useNavigate } from "react-router-dom";

export default function OilUsage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/oil-dashboard")}>← Back</button>
      <h2>Oil Usage Tracker</h2>
      <p>Input harian penggunaan oli untuk mesin dan kendaraan.</p>
      {/* Tambahkan Form Input di sini */}
    </div>
  );
}