using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dtos
{
    // ==============================
    // Dashboard DTOs
    // ==============================
    public class DashboardSummaryDto
    {
        public int TotalMedicinesInStock { get; set; }
        public int LowStockCount { get; set; }
        public int ExpiredCount { get; set; }
        public int PendingRequestsCount { get; set; }
        public List<RecentTransferDto> RecentTransfers { get; set; } = new();
    }

    public class RecentTransferDto
    {
        public int TransferId { get; set; }
        public string BranchName { get; set; } = "";
        public DateTime TransferDate { get; set; }
        public string Status { get; set; } = "";
        public int TotalItems { get; set; }
    }

    // ==============================
    // Medicine DTOs
    // ==============================
    public class MedicineCreateDto
    {
        [Required, MaxLength(200)]
        public string MedicineName { get; set; } = "";
        [MaxLength(200)]
        public string GenericName { get; set; } = "";
        public decimal UnitPrice { get; set; }
        [MaxLength(200)]
        public string UnitOfMeasure { get; set; } = "";
        // Optional: IsActive default true; we'll set in entity
    }

    public class MedicineUpdateDto
    {
        [MaxLength(200)]
        public string MedicineName { get; set; } = "";
        [MaxLength(200)]
        public string GenericName { get; set; } = "";
        public decimal? UnitPrice { get; set; }
        [MaxLength(200)]
        public string UnitOfMeasure { get; set; } = "";
        public bool? IsActive { get; set; }
    }

    public class MedicineResponseDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public string GenericName { get; set; } = "";
        public decimal UnitPrice { get; set; }
        public string UnitOfMeasure { get; set; } = "";
        public bool IsActive { get; set; } = true;
        // Total quantity in central store (optional)
        public float TotalStock { get; set; }
    }

    // ==============================
    // Inventory DTOs
    // ==============================
    public class InventoryCreateDto
    {
        [Required]
        public int MedicineID { get; set; }
        [Required]
        public float Quantity { get; set; }
        [Required]
        public DateTime ExpiryDate { get; set; }
        [Required]
        public string BatchNumber { get; set; } = "";
        public string Source { get; set; } = ""; // e.g., Supplier, AidStore
    }

    public class InventoryUpdateDto
    {
        [Required]
        public float QuantityAdjustment { get; set; } // positive or negative
        public string? Remarks { get; set; }
    }

    public class InventoryResponseDto
    {
        public int CentralInventoryID { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float QuantityAvailable { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string BatchNumber { get; set; } = "";
        public string Source { get; set; } = "";
    }

    // ==============================
    // Request DTOs
    // ==============================
    public class RequestResponseDto
    {
        public int CentralRequestID { get; set; }
        public int BranchPharmacyID { get; set; }
        public string BranchName { get; set; } = "";
        public string RequestedByPharmacist { get; set; } = "";
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public string? Remarks { get; set; }
        public List<RequestDetailDto> Details { get; set; } = new();
    }

    public class RequestDetailDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int RequestedQuantity { get; set; }
        public int ApprovedQuantity { get; set; }
    }

    public class RequestApproveDto
    {
        [Required]
        public List<ApprovedDetailDto> ApprovedDetails { get; set; } = new();
        public string? Remarks { get; set; }
    }

    public class ApprovedDetailDto
    {
        public int CentralRequestDetailID { get; set; }
        public int ApprovedQuantity { get; set; }
    }

    public class RequestRejectDto
    {
        public string? Remarks { get; set; }
    }

    public class RequestPartialApproveDto
    {
        [Required]
        public List<ApprovedDetailDto> ApprovedDetails { get; set; } = new();
        public string? Remarks { get; set; }
    }

    // ==============================
    // Transfer DTOs
    // ==============================
   public class TransferCreateDto
    {
        [Required]
        public int BranchPharmacyID { get; set; }
        public int? CentralRequestID { get; set; } // make nullable
        [Required]
        public List<TransferDetailCreateDto> Details { get; set; } = new();
    }
    public class TransferDetailCreateDto
    {
        [Required]
        public int MedicineID { get; set; }
        [Required]
        public int QuantityTransferred { get; set; }
        // Optionally specify which inventory batch to deduct from (if multiple batches)
        public int? CentralInventoryID { get; set; }
    }

    public class TransferResponseDto
{
    public int CentralTransferID { get; set; }
    public int? CentralRequestID { get; set; }   // ← changed to nullable
    public string BranchName { get; set; } = "";
    public DateTime TransferDate { get; set; }
    public string Status { get; set; } = "";
    public List<TransferDetailResponseDto> Details { get; set; } = new();
}

    public class TransferDetailResponseDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int QuantityTransferred { get; set; }
    }

    public class TransferHistoryDto
    {
        public int TransferId { get; set; }
        public string BranchName { get; set; } = "";
        public DateTime TransferDate { get; set; }
        public string Status { get; set; } = "";
        public string CreatedBy { get; set; } = "";
    }

    // ==============================
    // Stock Monitoring DTOs
    // ==============================
    public class LowStockMedicineDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float TotalQuantity { get; set; }
        public float Threshold { get; set; }
    }

    public class ExpiredMedicineDto
    {
        public int InventoryID { get; set; }
        public string MedicineName { get; set; } = "";
        public float Quantity { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string BatchNumber { get; set; } = "";
    }

    public class NearExpiryMedicineDto
    {
        public int InventoryID { get; set; }
        public string MedicineName { get; set; } = "";
        public float Quantity { get; set; }
        public DateTime ExpiryDate { get; set; }
        public int DaysToExpiry { get; set; }
    }

    // ==============================
    // Report DTOs
    // ==============================
    public class InventoryReportFilterDto
    {
        public string? MedicineName { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }

    public class StockMovementReportDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public float OpeningStock { get; set; }
        public float Received { get; set; }
        public float TransferredOut { get; set; }
        public float ClosingStock { get; set; }
    }

    public class MedicineTransferReportDto
    {
        public int TransferId { get; set; }
        public string BranchName { get; set; } = "";
        public DateTime TransferDate { get; set; }
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int Quantity { get; set; }
    }

    public class MedicineRequestReportDto
    {
        public int RequestId { get; set; }
        public string BranchName { get; set; } = "";
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = "";
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = "";
        public int Requested { get; set; }
        public int Approved { get; set; }
    }
    public class DashboardStatsDto
{
    public int TotalMedicines { get; set; }
    public int TotalInventoryRecords { get; set; }
    public float TotalStockQuantity { get; set; }
    public int LowStockCount { get; set; }
    public int ExpiredMedicineCount { get; set; }
    public int PendingRequestCount { get; set; }
    public int CompletedTransferCount { get; set; }
}
public class RequestSummaryDto
{
    public int RequestID { get; set; }
    public string BranchName { get; set; } = "";
    public DateTime RequestDate { get; set; }
    public string Status { get; set; } = "";
}
}
