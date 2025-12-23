import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./DashboardInventory.css";

export default function BarangKeluar() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  // Link Spreadsheet Barang Keluar (GID 568762200)
  const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/pub?gid=568762200&single=true&output=csv";
  const SPREADSHEET_EDIT_URL = "https://docs.google.com/spreadsheets/d/1RB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/edit#gid=568762200";

  const [keluarData, setKeluarData] = useState(() => {
    const savedData = localStorage.getItem("scm_barang_keluar_data");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [backupData, setBackupData] = useState([]);

  const mapDataToState = useCallback((rawData) => {
    return rawData.map((row, index) => {
      const getVal = (keywords) => {
        const key = Object.keys(row).find(k => 
          keywords.some(word => k.toLowerCase().trim() === word.toLowerCase())
        );
        return key ? String(row[key]).trim() : "";
      };

      return {
        id: getVal(["id barang", "id"]) || `OUT-${index + 1}`,
        namaBarang: getVal(["nama barang"]),
        satuan: getVal(["satuan"]),
        stok: getVal(["stok", "qty", "jumlah"]),
        gudang: getVal(["gudang"]),
        tanggal: getVal(["tanggal"]),
        doNo: getVal(["do no.", "do number", "nomor do"])
      };
    }).filter(item => item.namaBarang || item.doNo);
  }, []);

  const refreshFromCloud = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${SPREADSHEET_CSV_URL}&t=${new Date().getTime()}`);
      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string' });
      const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      
      const finalData = mapDataToState(rawData);
      if (finalData.length > 0) {
        setKeluarData(finalData);
        localStorage.setItem("scm_barang_keluar_data", JSON.stringify(finalData));
      }
    } catch (error) {
      console.error("Gagal sinkron barang keluar:", error);
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
    setKeluarData(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const saveChanges = () => {
    localStorage.setItem("scm_barang_keluar_data", JSON.stringify(keluarData));
    setIsEditing(false);
    alert("Data Barang Keluar Berhasil Disimpan!");
  };

  return (
    <div className="sasaran-container">
      <div className="sasaran-nav" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f4f4f4', alignItems: 'center' }}>
        <button className="btn-home" onClick={() => navigate("/dashboard-inventory")}>← BACK</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isEditing ? (
            <>
              <a href={SPREADSHEET_EDIT_URL} target="_blank" rel="noopener noreferrer">
                <button style={{ backgroundColor: '#1d6f42', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>🌐 Spreadsheet</button>
              </a>
              <button onClick={refreshFromCloud} disabled={isLoading} style={{ backgroundColor: "#f1c40f", border: "none", padding: "8px 15px", borderRadius: "5px", fontWeight: "bold" }}>
                {isLoading ? "🔄..." : "☁️ Sync Cloud"}
              </button>
              <button onClick={() => { setBackupData(JSON.parse(JSON.stringify(keluarData))); setIsEditing(true); }} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✏️ Edit</button>
            </>
          ) : (
            <>
              <button onClick={saveChanges} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>💾 Simpan</button>
              <button onClick={() => { setKeluarData(backupData); setIsEditing(false); }} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✖ Batal</button>
            </>
          )}
        </div>
      </div>

      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>LOG BARANG KELUAR</h2>

      <div className="table-responsive" style={{ padding: '0 20px', overflowX: 'auto' }}>
        <table className="kpi-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '13px' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ border: '1px solid #444', padding: '10px' }}>ID Barang</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Nama Barang</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Satuan</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Qty Keluar</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Gudang</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Tanggal</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Do No.</th>
            </tr>
          </thead>
          <tbody>
            {keluarData.map((item) => (
              <tr key={item.id} style={{ backgroundColor: '#fff' }}>
                <td style={{ border: '1px solid #ddd', textAlign: 'center', padding: '8px' }}>{item.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {isEditing ? <input style={{width:'100%'}} value={item.namaBarang} onChange={e => handleCellChange(item.id, "namaBarang", e.target.value)} /> : item.namaBarang}
                </td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.satuan}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                  {isEditing ? <input type="number" style={{width:'60px'}} value={item.stok} onChange={e => handleCellChange(item.id, "stok", e.target.value)} /> : item.stok}
                </td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.gudang}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.tanggal}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                  {isEditing ? <input style={{width:'100%'}} value={item.doNo} onChange={e => handleCellChange(item.id, "doNo", e.target.value)} /> : item.doNo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}