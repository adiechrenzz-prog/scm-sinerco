import React from 'react';
import { useNavigate } from "react-router-dom";

export default function PurchaseOrder() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/procurement-dashboard")}>← Back</button>
      <h2>Purchase Order (PO) Management</h2>
      <p>Halaman untuk memproses dokumen PO ke Supplier.</p>
    </div>
  );
}