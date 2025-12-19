import React from 'react';
import { useNavigate } from "react-router-dom";

export default function PurchaseRequest() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/procurement-dashboard")}>← Back</button>
      <h2>Purchase Request (PR) List</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#1e293b', color: 'white' }}>
            <th style={{ padding: '10px' }}>PR Number</th>
            <th style={{ padding: '10px' }}>Item Name</th>
            <th style={{ padding: '10px' }}>Qty</th>
            <th style={{ padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>PR-2025-001</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Seal Kit Pump</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>5 Pcs</td>
            <td style={{ padding: '10px', color: 'orange' }}>Pending</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}