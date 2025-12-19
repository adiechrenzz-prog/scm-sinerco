import React from 'react';
import { useNavigate } from "react-router-dom";

export default function OilLocation() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/oil-dashboard")}>← Back</button>
      <h2>Oil Stock by Location</h2>
      <p>Monitoring stok oli di gudang Jatibarang, Tambun, dll.</p>
    </div>
  );
}