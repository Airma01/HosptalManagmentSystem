/**
 * CSM Dashboard Barrel Export
 * 
 * This file exports all CSM Dashboard components, services, and shared components
 * from a single entry point for cleaner imports.
 * 
 * Usage:
 * import { CSMDashboard, MedicineList, InventoryList } from './Pages/Dashboard/CSMDashboard';
 */

// ========================= Main Dashboard =========================
export { default as CSMDashboard } from "./CSMDashboard";

// ========================= Components =========================
export { default as DashboardHeader } from "./Components/DashboardHeader";
export { default as DashboardStats } from "./Components/DashboardStats";
export { default as SummaryCards } from "./Components/SummaryCards";
export { default as LowStockTable } from "./Components/LowStockTable";
export { default as ExpiringMedicineTable } from "./Components/ExpiringMedicineTable";
export { default as BranchAlertsTable } from "./Components/BranchAlertsTable";
export { default as InventoryValueChart } from "./Components/InventoryValueChart";
export { default as RecentTransfers } from "./Components/RecentTransfers";

// ========================= Medicine =========================
export { default as MedicineList } from "./Medicine/MedicineList";
export { default as CreateMedicine } from "./Medicine/CreateMedicine";
export { default as EditMedicine } from "./Medicine/EditMedicine";
export { default as MedicineDetails } from "./Medicine/MedicineDetails";
export { default as MedicineSearch } from "./Medicine/MedicineSearch";

// ========================= Inventory =========================
export { default as InventoryList } from "./Inventory/InventoryList";
export { default as InventoryDetails } from "./Inventory/InventoryDetails";
export { default as CreateInventory } from "./Inventory/CreateInventory";
export { default as EditInventory } from "./Inventory/EditInventory";
export { default as AdjustStock } from "./Inventory/AdjustStock";
export { default as InventoryHistory } from "./Inventory/InventoryHistory";
export { default as LowStock } from "./Inventory/LowStock";
export { default as ExpiringMedicines } from "./Inventory/ExpiringMedicines";
export { default as ExpiredMedicines } from "./Inventory/ExpiredMedicines";
export { default as InventoryValue } from "./Inventory/InventoryValue";
export { default as ReceivePurchasedMedicine } from "./Inventory/ReceivePurchasedMedicine";
export { default as ReceiveAidStoreTransfer } from "./Inventory/ReceiveAidStoreTransfer";

// ========================= Requests =========================
export { default as RequestList } from "./Requests/RequestList";
export { default as RequestDetails } from "./Requests/RequestDetails";
export { default as RequestReview } from "./Requests/RequestReview";
export { default as ApproveRequest } from "./Requests/ApproveRequest";
export { default as PartialApproveRequest } from "./Requests/PartialApproveRequest";
export { default as RejectRequest } from "./Requests/RejectRequest";
export { default as CancelRequest } from "./Requests/CancelRequest";
export { default as RequestAvailability } from "./Requests/RequestAvailability";

// ========================= Transfers =========================
export { default as TransferList } from "./Transfers/TransferList";
export { default as CreateTransfer } from "./Transfers/CreateTransfer";
export { default as TransferDetails } from "./Transfers/TransferDetails";
export { default as DispatchTransfer } from "./Transfers/DispatchTransfer";
export { default as TransferTracking } from "./Transfers/TransferTracking";
export { default as UpdateTransferStatus } from "./Transfers/UpdateTransferStatus";
export { default as CancelTransfer } from "./Transfers/CancelTransfer";
export { default as TransferHistory } from "./Transfers/TransferHistory";

// ========================= Branches =========================
export { default as BranchList } from "./Branches/BranchList";
export { default as BranchDetails } from "./Branches/BranchDetails";
export { default as BranchInventory } from "./Branches/BranchInventory";
export { default as BranchRequests } from "./Branches/BranchRequests";
export { default as BranchTransfers } from "./Branches/BranchTransfers";
export { default as BranchConsumption } from "./Branches/BranchConsumption";
export { default as BranchLowStock } from "./Branches/BranchLowStock";

// ========================= Monitoring =========================
export { default as LowStockMonitoring } from "./Monitoring/LowStockMonitoring";
export { default as ExpiryMonitoring } from "./Monitoring/ExpiryMonitoring";
export { default as ExpiredMedicinesMonitor } from "./Monitoring/ExpiredMedicines";
export { default as NearExpiryMedicines } from "./Monitoring/NearExpiryMedicines";
export { default as CriticalStock } from "./Monitoring/CriticalStock";
export { default as ReplenishmentSuggestions } from "./Monitoring/ReplenishmentSuggestions";
export { default as MedicineMovement } from "./Monitoring/MedicineMovement";
export { default as InventoryAudit } from "./Monitoring/InventoryAudit";

// ========================= Reports =========================
export { default as InventoryReport } from "./Reports/InventoryReport";
export { default as BranchInventoryReport } from "./Reports/BranchInventoryReport";
export { default as RequestReport } from "./Reports/RequestReport";
export { default as TransferReport } from "./Reports/TransferReport";
export { default as ExpiryReport } from "./Reports/ExpiryReport";
export { default as ConsumptionReport } from "./Reports/ConsumptionReport";
export { default as InventoryValueReport } from "./Reports/InventoryValueReport";
export { default as StockMovementReport } from "./Reports/StockMovementReport";

// ========================= Services =========================
export * as dashboardService from "./Services/dashboardService";
export * as medicineService from "./Services/medicineService";
export * as inventoryService from "./Services/inventoryService";
export * as requestService from "./Services/requestService";
export * as transferService from "./Services/transferService";
export * as branchService from "./Services/branchService";
export * as monitoringService from "./Services/monitoringService";
export * as reportService from "./Services/reportService";

// ========================= Shared Components =========================
export { default as LoadingSpinner } from "./Shared/LoadingSpinner";
export { default as ErrorMessage } from "./Shared/ErrorMessage";
export { default as EmptyState } from "./Shared/EmptyState";
export { default as ConfirmDialog } from "./Shared/ConfirmDialog";
export { default as StatusBadge } from "./Shared/StatusBadge";
export { default as SearchBar } from "./Shared/SearchBar";
export { default as Pagination } from "./Shared/Pagination";