import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import DashboardSCMCircle from "./DashboardSCMCircle";
import DashboardJatibarang from "./DashboardJatibarang";
import DashboardJatiasri from "./DashboardJatiasri";
import DashboardTambun from "./DashboardTambun";
import DashboardONWJ from "./DashboardONWJ";
import DashboardSangasanga from "./DashboardSangasanga";
import DashboardTarakan from "./DashboardTarakan";
import DashboardKampar from "./DashboardKampar";
import DashboardLangkap from "./DashboardLangkap";
import DashboardTMB from "./DashboardTMB";
import DashboardLimau from "./DashboardLimau";
import DashboardKemala from "./DashboardKemala";

import ResetDatabase from "./ResetDatabase";
import ProtectedField from "./ProtectedField";

/* --- IMPORT MODUL LAINNYA --- */
import Inventory from "./Inventory";
import FieldInventoryDashboard from "./Field Inventory/FieldInventoryDashboard";
import AssetLocationDashboard from "./Asset Location/AssetLocationDashboard";
import OilDashboard from "./Oil Consumption/OilDashboard";
import InstrumentList from "./InstrumentList";
import StockOpname from "./StockOpname";
import ProcurementDashboard from "./Procurement/ProcurementDashboard";
import SOPDashboard from "./SOP Dashboard/SOPDashboard"; 
import PanelDashboard from "./Control Panel/PanelDashboard";
import QuarterDashboard from "./Quarter Report/QuarterDashboard";
import KPIDashboard from "./SCM Perf. (KPI)/KPIDashboard";
import PSVList from "./PSVList";
import OpnameDetail from "./OpnameDetail";
import AssetByLocation from "./Asset Location/AssetByLocation";
import LocationMaster from "./Asset Location/LocationMaster";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* --- DASHBOARD BERDASARKAN FIELD --- */}
      
      <Route path="/dashboard-ho" element={
        <ProtectedField field="ho"><DashboardSCMCircle /></ProtectedField>
      } />
      
      <Route path="/dashboard-jatibarang" element={
        <ProtectedField field="jatibarang"><DashboardJatibarang /></ProtectedField>
      } />

      <Route path="/dashboard-jatiasri" element={
        <ProtectedField field="jatiasri"><DashboardJatiasri /></ProtectedField>
      } />

      <Route path="/dashboard-tambun" element={
        <ProtectedField field="tambun"><DashboardTambun /></ProtectedField>
      } />

      <Route path="/dashboard-onwj" element={
        <ProtectedField field="onwj"><DashboardONWJ /></ProtectedField>
      } />

      <Route path="/dashboard-sangasanga" element={
        <ProtectedField field="sangasanga"><DashboardSangasanga /></ProtectedField>
      } />

      <Route path="/dashboard-tarakan" element={
        <ProtectedField field="tarakan"><DashboardTarakan /></ProtectedField>
      } />

      <Route path="/dashboard-kampar" element={
        <ProtectedField field="kampar"><DashboardKampar /></ProtectedField>
      } />

      <Route path="/dashboard-langkap" element={
        <ProtectedField field="langkap"><DashboardLangkap /></ProtectedField>
      } />

      <Route path="/dashboard-tmb" element={
        <ProtectedField field="tmb"><DashboardTMB /></ProtectedField>
      } />

      <Route path="/dashboard-limau" element={
        <ProtectedField field="limau"><DashboardLimau /></ProtectedField>
      } />

      <Route path="/dashboard-kemala" element={
        <ProtectedField field="kemala"><DashboardKemala /></ProtectedField>
      } />

      {/* --- RUTE MODUL (Akses Umum Setelah Login) --- */}
      <Route path="/inventory" element={<ProtectedField><Inventory /></ProtectedField>} />
      <Route path="/field-inventory-dashboard" element={<ProtectedField><FieldInventoryDashboard /></ProtectedField>} />
      <Route path="/asset-locations-dashboard" element={<ProtectedField><AssetLocationDashboard /></ProtectedField>} />
      <Route path="/asset-by-location" element={<ProtectedField><AssetByLocation /></ProtectedField>} />
      <Route path="/location-master" element={<ProtectedField><LocationMaster /></ProtectedField>} />


      <Route path="/oil-dashboard" element={<ProtectedField><OilDashboard /></ProtectedField>} />
      <Route path="/instrument-list" element={<ProtectedField><InstrumentList /></ProtectedField>} />
      <Route path="/stock-opname" element={<ProtectedField><StockOpname /></ProtectedField>} />
      <Route path="/procurement-dashboard" element={<ProtectedField><ProcurementDashboard /></ProtectedField>} />
      <Route path="/sop-scm" element={<ProtectedField><SOPDashboard /></ProtectedField>} />
      <Route path="/control-panels" element={<ProtectedField><PanelDashboard /></ProtectedField>} />
      <Route path="/quarter-dashboard" element={<ProtectedField><QuarterDashboard /></ProtectedField>} />
      <Route path="/kpi-dashboard" element={<ProtectedField><KPIDashboard /></ProtectedField>} />
      <Route path="/psv-list" element={<ProtectedField><PSVList /></ProtectedField>} />
      <Route path="/opname-detail" element={<ProtectedField><OpnameDetail /></ProtectedField>} />
      
      {/* Khusus Admin */}
      <Route path="/reset-database" element={<ProtectedField field="admin"><ResetDatabase /></ProtectedField>} />

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}