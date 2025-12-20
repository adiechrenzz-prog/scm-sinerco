import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase"; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// Import Library Export
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AssetByLocation() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  
  // State Form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newAsset, setNewAsset] = useState({
    unit: "", tahunUnit: "", lokasi: "", refurbish: "", tahunRefurbish: ""
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
      } else {
        setInitializing(false);
        fetchAssets();
      }
    });
    return () => unsub();
  }, [navigate]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "asset_locations"), orderBy("lokasi", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        no: index + 1,
        ...doc.data()
      }));
      setAssets(data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, "asset_locations", editId), newAsset);
        alert("Data berhasil diperbarui!");
      } else {
        await addDoc(collection(db, "asset_locations"), newAsset);
        alert("Data berhasil disimpan!");
      }
      resetForm();
      fetchAssets();
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan.");
    }
  };

  const handleEdit = (item) => {
    setNewAsset({
      unit: item.unit,
      tahunUnit: item.tahunUnit,
      lokasi: item.lokasi,
      refurbish: item.refurbish,
      tahunRefurbish: item.tahunRefurbish
    });
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await deleteDoc(doc(db, "asset_locations", id));
        fetchAssets();
      } catch (error) {
        alert("Gagal menghapus data.");
      }
    }
  };

  const resetForm = () => {
    setNewAsset({ unit: "", tahunUnit: "", lokasi: "", refurbish: "", tahunRefurbish: "" });
    setEditId(null);
    setShowForm(false);
  };

  // --- FITUR EXPORT ---
  const exportExcel = () => {
    const dataToExport = assets.map(item => ({
      NO: item.no,
      UNIT: item.unit,
      "THN UNIT": item.tahunUnit,
      LOKASI: item.lokasi,
      REFURBISH: item.refurbish,
      "THN REFURBISH": item.tahunRefurbish
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GasJack_Assets");
    XLSX.writeFile(workbook, "Data_Unit_GasJack.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Data Unit GasJack Compressor", 14, 15);
    
    autoTable(doc, {
      startY: 25,
      head: [['No', 'Unit', 'Thn Unit', 'Lokasi', 'Refurbish', 'Thn Refurbish']],
      body: assets.map(a => [a.no, a.unit, a.tahunUnit, a.lokasi, a.refurbish, a.tahunRefurbish]),
      theme: 'grid',
      headStyles: { fillStyle: 'f', fillColor: [26, 55, 77] }
    });
    
    doc.save("Data_Unit_GasJack.pdf");
  };

  if (initializing) return null;

  return (
    <div style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
        <div>
          <button onClick={() => navigate("/asset-locations-dashboard")} style={btnBack}>← KEMBALI</button>
          <h2 style={{ color: "#1a374d", margin: "15px 0 5px 0" }}>Data Unit GasJack Compressor</h2>
          <p style={{ color: "#666", margin: 0 }}>Inventory Workshop 2025</p>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={exportExcel} style={{ ...btnExport, backgroundColor: "#217346" }}>EXCEL</button>
          <button onClick={exportPDF} style={{ ...btnExport, backgroundColor: "#d32f2f" }}>PDF</button>
          <button onClick={() => window.print()} style={{ ...btnExport, backgroundColor: "#1a374d" }}>PRINT</button>
          <button onClick={() => setShowForm(!showForm)} style={btnAdd}>
            {showForm ? "BATAL" : "+ TAMBAH DATA"}
          </button>
        </div>
      </div>

      {/* Form Area */}
      {showForm && (
        <div style={formCard}>
          <h3 style={{ marginTop: 0, color: "#1a374d" }}>{editId ? "📝 Edit Asset" : "➕ Tambah Asset Baru"}</h3>
          <form onSubmit={handleSave} style={formGrid}>
            <div style={inputGroup}><label>Unit</label><input required value={newAsset.unit} onChange={(e)=>setNewAsset({...newAsset, unit: e.target.value})} style={inputStyle} placeholder="Contoh: MPI 7101"/></div>
            <div style={inputGroup}><label>Tahun Unit</label><input type="number" value={newAsset.tahunUnit} onChange={(e)=>setNewAsset({...newAsset, tahunUnit: e.target.value})} style={inputStyle} placeholder="YYYY"/></div>
            <div style={inputGroup}><label>Lokasi</label><input required value={newAsset.lokasi} onChange={(e)=>setNewAsset({...newAsset, lokasi: e.target.value})} style={inputStyle} placeholder="Contoh: Jati Asri"/></div>
            <div style={inputGroup}><label>Refurbish</label><input value={newAsset.refurbish} onChange={(e)=>setNewAsset({...newAsset, refurbish: e.target.value})} style={inputStyle} placeholder="Nama Refurbish"/></div>
            <div style={inputGroup}><label>Tahun Refurbish</label><input type="number" value={newAsset.tahunRefurbish} onChange={(e)=>setNewAsset({...newAsset, tahunRefurbish: e.target.value})} style={inputStyle} placeholder="YYYY"/></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
               <button type="submit" style={btnSubmit}>{editId ? "UPDATE DATA" : "SIMPAN KE DATABASE"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Table Area */}
      <div style={tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a374d", color: "white" }}>
              <th style={thStyle}>NO</th>
              <th style={thStyle}>UNIT</th>
              <th style={thStyle}>THN UNIT</th>
              <th style={thStyle}>LOKASI</th>
              <th style={thStyle}>REFURBISH</th>
              <th style={thStyle}>THN REFURBISH</th>
              <th style={thStyle}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>Memuat data...</td></tr>
            ) : assets.length > 0 ? (
              assets.map((item) => (
                <tr key={item.id} style={rowStyle} className="table-row">
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold" }}>{item.no}</td>
                  <td style={tdStyle}>{item.unit}</td>
                  <td style={tdStyle}>{item.tahunUnit || "-"}</td>
                  <td style={tdStyle}>{item.lokasi}</td>
                  <td style={tdStyle}>{item.refurbish || "-"}</td>
                  <td style={tdStyle}>{item.tahunRefurbish || "-"}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button onClick={() => handleEdit(item)} style={btnEdit}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={btnDelete}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: "center", padding: "50px", color: "#999" }}>Database kosong. Silakan tambah data baru.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === STYLES ===
const btnBack = { padding: "8px 16px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };
const btnAdd = { padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const btnExport = { padding: "10px 15px", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "12px" };
const formCard = { backgroundColor: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginBottom: "25px" };
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const inputStyle = { padding: "10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" };
const btnSubmit = { width: "100%", padding: "10px", backgroundColor: "#1a374d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", height: "40px" };
const tableCard = { backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" };
const thStyle = { padding: "15px", textAlign: "left", fontSize: "14px", fontWeight: "600" };
const tdStyle = { padding: "12px 15px", fontSize: "14px", borderBottom: "1px solid #eee" };
const rowStyle = { transition: "0.2s" };
const btnEdit = { padding: "5px 10px", backgroundColor: "#fff3cd", color: "#856404", border: "1px solid #ffeeba", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };
const btnDelete = { padding: "5px 10px", backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };