import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase"; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";

// Import Library Export
import * as XLSX from "xlsx";
import jsPDF from "jspdf"; 
import autoTable from "jspdf-autotable";

export default function LocationMaster() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  
  // State Form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newLoc, setNewLoc] = useState({
    namaLokasi: "", regional: "", teknisi: "", jumlahUnit: ""
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
      } else {
        setInitializing(false);
        fetchLocations();
      }
    });
    return () => unsub();
  }, [navigate]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "location_master"), orderBy("namaLokasi", "asc"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        no: index + 1,
        ...doc.data()
      }));
      setLocations(data);
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
        await updateDoc(doc(db, "location_master", editId), newLoc);
        alert("Data Lokasi diperbarui!");
      } else {
        await addDoc(collection(db, "location_master"), newLoc);
        alert("Data Lokasi berhasil disimpan!");
      }
      resetForm();
      fetchLocations();
    } catch (error) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleEdit = (item) => {
    setNewLoc({
      namaLokasi: item.namaLokasi,
      regional: item.regional,
      teknisi: item.teknisi,
      jumlahUnit: item.jumlahUnit
    });
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus lokasi ini?")) {
      try {
        await deleteDoc(doc(db, "location_master", id));
        fetchLocations();
      } catch (error) {
        alert("Gagal menghapus.");
      }
    }
  };

  const resetForm = () => {
    setNewLoc({ namaLokasi: "", regional: "", teknisi: "", jumlahUnit: "" });
    setEditId(null);
    setShowForm(false);
  };

  // --- EXPORT & PRINT ---
  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(locations.map(l => ({
      NO: l.no,
      "NAMA LOKASI": l.namaLokasi,
      REGIONAL: l.regional,
      TEKNISI: l.teknisi,
      "JUMLAH UNIT": l.jumlahUnit
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
    XLSX.writeFile(workbook, "Master_Lokasi.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("GasJack Compressor Location", 14, 15);
    autoTable(doc, {
      startY: 25,
      head: [['No', 'Nama Lokasi', 'Regional', 'Teknisi', 'Jumlah Unit']],
      body: locations.map(l => [l.no, l.namaLokasi, l.regional, l.teknisi, l.jumlahUnit]),
      theme: 'grid',
      headStyles: { fillColor: [26, 55, 77] }
    });
    doc.save("Master_Lokasi.pdf");
  };

  // Fungsi Cetak Langsung
  const handlePrint = () => {
    window.print();
  };

  if (initializing) return null;

  return (
    <div className="printable-area" style={{ padding: "30px", backgroundColor: "#f8f9fa", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* Header Area */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <button onClick={() => navigate("/asset-locations-dashboard")} style={btnBack}>← KEMBALI</button>
          <h2 style={{ color: "#1a374d", margin: "15px 0 5px 0" }}>GasJack Compressor Location</h2>
          <p style={{ color: "#666", margin: 0 }}>Daftar Area & Teknisi Workshop</p>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handlePrint} style={{ ...btnExport, backgroundColor: "#007bff" }}>CETAK</button>
          <button onClick={exportExcel} style={{ ...btnExport, backgroundColor: "#217346" }}>EXCEL</button>
          <button onClick={exportPDF} style={{ ...btnExport, backgroundColor: "#d32f2f" }}>PDF</button>
          <button onClick={() => setShowForm(!showForm)} style={btnAdd}>
            {showForm ? "BATAL" : "+ TAMBAH LOKASI"}
          </button>
        </div>
      </div>

      {/* Form Area */}
      {showForm && (
        <div className="no-print" style={formCard}>
          <h3 style={{ marginTop: 0, color: "#1a374d" }}>{editId ? "📝 Edit Lokasi" : "➕ Tambah Lokasi Baru"}</h3>
          <form onSubmit={handleSave} style={formGrid}>
            <div style={inputGroup}><label>Nama Lokasi</label><input required value={newLoc.namaLokasi} onChange={(e)=>setNewLoc({...newLoc, namaLokasi: e.target.value})} style={inputStyle} placeholder="Contoh: Jati Asri"/></div>
            <div style={inputGroup}><label>Regional</label><input required value={newLoc.regional} onChange={(e)=>setNewLoc({...newLoc, regional: e.target.value})} style={inputStyle} placeholder="Contoh: Zona 7"/></div>
            <div style={inputGroup}><label>Teknisi</label><input required value={newLoc.teknisi} onChange={(e)=>setNewLoc({...newLoc, teknisi: e.target.value})} style={inputStyle} placeholder="Nama Teknisi PIC"/></div>
            <div style={inputGroup}><label>Jumlah Unit</label><input type="number" required value={newLoc.jumlahUnit} onChange={(e)=>setNewLoc({...newLoc, jumlahUnit: e.target.value})} style={inputStyle} placeholder="0"/></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
               <button type="submit" style={btnSubmit}>{editId ? "UPDATE" : "SIMPAN"}</button>
            </div>
          </form>
        </div>
      )}

      {/* CSS untuk menyembunyikan elemen saat Print */}
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            .printable-area { padding: 0 !important; background-color: white !important; }
            table { border: 1px solid #000 !important; }
            th, td { border: 1px solid #000 !important; }
            .action-column { display: none !important; }
          }
        `}
      </style>

      {/* Table Area */}
      <div style={tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1a374d", color: "white" }}>
              <th style={thStyle}>NO</th>
              <th style={thStyle}>NAMA LOKASI</th>
              <th style={thStyle}>REGIONAL</th>
              <th style={thStyle}>TEKNISI</th>
              <th style={thStyle}>JUMLAH UNIT</th>
              <th className="no-print" style={thStyle}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "30px" }}>Memuat data...</td></tr>
            ) : locations.length > 0 ? (
              locations.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold" }}>{item.no}</td>
                  <td style={tdStyle}>{item.namaLokasi}</td>
                  <td style={tdStyle}>{item.regional}</td>
                  <td style={tdStyle}>{item.teknisi}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{item.jumlahUnit}</td>
                  <td className="no-print" style={tdStyle}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button onClick={() => handleEdit(item)} style={btnEdit}>Edit</button>
                      <button onClick={() => handleDelete(item.id)} style={btnDelete}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "50px", color: "#999" }}>Belum ada data lokasi.</td></tr>
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
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const inputStyle = { padding: "10px", border: "1px solid #ddd", borderRadius: "6px", fontSize: "14px" };
const btnSubmit = { width: "100%", padding: "10px", backgroundColor: "#1a374d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", height: "40px" };
const tableCard = { backgroundColor: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" };
const thStyle = { padding: "15px", textAlign: "left", fontSize: "14px", fontWeight: "600" };
const tdStyle = { padding: "12px 15px", fontSize: "14px" };
const btnEdit = { padding: "5px 10px", backgroundColor: "#fff3cd", color: "#856404", border: "1px solid #ffeeba", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };
const btnDelete = { padding: "5px 10px", backgroundColor: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb", borderRadius: "4px", cursor: "pointer", fontSize: "12px" };