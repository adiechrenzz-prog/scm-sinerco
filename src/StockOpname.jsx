import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, set } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function StockOpname() {
  const navigate = useNavigate();

  const [loadingAuth, setLoadingAuth] = useState(true);

  const [inventory, setInventory] = useState([]);
  const [barangMasuk, setBarangMasuk] = useState([]);
  const [barangKeluar, setBarangKeluar] = useState([]);

  const [search, setSearch] = useState("");
  const [opnameHistory, setOpnameHistory] = useState([]);

  // ========================= AUTH =========================
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, []);

  // ========================= LOAD DATA =========================

  // Inventory (stok awal)
  useEffect(() => {
    onValue(ref(database, "items"), (snap) => {
      const data = snap.val() || {};
      setInventory(Object.values(data));
    });
  }, []);

  // Barang masuk
  useEffect(() => {
    onValue(ref(database, "barangmasuk"), (snap) => {
      const data = snap.val() || {};
      setBarangMasuk(Object.values(data));
    });
  }, []);

  // Barang keluar (approved saja)
  useEffect(() => {
    onValue(ref(database, "barangkeluar"), (snap) => {
      const data = snap.val() || {};
      const arr = Object.values(data).filter((x) => x.status === "approved");
      setBarangKeluar(arr);
    });
  }, []);

  // Riwayat folder stockopname
  useEffect(() => {
    onValue(ref(database, "stockopname"), (snap) => {
      const data = snap.val() || {};
      setOpnameHistory(Object.keys(data)); // Nama folder = tanggal
    });
  }, []);

  if (loadingAuth) return <p>Checking login…</p>;

  // ========================= HITUNG STOK =========================
  const map = {};

  // stok awal
  inventory.forEach((i) => {
    const pn = String(i.partnumber || "");
    map[pn] = {
      partnumber: pn,
      nama: i.nama || "",
      harga: Number(i.harga || 0),
      stokAwal: Number(i.stok || 0),
      masuk: 0,
      keluar: 0,
    };
  });

  // barang masuk
  barangMasuk.forEach((bm) => {
    const pn = String(bm.partnumber || "");
    if (!map[pn]) {
      map[pn] = {
        partnumber: pn,
        nama: bm.nama || "",
        harga: 0,
        stokAwal: 0,
        masuk: 0,
        keluar: 0,
      };
    }
    map[pn].masuk += Number(bm.jumlah || 0);
  });

  // barang keluar approved
  barangKeluar.forEach((bk) => {
    const pn = String(bk.partnumber || "");
    if (!map[pn]) {
      map[pn] = {
        partnumber: pn,
        nama: bk.nama || "",
        harga: 0,
        stokAwal: 0,
        masuk: 0,
        keluar: 0,
      };
    }
    map[pn].keluar += Number(bk.jumlah || 0);
  });

  // hasil akhir
  const result = Object.values(map).map((i) => {
    const sisa = i.stokAwal + i.masuk - i.keluar;
    return {
      ...i,
      sisa,
      nilai: sisa * i.harga,
    };
  });

  // sort by part number aman
  result.sort((a, b) => {
    let x = a.partnumber.toString();
    let y = b.partnumber.toString();
    return x.localeCompare(y, "en", { numeric: true });
  });

  // ========================= FILTER SEARCH =========================
  const filtered = result.filter(
    (i) =>
      i.partnumber.toLowerCase().includes(search.toLowerCase()) ||
      i.nama.toLowerCase().includes(search.toLowerCase())
  );

  const totalNilai = filtered.reduce((sum, i) => sum + i.nilai, 0);

  // ========================= SAVE STOCK OPNAME =========================
  const saveOpname = () => {
    const now = new Date();
    const folder =
      now.toISOString().substring(0, 10) +
      "_" +
      now.toTimeString().substring(0, 8).replace(/:/g, "-");

    set(ref(database, "stockopname/" + folder), filtered);

    alert("Stock Opname berhasil disimpan!");
  };

  // ========================= EXPORT EXCEL =========================
  const exportExcel = () => {
    const rows = filtered.map((i) => ({
      "Part Number": i.partnumber,
      "Nama Barang": i.nama,
      "Stok Awal": i.stokAwal,
      "Total Masuk": i.masuk,
      "Total Keluar": i.keluar,
      "Sisa Stok": i.sisa,
      "Harga Satuan": i.harga,
      "Total Nilai": i.nilai,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sisa Stok");
    XLSX.writeFile(wb, "stock_opname.xlsx");
  };

  // ========================= UI =========================
  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Stock Opname</h2>

      {/* NAVIGASI */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>📝 Approval</button>

        <button onClick={exportExcel}>⬇ Export Excel</button>
        <button onClick={saveOpname} style={{ background: "#007bff", color: "white" }}>
          💾 Simpan Stock Opname
        </button>

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

      {/* SEARCH */}
      <input
        placeholder="Cari Part Number / Nama"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "40%", marginBottom: 10 }}
      />

      <h3>💰 Total Nilai Stok: Rp {totalNilai.toLocaleString()}</h3>

      {/* TABEL SISA STOK */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok Awal</th>
            <th>Masuk</th>
            <th>Keluar</th>
            <th>Sisa</th>
            <th>Harga</th>
            <th>Nilai</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((i) => (
            <tr key={i.partnumber}>
              <td>{i.partnumber}</td>
              <td>{i.nama}</td>
              <td>{i.stokAwal}</td>
              <td>{i.masuk}</td>
              <td>{i.keluar}</td>
              <td
                style={{
                  background: i.sisa < 0 ? "#ffb3b3" : "inherit",
                  fontWeight: i.sisa < 0 ? "bold" : "normal",
                }}
              >
                {i.sisa}
              </td>
              <td>{i.harga}</td>
              <td>{i.nilai.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />

      {/* RIWAYAT */}
      <h3>🕒 Riwayat Stock Opname</h3>

      {opnameHistory.length === 0 && <p>Belum pernah Stock Opname.</p>}

      <ul>
        {opnameHistory.map((h) => (
          <li key={h}>
            {h.replace("_", " ")}
            <button
              style={{ marginLeft: 10 }}
              onClick={() => navigate(`/opname-detail?tanggal=${h}`)}
            >
              Lihat Detail
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
