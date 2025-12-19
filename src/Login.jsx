import { useEffect, useState, useRef } from "react";
import { auth, database } from "./firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [field, setField] = useState("");
  const isRedirecting = useRef(false); // Untuk mencegah loop kedip-kedip

  const navigate = useNavigate();

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

  // ✅ Auto-redirect diperbaiki agar tidak infinite loop
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && !isRedirecting.current) {
        isRedirecting.current = true; // Kunci proses redirect
        try {
          const snap = await get(ref(database, "users/" + user.uid));
          if (snap.exists()) {
            const userFieldId = snap.val().field;
            const target = fields.find(f => f.id === userFieldId);
            if (target) {
              navigate(target.path, { replace: true });
            }
          }
        } catch (err) {
          console.error("Auth redirect error:", err);
          isRedirecting.current = false;
        }
      }
    });
    return () => unsub();
  }, [navigate]);

  const login = async () => {
    if (!email || !password || !field) {
      alert("Mohon isi Email, Password, dan Pilih Lokasi Field!");
      return;
    }

    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // Simpan pilihan field ke database user
      await set(ref(database, "users/" + uid), {
        email,
        field,
        lastLogin: new Date().toISOString()
      });

      const selectedField = fields.find(f => f.id === field);
      if (selectedField) {
        isRedirecting.current = true;
        navigate(selectedField.path, { replace: true });
      }

    } catch (err) {
      console.error(err);
      let msg = "Login Gagal!";
      if (err.code === "auth/wrong-password") msg = "Password salah!";
      if (err.code === "auth/user-not-found") msg = "Email tidak terdaftar!";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <img 
        src="/Logo-Sinerco.png" 
        alt="Logo Sinerco" 
        style={styles.logo} 
        onError={(e) => e.target.style.display = 'none'} 
      />
      <h3 style={styles.title}>Inventory System Login</h3>

      <div style={styles.form}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          autoComplete="current-password"
        />
        
        <select
          value={field}
          onChange={(e) => setField(e.target.value)}
          style={styles.input}
        >
          <option value="">-- Pilih Lokasi Field --</option>
          {fields.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        <button 
          onClick={login} 
          disabled={loading} 
          style={{...styles.button, opacity: loading ? 0.6 : 1}}
        >
          {loading ? "Authenticating..." : "Login Ke Dashboard"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 25px",
    maxWidth: "360px",
    margin: "100px auto",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, sans-serif"
  },
  logo: { width: "180px", marginBottom: "20px" },
  title: { color: "#333", marginBottom: "25px", fontSize: "18px", fontWeight: "600" },
  form: { display: "flex", flexDirection: "column" },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    fontSize: "14px",
    outline: "none"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#7b003f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
    transition: "0.3s"
  }
};