import React from 'react';
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function FieldAssets() {
  const navigate = useNavigate();

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([{ Asset: "Generator A", Location: "Jatibarang", Status: "Good" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "FieldAssets");
    XLSX.writeFile(wb, "FieldAssets.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Field Assets Report", 14, 10);
    doc.autoTable({
      head: [['Asset Name', 'Location', 'Condition']],
      body: [['Generator A', 'Jatibarang', 'Good']],
    });
    doc.save("FieldAssets.pdf");
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/field-inventory-dashboard")}>← Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <h2>Field Assets Monitoring</h2>
        <div>
          <button onClick={exportExcel} style={{ marginRight: '10px' }}>Excel</button>
          <button onClick={exportPDF}>PDF</button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead style={{ background: '#065f46', color: 'white' }}>
          <tr>
            <th style={{ padding: '10px' }}>Asset ID</th>
            <th style={{ padding: '10px' }}>Description</th>
            <th style={{ padding: '10px' }}>Field Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>AST-001</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Centrifugal Pump</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Tambun</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}