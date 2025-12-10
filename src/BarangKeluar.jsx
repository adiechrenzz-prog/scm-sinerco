import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, remove } from "firebase/database";

import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BarangKeluar() {
  const navigate = useNavigate();

  // ======================
  // MASTER DATA
  // ======================
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

  // ======================
  // FORM
  // ======================
  const [form, setForm] = useState({
    partnumber: "",
    nama: "",
    satuan: "",
    harga: 0,
    qty: "",
    tanggal: new Date().toISOString().slice(0, 10),
    tujuan: "",
    noDO: "",
  });

  // ======================
  // LOAD INVENTORY
  // ======================
  useEffect(() => {
    return onValue(ref(database, "items"), (snap) => {
      setItems(Object.values(snap.val() || {}));
    });
  }, []);

  // ======================
  // LOAD BARANG KELUAR
  // ======================
  useEffect(() => {
    return onValue(ref(database, "barangKeluar"), (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, v]) => ({
        id,
        ...v,
      }));
      setHistory(
        arr.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      );
    });
  }, []);

  // ======================
  // AUTO FILL
  // ======================
  const isiDariPart = (value) => {
    const item = items.find((i) => i.partnumber === value);
    if (!item) return;
    setForm((f) => ({
      ...f,
      partnumber: item.partnumber,
      nama: item.nama,
      satuan: item.satuan,
      harga: Number(item.harga || 0),
    }));
  };

  const isiDariNama = (value) => {
    const item = items.find((i) => i.nama === value);
    if (!item) return;
    setForm((f) => ({
      ...f,
      partnumber: item.partnumber,
      nama: item.nama,
      satuan: item.satuan,
      harga: Number(item.harga || 0),
    }));
  };

  const totalHarga = Number(form.qty || 0) * Number(form.harga || 0);

  // ======================
  // SIMPAN → STATUS PENDING
  // ======================
  const simpan = () => {
    if (!form.partnumber || !form.qty || !form.noDO || !form.tujuan) {
      alert("Lengkapi data wajib");
      return;
    }

    const item = items.find((i) => i.partnumber === form.partnumber);
    if (!item) {
      alert("Barang tidak ditemukan");
      return;
    }

    if (Number(form.qty) > Number(item.stok)) {
      alert("STOK TIDAK CUKUP");
      return;
    }

    const id = push(ref(database, "barangKeluar")).key;

    set(ref(database, "barangKeluar/" + id), {
      itemId: item.id,
      partnumber: item.partnumber,
      nama: item.nama,
      satuan: item.satuan,
      harga: Number(form.harga),
      stok: Number(form.qty),
      total: Number(form.qty) * Number(form.harga),
      tanggal: form.tanggal,
      tujuan: form.tujuan,
      noDO: form.noDO,

      status: "PENDING",
      stokInventory: Number(item.stok),
      createdBy: auth.currentUser?.email || "user",
      createdAt: new Date().toISOString(),
    });

    setForm({
      partnumber: "",
      nama: "",
      satuan: "",
      harga: 0,
      qty: "",
      tanggal: new Date().toISOString().slice(0, 10),
      tujuan: "",
      noDO: "",
    });
  };

  // ======================
  // EXPORT
  // ======================
  const exportExcelAll = () => {
    const ws = XLSX.utils.json_to_sheet(history);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Keluar");
    XLSX.writeFile(wb, "barang_keluar.xlsx");
  };

  const exportPDFAll = () => {
    const doc = new jsPDF();
    doc.text("Laporan Barang Keluar", 14, 14);

    autoTable(doc, {
      startY: 20,
      head: [[
        "Part Number","Nama Barang","Qty","Satuan",
        "Tanggal","Tujuan","No DO","Status"
      ]],
      body: history.map((h) => ([
        h.partnumber,
        h.nama,
        h.stok,
        h.satuan,
        h.tanggal,
        h.tujuan,
        h.noDO,
        h.status,
      ])),
    });

    doc.save("barang_keluar.pdf");
  };

  // ======================
  // PRINT DO (TANPA HARGA)
  // ======================
  const printByDO = () => {
    if (!form.noDO) {
      alert("Isi No DO");
      return;
    }

    const data = history.filter((h) => h.noDO === form.noDO);
    if (data.length === 0) {
      alert("No DO tidak ditemukan");
      return;
    }

    const doc = new jsPDF();
    doc.text(`DELIVERY ORDER`, 14, 14);
    doc.text(`No DO : ${form.noDO}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [[
        "Part Number","Nama Barang","Qty","Satuan","Tanggal","Tujuan"
      ]],
      body: data.map((h) => ([
        h.partnumber,
        h.nama,
        h.stok,
        h.satuan,
        h.tanggal,
        h.tujuan,
      ])),
    });

    doc.save(`DO_${form.noDO}.pdf`);
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div style={{ padding: 20 }}>
      <h2>📤 Barang Keluar</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => navigate("/inventory")}>📦 Inventory</button>
        <button onClick={() => navigate("/barang-masuk")}>📥 Barang Masuk</button>
        <button onClick={() => navigate("/approval-barang-keluar")}>
          ✅ Approval
        </button>
        <button
          onClick={() => {
            signOut(auth);
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      <hr />

      <input type="date"
        value={form.tanggal}
        onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
      />

      <input placeholder="Tujuan"
        value={form.tujuan}
        onChange={(e) => setForm({ ...form, tujuan: e.target.value })}
      />

      <input placeholder="No DO"
        value={form.noDO}
        onChange={(e) => setForm({ ...form, noDO: e.target.value })}
      />

      <input list="pn" placeholder="Cari Part Number"
        value={form.partnumber}
        onChange={(e) => {
          setForm({ ...form, partnumber: e.target.value });
          isiDariPart(e.target.value);
        }}
      />

      <input list="nm" placeholder="Cari Nama Barang"
        value={form.nama}
        onChange={(e) => {
          setForm({ ...form, nama: e.target.value });
          isiDariNama(e.target.value);
        }}
      />

      <datalist id="pn">
        {items.map((i) => (
          <option key={i.id} value={i.partnumber} />
        ))}
      </datalist>

      <datalist id="nm">
        {items.map((i) => (
          <option key={i.id} value={i.nama} />
        ))}
      </datalist>

      <input value={form.satuan} disabled placeholder="Satuan" />

      <input type="number" placeholder="Qty Keluar"
        value={form.qty}
        onChange={(e) => setForm({ ...form, qty: e.target.value })}
      />

      <input value={totalHarga} disabled placeholder="Total Harga" />

      <button onClick={simpan}>
        Simpan (Pending Approval)
      </button>

      <hr />

      <button onClick={exportExcelAll}>🟢 Print Excel</button>
      <button onClick={exportPDFAll} style={{ marginLeft: 6 }}>
        🔴 Print PDF
      </button>
      <button onClick={printByDO} style={{ marginLeft: 6 }}>
        🧾 Print DO
      </button>

      <hr />

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Qty</th>
            <th>Satuan</th>
            <th>Tanggal</th>
            <th>Tujuan</th>
            <th>No DO</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td>{h.partnumber}</td>
              <td>{h.nama}</td>
              <td>{h.stok}</td>
              <td>{h.satuan}</td>
              <td>{h.tanggal}</td>
              <td>{h.tujuan}</td>
              <td>{h.noDO}</td>
              <td>
                {h.status === "PENDING" && (
                  <span style={{ color: "orange" }}>PENDING</span>
                )}
                {h.status === "APPROVED" && (
                  <span style={{ color: "green" }}>APPROVED</span>
                )}
                {h.status === "REJECTED" && (
                  <span style={{ color: "red" }}>REJECTED</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
