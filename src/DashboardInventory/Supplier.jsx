import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./DashboardInventory.css";

export default function Supplier() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  // Link Spreadsheet Supplier (GID 438117494)
  const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/pub?gid=438117494&single=true&output=csv";
  
  // Link Edit Spreadsheet
  const SPREADSHEET_EDIT_URL = "https://docs.google.com/spreadsheets/d/1RB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/edit#gid=438117494";

  const [supplierData, setSupplierData] = useState(() => {
    const savedData = localStorage.getItem("scm_supplier_data");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [backupData, setBackupData] = useState([]);

  // Pemetaan kolom: Kode Supplier, Nama Supplier, Alamat, Telp
  const mapDataToState = useCallback((rawData) => {
    return rawData.map((row, index) => {
      const getVal = (keywords) => {
        const key = Object.keys(row).find(k => 
          keywords.some(word => k.toLowerCase().trim() === word.toLowerCase())
        );
        if (!key) return "";
        const val = row[key];
        return val !== undefined && val !== null ? String(val).trim() : "";
      };

      return {
        id: "sup-" + index,
        kode: getVal(["kode supplier", "kode"]),
        nama: getVal(["nama supplier", "nama"]),
        alamat: getVal(["alamat"]),
        telp: getVal(["telp", "telepon", "phone"])
      };
    }).filter(item => item.kode || item.nama);
  }, []);

  const refreshFromCloud = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${SPREADSHEET_CSV_URL}&t=${new Date().getTime()}`);
      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string' });
      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { 
        defval: "" 
      });
      
      const finalData = mapDataToState(rawData);
      if (finalData.length > 0) {
        setSupplierData(finalData);
        localStorage.setItem("scm_supplier_data", JSON.stringify(finalData));
      }
    } catch (error) {
      console.error("Gagal sinkron data supplier:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [mapDataToState, isLoading]);

  useEffect(() => {
    if (!hasFetched.current) {
      refreshFromCloud();
      hasFetched.current = true;
    }
  }, [refreshFromCloud]);

  const handleCellChange = (id, field, value) => {
    setSupplierData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteRow = (id) => {
    if (window.confirm("Hapus data supplier ini?")) {
      setSupplierData(supplierData.filter(item => item.id !== id));
    }
  };

  const startEditing = () => {
    setBackupData(JSON.parse(JSON.stringify(supplierData)));
    setIsEditing(true);
  };

  const saveChanges = () => {
    localStorage.setItem("scm_supplier_data", JSON.stringify(supplierData));
    setIsEditing(false);
    alert("Data Supplier berhasil disimpan lokal!");
  };

  const cancelChanges = () => {
    if (window.confirm("Batalkan semua perubahan?")) {
      setSupplierData(backupData);
      setIsEditing(false);
    }
  };

  return (
    <div className="sasaran-container">
      <div className="sasaran-nav" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f4f4f4', alignItems: 'center' }}>
        <button className="btn-home" onClick={() => navigate("/dashboard-inventory")}>← BACK</button>
        
        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
          {!isEditing ? (
            <>
              <a href={SPREADSHEET_EDIT_URL} target="_blank" rel="noopener noreferrer">
                <button style={{ backgroundColor: '#1d6f42', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🌐 Edit Spreadsheet
                </button>
              </a>
              <button onClick={refreshFromCloud} disabled={isLoading} style={{ backgroundColor: "#f1c40f", border: "none", padding: "8px 15px", borderRadius: "5px", color: "#333", fontWeight: "bold" }}>
                {isLoading ? "🔄 Sinkron..." : "☁️ Sync Cloud"}
              </button>
              <button onClick={startEditing} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✏️ Edit Tabel</button>
            </>
          ) : (
            <>
              <button onClick={saveChanges} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>💾 Simpan</button>
              <button onClick={cancelChanges} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✖ Batal</button>
            </>
          )}
        </div>
      </div>

      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>MASTER DATA SUPPLIER</h2>

      <div className="table-responsive" style={{ padding: '0 20px', overflowX: 'auto' }}>
        <table className="kpi-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '14px' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Kode Supplier</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Nama Supplier</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Alamat</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Telp</th>
              {isEditing && <th style={{ border: '1px solid #444', padding: '10px', backgroundColor: '#c0392b' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {supplierData.map((item) => (
              <tr key={item.id} style={{ backgroundColor: '#fff' }}>
                <td style={{ border: '1px solid #ddd', textAlign: 'center', padding: '8px' }}>
                  {isEditing ? <input style={{ width: '100%' }} value={item.kode} onChange={e => handleCellChange(item.id, "kode", e.target.value)} /> : item.kode}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {isEditing ? <input style={{ width: '100%' }} value={item.nama} onChange={e => handleCellChange(item.id, "nama", e.target.value)} /> : item.nama}
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {isEditing ? <input style={{ width: '100%' }} value={item.alamat} onChange={e => handleCellChange(item.id, "alamat", e.target.value)} /> : item.alamat}
                </td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center', padding: '8px' }}>
                  {isEditing ? <input style={{ width: '100%' }} value={item.telp} onChange={e => handleCellChange(item.id, "telp", e.target.value)} /> : item.telp}
                </td>
                {isEditing && (
                  <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                    <button onClick={() => deleteRow(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}