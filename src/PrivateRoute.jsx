import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Inventory from "./Inventory";
import DashboardSCMCircle from "./DashboardSCMCircle";
import PrivateRoute from "./PrivateRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ✅ SEMUA YANG BUTUH LOGIN */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardSCMCircle />
          </PrivateRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <PrivateRoute>
            <Inventory />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
