import React from 'react';
import { useNavigate } from "react-router-dom";

export default function FieldRequest() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/field-inventory-dashboard")}>← Back</button>
      <h2>Field Material Request</h2>
      <p>Form permintaan barang dari tim lapangan ke gudang pusat.</p>
    </div>
  );
}