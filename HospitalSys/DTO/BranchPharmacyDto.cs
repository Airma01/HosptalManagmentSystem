using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto
{
    // ===================== Dashboard DTOs =====================
    public class DashboardDto
{
    public int TotalInventoryItems { get; set; }
    public int TotalStockQuantity { get; set; }   // <-- add this
    public int LowStockItems { get; set; }
    public int ExpiredItems { get; set; }
    public int NearExpiryItems { get; set; }
    public int PendingPrescriptions { get; set; }
    public int PendingRequests { get; set; }
    public int RecentTransfers { get; set; }
    public List<RecentRequestDto> RecentRequests { get; set; } = new();
    public List<RecentTransferDto> RecentTransfersList { get; set; } = new();
}

    public class RecentRequestDto
    {
        public int RequestId { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public int TotalItems { get; set; }
    }

    public class RecentTransferDto
    {
        public int TransferId { get; set; }
        public DateTime TransferDate { get; set; }
        public string Status { get; set; } = "";
        public int TotalItems { get; set; }
    }

    // ===================== Inventory DTOs =====================
    public class InventoryResponseDto
    {
        public int InventoryId { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public int QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string BatchNumber { get; set; } = "";
        public string UnitOfMeasure { get; set; } = "";
        public decimal UnitPrice { get; set; }
    }

    public class MedicineStockDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public int TotalQuantity { get; set; }
        public string UnitOfMeasure { get; set; } = "";
        public decimal UnitPrice { get; set; }
        public int BatchCount { get; set; }
        public List<InventoryResponseDto> Batches { get; set; } = new();
    }

    public class LowStockMedicineDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public int AvailableQuantity { get; set; }
        public int ReorderLevel { get; set; }  // placeholder; you can adjust as needed
        public string UnitOfMeasure { get; set; } = "";
        public DateTime? EarliestExpiry { get; set; }
    }

    public class ExpiredMedicineDto
    {
        public int InventoryId { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public string BatchNumber { get; set; } = "";
        public int QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int DaysExpired { get; set; }
    }

    public class NearExpiryMedicineDto
    {
        public int InventoryId { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public string BatchNumber { get; set; } = "";
        public int QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int DaysUntilExpiry { get; set; }
    }

    // ===================== Central Store Request DTOs =====================
    public class CreateCentralStoreRequestDto
    {
        [Required]
        public int PharmacistId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one item is required.")]
        public List<CentralStoreRequestItemDto> Items { get; set; } = new();
    }

    public class CentralStoreRequestItemDto
    {
        [Required]
        public int MedicineId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
        public int RequestedQuantity { get; set; }
    }

    public class RequestSummaryDto
    {
        public int CentralRequestId { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public int TotalItems { get; set; }
        public int? ApprovedQuantityTotal { get; set; }
        public string RequestedByPharmacist { get; set; } = "";
    }

    public class RequestDetailDto
    {
        public int CentralRequestId { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public string RequestedByPharmacist { get; set; } = "";
        public List<CentralStoreRequestDetailDto> Details { get; set; } = new();
    }

    public class CentralStoreRequestDetailDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public int RequestedQuantity { get; set; }
        public int? ApprovedQuantity { get; set; }
    }

    public class CancelRequestDto
    {
        [Required]
        public int CentralRequestId { get; set; }

        [StringLength(500)]
        public string CancelReason { get; set; } = "";
    }

    // ===================== Transfer DTOs =====================
    public class TransferSummaryDto
    {
        public int CentralTransferId { get; set; }
        public DateTime TransferDate { get; set; }
        public string Status { get; set; } = "";
        public int TotalItems { get; set; }
        public string FromCentralStore { get; set; } = "";
    }

    public class TransferDetailDto
    {
        public int CentralTransferId { get; set; }
        public DateTime TransferDate { get; set; }
        public string Status { get; set; } = "";
        public string FromCentralStore { get; set; } = "";
        public string ProcessedByManager { get; set; } = "";
        public List<CentralStoreTransferDetailDto> Details { get; set; } = new();
    }

    public class CentralStoreTransferDetailDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public int QuantityTransferred { get; set; }
        public string BatchNumber { get; set; } = "";
        public DateTime ExpiryDate { get; set; }
    }

    public class AcceptTransferDto
    {
        [Required]
        public int CentralTransferId { get; set; }

        [StringLength(500)]
        public string Remarks { get; set; } = "";
    }

    public class RejectTransferDto
    {
        [Required]
        public int CentralTransferId { get; set; }

        [Required]
        [StringLength(500)]
        public string RejectReason { get; set; } = "";
    }

    // ===================== Prescription DTOs =====================
    public class PendingPrescriptionDto
    {
        public int PrescriptionId { get; set; }
        public DateTime PrescriptionDate { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = "";
        public string DoctorName { get; set; } = "";
        public int TotalItems { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, PartiallyDispensed, Dispensed
    }

    public class PrescriptionDetailResponseDto
    {
        public int PrescriptionId { get; set; }
        public DateTime PrescriptionDate { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = "";
        public string DoctorName { get; set; } = "";
        public List<PrescriptionMedicineDto> Medicines { get; set; } = new();
    }

    public class PrescriptionMedicineDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public string Dosage { get; set; } = "";
        public decimal Frequency { get; set; }
        public decimal Duration { get; set; }
        public decimal Quantity { get; set; }
        public int AvailableQuantity { get; set; }  // from branch inventory
        public bool IsAvailable { get; set; }
    }

    public class MedicineAvailabilityDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public int AvailableQuantity { get; set; }
        public bool IsAvailable { get; set; }
        public List<BatchAvailabilityDto> Batches { get; set; } = new();
    }

    public class BatchAvailabilityDto
    {
        public int InventoryId { get; set; }
        public string BatchNumber { get; set; } = "";
        public int QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
    }

    // ===================== Dispense DTOs =====================
    public class DispenseMedicineDto
    {
        [Required]
        public int PrescriptionId { get; set; }

        [Required]
        public int PharmacistId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one item must be dispensed.")]
        public List<DispenseMedicineItemDto> Items { get; set; } = new();
    }

    public class DispenseMedicineItemDto
    {
        [Required]
        public int MedicineId { get; set; }

        [Required]
        [Range(1, float.MaxValue, ErrorMessage = "Quantity must be greater than 0.")]
        public float QuantityDispensed { get; set; }

        public int? InventoryBatchId { get; set; } // optional to select specific batch
    }

    public class DispenseHistoryDto
    {
        public int DispenseId { get; set; }
        public DateTime DispenseDate { get; set; }
        public int PrescriptionId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; } = "";
        public string PharmacistName { get; set; } = "";
        public int TotalItems { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class DispenseDetailDto
    {
        public int DispenseId { get; set; }
        public DateTime DispenseDate { get; set; }
        public int PrescriptionId { get; set; }
        public string PatientName { get; set; } = "";
        public string PharmacistName { get; set; } = "";
        public List<DispenseDetailItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
    }

    public class DispenseDetailItemDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public float QuantityDispensed { get; set; }
        public string UnitOfMeasure { get; set; } = "";
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }

    // ===================== Report DTOs =====================
    public class StockReportDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public int TotalQuantity { get; set; }
        public int BatchCount { get; set; }
        public DateTime? OldestExpiry { get; set; }
        public DateTime? NewestExpiry { get; set; }
        public string UnitOfMeasure { get; set; } = "";
    }

    public class RequestReportDto
    {
        public int RequestId { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public string RequestedBy { get; set; } = "";
        public int TotalRequested { get; set; }
        public int? TotalApproved { get; set; }
        public List<RequestItemReportDto> Items { get; set; } = new();
    }

    public class RequestItemReportDto
    {
        public string MedicineName { get; set; } = "";
        public int RequestedQuantity { get; set; }
        public int? ApprovedQuantity { get; set; }
    }

    public class TransferReportDto
    {
        public int TransferId { get; set; }
        public DateTime TransferDate { get; set; }
        public string Status { get; set; } = "";
        public string FromCentralStore { get; set; } = "";
        public int TotalItems { get; set; }
        public List<TransferItemReportDto> Items { get; set; } = new();
    }

    public class TransferItemReportDto
    {
        public string MedicineName { get; set; } = "";
        public int QuantityTransferred { get; set; }
        public string BatchNumber { get; set; } = "";
        public DateTime ExpiryDate { get; set; }
    }

    public class DispenseReportDto
    {
        public int DispenseId { get; set; }
        public DateTime DispenseDate { get; set; }
        public int PrescriptionId { get; set; }
        public string PatientName { get; set; } = "";
        public string PharmacistName { get; set; } = "";
        public int TotalItems { get; set; }
        public decimal TotalAmount { get; set; }
        public List<DispenseItemReportDto> Items { get; set; } = new();
    }

    public class DispenseItemReportDto
    {
        public string MedicineName { get; set; } = "";
        public float QuantityDispensed { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal LineTotal { get; set; }
    }

    public class ExpiryReportDto
    {
        public int InventoryId { get; set; }
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = "";
        public string BatchNumber { get; set; } = "";
        public int QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string Status { get; set; } = ""; // "Expired", "Near Expiry", "Valid"
        public int DaysRemaining { get; set; } // negative if expired
    }

    // ===================== Profile DTOs =====================
    public class PharmacistProfileDto
    {
        public int PharmacistId { get; set; }
        public int UserId { get; set; }
        public string FullName { get; set; } = "";
        public string Email { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public int BranchPharmacyId { get; set; }
        public string BranchName { get; set; } = "";
        public string Location { get; set; } = "";
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = "";

        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "New password must be at least 6 characters long.")]
        public string NewPassword { get; set; } = "";

        [Required]
        [Compare("NewPassword", ErrorMessage = "Passwords do not match.")]
        public string ConfirmNewPassword { get; set; } = "";
    }
}