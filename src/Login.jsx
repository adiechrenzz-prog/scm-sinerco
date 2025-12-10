import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Kalau sudah login, langsung ke dashboard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/");
    });
    return () => unsub();
  }, [navigate]);

  const login = async () => {
    if (!email || !password) {
      alert("Email dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      alert("Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* ✅ LOGO */}
      <img
        src="/Logo-Sinerco.png"
        alt="Logo Sinerco"
        style={styles.logo}
      />

      <h3>Login Admin</h3>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button onClick={login} disabled={loading} style={styles.button}>
        {loading ? "Loading..." : "Login"}
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: 40,
    maxWidth: 360,
    margin: "100px auto",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: 10,
    background: "#fff",
  },
  logo: {
    width: 180,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#7b003f",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
};
