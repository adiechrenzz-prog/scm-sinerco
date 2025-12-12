import { useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, push, set, onValue, update, remove } from "firebase/database";

export default function Peminta() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nama: "", jabatan: "" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const r = ref(database, "peminta");
    return onValue(r, snap => {
      const d = snap.val() || {};
      setList(Object.values(d));
    });
  }, []);

  const save = () => {
    if (!form.nama) return alert("Nama wajib!");

    if (editId) {
      update(ref(database, "peminta/" + editId), form);
      setEditId(null);
    } else {
      const id = push(ref(database, "peminta")).key;
      set(ref(database, "peminta/" + id), { id, ...form });
    }

    setForm({ nama: "", jabatan: "" });
  };

  const editRow = r => {
    setEditId(r.id);
    setForm(r);
  };

  const deleteRow = id => {
    if (window.confirm("Hapus peminta?"))
      remove(ref(database, "peminta/" + id));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👤 Master Peminta Barang</h2>

      <input
        name="nama"
        placeholder="Nama"
        value={form.nama}
        onChange={(e) => setForm({ ...form, nama: e.target.value })}
      />

      <input
        name="jabatan"
        placeholder="Jabatan"
        value={form.jabatan}
        onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
      />

      <button onClick={save}>{editId ? "Update" : "Simpan"}</button>

      <hr />

      <table border="1" cellPadding="6" width="100%">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Jabatan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {list.map(r => (
            <tr key={r.id}>
              <td>{r.nama}</td>
              <td>{r.jabatan}</td>
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
