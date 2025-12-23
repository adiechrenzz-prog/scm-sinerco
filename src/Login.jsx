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

  useEffect(() => {
    // Membersihkan sisa sesi lama saat masuk halaman login
    localStorage.removeItem("user_field_data");
  }, []);

  const handleLoginAction = async (e) => {
    e.preventDefault();
    if (!email || !password || !field) {
      alert("Mohon isi semua data!");
      return;
    }

    setLoading(true);

    try {
      // 1. Proses Login
      const res = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Ambil data dari Cloud Firestore (db)
      const docRef = doc(db, "users", res.user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const userData = snap.data();
        
        // 3. Validasi Hak Akses
        const isAdmin = userData.field === "admin";
        const isFieldMatch = userData.field === field;

        if (isAdmin || isFieldMatch) {
          // Simpan data ke localStorage agar ProtectedField mengenalinya
          localStorage.setItem("user_field_data", JSON.stringify(userData));
          
          const target = fields.find(f => f.id === field);
          if (target) {
            // Memaksa reload ke dashboard untuk memutus infinite loop/throttling
            window.location.href = target.path;
          }
        } else {
          await signOut(auth);
          alert(`Akses Ditolak! Akun Anda terdaftar untuk: ${userData.field.toUpperCase()}.`);
          setLoading(false);
        }
      } else {
        await signOut(auth);
        alert("Data role tidak ditemukan di Firestore. Periksa koleksi 'users'!");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Email atau Password salah.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <img src="/Logo-Sinerco.png" alt="Logo Sinerco" style={styles.logo} />
        <h3 style={styles.title}>Supply Chain Management </h3>
        <form onSubmit={handleLoginAction} style={styles.form}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            style={styles.input}
            required
          >
            <option value="">-- Pilih Lokasi Field --</option>
            {fields.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <button 
            type="submit" 
            disabled={loading} 
            style={{...styles.button, opacity: loading ? 0.7 : 1}}
          >
            {loading ? "Authenticating..." : "Login Ke Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  outerContainer: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5" },
  container: { padding: "40px", width: "100%", maxWidth: "360px", textAlign: "center", borderRadius: "12px", background: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
  logo: { width: "180px", marginBottom: "20px" },
  title: { color: "#333", marginBottom: "25px", fontWeight: "600" },
  form: { display: "flex", flexDirection: "column" },
  input: { padding: "12px", marginBottom: "15px", borderRadius: "6px", border: "1px solid #ccc", outline: "none" },
  button: { padding: "12px", background: "#800020", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }
};