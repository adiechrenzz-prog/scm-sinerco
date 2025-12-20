import { useState, useEffect } from "react";
import { auth, db } from "./firebase"; 
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [field, setField] = useState(""); 

  const fields = [
    { id: "ho", name: "Head Office", path: "/dashboard-ho" },
    { id: "jatibarang", name: "Jatibarang", path: "/dashboard-jatibarang" },
    { id: "jatiasri", name: "Jatiasri", path: "/dashboard-jatiasri" },
    { id: "tambun", name: "Tambun", path: "/dashboard-tambun" },
    { id: "onwj", name: "PHE Onwj", path: "/dashboard-onwj" },
    { id: "sangasanga", name: "Sangasanga", path: "/dashboard-sangasanga" },
    { id: "tarakan", name: "Tarakan", path: "/dashboard-tarakan" },
    { id: "kampar", name: "Kampar", path: "/dashboard-kampar" },
    { id: "langkap", name: "Langkap", path: "/dashboard-langkap" },
    { id: "tmb", name: "TMB", path: "/dashboard-tmb" },
    { id: "limau", name: "Limau", path: "/dashboard-limau" },
    { id: "kemala", name: "Gunung Kemala", path: "/dashboard-kemala" },
  ];

  // Membersihkan sisa login setiap kali masuk halaman login
  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleLoginAction = async (e) => {
    e.preventDefault();
    if (!email || !password || !field) {
      alert("Isi Email, Password, dan Pilih Lokasi!");
      return;
    }

    setLoading(true);

    try {
      // 1. Login ke Firebase Auth
      const res = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Ambil data HANYA dari Firestore (db) - Sesuai gambar Anda
      const docRef = doc(db, "users", res.user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const userData = snap.data();
        
        // 3. Validasi: Admin atau Field Cocok
        if (userData.field === "admin" || userData.field === field) {
          // Simpan ke cache agar ProtectedField tidak bingung
          localStorage.setItem("user_field_data", JSON.stringify(userData));
          
          const targetPath = fields.find(f => f.id === field).path;
          
          // 4. Navigasi Paksa untuk memutus loop
          window.location.href = targetPath;
        } else {
          await signOut(auth);
          alert(`Akses Ditolak! Akun Anda terdaftar di: ${userData.field.toUpperCase()}`);
          setLoading(false);
        }
      } else {
        await signOut(auth);
        alert("Data Role tidak ditemukan di Firestore Koleksi 'users'!");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Login Gagal: Periksa Email/Password Anda.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <div style={{ padding: "40px", width: "100%", maxWidth: "360px", textAlign: "center", borderRadius: "12px", background: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
        <img src="/Logo-Sinerco.png" alt="Logo" style={{ width: "180px", marginBottom: "20px" }} />
        <h3 style={{ marginBottom: "25px" }}>Inventory System Login</h3>
        <form onSubmit={handleLoginAction} style={{ display: "flex", flexDirection: "column" }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: "12px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ccc" }} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: "12px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ccc" }} required />
          <select value={field} onChange={(e) => setField(e.target.value)} style={{ padding: "12px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ccc" }} required>
            <option value="">-- Pilih Lokasi Field --</option>
            {fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button type="submit" disabled={loading} style={{ padding: "12px", background: "#800020", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            {loading ? "Authenticating..." : "Login Ke Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}