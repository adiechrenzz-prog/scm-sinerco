import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./DashboardInventory.css";

export default function Inventory() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  // Link Spreadsheet Inventory (GID 2142713703)
  const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/pub?gid=2142713703&single=true&output=csv";
  const SPREADSHEET_EDIT_URL = "https://docs.google.com/spreadsheets/d/1RB7U6oyLsL5DcXW5cja8gY60PcTBX0v-KxnR1rRaXM6cJCRAO8JZQ-H9FjTiCRG49m5IHR2dcX8fuB/edit#gid=2142713703";

  const [inventoryData, setInventoryData] = useState(() => {
    const savedData = localStorage.getItem("scm_inventory_full_data");
    return savedData ? JSON.parse(savedData) : [];
  });

  const [backupData, setBackupData] = useState([]);

  // Fungsi pembersihan angka
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
      const harga = parseNum(getVal(["harga satuan", "harga"]));

      return {
        id: getVal(["id barang", "id"]) || `INV-${index + 1}`,
        namaBarang: getVal(["nama barang", "item"]),
        stok: stok,
        satuan: getVal(["satuan"]),
        gudang: getVal(["gudang"]),
        hargaSatuan: harga,
        total: stok * harga,
        rackInfo: getVal(["rack info", "rack", "rak"]),
        sisaBarang: getVal(["sisa barang", "sisa"]),
        leadTime: getVal(["lead time"])
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
        setInventoryData(finalData);
        localStorage.setItem("scm_inventory_full_data", JSON.stringify(finalData));
      }
    } catch (error) {
      console.error("Gagal sinkron data inventory:", error);
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
    setInventoryData(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Hitung ulang total jika stok atau harga berubah
        if (field === "stok" || field === "hargaSatuan") {
          updatedItem.total = parseNum(updatedItem.stok) * parseNum(updatedItem.hargaSatuan);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const saveChanges = () => {
    localStorage.setItem("scm_inventory_full_data", JSON.stringify(inventoryData));
    setIsEditing(false);
    alert("Data Inventory berhasil disimpan!");
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
              <button onClick={() => { setBackupData(JSON.parse(JSON.stringify(inventoryData))); setIsEditing(true); }} style={{ backgroundColor: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✏️ Edit</button>
            </>
          ) : (
            <>
              <button onClick={saveChanges} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>💾 Simpan</button>
              <button onClick={() => { setInventoryData(backupData); setIsEditing(false); }} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}>✖ Batal</button>
            </>
          )}
        </div>
      </div>

      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>INVENTORY LIST</h2>

      <div className="table-responsive" style={{ padding: '0 10px', overflowX: 'auto' }}>
        <table className="kpi-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '11px' }}>
          <thead style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Id Barang</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Nama Barang</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Stok</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Satuan</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Gudang</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Harga Satuan</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Total</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Rack Info</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Sisa Barang</th>
              <th style={{ border: '1px solid #444', padding: '8px' }}>Lead Time</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((item) => (
              <tr key={item.id} style={{ backgroundColor: '#fff' }}>
                <td style={{ border: '1px solid #ddd', padding: '5px', textAlign: 'center' }}>{item.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '5px' }}>
                  {isEditing ? <input style={{width:'100%'}} value={item.namaBarang} onChange={e => handleCellChange(item.id, "namaBarang", e.target.value)} /> : item.namaBarang}
                </td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                  {isEditing ? <input type="number" style={{width:'50px'}} value={item.stok} onChange={e => handleCellChange(item.id, "stok", e.target.value)} /> : item.stok}
                </td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.satuan}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.gudang}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'right', paddingRight: '5px' }}>
                  {isEditing ? <input type="number" style={{width:'80px'}} value={item.hargaSatuan} onChange={e => handleCellChange(item.id, "hargaSatuan", e.target.value)} /> : `Rp ${item.hargaSatuan.toLocaleString('id-ID')}`}
                </td>
                <td style={{ border: '1px solid #ddd', textAlign: 'right', paddingRight: '5px', fontWeight: 'bold' }}>
                  Rp {item.total.toLocaleString('id-ID')}
                </td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.rackInfo}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.sisaBarang}</td>
                <td style={{ border: '1px solid #ddd', textAlign: 'center' }}>{item.leadTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}