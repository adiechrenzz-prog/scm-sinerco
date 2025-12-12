import { useEffect, useState, useRef } from "react";
import { database } from "./firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";

import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Supplier() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [suppliers, setSuppliers] = useState([]);

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    telp: "",
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, []);

  useEffect(() => {
    const r = ref(database, "supplier");
    return onValue(r, snap => {
      const d = snap.val() || {};
      setSuppliers(Object.values(d));
    });
  }, []);

  if (loadingAuth) return <p>Checking login...</p>;

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const saveData = () => {
    if (!form.nama) return alert("Nama supplier wajib!");

    if (editId) {
      update(ref(database, "supplier/" + editId), form);
      setEditId(null);
    } else {
      const id = push(ref(database, "supplier")).key;
      set(ref(database, "supplier/" + id), { id, ...form });
    }

    setForm({ nama: "", alamat: "", telp: "" });
  };

  const editRow = s => {
    setEditId(s.id);
    setForm(s);
  };

  const deleteRow = id => {
    if (window.confirm("Hapus supplier ini?"))
      remove(ref(database, "supplier/" + id));
  };

  const exportExcel = () => {
    const data = suppliers.map(s => ({
      Nama: s.nama,
      Alamat: s.alamat,
      Telepon: s.telp,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Supplier");
    XLSX.writeFile(wb, "master_supplier.xlsx");
  };

  const importExcel = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const data = new Uint8Array(evt.target.result);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      rows.forEach(r => {
        if (!r["Nama"]) return;

        const id = push(ref(database, "supplier")).key;
        set(ref(database, "supplier/" + id), {
          id,
          nama: r["Nama"],
          alamat: r["Alamat"] || "",
          telp: r["Telepon"] || "",
        });
      });

      alert("Import berhasil!");
      e.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🏭 Master Supplier</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>

        <button onClick={() => fileInputRef.current.click()}>⬆ Import</button>
        <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={importExcel} style={{ display: "none" }} />

        <button onClick={exportExcel}>⬇ Export</button>

        <button onClick={() => { signOut(auth); navigate("/login"); }} style={{ marginLeft: "auto" }}>Logout</button>
      </div>

      <hr />

      <h3>{editId ? "Edit Supplier" : "Tambah Supplier"}</h3>

      <input name="nama" placeholder="Nama Supplier" value={form.nama} onChange={onChange} />
      <input name="alamat" placeholder="Alamat" value={form.alamat} onChange={onChange} />
      <input name="telp" placeholder="Telepon" value={form.telp} onChange={onChange} />

      <button onClick={saveData}>{editId ? "Update" : "Simpan"}</button>

      <hr />

      <table border="1" width="100%" cellPadding="6">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Alamat</th>
            <th>Telepon</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.map(s => (
            <tr key={s.id}>
              <td>{s.nama}</td>
              <td>{s.alamat}</td>
              <td>{s.telp}</td>
              <td>
                <button onClick={() => editRow(s)}>Edit</button>
                <button onClick={() => deleteRow(s.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
