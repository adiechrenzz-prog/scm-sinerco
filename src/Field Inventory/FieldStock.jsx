import React from 'react';
import { useNavigate } from "react-router-dom";

export default function FieldStock() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/field-inventory-dashboard")}>← Back</button>
      <h2>Field Stock Status</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '20px', background: '#ecfdf5', borderRadius: '10px', textAlign: 'center' }}>
          <h3>Total Items</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>450</p>
        </div>
      </div>
    </div>
  );
}