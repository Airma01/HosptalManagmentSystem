using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dtos;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Pharmacy.CentralStore;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/CSM/[controller]")]
    [Authorize(Roles = "CSM")]
    public class CentralStoreController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Lazy-loaded property – accessed only inside action methods
        private int CentralPharmacyId
        {
            get
            {
                var claim = User.FindFirst("CentralPharmacyID");
                if (claim == null || !int.TryParse(claim.Value, out int pharmacyId))
                    throw new UnauthorizedAccessException("Central Pharmacy ID claim not found in token.");
                return pharmacyId;
            }
        }

        public CentralStoreController(AppDbContext context)
        {
            _context = context;
            // Do NOT access User here – it will be null.
        }

        // Add a helper to get the current manager ID
        private int GetCurrentManagerId()
        {
            var claim = User.FindFirst("ManagerID");
            if (claim == null || !int.TryParse(claim.Value, out int managerId))
                throw new UnauthorizedAccessException("Manager ID claim not found.");
            return managerId;
        }
        // ========================== DASHBOARD ==========================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var centralId = CentralPharmacyId; // <-- accessed here

                var totalStock = await _context.CentralStoreInventories
                    .Where(i => i.CentralPharmacyID == centralId && i.QuantityAvailable > 0)
                    .SumAsync(i => i.QuantityAvailable);

                const int lowStockThreshold = 10;
                var lowStockCount = await _context.CentralStoreInventories
                    .Where(i => i.CentralPharmacyID == centralId && i.QuantityAvailable < lowStockThreshold && i.QuantityAvailable > 0)
                    .CountAsync();

                var expiredCount = await _context.CentralStoreInventories
                    .Where(i => i.CentralPharmacyID == centralId && i.ExpiryDate < DateTime.UtcNow)
                    .SumAsync(i => i.QuantityAvailable);

                var pendingRequests = await _context.CentralStoreRequests
                    .Where(r => r.Status == "Pending")
                    .CountAsync();

                var recentTransfers = await _context.CentralStoreTransfers
                    .Where(t => t.CentralPharmacyID == centralId)
                    .OrderByDescending(t => t.TransferDate)
                    .Take(5)
                    .Select(t => new RecentTransferDto
                    {
                        TransferId = t.CentralTransferID,
                        BranchName = t.BranchPharmacy != null ? t.BranchPharmacy.BranchName : "",
                        TransferDate = t.TransferDate,
                        Status = t.Status,
                        TotalItems = t.CentralStoreTransferDetail.Sum(d => d.QuantityTransferred)
                    })
                    .ToListAsync();

                var result = new DashboardSummaryDto
                {
                    TotalMedicinesInStock = (int)totalStock,
                    LowStockCount = lowStockCount,
                    ExpiredCount = (int)expiredCount,
                    PendingRequestsCount = pendingRequests,
                    RecentTransfers = recentTransfers
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving dashboard data.", error = ex.Message });
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
        // ========================== MEDICINE MANAGEMENT ==========================

        [HttpPost("medicines")]
        public async Task<IActionResult> CreateMedicine([FromBody] MedicineCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var exists = await _context.Medicines
                    .AnyAsync(m => m.MedicineName.ToLower() == dto.MedicineName.ToLower());
                if (exists)
                    return Conflict(new { message = "A medicine with this name already exists." });

                var medicine = new Medicine
                {
                    MedicineName = dto.MedicineName,
                    GenericName = dto.GenericName ?? "",
                    UnitPrice = dto.UnitPrice,
                    UnitOfMeasure = dto.UnitOfMeasure ?? ""
                };

                _context.Medicines.Add(medicine);
                await _context.SaveChangesAsync();

                var response = new MedicineResponseDto
                {
                    MedicineID = medicine.MedicineID,
                    MedicineName = medicine.MedicineName,
                    GenericName = medicine.GenericName,
                    UnitPrice = medicine.UnitPrice,
                    UnitOfMeasure = medicine.UnitOfMeasure,
                    IsActive = true
                };

                return CreatedAtAction(nameof(GetMedicineById), new { id = medicine.MedicineID }, response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating medicine.", error = ex.Message });
            }
        }

        [HttpGet("medicines")]
        public async Task<IActionResult> GetMedicines([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.Medicines.AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                    query = query.Where(m => m.MedicineName.Contains(search) || m.GenericName.Contains(search));

                var total = await query.CountAsync();
                var items = await query
                    .OrderBy(m => m.MedicineName)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(m => new MedicineResponseDto
                    {
                        MedicineID = m.MedicineID,
                        MedicineName = m.MedicineName,
                        GenericName = m.GenericName,
                        UnitPrice = m.UnitPrice,
                        UnitOfMeasure = m.UnitOfMeasure,
                        IsActive = true
                    })
                    .ToListAsync();

                return Ok(new { total, page, pageSize, items });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving medicines.", error = ex.Message });
            }
        }

        [HttpGet("medicines/{id}")]
        public async Task<IActionResult> GetMedicineById(long id)
        {
            try
            {
                var medicine = await _context.Medicines
                    .Where(m => m.MedicineID == id)
                    .Select(m => new MedicineResponseDto
                    {
                        MedicineID = m.MedicineID,
                        MedicineName = m.MedicineName,
                        GenericName = m.GenericName,
                        UnitPrice = m.UnitPrice,
                        UnitOfMeasure = m.UnitOfMeasure,
                        IsActive = true
                    })
                    .FirstOrDefaultAsync();

                if (medicine == null)
                    return NotFound(new { message = "Medicine not found." });

                return Ok(medicine);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving medicine.", error = ex.Message });
            }
        }

        [HttpPut("medicines/{id}")]
        public async Task<IActionResult> UpdateMedicine(long id, [FromBody] MedicineUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var medicine = await _context.Medicines.FindAsync(id);
                if (medicine == null)
                    return NotFound(new { message = "Medicine not found." });

                if (!string.IsNullOrWhiteSpace(dto.MedicineName))
                    medicine.MedicineName = dto.MedicineName;
                if (!string.IsNullOrWhiteSpace(dto.GenericName))
                    medicine.GenericName = dto.GenericName;
                if (dto.UnitPrice.HasValue)
                    medicine.UnitPrice = dto.UnitPrice.Value;
                if (!string.IsNullOrWhiteSpace(dto.UnitOfMeasure))
                    medicine.UnitOfMeasure = dto.UnitOfMeasure;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating medicine.", error = ex.Message });
            }
        }

        [HttpPatch("medicines/{id}/deactivate")]
        public async Task<IActionResult> DeactivateMedicine(long id)
        {
            // IsActive does not exist on Medicine – return not implemented.
            return StatusCode(501, new { message = "Deactivation not supported – no IsActive property on Medicine." });
        }

        // ========================== INVENTORY MANAGEMENT ==========================

       [HttpPost("inventory")]
        public async Task<IActionResult> AddInventory([FromBody] InventoryCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var centralId = CentralPharmacyId;

                var medicine = await _context.Medicines.FindAsync(dto.MedicineID);
                if (medicine == null)
                    return BadRequest(new { message = "Medicine not found." });

                // Convert expiry date to UTC to avoid PostgreSQL DateTimeKind error
                var expiryUtc = DateTime.SpecifyKind(dto.ExpiryDate, DateTimeKind.Utc);

                var existing = await _context.CentralStoreInventories
                    .FirstOrDefaultAsync(i => i.CentralPharmacyID == centralId
                                        && i.MedicineID == dto.MedicineID
                                        && i.BatchNumber == dto.BatchNumber
                                        && i.ExpiryDate == expiryUtc);

                if (existing != null)
                {
                    existing.QuantityAvailable += dto.Quantity;
                }
                else
                {
                    var inventory = new CentralStoreInventory
                    {
                        CentralPharmacyID = centralId,
                        MedicineID = dto.MedicineID,
                        QuantityAvailable = dto.Quantity,
                        ExpiryDate = expiryUtc,                       // <-- now Utc
                        BatchNumber = dto.BatchNumber,
                        Source = dto.Source ?? "Supplier"
                    };
                    _context.CentralStoreInventories.Add(inventory);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Inventory added/updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error adding inventory.", error = ex.Message });
            }
        }
        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var centralId = CentralPharmacyId;

                var query = _context.CentralStoreInventories
                    .Include(i => i.Medicine)
                    .Where(i => i.CentralPharmacyID == centralId);

                var total = await query.CountAsync();
                var items = await query
                    .OrderByDescending(i => i.CentralInventoryID)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(i => new InventoryResponseDto
                    {
                        CentralInventoryID = i.CentralInventoryID,
                        MedicineID = i.MedicineID,
                        MedicineName = i.Medicine != null ? i.Medicine.MedicineName : "",
                        QuantityAvailable = i.QuantityAvailable,
                        ExpiryDate = i.ExpiryDate,
                        BatchNumber = i.BatchNumber,
                        Source = i.Source
                    })
                    .ToListAsync();

                return Ok(new { total, page, pageSize, items });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving inventory.", error = ex.Message });
            }
        }

        [HttpPatch("inventory/{id}")]
        public async Task<IActionResult> UpdateInventory(long id, [FromBody] InventoryUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var inventory = await _context.CentralStoreInventories.FindAsync(id);
                if (inventory == null)
                    return NotFound(new { message = "Inventory record not found." });

                inventory.QuantityAvailable += dto.QuantityAdjustment;
                if (inventory.QuantityAvailable < 0)
                    return BadRequest(new { message = "Insufficient stock: adjustment would make quantity negative." });

                await _context.SaveChangesAsync();
                return Ok(new { message = "Inventory adjusted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating inventory.", error = ex.Message });
            }
        }

        [HttpGet("inventory/lowstock")]
        public async Task<IActionResult> GetLowStockMedicines([FromQuery] int threshold = 10)
        {
            try
            {
                var centralId = CentralPharmacyId;

                var lowStock = await _context.CentralStoreInventories
                    .Include(i => i.Medicine)
                    .Where(i => i.CentralPharmacyID == centralId && i.QuantityAvailable < threshold && i.QuantityAvailable > 0)
                    .GroupBy(i => i.MedicineID)
                    .Select(g => new LowStockMedicineDto
                    {
                        MedicineID = g.Key,
                        MedicineName = g.First().Medicine != null ? g.First().Medicine.MedicineName : "",
                        TotalQuantity = g.Sum(i => i.QuantityAvailable),
                        Threshold = threshold
                    })
                    .ToListAsync();

                return Ok(lowStock);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching low stock medicines.", error = ex.Message });
            }
        }

        [HttpGet("inventory/expired")]
        public async Task<IActionResult> GetExpiredMedicines()
        {
            try
            {
                var centralId = CentralPharmacyId;

                var expired = await _context.CentralStoreInventories
                    .Include(i => i.Medicine)
                    .Where(i => i.CentralPharmacyID == centralId && i.ExpiryDate < DateTime.UtcNow)
                    .Select(i => new ExpiredMedicineDto
                    {
                        InventoryID = i.CentralInventoryID,
                        MedicineName = i.Medicine != null ? i.Medicine.MedicineName : "",
                        Quantity = i.QuantityAvailable,
                        ExpiryDate = i.ExpiryDate,
                        BatchNumber = i.BatchNumber
                    })
                    .ToListAsync();

                return Ok(expired);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching expired medicines.", error = ex.Message });
            }
        }

        // ========================== REQUEST MANAGEMENT ==========================

        [HttpGet("requests/pending")]
        public async Task<IActionResult> GetPendingRequests([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.CentralStoreRequests
                    .Include(r => r.BranchPharmacy)
                    .Where(r => r.Status == "Pending");

                var total = await query.CountAsync();
                var items = await query
                    .OrderByDescending(r => r.RequestDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new RequestSummaryDto
                    {
                        RequestID = r.CentralRequestID,
                        BranchName = r.BranchPharmacy != null ? r.BranchPharmacy.BranchName : "",
                        RequestDate = r.RequestDate,
                        Status = r.Status
                    })
                    .ToListAsync();

                return Ok(new { total, page, pageSize, items });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving pending requests.", error = ex.Message });
            }
        }

        [HttpGet("requests/{id}")]
        public async Task<IActionResult> GetRequestDetails(long id)
        {
            try
            {
                var request = await _context.CentralStoreRequests
                    .Include(r => r.BranchPharmacy)
                    .Include(r => r.Pharmacist)
                        .ThenInclude(p => p.Users)
                    .Include(r => r.CentralStoreRequestDetail)
                        .ThenInclude(d => d.Medicine)
                    .FirstOrDefaultAsync(r => r.CentralRequestID == id);

                if (request == null)
                    return NotFound(new { message = "Request not found." });

                var dto = new RequestResponseDto
                {
                    CentralRequestID = request.CentralRequestID,
                    BranchPharmacyID = request.BranchPharmacyID,
                    BranchName = request.BranchPharmacy != null ? request.BranchPharmacy.BranchName : "",
                    RequestedByPharmacist = request.Pharmacist != null && request.Pharmacist.Users != null
                        ? request.Pharmacist.Users.FirstName + " " + request.Pharmacist.Users.FatherName
                        : "",
                    RequestDate = request.RequestDate,
                    Status = request.Status,
                    Details = request.CentralStoreRequestDetail.Select(d => new RequestDetailDto
                    {
                        MedicineID = d.MedicineID,
                        MedicineName = d.Medicine != null ? d.Medicine.MedicineName : "",
                        RequestedQuantity = d.RequestedQuantity,
                        ApprovedQuantity = d.ApprovedQuantity
                    }).ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving request details.", error = ex.Message });
            }
        }

        [HttpPut("requests/{id}/approve")]
        public async Task<IActionResult> ApproveRequest(long id, [FromBody] RequestApproveDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var centralId = CentralPharmacyId;
                var request = await _context.CentralStoreRequests
                    .Include(r => r.CentralStoreRequestDetail)
                    .FirstOrDefaultAsync(r => r.CentralRequestID == id);

                if (request == null)
                    return NotFound(new { message = "Request not found." });

                if (request.Status != "Pending")
                    return BadRequest(new { message = "Request is not pending." });

                foreach (var detail in request.CentralStoreRequestDetail)
                {
                    var totalAvailable = await _context.CentralStoreInventories
                        .Where(i => i.CentralPharmacyID == centralId && i.MedicineID == detail.MedicineID)
                        .SumAsync(i => i.QuantityAvailable);

                    if (totalAvailable < detail.RequestedQuantity)
                        return BadRequest(new { message = $"Insufficient stock for medicine ID {detail.MedicineID}. Available: {totalAvailable}, Requested: {detail.RequestedQuantity}" });
                }

                foreach (var detail in request.CentralStoreRequestDetail)
                {
                    detail.ApprovedQuantity = detail.RequestedQuantity;
                }

                request.Status = "Approved";

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Request approved successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "Error approving request.", error = ex.Message });
            }
        }

        [HttpPut("requests/{id}/reject")]
        public async Task<IActionResult> RejectRequest(long id, [FromBody] RequestRejectDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var request = await _context.CentralStoreRequests.FindAsync(id);
                if (request == null)
                    return NotFound(new { message = "Request not found." });

                if (request.Status != "Pending")
                    return BadRequest(new { message = "Request is not pending." });

                request.Status = "Rejected";

                await _context.SaveChangesAsync();
                return Ok(new { message = "Request rejected." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error rejecting request.", error = ex.Message });
            }
        }

        // ========================== TRANSFER MANAGEMENT ==========================

        private async Task<int> GetCurrentCentralStoreManagerId()
            {
                // 1. Read ManagerID claim
                var managerIdClaim = User.FindFirst("ManagerID");
                if (managerIdClaim == null)
                {
                    Console.WriteLine("❌ ManagerID claim not found in token.");
                    throw new UnauthorizedAccessException("Manager ID claim not found in token.");
                }

                if (!int.TryParse(managerIdClaim.Value, out int managerId))
                {
                    Console.WriteLine($"❌ ManagerID claim value '{managerIdClaim.Value}' is not a valid integer.");
                    throw new UnauthorizedAccessException("Manager ID claim value is not a valid integer.");
                }

                Console.WriteLine($"✅ Found ManagerID = {managerId}");

                // 2. Query all managers for this ManagerID (ignoring IsActive/IsCurrent) to see what exists
                var allManagers = await _context.CentralStoreManagers
                    .Where(m => m.ManagerID == managerId)
                    .Select(m => new { m.CentralStoreManagerID, m.CentralPharmacyID, m.IsActive, m.IsCurrent })
                    .ToListAsync();

                Console.WriteLine($"📋 Found {allManagers.Count} record(s) for ManagerID={managerId}:");
                foreach (var m in allManagers)
                {
                    Console.WriteLine($"   - CentralStoreManagerID={m.CentralStoreManagerID}, CentralPharmacyID={m.CentralPharmacyID}, IsActive={m.IsActive}, IsCurrent={m.IsCurrent}");
                }

                // 3. Find the active/current one
                var activeManager = allManagers.FirstOrDefault(m => m.IsActive && m.IsCurrent);
                if (activeManager == null)
                {
                    throw new InvalidOperationException($"No active Central Store Manager assignment found for Manager ID {managerId}. Found {allManagers.Count} record(s) but none with IsActive=true and IsCurrent=true.");
                }

                Console.WriteLine($"✅ Using CentralStoreManagerID = {activeManager.CentralStoreManagerID}");
                return activeManager.CentralStoreManagerID;
            }

       [HttpPost("transfers")]
        public async Task<IActionResult> CreateTransfer([FromBody] TransferCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var centralId = CentralPharmacyId;
                var branch = await _context.BranchPharmacies.FindAsync(dto.BranchPharmacyID);
                if (branch == null)
                    return BadRequest(new { message = "Branch pharmacy not found." });

                var transferDetails = new List<CentralStoreTransferDetail>();
                foreach (var item in dto.Details)
                {
                    var inventoryItems = await _context.CentralStoreInventories
                        .Where(i => i.CentralPharmacyID == centralId && i.MedicineID == item.MedicineID && i.QuantityAvailable > 0)
                        .OrderBy(i => i.ExpiryDate)
                        .ToListAsync();

                    int remaining = item.QuantityTransferred;
                    foreach (var inv in inventoryItems)
                    {
                        if (remaining <= 0) break;
                        float deduct = Math.Min(inv.QuantityAvailable, remaining);
                        inv.QuantityAvailable -= deduct;
                        remaining -= (int)deduct;
                    }

                    if (remaining > 0)
                        return BadRequest(new { message = $"Insufficient stock for medicine ID {item.MedicineID}. Needed {item.QuantityTransferred}, available less." });

                    transferDetails.Add(new CentralStoreTransferDetail
                    {
                        MedicineID = item.MedicineID,
                        QuantityTransferred = item.QuantityTransferred
                    });
                }

                // ✅ Fetches the correct CentralStoreManagerID using ManagerID from token
                var centralStoreManagerId = await GetCurrentCentralStoreManagerId();

                var transfer = new CentralStoreTransfer
                    {
                        CentralPharmacyID = centralId,
                        BranchPharmacyID = dto.BranchPharmacyID,
                        CentralStoreManagerID = centralStoreManagerId,
                        CentralRequestID = dto.CentralRequestID, // can be null
                        TransferDate = DateTime.UtcNow,
                        Status = "Completed",
                        CentralStoreTransferDetail = transferDetails
                    };
                _context.CentralStoreTransfers.Add(transfer);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var response = new TransferResponseDto
                {
                    CentralTransferID = transfer.CentralTransferID,
                    CentralRequestID = dto.CentralRequestID,
                    BranchName = branch.BranchName,
                    TransferDate = transfer.TransferDate,
                    Status = transfer.Status,
                    Details = transferDetails.Select(d => new TransferDetailResponseDto
                    {
                        MedicineID = d.MedicineID,
                        MedicineName = _context.Medicines.Find(d.MedicineID)?.MedicineName ?? "",
                        QuantityTransferred = d.QuantityTransferred
                    }).ToList()
                };

                return CreatedAtAction(nameof(GetTransferDetails), new { id = transfer.CentralTransferID }, response);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // ✅ Return detailed error for debugging
                return StatusCode(500, new { message = "Error creating transfer.", error = ex.Message, stackTrace = ex.StackTrace });
            }
        }
        [HttpGet("transfers")]
        public async Task<IActionResult> GetTransfers([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var centralId = CentralPharmacyId;

                var query = _context.CentralStoreTransfers
                    .Include(t => t.BranchPharmacy)
                    .Where(t => t.CentralPharmacyID == centralId);

                var total = await query.CountAsync();
                var items = await query
                    .OrderByDescending(t => t.TransferDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => new TransferHistoryDto
                    {
                        TransferId = t.CentralTransferID,
                        BranchName = t.BranchPharmacy != null ? t.BranchPharmacy.BranchName : "",
                        TransferDate = t.TransferDate,
                        Status = t.Status,
                        CreatedBy = ""
                    })
                    .ToListAsync();

                return Ok(new { total, page, pageSize, items });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving transfers.", error = ex.Message });
            }
        }

        [HttpGet("transfers/{id}")]
        public async Task<IActionResult> GetTransferDetails(long id)
        {
            try
            {
                var transfer = await _context.CentralStoreTransfers
                    .Include(t => t.BranchPharmacy)
                    .Include(t => t.CentralStoreTransferDetail)
                        .ThenInclude(d => d.Medicine)
                    .FirstOrDefaultAsync(t => t.CentralTransferID == id);

                if (transfer == null)
                    return NotFound(new { message = "Transfer not found." });

                var dto = new TransferResponseDto
                {
                    CentralTransferID = transfer.CentralTransferID,
                    CentralRequestID = transfer.CentralRequestID,
                    BranchName = transfer.BranchPharmacy != null ? transfer.BranchPharmacy.BranchName : "",
                    TransferDate = transfer.TransferDate,
                    Status = transfer.Status,
                    Details = transfer.CentralStoreTransferDetail.Select(d => new TransferDetailResponseDto
                    {
                        MedicineID = d.MedicineID,
                        MedicineName = d.Medicine != null ? d.Medicine.MedicineName : "",
                        QuantityTransferred = d.QuantityTransferred
                    }).ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving transfer details.", error = ex.Message });
            }
        }

        // ========================== REPORTS ==========================

        [HttpGet("reports/stock")]
        public async Task<IActionResult> GetStockReport()
        {
            try
            {
                var centralId = CentralPharmacyId;

                var transfersOut = await _context.CentralStoreTransferDetails
                    .Include(d => d.CentralStoreTransfer)
                    .Where(d => d.CentralStoreTransfer.CentralPharmacyID == centralId)
                    .GroupBy(d => d.MedicineID)
                    .Select(g => new
                    {
                        MedicineID = g.Key,
                        TransferredOut = g.Sum(d => d.QuantityTransferred)
                    })
                    .ToDictionaryAsync(k => k.MedicineID, v => v.TransferredOut);

                var inventory = await _context.CentralStoreInventories
                    .Where(i => i.CentralPharmacyID == centralId)
                    .GroupBy(i => i.MedicineID)
                    .Select(g => new
                    {
                        MedicineID = g.Key,
                        ClosingStock = g.Sum(i => i.QuantityAvailable)
                    })
                    .ToDictionaryAsync(k => k.MedicineID, v => v.ClosingStock);

                var allMedicineIds = transfersOut.Keys.Union(inventory.Keys).ToList();
                var medicines = await _context.Medicines
                    .Where(m => allMedicineIds.Contains(m.MedicineID))
                    .ToDictionaryAsync(m => m.MedicineID, m => m.MedicineName);

                var result = new List<StockMovementReportDto>();
                foreach (var id in allMedicineIds)
                {
                    result.Add(new StockMovementReportDto
                    {
                        MedicineID = id,
                        MedicineName = medicines.GetValueOrDefault(id, ""),
                        OpeningStock = 0,
                        Received = 0,
                        TransferredOut = transfersOut.GetValueOrDefault(id, 0),
                        ClosingStock = inventory.GetValueOrDefault(id, 0)
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating stock report.", error = ex.Message });
            }
        }

        [HttpGet("reports/transfers")]
        public async Task<IActionResult> GetTransferReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var centralId = CentralPharmacyId;

                var query = _context.CentralStoreTransferDetails
                    .Include(d => d.CentralStoreTransfer)
                    .Include(d => d.Medicine)
                    .Where(d => d.CentralStoreTransfer.CentralPharmacyID == centralId);

                if (from.HasValue)
                    query = query.Where(d => d.CentralStoreTransfer.TransferDate >= from.Value);
                if (to.HasValue)
                    query = query.Where(d => d.CentralStoreTransfer.TransferDate <= to.Value);

                var report = await query
                    .Select(d => new MedicineTransferReportDto
                    {
                        TransferId = d.CentralTransferID,
                        BranchName = d.CentralStoreTransfer.BranchPharmacy != null ? d.CentralStoreTransfer.BranchPharmacy.BranchName : "",
                        TransferDate = d.CentralStoreTransfer.TransferDate,
                        MedicineID = d.MedicineID,
                        MedicineName = d.Medicine != null ? d.Medicine.MedicineName : "",
                        Quantity = d.QuantityTransferred
                    })
                    .ToListAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating transfer report.", error = ex.Message });
            }
        }

        [HttpGet("reports/requests")]
        public async Task<IActionResult> GetRequestReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            try
            {
                var query = _context.CentralStoreRequestDetails
                    .Include(d => d.CentralStoreRequest)
                    .Include(d => d.Medicine)
                    .Where(d => d.CentralStoreRequest.BranchPharmacy != null);

                if (from.HasValue)
                    query = query.Where(d => d.CentralStoreRequest.RequestDate >= from.Value);
                if (to.HasValue)
                    query = query.Where(d => d.CentralStoreRequest.RequestDate <= to.Value);

                var report = await query
                    .Select(d => new MedicineRequestReportDto
                    {
                        RequestId = d.CentralRequestID,
                        BranchName = d.CentralStoreRequest.BranchPharmacy != null ? d.CentralStoreRequest.BranchPharmacy.BranchName : "",
                        RequestDate = d.CentralStoreRequest.RequestDate,
                        Status = d.CentralStoreRequest.Status,
                        MedicineID = d.MedicineID,
                        MedicineName = d.Medicine != null ? d.Medicine.MedicineName : "",
                        Requested = d.RequestedQuantity,
                        Approved = d.ApprovedQuantity
                    })
                    .ToListAsync();

                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating request report.", error = ex.Message });
            }
        }

        [HttpGet("branches")]
        [AllowAnonymous] // or keep [Authorize] if you want
        public async Task<IActionResult> GetBranches()
        {
            var branches = await _context.BranchPharmacies
                .Select(b => new { b.BranchPharmacyID, b.BranchName })
                .ToListAsync();
            return Ok(branches);
        }
    }
}