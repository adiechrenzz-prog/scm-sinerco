
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function StockOpnameReport() {
  const navigate = useNavigate();

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StockOpnameReport");
    XLSX.writeFile(wb, "StockOpnameReport.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("StockOpnameReport", 14, 14);
    autoTable(doc, { head: [["Placeholder"]], body: [["Data"]] });
    doc.save("StockOpnameReport.pdf");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>StockOpnameReport</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        <button onClick={exportExcel}>Export Excel</button>
        <button onClick={exportPDF}>Export PDF</button>
        <button onClick={() => signOut(auth).then(() => navigate("/login"))}>
          Logout
        </button>
      </div>

      <hr />
      <p>Template module. Siap dikembangkan.</p>
    </div>
  );
}
