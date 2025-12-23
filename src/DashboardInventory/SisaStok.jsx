import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./DashboardInventory.css";

export default function SisaStok() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  // Link Spreadsheet Sisa Stok (GID 1834342181)
  const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/pub?gid=1834342181&single=true&output=csv";
  const SPREADSHEET_EDIT_URL = "https://docs.google.com/spreadsheets/d/1RB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/edit#gid=1834342181";

  const [sisaData, setSisaData] = useState(() => {
    const savedData = localStorage.getItem("scm_sisa_stok_data");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [backupData, setBackupData] = useState([]);

  const parseNum = (val) => {
    if (!val) return 0;
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

      const stok = parseNum(getVal(["stok"]));
      const harga = parseNum(getVal(["harga satuan"]));
      const minStok = parseNum(getVal(["stok minimum", "min stok", "limit"]));

      return {
        id: getVal(["id barang", "id"]) || `SS-${index + 1}`,
        namaBarang: getVal(["nama barang"]),
        stok: stok,
        satuan: getVal(["satuan"]),
        gudang: getVal(["gudang"]),
        hargaSatuan: harga,
        total: stok * harga,
        rackInfo: getVal(["rack info", "rak"]),
        stokMinimum: minStok
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
        setSisaData(finalData);
        localStorage.setItem("scm_sisa_stok_data", JSON.stringify(finalData));
      }
    } catch (error) {
      console.error("Gagal sinkron sisa stok:", error);
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
    setSisaData(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === "stok" || field === "hargaSatuan") {
          updatedItem.total = parseNum(updatedItem.stok) * parseNum(updatedItem.hargaSatuan);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const saveChanges = () => {
    localStorage.setItem("scm_sisa_stok_data", JSON.stringify(sisaData));
    setIsEditing(false);
    alert("Data Sisa Stok Disimpan!");
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
              <button onClick={() => { setBackupData(JSON.parse(JSON.stringify(sisaData))); setIsEditing(true); }} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✏️ Edit</button>
            </>
          ) : (
            <>
              <button onClick={saveChanges} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>💾 Simpan</button>
              <button onClick={() => { setSisaData(backupData); setIsEditing(false); }} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✖ Batal</button>
            </>
          )}
        </div>
      </div>

      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>MONITORING SISA STOK</h2>

      <div className="table-responsive" style={{ padding: '0 10px', overflowX: 'auto' }}>
        <table className="kpi-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11px' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ border: '1px solid #444', padding: '8px' }}>ID Barang</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Nama Barang</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Sisa Stok</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Satuan</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Gudang</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Harga</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Total Nilai</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Rack</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Min. Stok</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {sisaData.map((item) => {
              const isLow = item.stok <= item.stokMinimum;
              return (
                <tr key={item.id} style={{ backgroundColor: isLow ? '#fff0f0' : '#fff' }}>
                  <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '5px' }}>{item.namaBarang}</td>
                  <td style={{ border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: isLow ? 'red' : 'black' }}>
                    {isEditing ? <input type="number" style={{width:'50px'}} value={item.stok} onChange={e => handleCellChange(item.id, "stok", e.target.value)} /> : item.stok}
                  </td>
                  <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.satuan}</td>
                  <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.gudang}</td>
                  <td style={{ border: '1px solid #ddd', textAlign: 'right' }}>{item.hargaSatuan.toLocaleString('id-ID')}</td>
                  <td style={{ border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>{item.total.toLocaleString('id-ID')}</td>
                  <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.rackInfo}</td>
                  <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.stokMinimum}</td>
                  <td style={{ border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold' }}>
                    {isLow ? <span style={{color:'red'}}>🔴 REORDER</span> : <span style={{color:'green'}}>✅ AMAN</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}