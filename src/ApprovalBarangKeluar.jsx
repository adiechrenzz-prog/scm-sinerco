import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, update } from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ApprovalBarangKeluar() {
  const navigate = useNavigate();
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

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
  // LOAD INVENTORY ITEMS
  // ======================
  useEffect(() => {
    const r = ref(database, "items");
    return onValue(r, (snap) => {
      const d = snap.val() || {};
      setItems(Object.values(d));
    });
  }, []);

  // ======================
  // LOAD PERMINTAAN BARANG KELUAR
  // ======================
  useEffect(() => {
    const r = ref(database, "barangKeluar");
    return onValue(r, (snap) => {
      const d = snap.val() || {};
      setHistory(Object.values(d));
    });
  }, []);

  if (loadingAuth) return <p>Checking login...</p>;

  // ======================
  // APPROVE — Kurangi stok
  // ======================
  const approve = async (row) => {
    if (!window.confirm("Setujui permintaan ini?")) return;

    const barang = items.find((i) => i.partnumber === row.partnumber);
    if (!barang) return alert("Barang tidak ditemukan!");

    const jumlah = Number(row.jumlah);

    // Hanya kurangi stok jika sebelumnya status bukan approved
    if (row.status !== "approved") {
      const stokBaru = Number(barang.stok) - jumlah;

      if (stokBaru < 0) return alert("Stok tidak cukup!");

      await update(ref(database, "items/" + barang.id), {
        stok: stokBaru,
      });
    }

    await update(ref(database, "barangKeluar/" + row.id), {
      status: "approved",
      waktuApprove: new Date().toLocaleString(),
    });
  };

  // ======================
  // SET KE PENDING → Kembalikan stok jika sebelumnya approved
  // ======================
  const setPending = async (row) => {
    if (!window.confirm("Kembalikan status menjadi pending?")) return;

    const barang = items.find((i) => i.partnumber === row.partnumber);
    if (!barang) return alert("Barang tidak ditemukan!");

    const jumlah = Number(row.jumlah);

    // Jika sebelumnya approved → balikan stok
    if (row.status === "approved") {
      const stokBaru = Number(barang.stok) + jumlah;

      await update(ref(database, "items/" + barang.id), {
        stok: stokBaru,
      });
    }

    await update(ref(database, "barangKeluar/" + row.id), {
      status: "pending",
    });
  };

  // ======================
  // REJECT — Jika sebelumnya approved stok dikembalikan
  // ======================
  const reject = async (row) => {
    if (!window.confirm("Tolak permintaan ini?")) return;

    const barang = items.find((i) => i.partnumber === row.partnumber);
    if (!barang) return alert("Barang tidak ditemukan!");

    const jumlah = Number(row.jumlah);

    // Jika sebelumnya approved → kembalikan stok
    if (row.status === "approved") {
      const stokBaru = Number(barang.stok) + jumlah;

      await update(ref(database, "items/" + barang.id), {
        stok: stokBaru,
      });
    }

    await update(ref(database, "barangKeluar/" + row.id), {
      status: "rejected",
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📝 Approval Barang Keluar</h2>

      {/* NAVIGATION */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>
        <button onClick={() => navigate("/barang-keluar")}>➖ Barang Keluar</button>
        <button onClick={() => navigate("/sisa-stok")}>📊 Sisa Stok</button>
        <button onClick={() => navigate("/stock-opname")}>📋 Stock Opname</button>
        <button onClick={() => navigate("/field-inventory")}>🧭 Field Inventory</button>

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

      {/* TABLE */}
      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Jumlah</th>
            <th>Peminta</th>
            <th>Tujuan</th>
            <th>Status</th>
            <th>Waktu</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {history.map((row) => (
            <tr key={row.id}>
              <td>{row.partnumber}</td>
              <td>{row.nama}</td>
              <td>{row.jumlah}</td>
              <td>{row.peminta}</td>
              <td>{row.tujuan}</td>
              <td>{row.status}</td>
              <td>{row.waktu}</td>

              <td>
                {/* APPROVE */}
                {row.status !== "approved" && (
                  <button onClick={() => approve(row)}>Approve</button>
                )}

                {/* PENDING */}
                {row.status === "approved" && (
                  <button onClick={() => setPending(row)}>Set Pending</button>
                )}

                {/* REJECT */}
                {row.status !== "rejected" && (
                  <button onClick={() => reject(row)}>Reject</button>
                )}

                {/* EDIT (Hanya jika pending) */}
                {row.status === "pending" && (
                  <button onClick={() => navigate("/barang-keluar?edit=" + row.id)}>
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
