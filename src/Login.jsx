import { useState } from "react";
import { auth, db } from "./firebase"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginAction = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const docRef = doc(db, "users", res.user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        localStorage.setItem("user_field_data", JSON.stringify(snap.data()));
      }
      
      // Gunakan replace: true agar halaman login tidak masuk dalam history browser
      navigate("/dashboard-scm", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Email atau Password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <img src="/Logo-Sinerco.png" alt="Logo Sinerco" style={styles.logo} />
        <h3 style={styles.title}>Supply Chain Management</h3>
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
          <button type="submit" disabled={loading} style={{...styles.button, opacity: loading ? 0.7 : 1}}>
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