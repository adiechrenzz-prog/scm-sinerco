import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database, auth } from "../firebase";
import { ref, onValue, set, push, remove } from "firebase/database";
import { signOut, onAuthStateChanged } from "firebase/auth";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function StockOpnameField() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    partNumber: "",
    description: "",
    stockSystem: "",
    stockActual: "",
    field: "Jatibarang", // Default field
  });

  // --- AUTH CHECK ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/login");
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- LOAD DATA ---
  useEffect(() => {
    const opnameRef = ref(database, "stock_opname_field");
    return onValue(opnameRef, (snap) => {
      const data = snap.val() || {};
      const arr = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      setItems(arr);
    });
  }, []);

  // --- ACTIONS ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.partNumber || !formData.stockActual) return alert("Isi data dengan lengkap!");

    const newRef = push(ref(database, "stock_opname_field"));
    const variance = Number(formData.stockActual) - Number(formData.stockSystem);
    
    set(newRef, {
      ...formData,
      variance,
      date: new Date().toLocaleString(),
      inspector: auth.currentUser?.email || "Unknown"
    });

    setFormData({ partNumber: "", description: "", stockSystem: "", stockActual: "", field: "Jatibarang" });
    alert("Data Opname tersimpan!");
  };

  const deleteItem = (id) => {
    if (window.confirm("Hapus data ini?")) {
      remove(ref(database, `stock_opname_field/${id}`));
    }
  };

  // --- EXPORT FUNCTIONS ---
  const exportExcel = () => {
    const dataToExport = items.map(i => ({
      Tanggal: i.date,
      Field: i.field,
      "Part Number": i.partNumber,
      Deskripsi: i.description,
      "Stok Sistem": i.stockSystem,
      "Stok Aktual": i.stockActual,
      Selisih: i.variance,
      Inspektur: i.inspector
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "OpnameData");
    XLSX.writeFile(wb, "Stock_Opname_Field_Report.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Stock Opname Field", 14, 15);
    const tableRows = items.map(i => [
      i.date, i.partNumber, i.stockSystem, i.stockActual, i.variance
    ]);
    autoTable(doc, {
      startY: 20,
      head: [["Tanggal", "Part Number", "Sistem", "Aktual", "Selisih"]],
      body: tableRows,
    });
    doc.save("Stock_Opname_Report.pdf");
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📋 Stock Opname Field</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/dashboard-stock-opname")} style={btnStyle}>⬅ Kembali</button>
          <button onClick={() => signOut(auth).then(() => navigate("/login"))} style={btnDanger}>Logout</button>
        </div>
      </div>

      {/* FORM INPUT */}
      <form onSubmit={handleSubmit} style={formBoxStyle}>
        <div style={gridStyle}>
          <input name="partNumber" placeholder="Part Number" value={formData.partNumber} onChange={handleChange} style={inputStyle} />
          <input name="description" placeholder="Deskripsi Barang" value={formData.description} onChange={handleChange} style={inputStyle} />
          <input name="stockSystem" type="number" placeholder="Qty Sistem" value={formData.stockSystem} onChange={handleChange} style={inputStyle} />
          <input name="stockActual" type="number" placeholder="Qty Aktual" value={formData.stockActual} onChange={handleChange} style={inputStyle} />
          <select name="field" value={formData.field} onChange={handleChange} style={inputStyle}>
            <option value="Jatibarang">Jatibarang</option>
            <option value="Tambun">Tambun</option>
            <option value="Subang">Subang</option>
          </select>
          <button type="submit" style={btnSubmit}>Simpan Data</button>
        </div>
      </form>

      <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
        <button onClick={exportExcel} style={btnExport}>Export Excel</button>
        <button onClick={exportPDF} style={btnExport}>Export PDF</button>
      </div>

      {/* TABLE DATA */}
      <div style={{ overflowX: "auto" }}>
        <table border="1" width="100%" cellPadding="10" style={{ borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "#f4f4f4" }}>
            <tr>
              <th>Tanggal</th>
              <th>Field</th>
              <th>Part Number</th>
              <th>Sistem</th>
              <th>Aktual</th>
              <th>Variance</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.date}</td>
                <td>{i.field}</td>
                <td>{i.partNumber}</td>
                <td>{i.stockSystem}</td>
                <td>{i.stockActual}</td>
                <td style={{ color: i.variance < 0 ? "red" : "green", fontWeight: "bold" }}>
                  {i.variance}
                </td>
                <td>
                  <button onClick={() => deleteItem(i.id)} style={{ color: "red", cursor: "pointer" }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- STYLES ---
const btnStyle = { padding: "8px 15px", cursor: "pointer", background: "#eee", border: "1px solid #ccc", borderRadius: "4px" };
const btnDanger = { padding: "8px 15px", cursor: "pointer", background: "#ff4d4d", color: "white", border: "none", borderRadius: "4px" };
const btnExport = { padding: "8px 15px", cursor: "pointer", background: "#2196F3", color: "white", border: "none", borderRadius: "4px" };
const btnSubmit = { background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const formBoxStyle = { background: "#f9f9f9", padding: "20px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #ddd" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" };
const inputStyle = { padding: "10px", border: "1px solid #ccc", borderRadius: "4px" };