import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import DashboardSCMCircle from "./DashboardSCMCircle";
import DashboardJatibarang from "./DashboardJatibarang";
import ResetDatabase from "./ResetDatabase";
import ProtectedField from "./ProtectedField";

/* ================= SOP SYSTEM ================= */
import SOPDashboard from "./SOP Dashboard/SOPDashboard"; 
import SOPAudit from "./SOP Dashboard/SOPAudit";
import SOPFileList from "./SOP Dashboard/SOPFileList";
import SOPFileViewer from "./SOP Dashboard/SOPFileViewer";
import SOPInventory from "./SOP Dashboard/SOPInventory";
import SOPMaintenance from "./SOP Dashboard/SOPMaintenance";
import SOPProcurement from "./SOP Dashboard/SOPProcurement";
import SOPSCMDetail from "./SOP Dashboard/SOPSCM";

/* ================= CONTROL PANEL SYSTEM ================= */
import PanelDashboard from "./Control Panel/PanelDashboard";
import PanelLocation from "./Control Panel/PanelLocation";
import PanelMaster from "./Control Panel/PanelMaster";
import PanelSpecification from "./Control Panel/PanelSpecification";
import PanelStatus from "./Control Panel/PanelStatus";
import PanelWiringDiagram from "./Control Panel/PanelWiringDiagram";

/* ================= KPI SYSTEM (SCM PERF.) ================= */
import KPIDashboard from "./SCM Perf. (KPI)/KPIDashboard";
import KPIInventory from "./SCM Perf. (KPI)/KPIInventory";
import KPIProcurement from "./SCM Perf. (KPI)/KPIProcurement";
import KPIMaintenance from "./SCM Perf. (KPI)/KPIMaintenance";
import KPIMonthlyChart from "./SCM Perf. (KPI)/KPIMonthlyChart";
import KPITargetActual from "./SCM Perf. (KPI)/KPITargetActual";

/* ================= INVENTORY ================= */
import Inventory from "./Inventory";
import BarangMasuk from "./BarangMasuk";
import BarangKeluar from "./BarangKeluar";
import ApprovalBarangKeluar from "./ApprovalBarangKeluar";
import SisaStok from "./SisaStok";
import StockOpname from "./StockOpname";
import DataPart from "./DataPart";
import Supplier from "./Supplier";
import Peminta from "./Peminta";
import Tujuan from "./Tujuan";
import DOPrint from "./DOPrint";

/* ================= FIELD INVENTORY SYSTEM ================= */
import FieldInventoryDashboard from "./Field Inventory/FieldInventoryDashboard";
import FieldAssets from "./Field Inventory/FieldAssets";
import FieldCriticalStock from "./Field Inventory/FieldCriticalStock";
import FieldInventoryMain from "./Field Inventory/FieldInventory"; 
import FieldMovement from "./Field Inventory/FieldMovement";
import FieldRequest from "./Field Inventory/FieldRequest";
import FieldStock from "./Field Inventory/FieldStock";

/* ================= ASSET LOCATION SYSTEM ================= */
import AssetLocationDashboard from "./Asset Location/AssetLocationDashboard";
import AssetByLocation from "./Asset Location/AssetByLocation";
import LocationMaster from "./Asset Location/LocationMaster";

/* ================= OIL CONSUMPTION SYSTEM ================= */
import OilDashboard from "./Oil Consumption/OilDashboard";
import OilAnalysis from "./Oil Consumption/OilAnalysis";
import OilLocation from "./Oil Consumption/OilLocation";
import OilMonthlyRecap from "./Oil Consumption/OilMonthlyRecap";
import OilPrice from "./Oil Consumption/OilPrice";
import OilUsage from "./Oil Consumption/OilUsage";

/* ================= PROCUREMENT SYSTEM ================= */
import ProcurementDashboard from "./Procurement/ProcurementDashboard";
import PurchaseRequest from "./Procurement/PurchaseRequest";
import PurchaseOrder from "./Procurement/PurchaseOrder";
import GoodsReceiving from "./Procurement/GoodsReceiving";
import SupplierEvaluation from "./Procurement/SupplierEvaluation";
import SupplierList from "./Procurement/SupplierList";

/* ================= CALIBRATION & PSV ================= */
import InstrumentList from "./InstrumentList";
import CalibrationHistory from "./CalibrationHistory";
import CalibrationSchedule from "./CalibrationSchedule";
import CalibrationReminder from "./CalibrationReminder";
import CalibrationCertificate from "./CalibrationCertificate";
import PSVList from "./PSVList";

/* ================= QUARTER REPORT SYSTEM ================= */
import QuarterDashboard from "./Quarter Report/QuarterDashboard";
import QuarterInventoryReport from "./Quarter Report/QuarterInventoryReport";
import QuarterKPIReport from "./Quarter Report/QuarterKPIReport";
import QuarterMaintenanceReport from "./Quarter Report/QuarterMaintenanceReport";
import QuarterProcurementReport from "./Quarter Report/QuarterProcurementReport";
import QuarterPresentation from "./Quarter Report/QuarterPresentation";

/* ================= OTHER ================= */
import OpnameDetail from "./OpnameDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" />} />

      {/* DASHBOARDS */}
      <Route path="/dashboard-ho" element={<ProtectedField field="ho"><DashboardSCMCircle /></ProtectedField>} />
      
      {/* FIELD INVENTORY ROUTES - Penyesuaian Path agar sesuai konsol */}
      <Route path="/field-inventory-dashboard" element={<ProtectedField><FieldInventoryDashboard /></ProtectedField>} />
      <Route path="/field-assets" element={<ProtectedField><FieldAssets /></ProtectedField>} />
      <Route path="/field-critical-stock" element={<ProtectedField><FieldCriticalStock /></ProtectedField>} />
      <Route path="/field-inventory-list" element={<ProtectedField><FieldInventoryMain /></ProtectedField>} />
      <Route path="/field-movement" element={<ProtectedField><FieldMovement /></ProtectedField>} />
      <Route path="/field-request" element={<ProtectedField><FieldRequest /></ProtectedField>} />
      <Route path="/field-stock-status" element={<ProtectedField><FieldStock /></ProtectedField>} />

      {/* ASSET LOCATION ROUTES - Penyesuaian Path agar sesuai konsol */}
      <Route path="/asset-locations" element={<ProtectedField><AssetLocationDashboard /></ProtectedField>} />
      <Route path="/asset-locations-dashboard" element={<ProtectedField><AssetLocationDashboard /></ProtectedField>} /> {/* Alias untuk jaga-jaga */}
      <Route path="/asset-by-location" element={<ProtectedField><AssetByLocation /></ProtectedField>} />
      <Route path="/location-master" element={<ProtectedField><LocationMaster /></ProtectedField>} />

      {/* MODUL LAINNYA */}
      <Route path="/inventory" element={<ProtectedField><Inventory /></ProtectedField>} />
      <Route path="/oil-dashboard" element={<ProtectedField><OilDashboard /></ProtectedField>} />
      <Route path="/instrument-list" element={<ProtectedField><InstrumentList /></ProtectedField>} />
      <Route path="/stock-opname" element={<ProtectedField><StockOpname /></ProtectedField>} />
      <Route path="/procurement-dashboard" element={<ProtectedField><ProcurementDashboard /></ProtectedField>} />
      <Route path="/sop-scm" element={<ProtectedField><SOPDashboard /></ProtectedField>} />
      <Route path="/control-panels" element={<ProtectedField><PanelDashboard /></ProtectedField>} />
      <Route path="/quarter-dashboard" element={<ProtectedField><QuarterDashboard /></ProtectedField>} />
      <Route path="/kpi-dashboard" element={<ProtectedField><KPIDashboard /></ProtectedField>} />
      <Route path="/psv-list" element={<ProtectedField><PSVList /></ProtectedField>} />

      <Route path="/reset-database" element={<ProtectedField field="admin"><ResetDatabase /></ProtectedField>} />
      <Route path="/opname-detail" element={<ProtectedField><OpnameDetail /></ProtectedField>} />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}