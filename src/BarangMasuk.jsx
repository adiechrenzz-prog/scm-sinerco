import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function BarangMasuk() {
  const navigate = useNavigate();

  // ======================
  // DATA MASTER
  // ======================
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

  // ======================
  // FORM
  // ======================
  const [form, setForm] = useState({
    id: "",
    itemId: "",
    partnumber: "",
    nama: "",
    satuan: "",
    harga: 0,
    qty: "",
    invoice: "",
    tanggal: new Date().toISOString().slice(0, 10),
  });

  const [editMode, setEditMode] = useState(false);

  // ======================
  // LOAD INVENTORY
  // ======================
  useEffect(() => {
    return onValue(ref(database, "items"), (snap) => {
      setItems(Object.values(snap.val() || {}));
    });
  }, []);

  // ======================
  // LOAD HISTORI
  // ======================
  useEffect(() => {
    return onValue(ref(database, "barangMasuk"), (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, v]) => ({ id, ...v }));
      setHistory(
        arr.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
      );
    });
  }, []);

  // ======================
  // AUTO FILL DUA ARAH
  // ======================
  const isiDariPart = (value) => {
    const item = items.find((i) => i.partnumber === value);
    if (!item) return;
    setForm((f) => ({
      ...f,
      itemId: item.id,
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
      itemId: item.id,
      partnumber: item.partnumber,
      nama: item.nama,
      satuan: item.satuan,
      harga: Number(item.harga || 0),
    }));
  };

  const totalHarga = Number(form.qty || 0) * Number(form.harga || 0);

  // ======================
  // SIMPAN / UPDATE
  // ======================
  const simpan = () => {
    if (!form.itemId || !form.qty || !form.invoice || !form.tanggal) {
      alert("Lengkapi semua data wajib");
      return;
    }

    const item = items.find((i) => i.id === form.itemId);
    if (!item) return;

    const qty = Number(form.qty);
    const harga = Number(form.harga);

    if (editMode) {
      const old = history.find((h) => h.id === form.id);
      const selisih = qty - Number(old.stok);

      update(ref(database, "items/" + item.id), {
        stok: Number(item.stok) + selisih,
      });

      update(ref(database, "barangMasuk/" + form.id), {
        invoice: form.invoice,
        stok: qty,
        harga,
        total: qty * harga,
        tanggal: form.tanggal,
      });

      setEditMode(false);
    } else {
      update(ref(database, "items/" + item.id), {
        stok: Number(item.stok) + qty,
      });

      const id = push(ref(database, "barangMasuk")).key;
      set(ref(database, "barangMasuk/" + id), {
        invoice: form.invoice,
        itemId: item.id,
        partnumber: item.partnumber,
        nama: item.nama,
        satuan: item.satuan,
        stok: qty,
        harga,
        total: qty * harga,
        tanggal: form.tanggal,
      });
    }

    resetForm();
  };

  // ======================
  // EDIT / HAPUS
  // ======================
  const editData = (h) => {
    setEditMode(true);
    setForm({
      id: h.id,
      itemId: h.itemId,
      partnumber: h.partnumber,
      nama: h.nama,
      satuan: h.satuan,
      harga: h.harga,
      qty: h.stok,
      invoice: h.invoice,
      tanggal: h.tanggal,
    });
  };

  const hapusData = (h) => {
    if (!window.confirm("Hapus transaksi ini?")) return;

    const item = items.find((i) => i.id === h.itemId);
    if (item) {
      update(ref(database, "items/" + item.id), {
        stok: Number(item.stok) - Number(h.stok),
      });
    }

    remove(ref(database, "barangMasuk/" + h.id));
  };

  const resetForm = () => {
    setForm({
      id: "",
      itemId: "",
      partnumber: "",
      nama: "",
      satuan: "",
      harga: 0,
      qty: "",
      invoice: "",
      tanggal: new Date().toISOString().slice(0, 10),
    });
    setEditMode(false);
  };

  // ======================
  // EXPORT
  // ======================
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(history);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Masuk");
    XLSX.writeFile(wb, "barang_masuk.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Laporan Barang Masuk", 14, 14);

    autoTable(doc, {
      startY: 20,
      head: [[
        "Part Number","Nama Barang","Stok","Satuan",
        "Harga","Total","Tanggal","Invoice"
      ]],
      body: history.map((h) => ([
        h.partnumber,
        h.nama,
        h.stok,
        h.satuan,
        h.harga,
        h.total,
        h.tanggal,
        h.invoice,
      ])),
    });

    doc.save("barang_masuk.pdf");
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div style={{ padding: 20 }}>
      <h2>📥 Barang Masuk</h2>

<div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
  <button onClick={() => navigate("/inventory")}>
    📦 Inventory
  </button>

  <button onClick={() => navigate("/barang-keluar")}>
    ➖ Barang Keluar
  </button>

  <button
    onClick={() => signOut(auth).then(() => navigate("/login"))}
  >
    Logout
  </button>
</div>


      <hr />

      <input
        type="date"
        value={form.tanggal}
        onChange={(e) =>
          setForm({ ...form, tanggal: e.target.value })
        }
      />

      <input
        placeholder="No. Invoice"
        value={form.invoice}
        onChange={(e) =>
          setForm({ ...form, invoice: e.target.value })
        }
      />

      <input
        list="pn"
        placeholder="Cari Part Number"
        value={form.partnumber}
        onChange={(e) => {
          setForm({ ...form, partnumber: e.target.value });
          isiDariPart(e.target.value);
        }}
      />

      <input
        list="nm"
        placeholder="Cari Nama Barang"
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

      <input
        type="number"
        placeholder="Qty Masuk"
        value={form.qty}
        onChange={(e) =>
          setForm({ ...form, qty: e.target.value })
        }
      />

      <input
        type="number"
        placeholder="Harga Satuan"
        value={form.harga}
        onChange={(e) =>
          setForm({ ...form, harga: e.target.value })
        }
      />

      <input value={totalHarga} disabled placeholder="Total Harga" />

      <button onClick={simpan}>
        {editMode ? "Update Barang Masuk" : "Simpan Barang Masuk"}
      </button>

      {editMode && (
        <button onClick={resetForm} style={{ marginLeft: 8 }}>
          Batal
        </button>
      )}

      <hr />

      <button onClick={exportExcel}>🟢 Print Excel</button>
      <button onClick={exportPDF} style={{ marginLeft: 8 }}>
        🔴 Print PDF
      </button>

      <hr />

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Part Number</th>
            <th>Nama Barang</th>
            <th>Stok</th>
            <th>Satuan</th>
            <th>Harga Satuan</th>
            <th>Total Harga</th>
            <th>Tanggal</th>
            <th>No. Invoice</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td>{h.partnumber}</td>
              <td>{h.nama}</td>
              <td>{h.stok}</td>
              <td>{h.satuan}</td>
              <td>{h.harga}</td>
              <td>{h.total}</td>
              <td>{h.tanggal}</td>
              <td>{h.invoice}</td>
              <td>
                <button onClick={() => editData(h)}>Edit</button>
                <button onClick={() => hapusData(h)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
