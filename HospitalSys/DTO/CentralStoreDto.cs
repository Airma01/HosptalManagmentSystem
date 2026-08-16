using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Dto
{
    // ========================= Dashboard DTOs =========================
    public class DashboardSummaryDto
    {
        public int PendingRequests { get; set; }
        public int ApprovedRequests { get; set; }
        public int RejectedRequests { get; set; }
        public int TodayTransfers { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public List<LowStockMedicineDto> LowStockMedicines { get; set; } = new();
        public List<ExpiringMedicineDto> ExpiringMedicines { get; set; } = new();
        public List<BranchAlertDto> BranchAlerts { get; set; } = new();
    }

    public class DashboardStatsDto
    {
        public int TotalMedicines { get; set; }
        public int TotalBranches { get; set; }
        public int TotalRequests { get; set; }
        public int TotalTransfers { get; set; }
        public decimal TotalInventoryValue { get; set; }
    }

    public class LowStockMedicineDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public float QuantityAvailable { get; set; }
        public float ReorderLevel { get; set; }
        public string UnitOfMeasure { get; set; } = "";
        public bool IsCritical { get; set; }
    }

    public class ExpiringMedicineDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string BatchNumber { get; set; } = "";
        public DateTime ExpiryDate { get; set; }
        public float QuantityAvailable { get; set; }
        public int DaysUntilExpiry { get; set; }
    }

    public class InventoryValueDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float QuantityAvailable { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalValue { get; set; }
    }

    public class BranchAlertDto
    {
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int QuantityAvailable { get; set; }
        public string AlertType { get; set; } = "";
    }

    // ========================= Medicine DTOs =========================
    public class CreateMedicineDto
    {
        [Required]
        [MaxLength(200)]
        public string MedicineName { get; set; } = "";
        [Required]
        [MaxLength(200)]
        public string GenericName { get; set; } = "";
        [Required]
        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }
        [Required]
        [MaxLength(200)]
        public string UnitOfMeasure { get; set; } = "";
    }

    public class UpdateMedicineDto
    {
        [Required]
        public int MedicineID { get; set; }
        [Required]
        [MaxLength(200)]
        public string MedicineName { get; set; } = "";
        [Required]
        [MaxLength(200)]
        public string GenericName { get; set; } = "";
        [Required]
        [Range(0, double.MaxValue)]
        public decimal UnitPrice { get; set; }
        [Required]
        [MaxLength(200)]
        public string UnitOfMeasure { get; set; } = "";
    }

    public class MedicineListDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public decimal UnitPrice { get; set; }
        public string UnitOfMeasure { get; set; } = "";
        public float TotalStock { get; set; }
    }

    public class MedicineDetailsDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public decimal UnitPrice { get; set; }
        public string UnitOfMeasure { get; set; } = "";
        public List<InventoryListDto> InventoryBatches { get; set; } = new();
    }

    public class MedicineSearchDto
    {
        public string? MedicineName { get; set; }
        public string? GenericName { get; set; }
        public string? UnitOfMeasure { get; set; }
    }

    // ========================= Inventory DTOs =========================
    public class CreateInventoryDto
    {
        [Required]
        public int MedicineID { get; set; }
        [Required]
        [Range(0, float.MaxValue)]
        public float QuantityAvailable { get; set; }
        [Required]
        public DateTime ExpiryDate { get; set; }
        [Required]
        [MaxLength(100)]
        public string BatchNumber { get; set; } = "";
        [MaxLength(200)]
        public string Source { get; set; } = "";
    }

    public class UpdateInventoryDto
    {
        [Required]
        public int CentralInventoryID { get; set; }
        [Required]
        [Range(0, float.MaxValue)]
        public float QuantityAvailable { get; set; }
        [Required]
        public DateTime ExpiryDate { get; set; }
        [Required]
        [MaxLength(100)]
        public string BatchNumber { get; set; } = "";
        [MaxLength(200)]
        public string Source { get; set; } = "";
    }

    public class InventoryListDto
    {
        public int CentralInventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string BatchNumber { get; set; } = "";
        public string Source { get; set; } = "";
    }

    public class InventoryDetailsDto
    {
        public int CentralInventoryID { get; set; }
        public int CentralPharmacyID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public float QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string BatchNumber { get; set; } = "";
        public string Source { get; set; } = "";
        public decimal UnitPrice { get; set; }
        public decimal TotalValue => (decimal)QuantityAvailable * UnitPrice;
    }

    public class InventorySearchDto
    {
        public int? MedicineID { get; set; }
        public string? MedicineName { get; set; }
        public string? BatchNumber { get; set; }
        public string? Source { get; set; }
        public DateTime? ExpiryFrom { get; set; }
        public DateTime? ExpiryTo { get; set; }
    }

    public class InventoryAdjustmentDto
    {
        [Required]
        public int CentralInventoryID { get; set; }
        [Required]
        [Range(0, float.MaxValue)]
        public float AdjustmentQuantity { get; set; }
        [Required]
        [MaxLength(200)]
        public string AdjustmentReason { get; set; } = "";
    }

    public class InventoryHistoryDto
    {
        public int CentralInventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float PreviousQuantity { get; set; }
        public float NewQuantity { get; set; }
        public float ChangeAmount { get; set; }
        public DateTime ChangeDate { get; set; }
        public string ChangeType { get; set; } = "";
        public string? Reference { get; set; }
    }

    public class ReceivePurchasedMedicineDto
    {
        [Required]
        public int MedicineID { get; set; }
        [Required]
        [Range(0, float.MaxValue)]
        public float Quantity { get; set; }
        [Required]
        public DateTime ExpiryDate { get; set; }
        [Required]
        [MaxLength(100)]
        public string BatchNumber { get; set; } = "";
        [MaxLength(200)]
        public string PurchaseReference { get; set; } = "";
    }

    public class ReceiveAidStoreTransferDto
    {
        [Required]
        public int AidStoreTransferID { get; set; }
        public List<ReceiveInventoryItemDto> Items { get; set; } = new();
    }

    public class ReceiveInventoryItemDto
    {
        public int MedicineID { get; set; }
        public float Quantity { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string BatchNumber { get; set; } = "";
    }

    // Additional DTOs for service interface
    public class CentralInventoryDto
    {
        public int CentralInventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string BatchNumber { get; set; } = "";
        public string Source { get; set; } = "";
    }

    public class CentralInventoryDetailDto : CentralInventoryDto
    {
        public string GenericName { get; set; } = "";
        public decimal UnitPrice { get; set; }
    }

    public class InventoryPaginatedDto
    {
        public List<CentralInventoryDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    // ========================= Request DTOs =========================
    public class CentralStoreRequestDto
    {
        public int CentralRequestID { get; set; }
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public int RequestedByPharmacistID { get; set; }
        public string PharmacistName { get; set; } = "";
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public int? ApprovedByManagerID { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string? RejectionReason { get; set; }
        public List<RequestItemDto> Items { get; set; } = new();
    }

    public class RequestListDto
    {
        public int CentralRequestID { get; set; }
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public int TotalItems { get; set; }
    }

    public class RequestDetailsDto : CentralStoreRequestDto { }

    public class RequestItemDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int RequestedQuantity { get; set; }
        public int ApprovedQuantity { get; set; }
    }

    public class ApproveRequestDto
    {
        [Required]
        public int CentralRequestID { get; set; }
    }

    public class PartialApprovalDto
    {
        [Required]
        public int CentralRequestID { get; set; }
        [Required]
        public List<RequestApprovalItemDto> ApprovedItems { get; set; } = new();
    }

    public class PartialApproveRequestDto : PartialApprovalDto { }

    public class RejectRequestDto
    {
        [Required]
        public int CentralRequestID { get; set; }
        [Required]
        [MaxLength(500)]
        public string RejectionReason { get; set; } = "";
    }

    public class CancelRequestDto
    {
        [Required]
        public int CentralRequestID { get; set; }
        [MaxLength(500)]
        public string? CancellationReason { get; set; }
    }

    public class RequestReviewDto
    {
        public int CentralRequestID { get; set; }
        public string BranchName { get; set; } = "";
        public DateTime RequestDate { get; set; }
        public List<RequestItemDto> Items { get; set; } = new();
        public Dictionary<int, float> AvailableStock { get; set; } = new();
    }

    public class RequestAvailabilityDto
    {
        public int CentralRequestID { get; set; }
        public Dictionary<int, float> AvailableQuantities { get; set; } = new();
        public bool AllAvailable { get; set; }
        public List<RequestItemDto> Items { get; set; } = new();
    }

    public class RequestValidationDto
    {
        public bool IsValid { get; set; }
        public string? ValidationMessage { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class RequestApprovalItemDto
    {
        [Required]
        public int MedicineID { get; set; }
        [Required]
        [Range(0, int.MaxValue)]
        public int ApprovedQuantity { get; set; }
    }

    // ========================= Transfer DTOs =========================
    public class CentralStoreTransferDto
    {
        public int CentralTransferID { get; set; }
        public int? CentralRequestID { get; set; }
        public int CentralPharmacyID { get; set; }
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public int CentralStoreManagerID { get; set; }
        public string ManagerName { get; set; } = "";
        public DateTime TransferDate { get; set; }
        public string Status { get; set; } = "";
        public List<TransferItemDto> Items { get; set; } = new();
    }

    public class CreateTransferDto
    {
        [Required]
        public int? CentralRequestID { get; set; }
        [Required]
        public int BranchPharmacyID { get; set; }
        [Required]
        public DateTime TransferDate { get; set; }
        [Required]
        public List<TransferItemDto> Items { get; set; } = new();
    }

    public class TransferItemDto
    {
        [Required]
        public int MedicineID { get; set; }
        [Required]
        [Range(1, int.MaxValue)]
        public int QuantityTransferred { get; set; }
    }

    public class TransferListDto
    {
        public int CentralTransferID { get; set; }
        public int? CentralRequestID { get; set; }
        public string BranchName { get; set; } = "";
        public DateTime TransferDate { get; set; }
        public string Status { get; set; } = "";
        public int TotalItems { get; set; }
    }

    public class TransferDetailsDto : CentralStoreTransferDto { }

    public class TransferHistoryDto
    {
        public int CentralTransferID { get; set; }
        public string Action { get; set; } = "";
        public DateTime ActionDate { get; set; }
        public string PerformedBy { get; set; } = "";
        public string? Details { get; set; }
    }

    public class TransferTrackingDto
    {
        public int CentralTransferID { get; set; }
        public string Status { get; set; } = "";
        public DateTime? DispatchedDate { get; set; }
        public DateTime? InTransitDate { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public DateTime? CancelledDate { get; set; }
        public List<TransferStatusHistoryDto> History { get; set; } = new();
    }

    public class TransferStatusHistoryDto
    {
        public string Status { get; set; } = "";
        public DateTime ChangedDate { get; set; }
        public string? Remarks { get; set; }
    }

    public class DispatchTransferDto
    {
        [Required]
        public int CentralTransferID { get; set; }
        public DateTime DispatchDate { get; set; } = DateTime.UtcNow;
        public string? DispatchNotes { get; set; }
    }

    public class TransferStatusDto
    {
        [Required]
        public int CentralTransferID { get; set; }
        [Required]
        public string Status { get; set; } = "";
        public string? Remarks { get; set; }
    }

    public class CancelTransferDto
    {
        [Required]
        public int CentralTransferID { get; set; }
        [Required]
        [MaxLength(500)]
        public string CancellationReason { get; set; } = "";
    }

    // ========================= Branch DTOs =========================
    public class BranchPharmacyListDto
    {
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public string Location { get; set; } = "";
        public int TotalMedicines { get; set; }
        public int TotalRequests { get; set; }
    }

    public class BranchPharmacyListDtos : BranchPharmacyListDto { }

    public class BranchPharmacyDetailsDto
    {
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public string Location { get; set; } = "";
        public List<BranchInventoryDto> Inventory { get; set; } = new();
    }

    public class BranchInventoryDto
    {
        public int BranchInventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string BatchNumber { get; set; } = "";
    }

    public class BranchInventoryDetailsDto : BranchInventoryDto
    {
        public string GenericName { get; set; } = "";
        public decimal UnitPrice { get; set; }
        public string UnitOfMeasure { get; set; } = "";
    }

    public class BranchRequestDto
    {
        public int CentralRequestID { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public int TotalItems { get; set; }
    }

    public class BranchTransferDto
    {
        public int CentralTransferID { get; set; }
        public DateTime TransferDate { get; set; }
        public string Status { get; set; } = "";
        public int TotalItems { get; set; }
    }

    public class BranchConsumptionDto
    {
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float TotalConsumed { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
    }

    public class BranchStockStatusDto
    {
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int QuantityAvailable { get; set; }
        public string Status { get; set; } = "";
    }

    public class LowStockBranchDto
    {
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int QuantityAvailable { get; set; }
        public int ReorderLevel { get; set; }
    }

    public class BranchSummaryDto : BranchPharmacyListDto { }

    // ========================= Monitoring DTOs =========================
    public class ExpiredMedicineDto
    {
        public int CentralInventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string BatchNumber { get; set; } = "";
        public DateTime ExpiryDate { get; set; }
        public float Quantity { get; set; }
        public int DaysOverdue { get; set; }
    }

    public class NearExpiryMedicineDto
    {
        public int CentralInventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string BatchNumber { get; set; } = "";
        public DateTime ExpiryDate { get; set; }
        public float Quantity { get; set; }
        public int DaysUntilExpiry { get; set; }
    }

    public class CriticalStockDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float QuantityAvailable { get; set; }
        public float ReorderLevel { get; set; }
        public string UnitOfMeasure { get; set; } = "";
    }

    public class ReplenishmentSuggestionDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float CurrentStock { get; set; }
        public float ReorderLevel { get; set; }
        public float SuggestedOrderQuantity { get; set; }
        public string Priority { get; set; } = "";
    }

    public class MedicineMovementDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public List<InventoryMovementDto> Movements { get; set; } = new();
    }

    public class InventoryMovementDto
    {
        public int InventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string MovementType { get; set; } = "";
        public float QuantityChange { get; set; }
        public float RemainingQuantity { get; set; }
        public DateTime MovementDate { get; set; }
        public string Reference { get; set; } = "";
    }

    public class InventoryAuditDto
    {
        public int AuditID { get; set; }
        public int CentralInventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float PreviousQuantity { get; set; }
        public float NewQuantity { get; set; }
        public float ChangeAmount { get; set; }
        public string ChangeReason { get; set; } = "";
        public DateTime AuditDate { get; set; }
        public string PerformedBy { get; set; } = "";
    }

    // ========================= Report DTOs =========================
    public class InventoryReportDto
    {
        public DateTime ReportDate { get; set; }
        public List<InventoryListDto> Inventory { get; set; } = new();
    }

    public class BranchInventoryReportDto
    {
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public DateTime ReportDate { get; set; }
        public List<BranchInventoryDto> Inventory { get; set; } = new();
    }

    public class RequestReportDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public List<RequestListDto> Requests { get; set; } = new();
    }

    public class TransferReportDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public List<TransferListDto> Transfers { get; set; } = new();
    }

    public class ExpiryReportDto
    {
        public DateTime ReportDate { get; set; }
        public List<ExpiredMedicineDto> Expired { get; set; } = new();
        public List<NearExpiryMedicineDto> NearExpiry { get; set; } = new();
    }

    public class ConsumptionReportDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public List<MedicineConsumptionDto> Consumption { get; set; } = new();
    }

    public class MedicineConsumptionDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float TotalConsumed { get; set; }
        public int NumberOfDispenses { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
    }

    public class InventoryValueReportDto
    {
        public DateTime ReportDate { get; set; }
        public decimal TotalValue { get; set; }
        public List<MedicineInventoryValueDto> Items { get; set; } = new();
    }

    public class MedicineInventoryValueDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float TotalQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalValue => (decimal)TotalQuantity * UnitPrice;
    }

    public class StockMovementReportDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public List<StockMovementDto> Movements { get; set; } = new();
    }

    public class StockMovementDto
    {
        public DateTime Date { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float OpeningBalance { get; set; }
        public float QuantityIn { get; set; }
        public float QuantityOut { get; set; }
        public float ClosingBalance { get; set; }
    }

    // ========================= Additional DTOs (Service Interface) =========================
    public class DispensingReportDto
    {
        public DateTime ReportDate { get; set; }
        public List<DispenseMedicine> Dispenses { get; set; } = new();
    }

    public class DailyDispensingDto
    {
        public DateTime Date { get; set; }
        public int TotalDispenses { get; set; }
        public decimal TotalValue { get; set; }
    }

    public class MonthlyDispensingDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int TotalDispenses { get; set; }
        public decimal TotalValue { get; set; }
    }

    public class AuditReportDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public List<InventoryAuditDto> Audits { get; set; } = new();
    }

    public class TransferVerificationDto
    {
        public int CentralTransferID { get; set; }
        public bool IsVerified { get; set; }
        public List<TransferVerificationItemDto> Items { get; set; } = new();
        public string? Remarks { get; set; }
    }

    public class TransferVerificationItemDto
    {
        public int MedicineID { get; set; }
        public int ExpectedQuantity { get; set; }
        public int ReceivedQuantity { get; set; }
        public bool IsMatch => ExpectedQuantity == ReceivedQuantity;
    }

    public class InventoryVarianceDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float ExpectedQuantity { get; set; }
        public float ActualQuantity { get; set; }
        public float Variance { get; set; }
        public DateTime VarianceDate { get; set; }
    }

    public class StockAdjustmentDto
    {
        public int AdjustmentID { get; set; }
        public int CentralInventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float AdjustmentQuantity { get; set; }
        public string AdjustmentType { get; set; } = "";
        public string Reason { get; set; } = "";
        public string Status { get; set; } = "";
        public DateTime RequestedDate { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public int? ApprovedBy { get; set; }
    }

    public class ApproveAdjustmentDto
    {
        [Required]
        public int AdjustmentID { get; set; }
        [MaxLength(200)]
        public string? Comments { get; set; }
    }

    public class RejectAdjustmentDto
    {
        [Required]
        public int AdjustmentID { get; set; }
        [Required]
        [MaxLength(200)]
        public string RejectionReason { get; set; } = "";
    }

    public class MedicineReturnDto
    {
        public int ReturnID { get; set; }
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public DateTime ReturnDate { get; set; }
        public string Status { get; set; } = "";
        public List<ReturnItemDto> Items { get; set; } = new();
    }

    public class ReturnItemDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int Quantity { get; set; }
        public string BatchNumber { get; set; } = "";
    }

    public class ApproveReturnDto
    {
        [Required]
        public int ReturnID { get; set; }
        [MaxLength(200)]
        public string? Comments { get; set; }
    }

    public class RejectReturnDto
    {
        [Required]
        public int ReturnID { get; set; }
        [Required]
        [MaxLength(200)]
        public string RejectionReason { get; set; } = "";
    }

    public class ReceiveReturnedMedicineDto
    {
        [Required]
        public int ReturnID { get; set; }
        [Required]
        public DateTime ReceivedDate { get; set; }
        [MaxLength(200)]
        public string? ReceivingNotes { get; set; }
    }

    public class BranchPerformanceDto
    {
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public int TotalRequests { get; set; }
        public int TotalTransfers { get; set; }
        public int TotalDispenses { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageResponseTime { get; set; }
    }

    public class InventoryTransactionDto
    {
        public int TransactionID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string TransactionType { get; set; } = "";
        public float Quantity { get; set; }
        public float BalanceAfter { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Reference { get; set; } = "";
        public string Source { get; set; } = "";
    }

    public class MedicineTransactionHistoryDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public List<InventoryTransactionDto> Transactions { get; set; } = new();
    }

    public class TransferTransactionHistoryDto
    {
        public int CentralTransferID { get; set; }
        public List<TransferStatusHistoryDto> StatusHistory { get; set; } = new();
    }

    // ========================= Search DTOs =========================
    public class SearchMedicineDto
    {
        public string? MedicineName { get; set; }
        public string? GenericName { get; set; }
        public string? BatchNumber { get; set; }
    }

    public class SearchInventoryDto
    {
        public int? MedicineID { get; set; }
        public string? MedicineName { get; set; }
        public string? BatchNumber { get; set; }
        public DateTime? ExpiryFrom { get; set; }
        public DateTime? ExpiryTo { get; set; }
        public string? Source { get; set; }
    }

    public class SearchRequestDto
    {
        public int? RequestID { get; set; }
        public int? BranchPharmacyID { get; set; }
        public string? BranchName { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class SearchTransferDto
    {
        public int? TransferID { get; set; }
        public int? BranchPharmacyID { get; set; }
        public string? BranchName { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class SearchBranchDto
    {
        public string? BranchName { get; set; }
        public string? Location { get; set; }
    }
}