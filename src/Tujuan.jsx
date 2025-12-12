import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push, set, onValue, update, remove } from "firebase/database";

export default function Tujuan() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nama: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const r = ref(database, "tujuan");
    return onValue(r, snap => {
      const d = snap.val() || {};
      setList(Object.values(d));
    });
  }, []);

  const save = () => {
    if (!form.nama) return alert("Nama tujuan wajib!");

    if (editId) {
      update(ref(database, "tujuan/" + editId), form);
      setEditId(null);
    } else {
      const id = push(ref(database, "tujuan")).key;
      set(ref(database, "tujuan/" + id), { id, ...form });
    }

    setForm({ nama: "" });
  };

  const editRow = r => {
    setEditId(r.id);
    setForm(r);
  };

  const deleteRow = id => {
    if (window.confirm("Hapus tujuan?"))
      remove(ref(database, "tujuan/" + id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📍 Master Tujuan Barang Keluar</h2>

      <input
        name="nama"
        placeholder="Nama Tujuan"
        value={form.nama}
        onChange={(e) => setForm({ ...form, nama: e.target.value })}
      />

      <button onClick={save}>{editId ? "Update" : "Simpan"}</button>

      <hr />

      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Nama Tujuan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {list.map(r => (
            <tr key={r.id}>
              <td>{r.nama}</td>
              <td>
                <button onClick={() => editRow(r)}>Edit</button>
                <button onClick={() => deleteRow(r.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
