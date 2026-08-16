using HospitalSys.Data;
using HospitalSys.Branch.Dto;
using HospitalSys.Models;
using HospitalSys.Models.Pharmacy.Branch;
using HospitalSys.Models.Pharmacy.CentralStore;
using HospitalSys.Models.Pharmacy.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/Pharmacy/[controller]")]
    [Authorize(Roles = "Pharmacist")]
    public class BranchPharmacyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BranchPharmacyController(AppDbContext context)
        {
            _context = context;
        }

        private int GetPharmacistId()
        {
            var claim = User.FindFirst("PharmacistID")?.Value;
            if (string.IsNullOrEmpty(claim))
                throw new UnauthorizedAccessException("PharmacistID claim not found");
            return int.Parse(claim);
        }

        private int GetBranchPharmacyId()
        {
            var claim = User.FindFirst("BranchPharmacyID")?.Value;
            if (string.IsNullOrEmpty(claim))
                throw new UnauthorizedAccessException("BranchPharmacyID claim not found");
            return int.Parse(claim);
        }

        #region Dashboard

        [HttpGet("GetDashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var inventory = await _context.BranchInventories
                    .Where(i => i.BranchPharmacyID == branchId)
                    .Include(i => i.Medicine)
                    .ToListAsync();

                var totalItems = inventory.Count;
                var totalStockQuantity = inventory.Sum(i => i.QuantityAvailable);
                var lowStockCount = inventory.Count(i => i.QuantityAvailable <= 20);
                var expiredCount = inventory.Count(i => i.ExpiryDate < DateTime.UtcNow);
                var nearExpiryCount = inventory.Count(i => i.ExpiryDate >= DateTime.UtcNow && i.ExpiryDate <= DateTime.UtcNow.AddDays(30));

                var pendingRequests = await _context.CentralStoreRequests
                    .Where(r => r.BranchPharmacyID == branchId && r.Status == "Pending")
                    .CountAsync();

                var pendingTransfers = await _context.CentralStoreTransfers
                    .Where(t => t.BranchPharmacyID == branchId && t.Status == "Pending")
                    .CountAsync();

                var recentRequests = await _context.CentralStoreRequests
                    .Where(r => r.BranchPharmacyID == branchId)
                    .OrderByDescending(r => r.RequestDate)
                    .Take(5)
                    .Select(r => new RecentRequestDto
                    {
                        RequestId = r.CentralRequestID,
                        RequestDate = r.RequestDate,
                        Status = r.Status,
                        TotalItems = r.CentralStoreRequestDetail.Sum(d => d.RequestedQuantity)
                    })
                    .ToListAsync();

                var recentTransfers = await _context.CentralStoreTransfers
                    .Where(t => t.BranchPharmacyID == branchId)
                    .OrderByDescending(t => t.TransferDate)
                    .Take(5)
                    .Select(t => new RecentTransferDto
                    {
                        TransferId = t.CentralTransferID,
                        TransferDate = t.TransferDate,
                        Status = t.Status,
                        TotalItems = t.CentralStoreTransferDetail.Sum(d => d.QuantityTransferred)
                    })
                    .ToListAsync();

                var dashboard = new DashboardDto
                {
                    TotalInventoryItems = totalItems,
                    TotalStockQuantity = totalStockQuantity,
                    LowStockItems = lowStockCount,
                    ExpiredItems = expiredCount,
                    NearExpiryItems = nearExpiryCount,
                    PendingPrescriptions = 0,
                    PendingRequests = pendingRequests,
                    RecentTransfers = pendingTransfers,
                    RecentRequests = recentRequests,
                    RecentTransfersList = recentTransfers
                };

                return Ok(dashboard);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region Inventory

        [HttpGet("GetInventory")]
        public async Task<IActionResult> GetInventory()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var inventory = await _context.BranchInventories
                    .Where(i => i.BranchPharmacyID == branchId)
                    .Include(i => i.Medicine)
                    .Select(i => new InventoryResponseDto
                    {
                        InventoryId = i.BranchInventoryID,
                        MedicineId = i.MedicineID,
                        MedicineName = i.Medicine != null ? i.Medicine.MedicineName : "",
                        GenericName = i.Medicine != null ? i.Medicine.GenericName : "",
                        QuantityAvailable = i.QuantityAvailable,
                        ExpiryDate = i.ExpiryDate,
                        BatchNumber = i.BatchNumber,
                        UnitOfMeasure = i.Medicine != null ? i.Medicine.UnitOfMeasure : "",
                        UnitPrice = i.Medicine != null ? i.Medicine.UnitPrice : 0
                    })
                    .ToListAsync();

                return Ok(inventory);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetAllMedicines")]
public async Task<IActionResult> GetAllMedicines()
{
    try
    {
        var medicines = await _context.Medicines
            .Select(m => new {
                m.MedicineID,
                m.MedicineName,
                m.UnitOfMeasure,
                m.UnitPrice,
                m.GenericName
            })
            .ToListAsync();
        return Ok(medicines);
    }
    catch (Exception ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

        [HttpGet("GetMedicineStock/{medicineId}")]
        public async Task<IActionResult> GetMedicineStock(int medicineId)
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var medicine = await _context.Medicines
                    .FirstOrDefaultAsync(m => m.MedicineID == medicineId);
                if (medicine == null)
                    return NotFound(new { message = "Medicine not found." });

                var batches = await _context.BranchInventories
                    .Where(i => i.BranchPharmacyID == branchId && i.MedicineID == medicineId)
                    .Select(i => new InventoryResponseDto
                    {
                        InventoryId = i.BranchInventoryID,
                        MedicineId = i.MedicineID,
                        MedicineName = i.Medicine != null ? i.Medicine.MedicineName : "",
                        GenericName = i.Medicine != null ? i.Medicine.GenericName : "",
                        QuantityAvailable = i.QuantityAvailable,
                        ExpiryDate = i.ExpiryDate,
                        BatchNumber = i.BatchNumber,
                        UnitOfMeasure = i.Medicine != null ? i.Medicine.UnitOfMeasure : "",
                        UnitPrice = i.Medicine != null ? i.Medicine.UnitPrice : 0
                    })
                    .ToListAsync();

                var totalQty = batches.Sum(b => b.QuantityAvailable);

                var result = new MedicineStockDto
                {
                    MedicineId = medicine.MedicineID,
                    MedicineName = medicine.MedicineName,
                    GenericName = medicine.GenericName,
                    TotalQuantity = totalQty,
                    UnitOfMeasure = medicine.UnitOfMeasure,
                    UnitPrice = medicine.UnitPrice,
                    BatchCount = batches.Count,
                    Batches = batches
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetLowStockMedicines")]
        public async Task<IActionResult> GetLowStockMedicines()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var lowStock = await _context.BranchInventories
                    .Where(i => i.BranchPharmacyID == branchId)
                    .Include(i => i.Medicine)
                    .GroupBy(i => i.MedicineID)
                    .Select(g => new
                    {
                        MedicineId = g.Key,
                        MedicineName = g.First().Medicine != null ? g.First().Medicine.MedicineName : "",
                        AvailableQuantity = g.Sum(i => i.QuantityAvailable),
                        UnitOfMeasure = g.First().Medicine != null ? g.First().Medicine.UnitOfMeasure : "",
                        EarliestExpiry = g.Min(i => i.ExpiryDate)
                    })
                    .Where(x => x.AvailableQuantity <= 20)
                    .ToListAsync();

                var result = lowStock.Select(x => new LowStockMedicineDto
                {
                    MedicineId = x.MedicineId,
                    MedicineName = x.MedicineName,
                    AvailableQuantity = x.AvailableQuantity,
                    ReorderLevel = 20,
                    UnitOfMeasure = x.UnitOfMeasure,
                    EarliestExpiry = x.EarliestExpiry
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetExpiredMedicines")]
        public async Task<IActionResult> GetExpiredMedicines()
        {
            try
            {
                var branchId = GetBranchPharmacyId();
                var now = DateTime.UtcNow;

                var expired = await _context.BranchInventories
                    .Where(i => i.BranchPharmacyID == branchId && i.ExpiryDate < now)
                    .Include(i => i.Medicine)
                    .Select(i => new ExpiredMedicineDto
                    {
                        InventoryId = i.BranchInventoryID,
                        MedicineId = i.MedicineID,
                        MedicineName = i.Medicine != null ? i.Medicine.MedicineName : "",
                        BatchNumber = i.BatchNumber,
                        QuantityAvailable = i.QuantityAvailable,
                        ExpiryDate = i.ExpiryDate,
                        DaysExpired = (int)(now - i.ExpiryDate).TotalDays
                    })
                    .ToListAsync();

                return Ok(expired);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetNearExpiryMedicines")]
        public async Task<IActionResult> GetNearExpiryMedicines()
        {
            try
            {
                var branchId = GetBranchPharmacyId();
                var now = DateTime.UtcNow;
                var threshold = now.AddDays(30);

                var nearExpiry = await _context.BranchInventories
                    .Where(i => i.BranchPharmacyID == branchId && i.ExpiryDate >= now && i.ExpiryDate <= threshold)
                    .Include(i => i.Medicine)
                    .Select(i => new NearExpiryMedicineDto
                    {
                        InventoryId = i.BranchInventoryID,
                        MedicineId = i.MedicineID,
                        MedicineName = i.Medicine != null ? i.Medicine.MedicineName : "",
                        BatchNumber = i.BatchNumber,
                        QuantityAvailable = i.QuantityAvailable,
                        ExpiryDate = i.ExpiryDate,
                        DaysUntilExpiry = (int)(i.ExpiryDate - now).TotalDays
                    })
                    .ToListAsync();

                return Ok(nearExpiry);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region Central Store Requests

        [HttpPost("CreateCentralStoreRequest")]
        public async Task<IActionResult> CreateCentralStoreRequest([FromBody] CreateCentralStoreRequestDto model)
        {
            try
            {
                var pharmacistId = GetPharmacistId();
                var branchId = GetBranchPharmacyId();

                if (model.Items == null || !model.Items.Any())
                    return BadRequest(new { message = "At least one item is required." });

                var pharmacist = await _context.Pharmacists
                    .FirstOrDefaultAsync(p => p.PharmacistID == pharmacistId && p.BranchPharmacyID == branchId);
                if (pharmacist == null)
                    return Unauthorized(new { message = "Invalid pharmacist for this branch." });

                var request = new CentralStoreRequest
                {
                    BranchPharmacyID = branchId,
                    RequestedByPharmacistID = pharmacistId,
                    RequestDate = DateTime.UtcNow,
                    Status = "Pending",
                    CentralStoreRequestDetail = new List<CentralStoreRequestDetail>()
                };

                foreach (var item in model.Items)
                {
                    var detail = new CentralStoreRequestDetail
                    {
                        MedicineID = item.MedicineId,
                        RequestedQuantity = item.RequestedQuantity,
                        ApprovedQuantity = 0
                    };
                    request.CentralStoreRequestDetail.Add(detail);
                }

                _context.CentralStoreRequests.Add(request);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Request created successfully.", requestId = request.CentralRequestID });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetMyRequests")]
        public async Task<IActionResult> GetMyRequests()
        {
            try
            {
                var pharmacistId = GetPharmacistId();
                var branchId = GetBranchPharmacyId();

                var requests = await _context.CentralStoreRequests
                    .Where(r => r.BranchPharmacyID == branchId && r.RequestedByPharmacistID == pharmacistId)
                    .Include(r => r.CentralStoreRequestDetail)
                    .Include(r => r.Pharmacist)
                        .ThenInclude(p => p.Users)
                    .OrderByDescending(r => r.RequestDate)
                    .Select(r => new RequestSummaryDto
                    {
                        CentralRequestId = r.CentralRequestID,
                        RequestDate = r.RequestDate,
                        Status = r.Status,
                        TotalItems = r.CentralStoreRequestDetail.Sum(d => d.RequestedQuantity),
                        ApprovedQuantityTotal = r.CentralStoreRequestDetail.Sum(d => d.ApprovedQuantity),
                        RequestedByPharmacist = r.Pharmacist != null && r.Pharmacist.Users != null
                            ? r.Pharmacist.Users.FirstName + " " + r.Pharmacist.Users.FatherName : ""
                    })
                    .ToListAsync();

                return Ok(requests);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetRequestDetails/{requestId}")]
        public async Task<IActionResult> GetRequestDetails(int requestId)
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var request = await _context.CentralStoreRequests
                    .Where(r => r.BranchPharmacyID == branchId && r.CentralRequestID == requestId)
                    .Include(r => r.CentralStoreRequestDetail)
                        .ThenInclude(d => d.Medicine)
                    .Include(r => r.Pharmacist)
                        .ThenInclude(p => p.Users)
                    .FirstOrDefaultAsync();

                if (request == null)
                    return NotFound(new { message = "Request not found." });

                var result = new RequestDetailDto
                {
                    CentralRequestId = request.CentralRequestID,
                    RequestDate = request.RequestDate,
                    Status = request.Status,
                    RequestedByPharmacist = request.Pharmacist != null && request.Pharmacist.Users != null
                        ? request.Pharmacist.Users.FirstName + " " + request.Pharmacist.Users.FatherName : "",
                    Details = request.CentralStoreRequestDetail.Select(d => new CentralStoreRequestDetailDto
                    {
                        MedicineId = d.MedicineID,
                        MedicineName = d.Medicine?.MedicineName ?? "",
                        RequestedQuantity = d.RequestedQuantity,
                        ApprovedQuantity = d.ApprovedQuantity
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("CancelRequest/{requestId}")]
        public async Task<IActionResult> CancelRequest(int requestId, [FromBody] CancelRequestDto model)
        {
            try
            {
                var branchId = GetBranchPharmacyId();
                var pharmacistId = GetPharmacistId();

                var request = await _context.CentralStoreRequests
                    .FirstOrDefaultAsync(r => r.CentralRequestID == requestId && r.BranchPharmacyID == branchId);

                if (request == null)
                    return NotFound(new { message = "Request not found." });

                if (request.Status != "Pending")
                    return BadRequest(new { message = "Only pending requests can be cancelled." });

                request.Status = "Cancelled";
                await _context.SaveChangesAsync();

                return Ok(new { message = "Request cancelled successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region Transfers

        [HttpGet("GetReceivedTransfers")]
        public async Task<IActionResult> GetReceivedTransfers()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var transfers = await _context.CentralStoreTransfers
                    .Where(t => t.BranchPharmacyID == branchId)
                    .Include(t => t.CentralStoreTransferDetail)
                    .Include(t => t.CentralStorePharmacy)
                    .OrderByDescending(t => t.TransferDate)
                    .Select(t => new TransferSummaryDto
                    {
                        CentralTransferId = t.CentralTransferID,
                        TransferDate = t.TransferDate,
                        Status = t.Status,
                        TotalItems = t.CentralStoreTransferDetail.Sum(d => d.QuantityTransferred),
                        FromCentralStore = t.CentralStorePharmacy != null ? t.CentralStorePharmacy.Name : ""
                    })
                    .ToListAsync();

                return Ok(transfers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetTransferDetails/{transferId}")]
        public async Task<IActionResult> GetTransferDetails(int transferId)
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var transfer = await _context.CentralStoreTransfers
                    .Where(t => t.BranchPharmacyID == branchId && t.CentralTransferID == transferId)
                    .Include(t => t.CentralStoreTransferDetail)
                        .ThenInclude(d => d.Medicine)
                    .Include(t => t.CentralStoreManager)
                        .ThenInclude(m => m.MainPharmacyManager)
                        .ThenInclude(m => m.Users)
                    .Include(t => t.CentralStorePharmacy)
                    .FirstOrDefaultAsync();

                if (transfer == null)
                    return NotFound(new { message = "Transfer not found." });

                var result = new TransferDetailDto
                {
                    CentralTransferId = transfer.CentralTransferID,
                    TransferDate = transfer.TransferDate,
                    Status = transfer.Status,
                    FromCentralStore = transfer.CentralStorePharmacy?.Name ?? "",
                    ProcessedByManager = transfer.CentralStoreManager != null && transfer.CentralStoreManager.MainPharmacyManager != null && transfer.CentralStoreManager.MainPharmacyManager.Users != null
                        ? transfer.CentralStoreManager.MainPharmacyManager.Users.FirstName + " " + transfer.CentralStoreManager.MainPharmacyManager.Users.FatherName : "",
                    Details = transfer.CentralStoreTransferDetail.Select(d => new CentralStoreTransferDetailDto
                    {
                        MedicineId = d.MedicineID,
                        MedicineName = d.Medicine?.MedicineName ?? "",
                        QuantityTransferred = d.QuantityTransferred,
                        BatchNumber = "",
                        ExpiryDate = DateTime.UtcNow
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("AcceptTransfer/{transferId}")]
        public async Task<IActionResult> AcceptTransfer(int transferId, [FromBody] AcceptTransferDto model)
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var transfer = await _context.CentralStoreTransfers
                    .Where(t => t.BranchPharmacyID == branchId && t.CentralTransferID == transferId)
                    .Include(t => t.CentralStoreTransferDetail)
                    .FirstOrDefaultAsync();

                if (transfer == null)
                    return NotFound(new { message = "Transfer not found." });

                if (transfer.Status != "Pending")
                    return BadRequest(new { message = "Only pending transfers can be accepted." });

                foreach (var detail in transfer.CentralStoreTransferDetail)
                {
                    var branchInventory = new BranchInventory
                    {
                        BranchPharmacyID = branchId,
                        MedicineID = detail.MedicineID,
                        QuantityAvailable = detail.QuantityTransferred,
                        ExpiryDate = DateTime.UtcNow.AddMonths(6),
                        BatchNumber = "TRANSFER_" + DateTime.UtcNow.Ticks
                    };
                    _context.BranchInventories.Add(branchInventory);
                }

                transfer.Status = "Completed";
                await _context.SaveChangesAsync();

                return Ok(new { message = "Transfer accepted and inventory updated." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("RejectTransfer/{transferId}")]
        public async Task<IActionResult> RejectTransfer(int transferId, [FromBody] RejectTransferDto model)
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var transfer = await _context.CentralStoreTransfers
                    .FirstOrDefaultAsync(t => t.BranchPharmacyID == branchId && t.CentralTransferID == transferId);

                if (transfer == null)
                    return NotFound(new { message = "Transfer not found." });

                if (transfer.Status != "Pending")
                    return BadRequest(new { message = "Only pending transfers can be rejected." });

                transfer.Status = "Rejected";
                await _context.SaveChangesAsync();

                return Ok(new { message = "Transfer rejected." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region Prescriptions

        [HttpGet("GetPendingPrescriptions")]
        public async Task<IActionResult> GetPendingPrescriptions()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var prescriptions = await _context.Prescriptions
                    .Where(p => p.BranchPharmacyID == branchId)
                    .Include(p => p.PrescriptionDetail)
                    .Include(p => p.Patient)
                    .Include(p => p.Doctor)
                        .ThenInclude(d => d.Users)
                    .Where(p => !_context.DispenseMedicines.Any(d => d.PrescriptionID == p.PrescriptionID))
                    .OrderByDescending(p => p.PrescriptionDate)
                    .Select(p => new PendingPrescriptionDto
                    {
                        PrescriptionId = p.PrescriptionID,
                        PrescriptionDate = p.PrescriptionDate,
                        PatientId = p.PatientID,
                        PatientName = p.Patient != null ? p.Patient.FirstName + " " + p.Patient.LastName : "",
                        DoctorName = p.Doctor != null && p.Doctor.Users != null ? p.Doctor.Users.FirstName + " " + p.Doctor.Users.FatherName : "",
                        TotalItems = p.PrescriptionDetail.Sum(d => (int)d.Quantity),
                        Status = "Pending"
                    })
                    .ToListAsync();

                return Ok(prescriptions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetPrescriptionDetails/{prescriptionId}")]
        public async Task<IActionResult> GetPrescriptionDetails(int prescriptionId)
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var prescription = await _context.Prescriptions
                    .Where(p => p.BranchPharmacyID == branchId && p.PrescriptionID == prescriptionId)
                    .Include(p => p.PrescriptionDetail)
                        .ThenInclude(d => d.Medicine)
                    .Include(p => p.Patient)
                    .Include(p => p.Doctor)
                        .ThenInclude(d => d.Users)
                    .FirstOrDefaultAsync();

                if (prescription == null)
                    return NotFound(new { message = "Prescription not found." });

                var result = new PrescriptionDetailResponseDto
                {
                    PrescriptionId = prescription.PrescriptionID,
                    PrescriptionDate = prescription.PrescriptionDate,
                    PatientId = prescription.PatientID,
                    PatientName = prescription.Patient != null ? prescription.Patient.FirstName + " " + prescription.Patient.LastName : "",
                    DoctorName = prescription.Doctor != null && prescription.Doctor.Users != null ? prescription.Doctor.Users.FirstName + " " + prescription.Doctor.Users.FatherName : "",
                    Medicines = prescription.PrescriptionDetail.Select(d => new PrescriptionMedicineDto
                    {
                        MedicineId = d.MedicineID,
                        MedicineName = d.Medicine?.MedicineName ?? "",
                        Dosage = d.Dosage,
                        Frequency = d.Frequency,
                        Duration = d.Duration,
                        Quantity = d.Quantity,
                        AvailableQuantity = 0,
                        IsAvailable = false
                    }).ToList()
                };

                foreach (var med in result.Medicines)
                {
                    var totalAvailable = await _context.BranchInventories
                        .Where(i => i.BranchPharmacyID == branchId && i.MedicineID == med.MedicineId)
                        .SumAsync(i => i.QuantityAvailable);
                    med.AvailableQuantity = totalAvailable;
                    med.IsAvailable = totalAvailable >= med.Quantity;
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("CheckMedicineAvailability/{prescriptionId}")]
        public async Task<IActionResult> CheckMedicineAvailability(int prescriptionId)
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var prescription = await _context.Prescriptions
                    .Where(p => p.BranchPharmacyID == branchId && p.PrescriptionID == prescriptionId)
                    .Include(p => p.PrescriptionDetail)
                        .ThenInclude(d => d.Medicine)
                    .FirstOrDefaultAsync();

                if (prescription == null)
                    return NotFound(new { message = "Prescription not found." });

                var result = new List<MedicineAvailabilityDto>();

                foreach (var detail in prescription.PrescriptionDetail)
                {
                    var totalAvailable = await _context.BranchInventories
                        .Where(i => i.BranchPharmacyID == branchId && i.MedicineID == detail.MedicineID)
                        .SumAsync(i => i.QuantityAvailable);

                    var batches = await _context.BranchInventories
                        .Where(i => i.BranchPharmacyID == branchId && i.MedicineID == detail.MedicineID)
                        .Select(i => new BatchAvailabilityDto
                        {
                            InventoryId = i.BranchInventoryID,
                            BatchNumber = i.BatchNumber,
                            QuantityAvailable = i.QuantityAvailable,
                            ExpiryDate = i.ExpiryDate
                        })
                        .ToListAsync();

                    result.Add(new MedicineAvailabilityDto
                    {
                        MedicineId = detail.MedicineID,
                        MedicineName = detail.Medicine?.MedicineName ?? "",
                        AvailableQuantity = totalAvailable,
                        IsAvailable = totalAvailable >= detail.Quantity,
                        Batches = batches
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region Dispensing

        [HttpPost("DispenseMedicine")]
        public async Task<IActionResult> DispenseMedicine([FromBody] DispenseMedicineDto model)
        {
            try
            {
                var pharmacistId = GetPharmacistId();
                var branchId = GetBranchPharmacyId();

                var prescription = await _context.Prescriptions
                    .Where(p => p.BranchPharmacyID == branchId && p.PrescriptionID == model.PrescriptionId)
                    .Include(p => p.PrescriptionDetail)
                    .FirstOrDefaultAsync();

                if (prescription == null)
                    return NotFound(new { message = "Prescription not found." });

                var existingDispense = await _context.DispenseMedicines
                    .AnyAsync(d => d.PrescriptionID == model.PrescriptionId);
                if (existingDispense)
                    return BadRequest(new { message = "Prescription already dispensed." });

                foreach (var item in model.Items)
                {
                    var available = await _context.BranchInventories
                        .Where(i => i.BranchPharmacyID == branchId && i.MedicineID == item.MedicineId)
                        .SumAsync(i => i.QuantityAvailable);

                    if (available < item.QuantityDispensed)
                        return BadRequest(new { message = $"Insufficient stock for medicine ID {item.MedicineId}. Available: {available}, Requested: {item.QuantityDispensed}" });
                }

                var dispense = new DispenseMedicine
                {
                    PrescriptionID = model.PrescriptionId,
                    BranchPharmacyID = branchId,
                    PharmacistID = pharmacistId,
                    DispenceDate = DateTime.UtcNow,
                    DispenseMedicineDetails = new List<DispenseMedicineDetail>()
                };

                foreach (var item in model.Items)
                {
                    var remaining = item.QuantityDispensed;
                    var batches = await _context.BranchInventories
                        .Where(i => i.BranchPharmacyID == branchId && i.MedicineID == item.MedicineId && i.QuantityAvailable > 0)
                        .OrderBy(i => i.ExpiryDate)
                        .ToListAsync();

                    foreach (var batch in batches)
                    {
                        if (remaining <= 0) break;
                        var deduct = Math.Min(batch.QuantityAvailable, (int)remaining);
                        batch.QuantityAvailable -= deduct;
                        remaining -= deduct;
                    }

                    if (remaining > 0)
                        throw new Exception($"Could not fully allocate required quantity for medicine ID {item.MedicineId}. Missing {remaining} units.");

                    dispense.DispenseMedicineDetails.Add(new DispenseMedicineDetail
                    {
                        MedicineID = item.MedicineId,
                        QuantityDispenced = item.QuantityDispensed
                    });
                }

                _context.DispenseMedicines.Add(dispense);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Dispense completed successfully.", dispenseId = dispense.DispenseID });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetDispenseHistory")]
        public async Task<IActionResult> GetDispenseHistory()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var history = await _context.DispenseMedicines
                    .Where(d => d.BranchPharmacyID == branchId)
                    .Include(d => d.Prescription)
                        .ThenInclude(p => p.Patient)
                    .Include(d => d.Pharmacist)
                        .ThenInclude(p => p.Users)
                    .Include(d => d.DispenseMedicineDetails)
                        .ThenInclude(dt => dt.Medicine)
                    .OrderByDescending(d => d.DispenceDate)
                    .Select(d => new DispenseHistoryDto
                    {
                        DispenseId = d.DispenseID,
                        DispenseDate = d.DispenceDate,
                        PrescriptionId = d.PrescriptionID,
                        PatientId = d.Prescription != null ? d.Prescription.PatientID : 0,
                        PatientName = d.Prescription != null && d.Prescription.Patient != null ? d.Prescription.Patient.FirstName + " " + d.Prescription.Patient.LastName : "",
                        PharmacistName = d.Pharmacist != null && d.Pharmacist.Users != null ? d.Pharmacist.Users.FirstName + " " + d.Pharmacist.Users.FatherName : "",
                        TotalItems = d.DispenseMedicineDetails.Sum(dt => (int)dt.QuantityDispenced),
                        TotalAmount = d.DispenseMedicineDetails.Sum(dt => (decimal)dt.QuantityDispenced * (dt.Medicine != null ? dt.Medicine.UnitPrice : 0))
                    })
                    .ToListAsync();

                return Ok(history);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetDispenseDetails/{dispenseId}")]
        public async Task<IActionResult> GetDispenseDetails(int dispenseId)
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var dispense = await _context.DispenseMedicines
                    .Where(d => d.BranchPharmacyID == branchId && d.DispenseID == dispenseId)
                    .Include(d => d.Prescription)
                        .ThenInclude(p => p.Patient)
                    .Include(d => d.Pharmacist)
                        .ThenInclude(p => p.Users)
                    .Include(d => d.DispenseMedicineDetails)
                        .ThenInclude(dt => dt.Medicine)
                    .FirstOrDefaultAsync();

                if (dispense == null)
                    return NotFound(new { message = "Dispense record not found." });

                var result = new DispenseDetailDto
                {
                    DispenseId = dispense.DispenseID,
                    DispenseDate = dispense.DispenceDate,
                    PrescriptionId = dispense.PrescriptionID,
                    PatientName = dispense.Prescription?.Patient != null ? dispense.Prescription.Patient.FirstName + " " + dispense.Prescription.Patient.LastName : "",
                    PharmacistName = dispense.Pharmacist != null && dispense.Pharmacist.Users != null ? dispense.Pharmacist.Users.FirstName + " " + dispense.Pharmacist.Users.FatherName : "",
                    Items = dispense.DispenseMedicineDetails.Select(dt => new DispenseDetailItemDto
                    {
                        MedicineId = dt.MedicineID,
                        MedicineName = dt.Medicine?.MedicineName ?? "",
                        QuantityDispensed = dt.QuantityDispenced,
                        UnitOfMeasure = dt.Medicine?.UnitOfMeasure ?? "",
                        UnitPrice = dt.Medicine?.UnitPrice ?? 0,
                        LineTotal = (decimal)dt.QuantityDispenced * (dt.Medicine?.UnitPrice ?? 0)
                    }).ToList(),
                    TotalAmount = dispense.DispenseMedicineDetails.Sum(dt => (decimal)dt.QuantityDispenced * (dt.Medicine != null ? dt.Medicine.UnitPrice : 0))
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region Reports

        [HttpGet("GetStockReport")]
        public async Task<IActionResult> GetStockReport()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var report = await _context.BranchInventories
                    .Where(i => i.BranchPharmacyID == branchId)
                    .Include(i => i.Medicine)
                    .GroupBy(i => i.MedicineID)
                    .Select(g => new StockReportDto
                    {
                        MedicineId = g.Key,
                        MedicineName = g.First().Medicine != null ? g.First().Medicine.MedicineName : "",
                        GenericName = g.First().Medicine != null ? g.First().Medicine.GenericName : "",
                        TotalQuantity = g.Sum(i => i.QuantityAvailable),
                        BatchCount = g.Count(),
                        OldestExpiry = g.Min(i => i.ExpiryDate),
                        NewestExpiry = g.Max(i => i.ExpiryDate),
                        UnitOfMeasure = g.First().Medicine != null ? g.First().Medicine.UnitOfMeasure : ""
                    })
                    .ToListAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetRequestReport")]
        public async Task<IActionResult> GetRequestReport()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var requests = await _context.CentralStoreRequests
                    .Where(r => r.BranchPharmacyID == branchId)
                    .Include(r => r.CentralStoreRequestDetail)
                        .ThenInclude(d => d.Medicine)
                    .Include(r => r.Pharmacist)
                        .ThenInclude(p => p.Users)
                    .OrderByDescending(r => r.RequestDate)
                    .Select(r => new RequestReportDto
                    {
                        RequestId = r.CentralRequestID,
                        RequestDate = r.RequestDate,
                        Status = r.Status,
                        RequestedBy = r.Pharmacist != null && r.Pharmacist.Users != null ? r.Pharmacist.Users.FirstName + " " + r.Pharmacist.Users.FatherName : "",
                        TotalRequested = r.CentralStoreRequestDetail.Sum(d => d.RequestedQuantity),
                        TotalApproved = r.CentralStoreRequestDetail.Sum(d => d.ApprovedQuantity),
                        Items = r.CentralStoreRequestDetail.Select(d => new RequestItemReportDto
                        {
                            MedicineName = d.Medicine != null ? d.Medicine.MedicineName : "",
                            RequestedQuantity = d.RequestedQuantity,
                            ApprovedQuantity = d.ApprovedQuantity
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(requests);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetTransferReport")]
        public async Task<IActionResult> GetTransferReport()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var transfers = await _context.CentralStoreTransfers
                    .Where(t => t.BranchPharmacyID == branchId)
                    .Include(t => t.CentralStoreTransferDetail)
                        .ThenInclude(d => d.Medicine)
                    .Include(t => t.CentralStorePharmacy)
                    .OrderByDescending(t => t.TransferDate)
                    .Select(t => new TransferReportDto
                    {
                        TransferId = t.CentralTransferID,
                        TransferDate = t.TransferDate,
                        Status = t.Status,
                        FromCentralStore = t.CentralStorePharmacy != null ? t.CentralStorePharmacy.Name : "",
                        TotalItems = t.CentralStoreTransferDetail.Sum(d => d.QuantityTransferred),
                        Items = t.CentralStoreTransferDetail.Select(d => new TransferItemReportDto
                        {
                            MedicineName = d.Medicine != null ? d.Medicine.MedicineName : "",
                            QuantityTransferred = d.QuantityTransferred,
                            BatchNumber = "",
                            ExpiryDate = DateTime.UtcNow
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(transfers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetDispenseReport")]
        public async Task<IActionResult> GetDispenseReport()
        {
            try
            {
                var branchId = GetBranchPharmacyId();

                var report = await _context.DispenseMedicines
                    .Where(d => d.BranchPharmacyID == branchId)
                    .Include(d => d.Prescription)
                        .ThenInclude(p => p.Patient)
                    .Include(d => d.Pharmacist)
                        .ThenInclude(p => p.Users)
                    .Include(d => d.DispenseMedicineDetails)
                        .ThenInclude(dt => dt.Medicine)
                    .OrderByDescending(d => d.DispenceDate)
                    .Select(d => new DispenseReportDto
                    {
                        DispenseId = d.DispenseID,
                        DispenseDate = d.DispenceDate,
                        PrescriptionId = d.PrescriptionID,
                        PatientName = d.Prescription != null && d.Prescription.Patient != null ? d.Prescription.Patient.FirstName + " " + d.Prescription.Patient.LastName : "",
                        PharmacistName = d.Pharmacist != null && d.Pharmacist.Users != null ? d.Pharmacist.Users.FirstName + " " + d.Pharmacist.Users.FatherName : "",
                        TotalItems = d.DispenseMedicineDetails.Sum(dt => (int)dt.QuantityDispenced),
                        TotalAmount = d.DispenseMedicineDetails.Sum(dt => (decimal)dt.QuantityDispenced * (dt.Medicine != null ? dt.Medicine.UnitPrice : 0)),
                        Items = d.DispenseMedicineDetails.Select(dt => new DispenseItemReportDto
                        {
                            MedicineName = dt.Medicine != null ? dt.Medicine.MedicineName : "",
                            QuantityDispensed = dt.QuantityDispenced,
                            UnitPrice = dt.Medicine != null ? dt.Medicine.UnitPrice : 0,
                            LineTotal = (decimal)dt.QuantityDispenced * (dt.Medicine != null ? dt.Medicine.UnitPrice : 0)
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetExpiryReport")]
        public async Task<IActionResult> GetExpiryReport()
        {
            try
            {
                var branchId = GetBranchPharmacyId();
                var now = DateTime.UtcNow;

                var inventory = await _context.BranchInventories
                    .Where(i => i.BranchPharmacyID == branchId)
                    .Include(i => i.Medicine)
                    .Select(i => new ExpiryReportDto
                    {
                        InventoryId = i.BranchInventoryID,
                        MedicineId = i.MedicineID,
                        MedicineName = i.Medicine != null ? i.Medicine.MedicineName : "",
                        BatchNumber = i.BatchNumber,
                        QuantityAvailable = i.QuantityAvailable,
                        ExpiryDate = i.ExpiryDate,
                        Status = i.ExpiryDate < now ? "Expired" : (i.ExpiryDate <= now.AddDays(30) ? "Near Expiry" : "Valid"),
                        DaysRemaining = (int)(i.ExpiryDate - now).TotalDays
                    })
                    .ToListAsync();

                return Ok(inventory);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        #endregion

        #region Profile

        [HttpGet("GetProfile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var pharmacistId = GetPharmacistId();
                var branchId = GetBranchPharmacyId();

                var pharmacist = await _context.Pharmacists
                    .Where(p => p.PharmacistID == pharmacistId && p.BranchPharmacyID == branchId)
                    .Include(p => p.Users)
                    .Include(p => p.BranchPharmacy)
                    .FirstOrDefaultAsync();

                if (pharmacist == null)
                    return NotFound(new { message = "Pharmacist not found." });

                var profile = new PharmacistProfileDto
                {
                    PharmacistId = pharmacist.PharmacistID,
                    UserId = pharmacist.UserID,
                    FullName = pharmacist.Users != null ? pharmacist.Users.FirstName + " " + pharmacist.Users.FatherName : "",
                    Email = pharmacist.Users?.Email ?? "",
                    PhoneNumber = pharmacist.Users?.Phone ?? "",
                    BranchPharmacyId = pharmacist.BranchPharmacyID,
                    BranchName = pharmacist.BranchPharmacy?.BranchName ?? "",
                    Location = pharmacist.BranchPharmacy?.Location ?? ""
                };

                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        #endregion
    }
}