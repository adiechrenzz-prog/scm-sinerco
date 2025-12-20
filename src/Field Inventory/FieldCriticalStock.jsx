import React from 'react';
import { useNavigate } from "react-router-dom";

export default function FieldCriticalStock() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/field-inventory-dashboard")}>← Back</button>
      <h2 style={{ color: '#dc2626' }}>Critical Stock Alert (Field)</h2>
      <p>Daftar barang di lapangan yang sudah di bawah safety stock.</p>
    </div>
  );
}