import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./DashboardInventory.css";

export default function StockOpname() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  // Link Spreadsheet Stock Opname (GID 2078400991)
  const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/pub?gid=2078400991&single=true&output=csv";
  
  const SPREADSHEET_EDIT_URL = "https://docs.google.com/spreadsheets/d/1RB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/edit#gid=2078400991";

  const [stockData, setStockData] = useState(() => {
    const savedData = localStorage.getItem("scm_stock_opname_data");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [backupData, setBackupData] = useState([]);

  // Fungsi Helper untuk angka
  const parseNum = (val) => {
    const n = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const mapDataToState = useCallback((rawData) => {
    return rawData.map((row, index) => {
      const getVal = (keywords) => {
        const key = Object.keys(row).find(k => 
          keywords.some(word => k.toLowerCase().trim() === word.toLowerCase())
        );
        return key ? String(row[key]).trim() : "";
      };

      const stokSistem = parseNum(getVal(["stok", "stok sistem"]));
      const stokFisik = parseNum(getVal(["stock opname", "stok fisik", "opname"]));

      return {
        id: getVal(["id barang", "id"]) || `item-${index}`,
        namaBarang: getVal(["nama barang", "item"]),
        stok: stokSistem,
        opname: stokFisik,
        satuan: getVal(["satuan"]),
        selisih: stokFisik - stokSistem,
        tanggal: getVal(["tanggal", "date"])
      };
    }).filter(item => item.namaBarang);
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
        setStockData(finalData);
        localStorage.setItem("scm_stock_opname_data", JSON.stringify(finalData));
      }
    } catch (error) {
      console.error("Gagal sinkron stock opname:", error);
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
    setStockData(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Auto hitung selisih jika stok atau opname berubah
        if (field === "stok" || field === "opname") {
          updatedItem.selisih = parseNum(updatedItem.opname) - parseNum(updatedItem.stok);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const saveChanges = () => {
    localStorage.setItem("scm_stock_opname_data", JSON.stringify(stockData));
    setIsEditing(false);
    alert("Data Stock Opname disimpan!");
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
                {isLoading ? "🔄..." : "☁️ Sync"}
              </button>
              <button onClick={() => { setBackupData(JSON.parse(JSON.stringify(stockData))); setIsEditing(true); }} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✏️ Edit</button>
            </>
          ) : (
            <>
              <button onClick={saveChanges} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>💾 Simpan</button>
              <button onClick={() => { setStockData(backupData); setIsEditing(false); }} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✖ Batal</button>
            </>
          )}
        </div>
      </div>

      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>LAPORAN STOCK OPNAME</h2>

      <div className="table-responsive" style={{ padding: '0 20px', overflowX: 'auto' }}>
        <table className="kpi-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '13px' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ border: '1px solid #444', padding: '10px' }}>ID Barang</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Nama Barang</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Stok (Sistem)</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Stock Opname (Fisik)</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Satuan</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Selisih</th>
              <th style={{ border: '1px solid #444', padding: '10px' }}>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((item) => (
              <tr key={item.id} style={{ backgroundColor: item.selisih !== 0 ? '#fff5f5' : '#fff' }}>
                <td style={{ border: '1px solid #ddd', textAlign: 'center', padding: '8px' }}>{item.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{isEditing ? <input value={item.namaBarang} onChange={e => handleCellChange(item.id, "namaBarang", e.target.value)} /> : item.namaBarang}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{isEditing ? <input type="number" style={{width:'60px'}} value={item.stok} onChange={e => handleCellChange(item.id, "stok", e.target.value)} /> : item.stok}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>{isEditing ? <input type="number" style={{width:'60px'}} value={item.opname} onChange={e => handleCellChange(item.id, "opname", e.target.value)} /> : item.opname}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.satuan}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center', color: item.selisih < 0 ? 'red' : item.selisih > 0 ? 'green' : 'black', fontWeight: 'bold' }}>
                  {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                </td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{isEditing ? <input type="date" value={item.tanggal} onChange={e => handleCellChange(item.id, "tanggal", e.target.value)} /> : item.tanggal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}