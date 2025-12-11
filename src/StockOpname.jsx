import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function StockOpname() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);
  const [opname, setOpname] = useState([]);

  const [stokFisik, setStokFisik] = useState({}); // { itemId: value }

  // ======================
  // AUTH GUARD
  // ======================
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // ======================
  // LOAD INVENTORY
  // ======================
  useEffect(() => {
    const r = ref(database, "items");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setItems(Object.values(data));
    });
  }, []);

  // ======================
  // LOAD HASIL OPNAME
  // ======================
  useEffect(() => {
    const r = ref(database, "stockOpname");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      setOpname(Object.values(data));
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  // ======================
  // SIMPAN HASIL OPNAME
  // ======================
  const simpanOpname = () => {
    items.forEach((i) => {
      const fisik = Number(stokFisik[i.id] || 0);
      const sistem = Number(i.stok);

      const id = push(ref(database, "stockOpname")).key;

      set(ref(database, "stockOpname/" + id), {
        id,
        idItem: i.id,
        nama: i.nama,
        partnumber: i.partnumber,
        stok_sistem: sistem,
        stok_fisik: fisik,
        selisih: fisik - sistem,
        waktu: Date.now(),
      });
    });

    alert("✔ Stock Opname berhasil disimpan!");
  };

  // ======================
  // EXPORT LAPORAN OPNAME
  // ======================
  const exportExcel = () => {
    const data = opname.map((o) => ({
      "Part Number": o.partnumber,
      "Nama Barang": o.nama,
      "Stok Sistem": o.stok_sistem,
      "Stok Fisik": o.stok_fisik,
      "Selisih": o.selisih,
      "Waktu": new Date(o.waktu).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Stock Opname");
    XLSX.writeFile(wb, "stock_opname.xlsx");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Stock Opname</h2>

      {/* NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>📝 Approval</button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/field-inventory")}>🧭 Field Inventory</button>

        <button onClick={exportExcel}>⬇ Export Excel</button>

        <button
          onClick={() => {
            signOut(auth);
            navigate("/login");
          }}
          style={{ marginLeft: "auto" }}
        >
          Logout
        </button>
      </div>

      <hr />

      <h3>Input Stok Fisik</h3>

      {/* INPUT STOK FISIK */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok Sistem</th>
            <th>Stok Fisik</th>
          </tr>
        </thead>

        <tbody>
          {items
            .sort((a, b) => Number(a.partnumber) - Number(b.partnumber))
            .map((i) => (
              <tr key={i.id}>
                <td>{i.partnumber}</td>
                <td>{i.nama}</td>
                <td>{i.stok}</td>

                <td>
                  <input
                    type="number"
                    value={stokFisik[i.id] || ""}
                    onChange={(e) =>
                      setStokFisik({ ...stokFisik, [i.id]: e.target.value })
                    }
                    style={{ width: 80 }}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <br />
      <button onClick={simpanOpname}>✔ Simpan Hasil Opname</button>

      <hr />

      <h3>Riwayat Stock Opname</h3>

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok Sistem</th>
            <th>Stok Fisik</th>
            <th>Selisih</th>
            <th>Waktu</th>
          </tr>
        </thead>

        <tbody>
          {opname
            .sort((a, b) => b.waktu - a.waktu)
            .map((o) => (
              <tr key={o.id}>
                <td>{o.partnumber}</td>
                <td>{o.nama}</td>
                <td>{o.stok_sistem}</td>
                <td>{o.stok_fisik}</td>

                <td
                  style={{
                    color:
                      o.selisih > 0
                        ? "green"
                        : o.selisih < 0
                        ? "red"
                        : "black",
                  }}
                >
                  {o.selisih}
                </td>

                <td>{new Date(o.waktu).toLocaleString()}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
