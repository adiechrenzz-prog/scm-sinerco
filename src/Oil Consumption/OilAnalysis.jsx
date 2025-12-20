import React from 'react';
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function OilAnalysis() {
  const navigate = useNavigate();

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([{ Date: "2025-12-19", Lab: "Sinerco Lab", Result: "Normal" }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "OilAnalysis");
    XLSX.writeFile(wb, "OilAnalysis.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Oil Analysis Report", 14, 10);
    doc.autoTable({
      head: [['Date', 'Lab Result', 'Status']],
      body: [['2025-12-19', 'Viscosity OK', 'Normal']],
    });
    doc.save("OilAnalysis.pdf");
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate("/oil-dashboard")}>← Back</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <h2>Oil Analysis Report</h2>
        <div>
          <button onClick={exportExcel} style={{ marginRight: '10px' }}>Export Excel</button>
          <button onClick={exportPDF}>Export PDF</button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead style={{ background: '#92400e', color: 'white' }}>
          <tr>
            <th style={{ padding: '10px' }}>Sample Date</th>
            <th style={{ padding: '10px' }}>Equipment ID</th>
            <th style={{ padding: '10px' }}>Condition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>19/12/2025</td>
            <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>PUMP-001</td>
            <td style={{ padding: '10px', color: 'green' }}>Normal</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}