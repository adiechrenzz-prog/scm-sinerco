import React from 'react';
import { useNavigate } from "react-router-dom";

export default function OilPrice() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/oil-dashboard")}>← Back</button>
      <h2>Oil Price Database</h2>
      <p>Daftar harga oli per liter/drum sesuai kontrak supplier.</p>
    </div>
  );
}