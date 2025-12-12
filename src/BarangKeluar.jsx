// BarangKeluar.jsx — DO multi-item (editable DO anytime)
import { useEffect, useState, useRef } from "react";
import { database } from "./firebase";
import {
  ref,
  onValue,
  push,
  set,
  update,
  remove,
  get,
  query,
  orderByChild,
} from "firebase/database";

import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import * as XLSX from "xlsx";

export default function BarangKeluar() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [loadingAuth, setLoadingAuth] = useState(true);

  // all barang keluar items
  const [items, setItems] = useState([]);

  // masters
  const [parts, setParts] = useState([]);
  const [pemintaList, setPemintaList] = useState([]);
  const [tujuanList, setTujuanList] = useState([]);

  // search inputs
  const [searchPart, setSearchPart] = useState("");
  const [searchPeminta, setSearchPeminta] = useState("");
  const [searchTujuan, setSearchTujuan] = useState("");

  // DO management
  const [currentDO, setCurrentDO] = useState(""); // currently selected DO in UI
  const [doActive, setDoActive] = useState(null); // object stored in /do_active (if any)
  const [doList, setDoList] = useState([]); // list of known DO numbers (from items + do_active)

  // form for adding item
  const [form, setForm] = useState({
    partnumber: "",
    nama: "",
    jumlah: "",
    harga: "",
    total: "",
    peminta: "",
    tujuan: "",
    ket: "",
    doNumber: "", // target DO for this item
  });

  // edit DO number fields
  const [editOldDo, setEditOldDo] = useState("");
  const [editNewDo, setEditNewDo] = useState("");

  // helpers
  const nowDateTime = () => {
    const d = new Date();
    const date = d.toISOString().substring(0, 10);
    const time = d.toTimeString().split(" ")[0];
    return `${date} ${time}`;
  };

  // AUTH guard
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setLoadingAuth(false);
    });
  }, [navigate]);

  // LOAD barangkeluar
  useEffect(() => {
    const r = ref(database, "barangkeluar");
    return onValue(r, (snap) => {
      const data = snap.val() || {};
      const arr = Object.values(data).map((x) => ({
        ...x,
        // ensure fields exist
        jumlah: Number(x.jumlah || 0),
        harga: Number(x.harga || 0),
        total: Number(x.total || 0),
        doNumber: String(x.doNumber || x.noDO || ""),
        id: x.id || x.key || x._id || x?.id || "",
      }));
      setItems(arr);
    });
  }, []);

  // LOAD masters
  useEffect(() => {
    onValue(ref(database, "datasparepart"), (snap) => {
      const d = snap.val() || {};
      setParts(Object.values(d));
    });

    onValue(ref(database, "peminta"), (snap) => {
      const d = snap.val() || {};
      setPemintaList(Object.values(d));
    });

    onValue(ref(database, "tujuan"), (snap) => {
      const d = snap.val() || {};
      setTujuanList(Object.values(d));
    });
  }, []);

  // LOAD do_active node (stores current open DO info if any)
  useEffect(() => {
    const r = ref(database, "do_active");
    return onValue(r, (snap) => {
      const v = snap.val() || null;
      setDoActive(v);
      if (v && v.doNumber) {
        setCurrentDO(String(v.doNumber));
      } else {
        // if no active DO in DB, we still may set currentDO to empty
        setCurrentDO("");
      }
    });
  }, []);

  // build doList from items + do_active
  useEffect(() => {
    const setUniqueDoList = () => {
      const s = new Set();
      if (doActive && doActive.doNumber) s.add(String(doActive.doNumber));
      items.forEach((it) => {
        const d = String(it.doNumber || it.noDO || "").trim();
        if (d) s.add(d);
      });
      const arr = Array.from(s).sort();
      setDoList(arr);
      // if no currentDO set and there is an active DO in DB, prefer that
      if (!currentDO && doActive && doActive.doNumber) {
        setCurrentDO(String(doActive.doNumber));
      }
    };
    setUniqueDoList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, doActive]);

  if (loadingAuth) return <p>Checking login…</p>;

  // Safety filter helpers (avoid toLowerCase on numbers)
  const safeLower = (v) => String(v || "").toLowerCase();

  // FILTERS for UI lists
  const fPart = parts.filter((p) => {
    const pn = safeLower(p.partnumber);
    const nm = safeLower(p.nama);
    const key = safeLower(searchPart);
    return pn.includes(key) || nm.includes(key);
  });

  const fPeminta = pemintaList.filter((p) =>
    safeLower(p.nama).includes(safeLower(searchPeminta))
  );

  const fTujuan = tujuanList.filter((t) =>
    safeLower(t.nama).includes(safeLower(searchTujuan))
  );

  // =========================
  // DO helpers
  // =========================
  const generateDONumber = () => {
    // format: DO-YYYY-0001
    const year = new Date().getFullYear();
    // count existing DO in items that belong to this year
    const existingThisYear = doList.filter((d) => String(d).includes(`DO-${year}-`));
    const num = existingThisYear.length + 1;
    return `DO-${year}-${String(num).padStart(4, "0")}`;
  };

  const createNewDO = async () => {
    const newNo = generateDONumber();
    // save in do_active
    await set(ref(database, "do_active"), {
      doNumber: newNo,
      status: "open",
      createdAt: nowDateTime(),
    });
    setCurrentDO(newNo);
    alert("DO baru dibuat: " + newNo);
  };

  const finishCurrentDO = async () => {
    if (!currentDO) return alert("Tidak ada DO aktif untuk diselesaikan.");
    if (!window.confirm(`Selesaikan DO ${currentDO}? (tidak akan menghapus item)`)) return;
    // Set do_active.status closed (if matches)
    const da = (await get(ref(database, "do_active"))).val();
    if (da && String(da.doNumber) === String(currentDO)) {
      await update(ref(database, "do_active"), { status: "closed", closedAt: nowDateTime() });
    }
    // Optionally mark items in this DO as status 'ready' -- we'll set a field 'doClosed': true
    // Update all items with this doNumber: set doStatus = 'closed' (keeps history)
    const updates = {};
    items.forEach((it) => {
      const itDo = String(it.doNumber || it.noDO || "").trim();
      if (itDo && itDo === String(currentDO)) {
        updates[`barangkeluar/${it.id}/doStatus`] = "closed";
      }
    });
    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
    }
    // create next DO automatically and set as active
    const nextDo = generateDONumber(); // note: generate uses current doList, may need to recalc, but it's fine
    await set(ref(database, "do_active"), {
      doNumber: nextDo,
      status: "open",
      createdAt: nowDateTime(),
    });
    setCurrentDO(nextDo);
    alert(`DO ${currentDO} diselesaikan. DO baru aktif: ${nextDo}`);
  };

  // Edit DO number: update do_active if matches and update all items that match oldDo -> newDo
  const editDoNumber = async () => {
    const oldD = String(editOldDo || "").trim();
    const newD = String(editNewDo || "").trim();
    if (!oldD || !newD) return alert("Old DO & New DO harus diisi");
    if (!window.confirm(`Ganti semua item DO ${oldD} menjadi ${newD}?`)) return;
    // update do_active if matches
    const daSnap = (await get(ref(database, "do_active"))).val() || null;
    if (daSnap && String(daSnap.doNumber) === oldD) {
      await update(ref(database, "do_active"), { doNumber: newD });
      setDoActive({ ...daSnap, doNumber: newD });
      setCurrentDO(newD);
    }
    // update barangkeluar items where doNumber == oldD
    const updates = {};
    items.forEach((it) => {
      const itDo = String(it.doNumber || it.noDO || "").trim();
      if (itDo === oldD) {
        updates[`barangkeluar/${it.id}/doNumber`] = newD;
        updates[`barangkeluar/${it.id}/noDO`] = newD; // keep old field too
      }
    });
    if (Object.keys(updates).length === 0) {
      alert("Tidak ada item dengan DO tersebut.");
      return;
    }
    await update(ref(database), updates);
    alert(`Semua item DO ${oldD} telah diubah menjadi ${newD}`);
    setEditOldDo("");
    setEditNewDo("");
  };

  // Update a single item's doNumber (allow moving item to another DO)
  const moveItemToDo = async (itemId, newDo) => {
    if (!itemId || !newDo) return;
    await update(ref(database, `barangkeluar/${itemId}`), { doNumber: newDo, noDO: newDo });
    alert("Item dipindah ke DO " + newDo);
  };

  // =========================
  // Form handlers
  // =========================
  const handleForm = (e) => {
    const { name, value } = e.target;
    let nf = { ...form, [name]: value };
    if (name === "jumlah") {
      const qty = Number(value || 0);
      const harga = Number(form.harga || 0);
      nf.total = qty * harga;
    }
    if (name === "harga") {
      const hargaVal = Number(value || 0);
      const qty = Number(form.jumlah || 0);
      nf.total = qty * hargaVal;
    }
    setForm(nf);
  };

  const applyPart = (p) => {
    setForm({
      ...form,
      partnumber: String(p.partnumber || ""),
      nama: String(p.nama || ""),
      harga: Number(p.harga || 0),
      jumlah: form.jumlah || "",
      total: form.jumlah ? Number(form.jumlah) * Number(p.harga || 0) : form.total || "",
    });
    setSearchPart("");
  };

  const applyPeminta = (p) => {
    setForm({ ...form, peminta: p.nama || "" });
    setSearchPeminta("");
  };

  const applyTujuan = (t) => {
    setForm({ ...form, tujuan: t.nama || "" });
    setSearchTujuan("");
  };

  // Save item to selected DO (if no DO selected, create DO first)
  const saveItem = async () => {
    // choose do target: form.doNumber > currentDO > create new DO
    let targetDO = String(form.doNumber || "").trim();
    if (!targetDO) targetDO = String(currentDO || "").trim();
    if (!targetDO) {
      // create new DO and set as active
      const newDo = generateDONumber();
      await set(ref(database, "do_active"), { doNumber: newDo, status: "open", createdAt: nowDateTime() });
      setCurrentDO(newDo);
      targetDO = newDo;
    }

    if (!form.partnumber) return alert("Pilih sparepart!");
    if (!form.jumlah) return alert("Jumlah wajib!");
    if (!form.peminta) return alert("Peminta wajib!");
    if (!form.tujuan) return alert("Tujuan wajib!");

    const id = push(ref(database, "barangkeluar")).key;
    const payload = {
      id,
      doNumber: targetDO,
      noDO: targetDO,
      partnumber: String(form.partnumber || ""),
      nama: String(form.nama || ""),
      jumlah: Number(form.jumlah || 0),
      harga: Number(form.harga || 0),
      total: Number(form.total || 0),
      peminta: String(form.peminta || ""),
      tujuan: String(form.tujuan || ""),
      waktu: nowDateTime(),
      status: "pending",
      ket: String(form.ket || ""),
    };

    await set(ref(database, `barangkeluar/${id}`), payload);

    // refresh UI (onValue will update)
    setForm({
      partnumber: "",
      nama: "",
      jumlah: "",
      harga: "",
      total: "",
      peminta: "",
      tujuan: "",
      ket: "",
      doNumber: "",
    });
  };

  // DELETE one item
  const deleteItem = async (id) => {
    if (!window.confirm("Hapus item ini?")) return;
    await remove(ref(database, `barangkeluar/${id}`));
  };

  // EXPORT Excel
  const exportExcel = () => {
    const rows = items.map((i) => ({
      "No DO": i.doNumber || i.noDO || "",
      "Part Number": i.partnumber,
      Nama: i.nama,
      Jumlah: i.jumlah,
      Harga: i.harga,
      Total: i.total,
      Peminta: i.peminta,
      Tujuan: i.tujuan,
      Waktu: i.waktu,
      Status: i.status || "",
      Keterangan: i.ket || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Barang Keluar");
    XLSX.writeFile(wb, "barang_keluar.xlsx");
  };

  // IMPORT Excel (assign to DO if present in file or to current DO)
  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const bytes = new Uint8Array(ev.target.result);
      const wb = XLSX.read(bytes, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      // if no current DO, create one for imported rows without DO
      let activeDo = String(currentDO || (doActive && doActive.doNumber) || "").trim();
      if (!activeDo) {
        // create new DO and set active
        const newDo = generateDONumber();
        await set(ref(database, "do_active"), { doNumber: newDo, status: "open", createdAt: nowDateTime() });
        activeDo = newDo;
        setCurrentDO(newDo);
      }

      // write rows
      let indexOffset = items.length;
      for (let idx = 0; idx < rows.length; idx++) {
        const r = rows[idx];
        const id = push(ref(database, "barangkeluar")).key;
        const rowDo = String(r["No DO"] || r["DO"] || "").trim() || activeDo;
        await set(ref(database, `barangkeluar/${id}`), {
          id,
          doNumber: rowDo,
          noDO: rowDo,
          partnumber: r["Part Number"] || "",
          nama: r["Nama"] || "",
          jumlah: Number(r["Jumlah"] || r["qty"] || 0),
          harga: Number(r["Harga"] || 0),
          total: Number(r["Total"] || 0),
          peminta: r["Peminta"] || "",
          tujuan: r["Tujuan"] || "",
          waktu: r["Waktu"] || nowDateTime(),
          status: r["Status"] || "pending",
          ket: r["Keterangan"] || "",
        });
        indexOffset++;
      }

      alert("Import berhasil!");
      e.target.value = "";
    };

    reader.readAsArrayBuffer(file);
  };

  // CLEAR all barangkeluar
  const clearAll = async () => {
    if (!window.confirm("Hapus semua data Barang Keluar?")) return;
    await remove(ref(database, "barangkeluar"));
    alert("Semua data Barang Keluar dihapus.");
  };

  // PRINT DO (navigate)
  const goPrintDO = (doNum) => {
    if (!doNum) return alert("No DO kosong!");
    navigate(`/do-print?noDO=${encodeURIComponent(doNum)}`);
  };

  // Move an item to selected DO (UI action)
  const handleMoveItem = async (itemId) => {
    const newDo = prompt("Masukkan nomor DO tujuan (contoh DO-2025-0001):");
    if (!newDo) return;
    await moveItemToDo(itemId, newDo);
  };

  // ======= RENDER =======
  // grouped items by DO for display convenience
  const groupedByDo = items.reduce((acc, it) => {
    const d = String(it.doNumber || it.noDO || "UNASSIGNED");
    if (!acc[d]) acc[d] = [];
    acc[d].push(it);
    return acc;
  }, {});

  const totalPengeluaran = items.reduce((s, a) => s + Number(a.total || 0), 0);

  return (
    <div style={{ padding: 20 }}>
      <h2>➖ Barang Keluar — DO Multi-Item (Editable DO)</h2>

      {/* NAV */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => navigate("/dashboard")}>⬅ Dashboard</button>
        <button onClick={() => navigate("/barang-masuk")}>➕ Barang Masuk</button>

        <button onClick={exportExcel}>⬇ Export</button>
        <button onClick={() => fileRef.current.click()}>⬆ Import</button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: "none" }} onChange={importExcel} />

        <button style={{ background: "red", color: "white" }} onClick={clearAll}>
          🗑 Hapus Semua
        </button>

        <button style={{ marginLeft: "auto" }} onClick={() => { signOut(auth); navigate("/login"); }}>
          Logout
        </button>
      </div>

      <hr />

      {/* DO controls */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <div>
          <b>DO Aktif:</b> {doActive?.doNumber || currentDO || "(tidak ada)"} &nbsp;
          <span style={{ color: "#666" }}>({doActive?.status || "—"})</span>
        </div>

        <button onClick={createNewDO}>🆕 Buat DO Baru</button>
        <button onClick={finishCurrentDO}>✔ Selesaikan DO Aktif</button>

        <select value={currentDO} onChange={(e) => setCurrentDO(e.target.value)}>
          <option value="">-- Pilih DO (atau biarkan kosong) --</option>
          {doList.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <div style={{ marginLeft: "auto", fontSize: 13, color: "#555" }}>
          Total Pengeluaran: Rp {totalPengeluaran.toLocaleString()}
        </div>
      </div>

      {/* Edit DO number global */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 16 }}>
        <input placeholder="DO lama (mis. DO-2025-0001)" value={editOldDo} onChange={(e) => setEditOldDo(e.target.value)} />
        <input placeholder="DO baru (mis. DO-2025-0100)" value={editNewDo} onChange={(e) => setEditNewDo(e.target.value)} />
        <button onClick={editDoNumber}>✏️ Ganti Nomor DO (update semua item)</button>
      </div>

      <hr />

      {/* FORM: add item */}
      <h3>Tambah Item ke DO</h3>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ minWidth: 280 }}>
          <input placeholder="Cari Sparepart" value={searchPart} onChange={(e) => setSearchPart(e.target.value)} />
          {searchPart && (
            <div style={{ border: "1px solid #ccc", maxHeight: 150, overflow: "auto", background: "#fff" }}>
              {fPart.map((p) => (
                <div key={p.id} style={{ padding: 6, cursor: "pointer", borderBottom: "1px solid #eee" }} onClick={() => applyPart(p)}>
                  <b>{String(p.partnumber)}</b> — {String(p.nama)}
                </div>
              ))}
            </div>
          )}
        </div>

        <input name="partnumber" value={form.partnumber} readOnly placeholder="Part Number" />
        <input name="nama" value={form.nama} readOnly placeholder="Nama" style={{ minWidth: 220 }} />

        <input name="jumlah" type="number" placeholder="Jumlah" value={form.jumlah} onChange={handleForm} style={{ width: 100 }} />
        <input name="harga" type="number" placeholder="Harga" value={form.harga} onChange={handleForm} style={{ width: 120 }} />
        <input name="total" placeholder="Total" value={form.total} readOnly style={{ width: 120 }} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <div style={{ minWidth: 220 }}>
          <input placeholder="Cari Peminta" value={searchPeminta} onChange={(e) => setSearchPeminta(e.target.value)} />
          {searchPeminta && (
            <div style={{ border: "1px solid #ccc", maxHeight: 120, overflow: "auto", background: "#fff" }}>
              {fPeminta.map((p) => (
                <div key={p.id} style={{ padding: 6, cursor: "pointer", borderBottom: "1px solid #eee" }} onClick={() => applyPeminta(p)}>
                  {String(p.nama)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ minWidth: 220 }}>
          <input placeholder="Cari Tujuan" value={searchTujuan} onChange={(e) => setSearchTujuan(e.target.value)} />
          {searchTujuan && (
            <div style={{ border: "1px solid #ccc", maxHeight: 120, overflow: "auto", background: "#fff" }}>
              {fTujuan.map((t) => (
                <div key={t.id} style={{ padding: 6, cursor: "pointer", borderBottom: "1px solid #eee" }} onClick={() => applyTujuan(t)}>
                  {String(t.nama)}
                </div>
              ))}
            </div>
          )}
        </div>

        <input name="peminta" placeholder="Peminta" value={form.peminta} readOnly />
        <input name="tujuan" placeholder="Tujuan" value={form.tujuan} readOnly />

        <input name="doNumber" placeholder="Masukkan No DO (opsional)" value={form.doNumber} onChange={(e) => setForm({ ...form, doNumber: e.target.value })} />
        <input name="ket" placeholder="Keterangan" value={form.ket} onChange={handleForm} />

        <button onClick={saveItem}>➕ Tambah ke DO</button>
      </div>

      <hr />

      {/* TABLE: grouped by DO */}
      <h3>Daftar Barang Keluar (Group by DO)</h3>

      {Object.keys(groupedByDo).length === 0 && <p>Belum ada data.</p>}

      {Object.keys(groupedByDo).map((doNum) => (
        <div key={doNum} style={{ marginBottom: 18, border: "1px solid #ddd", padding: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <b>DO:</b> {doNum} &nbsp;
              <span style={{ color: "#666" }}>({groupedByDo[doNum].length} item)</span>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => goPrintDO(doNum)}>📄 Print DO</button>
              <button onClick={() => {
                // prompt to edit DO number for this DO only
                const newD = prompt("Masukkan nomor DO baru untuk semua item DO ini:", doNum);
                if (newD && newD.trim()) {
                  setEditOldDo(doNum);
                  setEditNewDo(newD.trim());
                  editDoNumber();
                }
              }}>✏️ Edit Nomor DO</button>
            </div>
          </div>

          <table border="1" width="100%" cellPadding="6" style={{ marginTop: 8 }}>
            <thead>
              <tr style={{ background: "#fafafa" }}>
                <th>No</th>
                <th>Part Number</th>
                <th>Nama</th>
                <th>Jumlah</th>
                <th>Harga</th>
                <th>Total</th>
                <th>Peminta</th>
                <th>Tujuan</th>
                <th>Waktu</th>
                <th>Keterangan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {groupedByDo[doNum].map((it, idx) => (
                <tr key={it.id}>
                  <td>{idx + 1}</td>
                  <td>{it.partnumber}</td>
                  <td>{it.nama}</td>
                  <td>{it.jumlah}</td>
                  <td>{it.harga}</td>
                  <td>{it.total}</td>
                  <td>{it.peminta}</td>
                  <td>{it.tujuan}</td>
                  <td>{it.waktu}</td>
                  <td>{it.ket}</td>
                  <td>
                    <button onClick={() => handleMoveItem(it.id)}>🔀 Pindah DO</button>
                    <button onClick={() => deleteItem(it.id)}>🗑 Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

    </div>
  );
}
