import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Perbaikan path import: naik satu tingkat ke folder src untuk menemukan firebase.js
import { database } from "../firebase"; 
import { ref, onValue, remove, set } from "firebase/database";

export default function FieldManager() {
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [name, setName] = useState("");
  const [keyField, setKeyField] = useState("");

  // Mengambil data master field dari Firebase
  useEffect(() => {
    const fieldRef = ref(database, "fields");
    const unsubscribe = onValue(fieldRef, (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, v]) => ({
        id,
        ...v,
      }));
      setFields(arr);
    });

    return () => unsubscribe();
  }, []);

  const addField = async () => {
    if (!keyField || !name) {
      alert("Harap isi Key dan Nama Field!");
      return;
    }

    try {
      // Menyimpan field baru dengan struktur yang konsisten
      await set(ref(database, "fields/" + keyField.trim()), {
        name: name.trim(),
        path: `/dashboard-${keyField.trim().toLowerCase()}`
      });

      setKeyField("");
      setName("");
      alert("Field berhasil ditambahkan!");
    } catch (error) {
      console.error("Error adding field:", error);
      alert("Gagal menambahkan field.");
    }
  };

  const deleteField = async (id) => {
    if (!window.confirm(`Hapus field "${id}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    
    try {
      await remove(ref(database, "fields/" + id));
    } catch (error) {
      console.error("Error deleting field:", error);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", fontFamily: "Segoe UI" }}>
      <button 
        onClick={() => navigate("/dashboard-inventory")}
        style={{ marginBottom: "20px", cursor: "pointer", padding: "8px 16px" }}
      >
        ← Kembali ke Dashboard
      </button>

      <h2 style={{ borderBottom: "2px solid #064e3b", paddingBottom: "10px", color: "#064e3b" }}>
        Master Data Field (Lokasi)
      </h2>

      <div style={{ 
        background: "#f0fdf4", 
        padding: "20px", 
        borderRadius: "8px", 
        marginBottom: "30px",
        display: "flex", 
        gap: "12px",
        alignItems: "flex-end"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold" }}>Key Field</label>
          <input
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            placeholder="contoh: jatibarang"
            value={keyField}
            onChange={(e) => setKeyField(e.target.value.toLowerCase().replace(/\s/g, ""))}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold" }}>Nama Tampilan</label>
          <input
            style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
            placeholder="contoh: Jatibarang"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button 
          onClick={addField}
          style={{ 
            padding: "10px 20px", 
            background: "#059669", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Tambah Field
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ background: "#064e3b", color: "white" }}>
            <th style={{ padding: "12px", textAlign: "left" }}>Key (ID)</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Nama Lokasi</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Redirect Path</th>
            <th style={{ padding: "12px", textAlign: "center" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {fields.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                Belum ada data field.
              </td>
            </tr>
          ) : (
            fields.map((f) => (
              <tr key={f.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "12px", fontWeight: "bold" }}>{f.id}</td>
                <td style={{ padding: "12px" }}>{f.name}</td>
                <td style={{ padding: "12px", color: "#666", fontSize: "13px" }}>{f.path}</td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button 
                    onClick={() => deleteField(f.id)}
                    style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}