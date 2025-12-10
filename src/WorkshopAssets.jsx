
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function WorkshopAssets() {
  const navigate = useNavigate();

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WorkshopAssets");
    XLSX.writeFile(wb, "WorkshopAssets.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("WorkshopAssets", 14, 14);
    autoTable(doc, { head: [["Placeholder"]], body: [["Data"]] });
    doc.save("WorkshopAssets.pdf");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>WorkshopAssets</h2>

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
