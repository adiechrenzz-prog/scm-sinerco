import React from 'react';
import { useNavigate } from "react-router-dom";

export default function OilMonthlyRecap() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/oil-dashboard")}>← Back</button>
      <h2>Monthly Recap Consumption</h2>
      <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Total Bulan Ini: 1.250 Liter</h3>
      </div>
    </div>
  );
}