import React from 'react';
import { useNavigate } from "react-router-dom";

export default function GoodsReceiving() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/procurement-dashboard")}>← Back</button>
      <h2>Goods Receiving (GR)</h2>
      <p>Halaman untuk verifikasi barang datang dari supplier.</p>
    </div>
  );
}