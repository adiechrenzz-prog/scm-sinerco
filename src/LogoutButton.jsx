import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <button style={styles.btn} onClick={handleLogout}>
      Logout
    </button>
  );
}

const styles = {
  btn: {
    position: "fixed",
    top: 12,
    right: 20,
    zIndex: 99999,
    padding: "10px 18px",
    background: "#7b003f",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
};
