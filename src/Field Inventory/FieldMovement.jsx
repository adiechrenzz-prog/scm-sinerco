import React from 'react';
import { useNavigate } from "react-router-dom";

export default function FieldMovement() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/field-inventory-dashboard")}>← Back</button>
      <h2>Field Stock Movement</h2>
      <p>Log perpindahan barang antar station atau lokasi kerja.</p>
    </div>
  );
}