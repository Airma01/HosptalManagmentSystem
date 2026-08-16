// using System.Security.Claims;
// using System.Linq.Expressions;
// using HospitalSys.Data;
// using HospitalSys.Dtos.Pharmacy.CentralStore;
// using HospitalSys.Models;
// using HospitalSys.Models.Pharmacy.Branch;
// using HospitalSys.Models.Pharmacy.CentralStore;
// using HospitalSys.Models.Pharmacy.Common;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.Extensions.Logging;

// namespace HospitalSys.Controllers.Pharmacy.CentralStore
// {
//     [ApiController]
//     [Route("Hospital/CSM/[controller]")]
//     [Authorize(Roles = "CSM")]
//     public class CentralStoreController : ControllerBase
//     {
//         private readonly AppDbContext _context;
//         private readonly ILogger<CentralStoreController> _logger;

//         public CentralStoreController(AppDbContext context, ILogger<CentralStoreController> logger)
//         {
//             _context = context;
//             _logger = logger;
//         }

//         #region Private Helpers

//         private int GetAuthenticatedManagerId()
//         {
//             var value = User.FindFirst("ManagerID")?.Value;
//             if (string.IsNullOrEmpty(value) || !int.TryParse(value, out int id))
//                 throw new UnauthorizedAccessException("ManagerID claim not found or invalid.");
//             return id;
//         }

//         private int GetAuthenticatedCentralPharmacyId()
//         {
//             var value = User.FindFirst("CentralPharmacyID")?.Value;
//             if (string.IsNullOrEmpty(value) || !int.TryParse(value, out int id))
//                 throw new UnauthorizedAccessException("CentralPharmacyID claim not found or invalid.");
//             return id;
//         }

//         private async Task<bool> ValidateManagerAsync(int managerId, int centralPharmacyId)
//         {
//             return await _context.CentralStoreManagers
//                 .AnyAsync(csm => csm.CentralStoreManagerID == managerId
//                                  && csm.CentralPharmacyID == centralPharmacyId
//                                  && csm.IsActive
//                                  && csm.IsCurrent);
//         }

//         private IActionResult HandleException(Exception ex)
//         {
//             _logger.LogError(ex, "Error in CentralStoreController.");
//             return ex switch
//             {
//                 UnauthorizedAccessException _ => Unauthorized(new { message = ex.Message }),
//                 KeyNotFoundException _ => NotFound(new { message = ex.Message }),
//                 InvalidOperationException _ => Conflict(new { message = ex.Message }),
//                 ArgumentException _ => BadRequest(new { message = ex.Message }),
//                 _ => StatusCode(500, new { message = "An internal error occurred. Please contact support." })
//             };
//         }

//         #endregion

//         #region 1. Dashboard

//         [HttpGet("dashboard")]
//         public async Task<IActionResult> GetDashboardSummary()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();

//                 var totalMedicines = await _context.Medicines.CountAsync();
//                 var totalBranches = await _context.BranchPharmacies
//                     .Where(b => _context.CentralStoreTransfers
//                         .Any(t => t.CentralPharmacyID == cpId && t.BranchPharmacyID == b.BranchPharmacyID))
//                     .Distinct()
//                     .CountAsync();

//                 var pendingRequests = await _context.CentralStoreRequests
//                     .Where(r => r.Status == RequestStatus.Pending.ToString())
//                     .CountAsync();

//                 var todayTransfers = await _context.CentralStoreTransfers
//                     .CountAsync(t => t.CentralPharmacyID == cpId
//                                      && t.TransferDate.Date == DateTime.UtcNow.Date);

//                 var totalValue = await _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId)
//                     .SumAsync(i => (decimal)i.QuantityAvailable * (i.Medicine!.UnitPrice));

//                 var lowStockItems = await _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId && i.QuantityAvailable < 50)
//                     .CountAsync();

//                 var expiringItems = await _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId
//                                 && i.ExpiryDate <= DateTime.UtcNow.AddDays(30)
//                                 && i.ExpiryDate > DateTime.UtcNow)
//                     .CountAsync();

//                 var overdueRequests = await _context.CentralStoreRequests
//                     .Where(r => r.Status == RequestStatus.Pending.ToString()
//                                 && r.RequestDate < DateTime.UtcNow.AddHours(-48))
//                     .CountAsync();

//                 return Ok(new DashboardSummaryDto
//                 {
//                     TotalMedicines = totalMedicines,
//                     TotalBranches = totalBranches,
//                     PendingRequests = pendingRequests,
//                     TodayTransfers = todayTransfers,
//                     TotalInventoryValue = totalValue,
//                     LowStockItems = lowStockItems,
//                     ExpiringItems = expiringItems,
//                     OverdueRequests = overdueRequests,
//                     GeneratedAt = DateTime.UtcNow
//                 });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("dashboard/pending-requests")]
//         public async Task<IActionResult> GetPendingRequestCount()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var count = await _context.CentralStoreRequests
//                     .Where(r => r.Status == RequestStatus.Pending.ToString())
//                     .CountAsync();
//                 return Ok(new { count });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("dashboard/today-transfers")]
//         public async Task<IActionResult> GetTodayTransferCount()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var count = await _context.CentralStoreTransfers
//                     .CountAsync(t => t.CentralPharmacyID == cpId
//                                      && t.TransferDate.Date == DateTime.UtcNow.Date);
//                 return Ok(new { count });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("dashboard/low-stock")]
//         public async Task<IActionResult> GetLowStockMedicines()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var result = await _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId && i.QuantityAvailable < 50)
//                     .GroupBy(i => new { i.MedicineID, i.Medicine!.MedicineName, i.Medicine.GenericName, i.Source })
//                     .Select(g => new LowStockMedicineDto
//                     {
//                         MedicineID = g.Key.MedicineID,
//                         MedicineName = g.Key.MedicineName,
//                         GenericName = g.Key.GenericName,
//                         QuantityAvailable = g.Sum(x => x.QuantityAvailable),
//                         ReorderLevel = 50,
//                         BatchCount = g.Count(),
//                         EarliestExpiry = g.Min(x => x.ExpiryDate),
//                         Source = g.Key.Source ?? ""
//                     })
//                     .OrderBy(d => d.QuantityAvailable)
//                     .ToListAsync();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("dashboard/expiring")]
//         public async Task<IActionResult> GetExpiringMedicines()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var today = DateTime.UtcNow;
//                 var result = await _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId
//                                 && i.ExpiryDate <= today.AddDays(30)
//                                 && i.ExpiryDate > today)
//                     .Select(i => new ExpiringMedicineDto
//                     {
//                         MedicineID = i.MedicineID,
//                         MedicineName = i.Medicine!.MedicineName,
//                         GenericName = i.Medicine.GenericName,
//                         BatchNumber = i.BatchNumber,
//                         ExpiryDate = i.ExpiryDate,
//                         DaysUntilExpiry = EF.Functions.DateDiffDay(today, i.ExpiryDate),
//                         QuantityAvailable = i.QuantityAvailable,
//                         UnitPrice = i.Medicine.UnitPrice,
//                         TotalValue = (decimal)i.QuantityAvailable * i.Medicine.UnitPrice,
//                         Source = i.Source
//                     })
//                     .OrderBy(d => d.ExpiryDate)
//                     .ToListAsync();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("dashboard/inventory-value")]
//         public async Task<IActionResult> GetTotalInventoryValue()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var value = await _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId)
//                     .SumAsync(i => (decimal)i.QuantityAvailable * i.Medicine!.UnitPrice);
//                 return Ok(new { totalValue = value });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 2. Central Inventory Management

//         [HttpGet("inventory")]
//         public async Task<IActionResult> GetInventory()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var result = await _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId)
//                     .Include(i => i.Medicine)
//                     .Select(i => new CentralInventoryDto
//                     {
//                         CentralInventoryID = i.CentralInventoryID,
//                         MedicineID = i.MedicineID,
//                         MedicineName = i.Medicine!.MedicineName,
//                         GenericName = i.Medicine.GenericName,
//                         BatchNumber = i.BatchNumber,
//                         ExpiryDate = i.ExpiryDate,
//                         QuantityAvailable = i.QuantityAvailable,
//                         UnitPrice = i.Medicine.UnitPrice,
//                         TotalValue = (decimal)i.QuantityAvailable * i.Medicine.UnitPrice,
//                         Source = i.Source
//                     })
//                     .ToListAsync();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("inventory/{id}")]
//         public async Task<IActionResult> GetInventoryById(int id)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var item = await _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId && i.CentralInventoryID == id)
//                     .Include(i => i.Medicine)
//                     .Include(i => i.CentralStorePharmacy)
//                     .FirstOrDefaultAsync();

//                 if (item == null)
//                     return NotFound(new { message = $"Inventory item {id} not found." });

//                 var result = new CentralInventoryDetailDto
//                 {
//                     CentralInventoryID = item.CentralInventoryID,
//                     CentralPharmacyID = item.CentralPharmacyID,
//                     CentralPharmacyName = item.CentralStorePharmacy?.Name ?? "Central Store",
//                     MedicineID = item.MedicineID,
//                     MedicineName = item.Medicine!.MedicineName,
//                     GenericName = item.Medicine.GenericName,
//                     BatchNumber = item.BatchNumber,
//                     ExpiryDate = item.ExpiryDate,
//                     QuantityAvailable = item.QuantityAvailable,
//                     ReservedQuantity = 0,
//                     AvailableQuantity = (int)item.QuantityAvailable,
//                     UnitPrice = item.Medicine.UnitPrice,
//                     TotalValue = (decimal)item.QuantityAvailable * item.Medicine.UnitPrice,
//                     Source = item.Source,
//                     CostPrice = item.Medicine.UnitPrice,
//                     SellingPrice = item.Medicine.UnitPrice * 1.2m,
//                     LocationInStore = ""
//                 };

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("inventory/medicine/{medicineId}")]
//         public async Task<IActionResult> GetMedicineInventory(int medicineId)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var result = await _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId && i.MedicineID == medicineId)
//                     .Include(i => i.Medicine)
//                     .Select(i => new CentralInventoryDto
//                     {
//                         CentralInventoryID = i.CentralInventoryID,
//                         MedicineID = i.MedicineID,
//                         MedicineName = i.Medicine!.MedicineName,
//                         GenericName = i.Medicine.GenericName,
//                         BatchNumber = i.BatchNumber,
//                         ExpiryDate = i.ExpiryDate,
//                         QuantityAvailable = i.QuantityAvailable,
//                         UnitPrice = i.Medicine.UnitPrice,
//                         TotalValue = (decimal)i.QuantityAvailable * i.Medicine.UnitPrice,
//                         Source = i.Source
//                     })
//                     .ToListAsync();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("inventory/search")]
//         public async Task<IActionResult> SearchInventory([FromQuery] InventorySearchDto dto)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var query = _context.CentralStoreInventories
//                     .Where(i => i.CentralPharmacyID == cpId)
//                     .Include(i => i.Medicine)
//                     .AsQueryable();

//                 if (!string.IsNullOrEmpty(dto.SearchTerm))
//                     query = query.Where(i => i.Medicine!.MedicineName.Contains(dto.SearchTerm)
//                                              || i.Medicine.GenericName.Contains(dto.SearchTerm));

//                 if (dto.MedicineID.HasValue)
//                     query = query.Where(i => i.MedicineID == dto.MedicineID.Value);

//                 if (!string.IsNullOrEmpty(dto.BatchNumber))
//                     query = query.Where(i => i.BatchNumber.Contains(dto.BatchNumber));

//                 if (dto.ExpiryDateFrom.HasValue)
//                     query = query.Where(i => i.ExpiryDate >= dto.ExpiryDateFrom.Value);

//                 if (dto.ExpiryDateTo.HasValue)
//                     query = query.Where(i => i.ExpiryDate <= dto.ExpiryDateTo.Value);

//                 if (dto.MinQuantity.HasValue)
//                     query = query.Where(i => i.QuantityAvailable >= dto.MinQuantity.Value);

//                 if (dto.MaxQuantity.HasValue)
//                     query = query.Where(i => i.QuantityAvailable <= dto.MaxQuantity.Value);

//                 var totalCount = await query.CountAsync();

//                 if (!string.IsNullOrEmpty(dto.SortBy))
//                 {
//                     var sortExpr = dto.SortBy.ToLower() switch
//                     {
//                         "medicinename" => (Expression<Func<CentralStoreInventory, object>>)(i => i.Medicine!.MedicineName),
//                         "expirydate" => i => i.ExpiryDate,
//                         "quantityavailable" => i => i.QuantityAvailable,
//                         _ => (Expression<Func<CentralStoreInventory, object>>)(i => i.Medicine!.MedicineName)
//                     };
//                     query = dto.SortDescending ? query.OrderByDescending(sortExpr) : query.OrderBy(sortExpr);
//                 }

//                 var items = await query
//                     .Skip((dto.PageNumber - 1) * dto.PageSize)
//                     .Take(dto.PageSize)
//                     .Select(i => new CentralInventoryDto
//                     {
//                         CentralInventoryID = i.CentralInventoryID,
//                         MedicineID = i.MedicineID,
//                         MedicineName = i.Medicine!.MedicineName,
//                         GenericName = i.Medicine.GenericName,
//                         BatchNumber = i.BatchNumber,
//                         ExpiryDate = i.ExpiryDate,
//                         QuantityAvailable = i.QuantityAvailable,
//                         UnitPrice = i.Medicine.UnitPrice,
//                         TotalValue = (decimal)i.QuantityAvailable * i.Medicine.UnitPrice,
//                         Source = i.Source
//                     })
//                     .ToListAsync();

//                 return Ok(new InventoryPaginatedDto
//                 {
//                     Items = items,
//                     TotalCount = totalCount,
//                     PageNumber = dto.PageNumber,
//                     PageSize = dto.PageSize,
//                     TotalPages = (int)Math.Ceiling(totalCount / (double)dto.PageSize)
//                 });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 3. Branch Request Management

//         [HttpGet("requests/pending")]
//         public async Task<IActionResult> GetPendingRequests()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var requests = await _context.CentralStoreRequests
//                     .Where(r => r.Status == RequestStatus.Pending.ToString() && branchIds.Contains(r.BranchPharmacyID))
//                     .Include(r => r.BranchPharmacy)
//                     .Include(r => r.Pharmacist)
//                     .Include(r => r.CentralStoreRequestDetail)!
//                         .ThenInclude(d => d.Medicine)
//                     .ToListAsync();

//                 var result = requests.Select(r => new CentralStoreRequestDto
//                 {
//                     CentralRequestID = r.CentralRequestID,
//                     BranchPharmacyID = r.BranchPharmacyID,
//                     BranchName = r.BranchPharmacy?.BranchName ?? "Unknown",
//                     RequestedByPharmacistID = r.RequestedByPharmacistID,
//                     PharmacistName = r.Pharmacist?.Users?.FirstName ?? "Pharmacist",
//                     RequestDate = r.RequestDate,
//                     Status = Enum.Parse<RequestStatus>(r.Status),
//                     RejectionReason = r.RejectionReason,
//                     ApprovedByManagerID = r.ApprovedByManagerID,
//                     ApprovedDate = r.ApprovalDate,
//                     Details = r.CentralStoreRequestDetail?.Select(d => new CentralStoreRequestDetailDto
//                     {
//                         CentralRequestDetailID = d.CentralRequestDetailID,
//                         MedicineID = d.MedicineID,
//                         MedicineName = d.Medicine?.MedicineName ?? "Unknown",
//                         GenericName = d.Medicine?.GenericName ?? "Unknown",
//                         RequestedQuantity = d.RequestedQuantity,
//                         ApprovedQuantity = d.ApprovedQuantity,
//                         UnitOfMeasure = d.Medicine?.UnitOfMeasure,
//                         UnitPrice = d.Medicine?.UnitPrice ?? 0,
//                         TotalValue = (decimal)d.ApprovedQuantity * (d.Medicine?.UnitPrice ?? 0)
//                     }).ToList() ?? new List<CentralStoreRequestDetailDto>()
//                 }).ToList();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("requests/approved")]
//         public async Task<IActionResult> GetApprovedRequests()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var requests = await _context.CentralStoreRequests
//                     .Where(r => (r.Status == RequestStatus.Approved.ToString() || r.Status == RequestStatus.PartiallyApproved.ToString())
//                                 && branchIds.Contains(r.BranchPharmacyID))
//                     .Include(r => r.BranchPharmacy)
//                     .Include(r => r.Pharmacist)
//                     .Include(r => r.CentralStoreRequestDetail)!
//                         .ThenInclude(d => d.Medicine)
//                     .ToListAsync();

//                 var result = requests.Select(r => new CentralStoreRequestDto
//                 {
//                     CentralRequestID = r.CentralRequestID,
//                     BranchPharmacyID = r.BranchPharmacyID,
//                     BranchName = r.BranchPharmacy?.BranchName ?? "Unknown",
//                     RequestedByPharmacistID = r.RequestedByPharmacistID,
//                     PharmacistName = r.Pharmacist?.Users?.FirstName ?? "Pharmacist",
//                     RequestDate = r.RequestDate,
//                     Status = Enum.Parse<RequestStatus>(r.Status),
//                     RejectionReason = r.RejectionReason,
//                     ApprovedByManagerID = r.ApprovedByManagerID,
//                     ApprovedDate = r.ApprovalDate,
//                     Details = r.CentralStoreRequestDetail?.Select(d => new CentralStoreRequestDetailDto
//                     {
//                         CentralRequestDetailID = d.CentralRequestDetailID,
//                         MedicineID = d.MedicineID,
//                         MedicineName = d.Medicine?.MedicineName ?? "Unknown",
//                         GenericName = d.Medicine?.GenericName ?? "Unknown",
//                         RequestedQuantity = d.RequestedQuantity,
//                         ApprovedQuantity = d.ApprovedQuantity,
//                         UnitOfMeasure = d.Medicine?.UnitOfMeasure,
//                         UnitPrice = d.Medicine?.UnitPrice ?? 0,
//                         TotalValue = (decimal)d.ApprovedQuantity * (d.Medicine?.UnitPrice ?? 0)
//                     }).ToList() ?? new List<CentralStoreRequestDetailDto>()
//                 }).ToList();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("requests/rejected")]
//         public async Task<IActionResult> GetRejectedRequests()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var requests = await _context.CentralStoreRequests
//                     .Where(r => r.Status == RequestStatus.Rejected.ToString() && branchIds.Contains(r.BranchPharmacyID))
//                     .Include(r => r.BranchPharmacy)
//                     .Include(r => r.Pharmacist)
//                     .Include(r => r.CentralStoreRequestDetail)!
//                         .ThenInclude(d => d.Medicine)
//                     .ToListAsync();

//                 var result = requests.Select(r => new CentralStoreRequestDto
//                 {
//                     CentralRequestID = r.CentralRequestID,
//                     BranchPharmacyID = r.BranchPharmacyID,
//                     BranchName = r.BranchPharmacy?.BranchName ?? "Unknown",
//                     RequestedByPharmacistID = r.RequestedByPharmacistID,
//                     PharmacistName = r.Pharmacist?.Users?.FirstName ?? "Pharmacist",
//                     RequestDate = r.RequestDate,
//                     Status = Enum.Parse<RequestStatus>(r.Status),
//                     RejectionReason = r.RejectionReason,
//                     ApprovedByManagerID = r.ApprovedByManagerID,
//                     ApprovedDate = r.ApprovalDate,
//                     Details = r.CentralStoreRequestDetail?.Select(d => new CentralStoreRequestDetailDto
//                     {
//                         CentralRequestDetailID = d.CentralRequestDetailID,
//                         MedicineID = d.MedicineID,
//                         MedicineName = d.Medicine?.MedicineName ?? "Unknown",
//                         GenericName = d.Medicine?.GenericName ?? "Unknown",
//                         RequestedQuantity = d.RequestedQuantity,
//                         ApprovedQuantity = d.ApprovedQuantity,
//                         UnitOfMeasure = d.Medicine?.UnitOfMeasure,
//                         UnitPrice = d.Medicine?.UnitPrice ?? 0,
//                         TotalValue = (decimal)d.ApprovedQuantity * (d.Medicine?.UnitPrice ?? 0)
//                     }).ToList() ?? new List<CentralStoreRequestDetailDto>()
//                 }).ToList();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("requests/{requestId}")]
//         public async Task<IActionResult> GetRequestById(int requestId)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var r = await _context.CentralStoreRequests
//                     .Where(req => req.CentralRequestID == requestId && branchIds.Contains(req.BranchPharmacyID))
//                     .Include(req => req.BranchPharmacy)
//                     .Include(req => req.Pharmacist)
//                     .Include(req => req.CentralStoreRequestDetail)!
//                         .ThenInclude(d => d.Medicine)
//                     .FirstOrDefaultAsync();

//                 if (r == null)
//                     return NotFound(new { message = $"Request {requestId} not found." });

//                 var result = new CentralStoreRequestDto
//                 {
//                     CentralRequestID = r.CentralRequestID,
//                     BranchPharmacyID = r.BranchPharmacyID,
//                     BranchName = r.BranchPharmacy?.BranchName ?? "Unknown",
//                     RequestedByPharmacistID = r.RequestedByPharmacistID,
//                     PharmacistName = r.Pharmacist?.Users?.FirstName ?? "Pharmacist",
//                     RequestDate = r.RequestDate,
//                     Status = Enum.Parse<RequestStatus>(r.Status),
//                     RejectionReason = r.RejectionReason,
//                     ApprovedByManagerID = r.ApprovedByManagerID,
//                     ApprovedDate = r.ApprovalDate,
//                     Details = r.CentralStoreRequestDetail?.Select(d => new CentralStoreRequestDetailDto
//                     {
//                         CentralRequestDetailID = d.CentralRequestDetailID,
//                         MedicineID = d.MedicineID,
//                         MedicineName = d.Medicine?.MedicineName ?? "Unknown",
//                         GenericName = d.Medicine?.GenericName ?? "Unknown",
//                         RequestedQuantity = d.RequestedQuantity,
//                         ApprovedQuantity = d.ApprovedQuantity,
//                         UnitOfMeasure = d.Medicine?.UnitOfMeasure,
//                         UnitPrice = d.Medicine?.UnitPrice ?? 0,
//                         TotalValue = (decimal)d.ApprovedQuantity * (d.Medicine?.UnitPrice ?? 0)
//                     }).ToList() ?? new List<CentralStoreRequestDetailDto>()
//                 };

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("requests/{requestId}/approve")]
//         public async Task<IActionResult> ApproveRequest(int requestId, [FromBody] ApproveRequestDto dto)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var managerId = GetAuthenticatedManagerId();

//                 if (!await ValidateManagerAsync(managerId, cpId))
//                     return Unauthorized(new { message = "Manager not authorized for this Central Store." });

//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var request = await _context.CentralStoreRequests
//                     .Where(r => r.CentralRequestID == requestId && branchIds.Contains(r.BranchPharmacyID))
//                     .Include(r => r.CentralStoreRequestDetail)!
//                         .ThenInclude(d => d.Medicine)
//                     .FirstOrDefaultAsync();

//                 if (request == null)
//                     return NotFound(new { message = $"Request {requestId} not found." });

//                 if (request.Status != RequestStatus.Pending.ToString())
//                     return Conflict(new { message = $"Request is already {request.Status} and cannot be approved." });

//                 foreach (var detail in request.CentralStoreRequestDetail)
//                 {
//                     var availableQty = await _context.CentralStoreInventories
//                         .Where(i => i.CentralPharmacyID == cpId && i.MedicineID == detail.MedicineID)
//                         .SumAsync(i => i.QuantityAvailable);

//                     if (availableQty < detail.RequestedQuantity)
//                         throw new InvalidOperationException($"Insufficient stock for '{detail.Medicine?.MedicineName}'. Available: {availableQty}, Requested: {detail.RequestedQuantity}");
//                 }

//                 foreach (var detail in request.CentralStoreRequestDetail)
//                     detail.ApprovedQuantity = detail.RequestedQuantity;

//                 request.Status = RequestStatus.Approved.ToString();
//                 request.ApprovedByManagerID = managerId;
//                 request.ApprovalDate = DateTime.UtcNow;
//                 request.RejectionReason = null;

//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Request approved successfully.", requestId = request.CentralRequestID });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("requests/{requestId}/reject")]
//         public async Task<IActionResult> RejectRequest(int requestId, [FromBody] RejectRequestDto dto)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var managerId = GetAuthenticatedManagerId();

//                 if (!await ValidateManagerAsync(managerId, cpId))
//                     return Unauthorized(new { message = "Manager not authorized for this Central Store." });

//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var request = await _context.CentralStoreRequests
//                     .FirstOrDefaultAsync(r => r.CentralRequestID == requestId && branchIds.Contains(r.BranchPharmacyID));

//                 if (request == null)
//                     return NotFound(new { message = $"Request {requestId} not found." });

//                 if (request.Status != RequestStatus.Pending.ToString())
//                     return Conflict(new { message = $"Request is already {request.Status} and cannot be rejected." });

//                 request.Status = RequestStatus.Rejected.ToString();
//                 request.RejectionReason = dto.RejectionReason;
//                 request.ApprovedByManagerID = managerId;
//                 request.ApprovalDate = DateTime.UtcNow;

//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Request rejected successfully.", requestId = request.CentralRequestID });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("requests/{requestId}/partial-approve")]
//         public async Task<IActionResult> PartialApproveRequest(int requestId, [FromBody] PartialApprovalDto dto)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var managerId = GetAuthenticatedManagerId();

//                 if (!await ValidateManagerAsync(managerId, cpId))
//                     return Unauthorized(new { message = "Manager not authorized for this Central Store." });

//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var request = await _context.CentralStoreRequests
//                     .Where(r => r.CentralRequestID == requestId && branchIds.Contains(r.BranchPharmacyID))
//                     .Include(r => r.CentralStoreRequestDetail)!
//                         .ThenInclude(d => d.Medicine)
//                     .FirstOrDefaultAsync();

//                 if (request == null)
//                     return NotFound(new { message = $"Request {requestId} not found." });

//                 if (request.Status != RequestStatus.Pending.ToString())
//                     return Conflict(new { message = $"Request is already {request.Status}." });

//                 foreach (var item in dto.Items)
//                 {
//                     var detail = request.CentralStoreRequestDetail
//                         .FirstOrDefault(d => d.CentralRequestDetailID == item.CentralRequestDetailID);
//                     if (detail == null) continue;

//                     if (item.ApprovedQuantity > detail.RequestedQuantity)
//                         throw new ArgumentException($"Approved quantity exceeds requested for '{detail.Medicine?.MedicineName}'.");

//                     var availableQty = await _context.CentralStoreInventories
//                         .Where(i => i.CentralPharmacyID == cpId && i.MedicineID == detail.MedicineID)
//                         .SumAsync(i => i.QuantityAvailable);

//                     if (availableQty < item.ApprovedQuantity)
//                         throw new InvalidOperationException($"Insufficient stock for '{detail.Medicine?.MedicineName}'.");

//                     detail.ApprovedQuantity = item.ApprovedQuantity;
//                     detail.RejectionReason = item.RejectionReason;
//                 }

//                 bool allApproved = request.CentralStoreRequestDetail.All(d => d.ApprovedQuantity > 0);
//                 bool anyApproved = request.CentralStoreRequestDetail.Any(d => d.ApprovedQuantity > 0);

//                 request.Status = allApproved ? RequestStatus.Approved.ToString()
//                               : anyApproved ? RequestStatus.PartiallyApproved.ToString()
//                               : RequestStatus.Rejected.ToString();
//                 request.ApprovedByManagerID = managerId;
//                 request.ApprovalDate = DateTime.UtcNow;
//                 request.RejectionReason = dto.OverallNotes;

//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Request partially approved successfully.", requestId = request.CentralRequestID });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 4. Transfer Management (Atomic)

//         [HttpPost("transfers")]
//         public async Task<IActionResult> CreateTransfer([FromBody] CreateTransferDto dto)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var managerId = GetAuthenticatedManagerId();

//                 if (!await ValidateManagerAsync(managerId, cpId))
//                     return Unauthorized(new { message = "Manager not authorized." });

//                 var branch = await _context.BranchPharmacies.FindAsync(dto.BranchPharmacyID);
//                 if (branch == null)
//                     return NotFound(new { message = $"Branch {dto.BranchPharmacyID} not found." });

//                 foreach (var item in dto.Items)
//                 {
//                     var inventory = await _context.CentralStoreInventories
//                         .FirstOrDefaultAsync(i => i.CentralPharmacyID == cpId
//                                                   && i.MedicineID == item.MedicineID
//                                                   && i.BatchNumber == item.BatchNumber);

//                     if (inventory == null)
//                         return NotFound(new { message = $"Batch {item.BatchNumber} for Medicine {item.MedicineID} not found." });

//                     if (inventory.QuantityAvailable < item.Quantity)
//                         return Conflict(new { message = $"Insufficient stock for batch {item.BatchNumber}." });
//                 }

//                 var transfer = new CentralStoreTransfer
//                 {
//                     CentralPharmacyID = cpId,
//                     BranchPharmacyID = dto.BranchPharmacyID,
//                     CentralStoreManagerID = managerId,
//                     TransferDate = DateTime.UtcNow,
//                     Status = TransferStatus.Draft.ToString(),
//                     CentralRequestID = dto.CentralRequestID,
//                     CentralStoreTransferDetail = dto.Items.Select(i => new CentralStoreTransferDetail
//                     {
//                         MedicineID = i.MedicineID,
//                         QuantityTransferred = i.Quantity,
//                         BatchNumber = i.BatchNumber
//                     }).ToList()
//                 };

//                 _context.CentralStoreTransfers.Add(transfer);
//                 await _context.SaveChangesAsync();

//                 return CreatedAtAction(nameof(GetTransferById), new { transferId = transfer.CentralTransferID }, new { transferId = transfer.CentralTransferID });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("transfers/{transferId}/execute")]
//         public async Task<IActionResult> ExecuteTransfer(int transferId)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var managerId = GetAuthenticatedManagerId();

//                 if (!await ValidateManagerAsync(managerId, cpId))
//                     return Unauthorized(new { message = "Manager not authorized." });

//                 var transfer = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralTransferID == transferId && t.CentralPharmacyID == cpId)
//                     .Include(t => t.CentralStoreTransferDetail)!
//                         .ThenInclude(d => d.Medicine)
//                     .Include(t => t.BranchPharmacy)
//                     .FirstOrDefaultAsync();

//                 if (transfer == null)
//                     return NotFound(new { message = $"Transfer {transferId} not found." });

//                 if (transfer.Status != TransferStatus.Draft.ToString())
//                     return Conflict(new { message = $"Transfer is {transfer.Status} and cannot be executed." });

//                 await using var transaction = await _context.Database.BeginTransactionAsync();

//                 try
//                 {
//                     foreach (var detail in transfer.CentralStoreTransferDetail)
//                     {
//                         var centralInventory = await _context.CentralStoreInventories
//                             .FirstOrDefaultAsync(i => i.CentralPharmacyID == cpId
//                                                       && i.MedicineID == detail.MedicineID
//                                                       && i.BatchNumber == detail.BatchNumber);

//                         if (centralInventory == null)
//                             throw new KeyNotFoundException($"Batch {detail.BatchNumber} not found.");

//                         if (centralInventory.QuantityAvailable < detail.QuantityTransferred)
//                             throw new InvalidOperationException($"Insufficient stock for '{detail.Medicine?.MedicineName}'.");

//                         // Deduct Central
//                         centralInventory.QuantityAvailable -= detail.QuantityTransferred;
//                         _context.CentralStoreInventories.Update(centralInventory);

//                         // Add to Branch
//                         var branchInventory = await _context.BranchInventories
//                             .FirstOrDefaultAsync(b => b.BranchPharmacyID == transfer.BranchPharmacyID
//                                                       && b.MedicineID == detail.MedicineID
//                                                       && b.BatchNumber == detail.BatchNumber);

//                         if (branchInventory == null)
//                         {
//                             branchInventory = new BranchInventory
//                             {
//                                 BranchPharmacyID = transfer.BranchPharmacyID,
//                                 MedicineID = detail.MedicineID,
//                                 QuantityAvailable = 0,
//                                 ExpiryDate = centralInventory.ExpiryDate,
//                                 BatchNumber = detail.BatchNumber
//                             };
//                             _context.BranchInventories.Add(branchInventory);
//                         }
//                         branchInventory.QuantityAvailable += detail.QuantityTransferred;
//                         _context.BranchInventories.Update(branchInventory);

//                         // Transaction History - Out
//                         _context.InventoryTransactions.Add(new InventoryTransaction
//                         {
//                             TransactionType = TransactionType.TransferOut,
//                             MedicineID = detail.MedicineID,
//                             BatchNumber = detail.BatchNumber,
//                             Quantity = detail.QuantityTransferred,
//                             UnitPrice = detail.Medicine?.UnitPrice ?? 0,
//                             SourceStoreType = StoreType.CentralStore,
//                             SourceStoreID = cpId,
//                             DestinationStoreType = StoreType.BranchPharmacy,
//                             DestinationStoreID = transfer.BranchPharmacyID,
//                             ReferenceNumber = transfer.CentralTransferID.ToString(),
//                             ReferenceID = transfer.CentralTransferID,
//                             CreatedByUserID = managerId,
//                             Notes = $"Transfer #{transfer.CentralTransferID} to {transfer.BranchPharmacy?.BranchName}"
//                         });

//                         // Transaction History - In
//                         _context.InventoryTransactions.Add(new InventoryTransaction
//                         {
//                             TransactionType = TransactionType.TransferIn,
//                             MedicineID = detail.MedicineID,
//                             BatchNumber = detail.BatchNumber,
//                             Quantity = detail.QuantityTransferred,
//                             UnitPrice = detail.Medicine?.UnitPrice ?? 0,
//                             SourceStoreType = StoreType.CentralStore,
//                             SourceStoreID = cpId,
//                             DestinationStoreType = StoreType.BranchPharmacy,
//                             DestinationStoreID = transfer.BranchPharmacyID,
//                             ReferenceNumber = transfer.CentralTransferID.ToString(),
//                             ReferenceID = transfer.CentralTransferID,
//                             CreatedByUserID = managerId,
//                             Notes = $"Transfer #{transfer.CentralTransferID} from Central Store"
//                         });
//                     }

//                     transfer.Status = TransferStatus.Completed.ToString();
//                     transfer.TransferDate = DateTime.UtcNow;
//                     _context.CentralStoreTransfers.Update(transfer);

//                     await _context.SaveChangesAsync();
//                     await transaction.CommitAsync();

//                     return Ok(new { message = "Transfer executed successfully.", transferId = transfer.CentralTransferID });
//                 }
//                 catch
//                 {
//                     await transaction.RollbackAsync();
//                     throw;
//                 }
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("transfers/{transferId}/cancel")]
//         public async Task<IActionResult> CancelTransfer(int transferId)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var managerId = GetAuthenticatedManagerId();

//                 if (!await ValidateManagerAsync(managerId, cpId))
//                     return Unauthorized(new { message = "Manager not authorized." });

//                 var transfer = await _context.CentralStoreTransfers
//                     .FirstOrDefaultAsync(t => t.CentralTransferID == transferId && t.CentralPharmacyID == cpId);

//                 if (transfer == null)
//                     return NotFound(new { message = $"Transfer {transferId} not found." });

//                 if (transfer.Status == TransferStatus.Completed.ToString())
//                     return Conflict(new { message = "Cannot cancel a completed transfer." });

//                 transfer.Status = TransferStatus.Cancelled.ToString();
//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Transfer cancelled successfully.", transferId = transfer.CentralTransferID });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("transfers")]
//         public async Task<IActionResult> GetTransferHistory([FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var query = _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Include(t => t.BranchPharmacy)
//                     .Include(t => t.CentralStoreTransferDetail)!
//                         .ThenInclude(d => d.Medicine)
//                     .AsQueryable();

//                 if (from.HasValue) query = query.Where(t => t.TransferDate >= from.Value);
//                 if (to.HasValue) query = query.Where(t => t.TransferDate <= to.Value);

//                 var result = await query
//                     .OrderByDescending(t => t.TransferDate)
//                     .Select(t => new TransferHistoryDto
//                     {
//                         CentralTransferID = t.CentralTransferID,
//                         CentralRequestID = t.CentralRequestID,
//                         BranchName = t.BranchPharmacy!.BranchName,
//                         TransferDate = t.TransferDate,
//                         Status = Enum.Parse<TransferStatus>(t.Status),
//                         TotalItems = t.CentralStoreTransferDetail.Count,
//                         TotalQuantity = t.CentralStoreTransferDetail.Sum(d => d.QuantityTransferred),
//                         TotalValue = t.CentralStoreTransferDetail.Sum(d => (decimal)d.QuantityTransferred * d.Medicine!.UnitPrice),
//                         CreatedBy = t.CentralStoreManager?.MainPharmacyManager?.Users?.FirstName ?? "Unknown",
//                         ReceivedDate = null
//                     })
//                     .ToListAsync();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("transfers/{transferId}")]
//         public async Task<IActionResult> GetTransferById(int transferId)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var transfer = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralTransferID == transferId && t.CentralPharmacyID == cpId)
//                     .Include(t => t.CentralStoreTransferDetail)!
//                         .ThenInclude(d => d.Medicine)
//                     .Include(t => t.BranchPharmacy)
//                     .Include(t => t.CentralStorePharmacy)
//                     .Include(t => t.CentralStoreManager)!
//                         .ThenInclude(m => m.MainPharmacyManager)!
//                             .ThenInclude(mp => mp.Users)
//                     .FirstOrDefaultAsync();

//                 if (transfer == null)
//                     return NotFound(new { message = $"Transfer {transferId} not found." });

//                 var details = new List<TransferDetailDto>();
//                 foreach (var detail in transfer.CentralStoreTransferDetail)
//                 {
//                     details.Add(new TransferDetailDto
//                     {
//                         CentralTransferDetailID = detail.CentralTransferDetailID,
//                         MedicineID = detail.MedicineID,
//                         MedicineName = detail.Medicine?.MedicineName ?? "Unknown",
//                         GenericName = detail.Medicine?.GenericName ?? "Unknown",
//                         QuantityTransferred = detail.QuantityTransferred,
//                         BatchNumber = detail.BatchNumber,
//                         ExpiryDate = DateTime.UtcNow,
//                         UnitPrice = detail.Medicine?.UnitPrice ?? 0,
//                         TotalValue = (decimal)detail.QuantityTransferred * (detail.Medicine?.UnitPrice ?? 0),
//                         Source = ""
//                     });
//                 }

//                 var result = new CentralStoreTransferDto
//                 {
//                     CentralTransferID = transfer.CentralTransferID,
//                     CentralRequestID = transfer.CentralRequestID,
//                     CentralPharmacyID = transfer.CentralPharmacyID,
//                     CentralPharmacyName = transfer.CentralStorePharmacy?.Name ?? "Central Store",
//                     BranchPharmacyID = transfer.BranchPharmacyID,
//                     BranchName = transfer.BranchPharmacy?.BranchName ?? "Unknown",
//                     CentralStoreManagerID = transfer.CentralStoreManagerID,
//                     ManagerName = transfer.CentralStoreManager?.MainPharmacyManager?.Users?.FirstName ?? "Manager",
//                     TransferDate = transfer.TransferDate,
//                     Status = Enum.Parse<TransferStatus>(transfer.Status),
//                     Details = details
//                 };

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 5. Branch Inventory Monitoring

//         [HttpGet("branches")]
//         public async Task<IActionResult> GetAllBranchPharmacies()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var result = await _context.BranchPharmacies
//                     .Where(b => branchIds.Contains(b.BranchPharmacyID))
//                     .Select(b => new BranchSummaryDto
//                     {
//                         BranchPharmacyID = b.BranchPharmacyID,
//                         BranchName = b.BranchName,
//                         Location = b.Location,
//                         TotalInventoryItems = b.BranchInventory.Count,
//                         TotalInventoryValue = b.BranchInventory.Sum(i => (decimal)i.QuantityAvailable * i.Medicine!.UnitPrice),
//                         PendingRequests = _context.CentralStoreRequests.Count(r => r.BranchPharmacyID == b.BranchPharmacyID && r.Status == RequestStatus.Pending.ToString()),
//                         TodayDispenses = _context.DispenseMedicin.Count(d => d.BranchPharmacyID == b.BranchPharmacyID && d.DispenceDate.Date == DateTime.UtcNow.Date),
//                         IsActive = true,
//                         LastStockUpdate = b.BranchInventory.Max(i => (DateTime?)i.ExpiryDate)
//                     })
//                     .ToListAsync();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("branches/{branchId}/inventory")]
//         public async Task<IActionResult> GetBranchInventory(int branchId)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var isServed = await _context.CentralStoreTransfers
//                     .AnyAsync(t => t.CentralPharmacyID == cpId && t.BranchPharmacyID == branchId);

//                 if (!isServed)
//                     return Unauthorized(new { message = "Not authorized to view this branch." });

//                 var result = await _context.BranchInventories
//                     .Where(b => b.BranchPharmacyID == branchId)
//                     .Include(b => b.Medicine)
//                     .Select(b => new BranchInventoryDto
//                     {
//                         BranchInventoryID = b.BranchInventoryID,
//                         BranchPharmacyID = b.BranchPharmacyID,
//                         BranchName = b.BranchPharmacy!.BranchName,
//                         MedicineID = b.MedicineID,
//                         MedicineName = b.Medicine!.MedicineName,
//                         GenericName = b.Medicine.GenericName,
//                         QuantityAvailable = b.QuantityAvailable,
//                         ExpiryDate = b.ExpiryDate,
//                         BatchNumber = b.BatchNumber,
//                         UnitPrice = b.Medicine.UnitPrice,
//                         TotalValue = (decimal)b.QuantityAvailable * b.Medicine.UnitPrice,
//                         ReorderLevel = 50,
//                         IsLowStock = b.QuantityAvailable < 50,
//                         IsExpiringSoon = b.ExpiryDate <= DateTime.UtcNow.AddDays(30) && b.ExpiryDate > DateTime.UtcNow
//                     })
//                     .ToListAsync();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("branches/{branchId}/stock-status")]
//         public async Task<IActionResult> GetBranchStockStatus(int branchId)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var isServed = await _context.CentralStoreTransfers
//                     .AnyAsync(t => t.CentralPharmacyID == cpId && t.BranchPharmacyID == branchId);

//                 if (!isServed)
//                     return Unauthorized(new { message = "Not authorized to view this branch." });

//                 var branch = await _context.BranchPharmacies
//                     .Include(b => b.BranchInventory)!
//                         .ThenInclude(i => i.Medicine)
//                     .FirstOrDefaultAsync(b => b.BranchPharmacyID == branchId);

//                 if (branch == null)
//                     return NotFound(new { message = $"Branch {branchId} not found." });

//                 var result = new BranchStockStatusDto
//                 {
//                     BranchPharmacyID = branchId,
//                     BranchName = branch.BranchName,
//                     Location = branch.Location,
//                     TotalMedicineSKUs = branch.BranchInventory.Select(i => i.MedicineID).Distinct().Count(),
//                     TotalQuantity = branch.BranchInventory.Sum(i => i.QuantityAvailable),
//                     TotalStockValue = branch.BranchInventory.Sum(i => (decimal)i.QuantityAvailable * i.Medicine!.UnitPrice),
//                     LowStockCount = branch.BranchInventory.Count(i => i.QuantityAvailable < 50),
//                     ExpiringCount = branch.BranchInventory.Count(i => i.ExpiryDate <= DateTime.UtcNow.AddDays(30) && i.ExpiryDate > DateTime.UtcNow),
//                     OutOfStockCount = branch.BranchInventory.Count(i => i.QuantityAvailable == 0),
//                     LastUpdated = DateTime.UtcNow
//                 };

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("branches/{branchId}/inventory/medicine/{medicineId}")]
//         public async Task<IActionResult> GetBranchMedicineStock(int branchId, int medicineId)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var isServed = await _context.CentralStoreTransfers
//                     .AnyAsync(t => t.CentralPharmacyID == cpId && t.BranchPharmacyID == branchId);

//                 if (!isServed)
//                     return Unauthorized(new { message = "Not authorized to view this branch." });

//                 var result = await _context.BranchInventories
//                     .Where(b => b.BranchPharmacyID == branchId && b.MedicineID == medicineId)
//                     .Include(b => b.Medicine)
//                     .Select(b => new BranchInventoryDto
//                     {
//                         BranchInventoryID = b.BranchInventoryID,
//                         BranchPharmacyID = b.BranchPharmacyID,
//                         BranchName = b.BranchPharmacy!.BranchName,
//                         MedicineID = b.MedicineID,
//                         MedicineName = b.Medicine!.MedicineName,
//                         GenericName = b.Medicine.GenericName,
//                         QuantityAvailable = b.QuantityAvailable,
//                         ExpiryDate = b.ExpiryDate,
//                         BatchNumber = b.BatchNumber,
//                         UnitPrice = b.Medicine.UnitPrice,
//                         TotalValue = (decimal)b.QuantityAvailable * b.Medicine.UnitPrice,
//                         ReorderLevel = 50,
//                         IsLowStock = b.QuantityAvailable < 50,
//                         IsExpiringSoon = b.ExpiryDate <= DateTime.UtcNow.AddDays(30) && b.ExpiryDate > DateTime.UtcNow
//                     })
//                     .ToListAsync();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 6. Dispensing Monitoring (Stubs - Full implementation can be added later)

//         [HttpGet("reports/dispensing")]
//         public async Task<IActionResult> GetBranchDispensingReport([FromQuery] int? branchId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 // Full implementation would join DispenseMedicine with BranchPharmacy
//                 return Ok(new List<DispensingReportDto>());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("reports/consumption")]
//         public async Task<IActionResult> GetMedicineConsumptionReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 return Ok(new List<MedicineConsumptionDto>());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("reports/dispensing/daily")]
//         public async Task<IActionResult> GetDailyDispensingReport([FromQuery] DateTime date)
//         {
//             try
//             {
//                 return Ok(new DailyDispensingDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("reports/dispensing/monthly")]
//         public async Task<IActionResult> GetMonthlyDispensingReport([FromQuery] int year, [FromQuery] int month)
//         {
//             try
//             {
//                 return Ok(new MonthlyDispensingDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 7. Audits (Stubs - Full implementation can be added later)

//         [HttpPost("audits/branches/{branchId}")]
//         public async Task<IActionResult> AuditBranchInventory(int branchId)
//         {
//             try
//             {
//                 return Ok(new AuditReportDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("audits/transfers/{transferId}")]
//         public async Task<IActionResult> VerifyTransfer(int transferId)
//         {
//             try
//             {
//                 return Ok(new TransferVerificationDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("audits/branches/{branchId}/variance")]
//         public async Task<IActionResult> InvestigateVariance(int branchId)
//         {
//             try
//             {
//                 return Ok(new AuditReportDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("audits/branches/{branchId}/verify-stock")]
//         public async Task<IActionResult> VerifyStockCount(int branchId, [FromBody] VerifyStockDto dto)
//         {
//             try
//             {
//                 return Ok(new InventoryVarianceDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 8. Stock Adjustment Approval (Stubs)

//         [HttpGet("adjustments/pending")]
//         public async Task<IActionResult> GetPendingAdjustments()
//         {
//             try
//             {
//                 return Ok(new List<StockAdjustmentDto>());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("adjustments/{adjustmentId}/approve")]
//         public async Task<IActionResult> ApproveStockAdjustment(int adjustmentId, [FromBody] ApproveAdjustmentDto dto)
//         {
//             try
//             {
//                 return Ok(new StockAdjustmentDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("adjustments/{adjustmentId}/reject")]
//         public async Task<IActionResult> RejectStockAdjustment(int adjustmentId, [FromBody] RejectAdjustmentDto dto)
//         {
//             try
//             {
//                 return Ok(new StockAdjustmentDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 9. Medicine Returns (Full Implementation)

//         [HttpGet("returns/pending")]
//         public async Task<IActionResult> GetPendingReturns()
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var returns = await _context.MedicineReturns
//                     .Where(r => r.Status == ReturnStatus.Pending && branchIds.Contains(r.BranchPharmacyID))
//                     .Include(r => r.BranchPharmacy)
//                     .Include(r => r.Pharmacist)
//                     .Include(r => r.Medicine)
//                     .ToListAsync();

//                 var result = returns.Select(r => new MedicineReturnDto
//                 {
//                     ReturnID = r.ReturnID,
//                     BranchPharmacyID = r.BranchPharmacyID,
//                     BranchName = r.BranchPharmacy?.BranchName ?? "Unknown",
//                     MedicineID = r.MedicineID,
//                     MedicineName = r.Medicine?.MedicineName ?? "Unknown",
//                     BatchNumber = r.BatchNumber,
//                     QuantityReturned = r.QuantityReturned,
//                     Status = r.Status,
//                     Reason = r.Reason,
//                     RequestedByPharmacistID = r.RequestedByPharmacistID,
//                     RequestedByPharmacistName = r.Pharmacist?.Users?.FirstName ?? "Pharmacist",
//                     RequestedDate = r.RequestedDate,
//                     ApprovedByManagerID = r.ApprovedByManagerID,
//                     ApprovedDate = r.ApprovedDate,
//                     ReceivedDate = r.ReceivedDate,
//                     RejectionReason = r.RejectionReason,
//                     Notes = r.Notes,
//                     TotalRefundValue = r.TotalRefundValue,
//                     IsRefundProcessed = r.IsRefundProcessed
//                 }).ToList();

//                 return Ok(result);
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("returns/{returnId}/approve")]
//         public async Task<IActionResult> ApproveReturn(int returnId, [FromBody] ApproveReturnDto dto)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var managerId = GetAuthenticatedManagerId();

//                 if (!await ValidateManagerAsync(managerId, cpId))
//                     return Unauthorized(new { message = "Manager not authorized." });

//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var returnRequest = await _context.MedicineReturns
//                     .FirstOrDefaultAsync(r => r.ReturnID == returnId && branchIds.Contains(r.BranchPharmacyID));

//                 if (returnRequest == null)
//                     return NotFound(new { message = $"Return {returnId} not found." });

//                 if (returnRequest.Status != ReturnStatus.Pending)
//                     return Conflict(new { message = $"Return is already {returnRequest.Status}." });

//                 returnRequest.Status = ReturnStatus.Approved;
//                 returnRequest.ApprovedByManagerID = managerId;
//                 returnRequest.ApprovedDate = DateTime.UtcNow;
//                 returnRequest.Notes = dto.Notes;

//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Return approved successfully.", returnId = returnRequest.ReturnID });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("returns/{returnId}/reject")]
//         public async Task<IActionResult> RejectReturn(int returnId, [FromBody] RejectReturnDto dto)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var managerId = GetAuthenticatedManagerId();

//                 if (!await ValidateManagerAsync(managerId, cpId))
//                     return Unauthorized(new { message = "Manager not authorized." });

//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var returnRequest = await _context.MedicineReturns
//                     .FirstOrDefaultAsync(r => r.ReturnID == returnId && branchIds.Contains(r.BranchPharmacyID));

//                 if (returnRequest == null)
//                     return NotFound(new { message = $"Return {returnId} not found." });

//                 if (returnRequest.Status != ReturnStatus.Pending)
//                     return Conflict(new { message = $"Return is already {returnRequest.Status}." });

//                 returnRequest.Status = ReturnStatus.Rejected;
//                 returnRequest.RejectionReason = dto.RejectionReason;

//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Return rejected successfully.", returnId = returnRequest.ReturnID });
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpPost("returns/{returnId}/receive")]
//         public async Task<IActionResult> ReceiveReturnedMedicine(int returnId, [FromBody] ReceiveReturnedMedicineDto dto)
//         {
//             try
//             {
//                 var cpId = GetAuthenticatedCentralPharmacyId();
//                 var managerId = GetAuthenticatedManagerId();

//                 if (!await ValidateManagerAsync(managerId, cpId))
//                     return Unauthorized(new { message = "Manager not authorized." });

//                 var branchIds = await _context.CentralStoreTransfers
//                     .Where(t => t.CentralPharmacyID == cpId)
//                     .Select(t => t.BranchPharmacyID)
//                     .Distinct()
//                     .ToListAsync();

//                 var returnRequest = await _context.MedicineReturns
//                     .Include(r => r.Medicine)
//                     .FirstOrDefaultAsync(r => r.ReturnID == returnId && branchIds.Contains(r.BranchPharmacyID));

//                 if (returnRequest == null)
//                     return NotFound(new { message = $"Return {returnId} not found." });

//                 if (returnRequest.Status != ReturnStatus.Approved)
//                     return Conflict(new { message = $"Return is {returnRequest.Status}. Only Approved returns can be received." });

//                 var quantityToReceive = dto.QuantityReceived > 0 ? dto.QuantityReceived : returnRequest.QuantityReturned;

//                 await using var transaction = await _context.Database.BeginTransactionAsync();

//                 try
//                 {
//                     // 1. Deduct from Branch Inventory
//                     var branchInventory = await _context.BranchInventories
//                         .FirstOrDefaultAsync(b => b.BranchPharmacyID == returnRequest.BranchPharmacyID
//                                                   && b.MedicineID == returnRequest.MedicineID
//                                                   && b.BatchNumber == returnRequest.BatchNumber);

//                     if (branchInventory == null || branchInventory.QuantityAvailable < quantityToReceive)
//                         return Conflict(new { message = "Branch does not have sufficient stock of this batch to return." });

//                     branchInventory.QuantityAvailable -= quantityToReceive;
//                     _context.BranchInventories.Update(branchInventory);

//                     // 2. Handle Central Inventory based on reason
//                     if (returnRequest.Reason == "Expired" || returnRequest.Reason == "Damaged")
//                     {
//                         // Write off - no restock to central
//                         _context.InventoryTransactions.Add(new InventoryTransaction
//                         {
//                             TransactionType = TransactionType.ExpiryWriteOff,
//                             MedicineID = returnRequest.MedicineID,
//                             BatchNumber = returnRequest.BatchNumber,
//                             Quantity = quantityToReceive,
//                             UnitPrice = returnRequest.Medicine?.UnitPrice ?? 0,
//                             SourceStoreType = StoreType.BranchPharmacy,
//                             SourceStoreID = returnRequest.BranchPharmacyID,
//                             DestinationStoreType = StoreType.CentralStore,
//                             DestinationStoreID = cpId,
//                             ReferenceNumber = returnRequest.ReturnID.ToString(),
//                             ReferenceID = returnRequest.ReturnID,
//                             CreatedByUserID = managerId,
//                             Notes = $"Returned as {returnRequest.Reason} from branch"
//                         });
//                     }
//                     else
//                     {
//                         // Restock to Central Inventory
//                         var centralInventory = await _context.CentralStoreInventories
//                             .FirstOrDefaultAsync(c => c.CentralPharmacyID == cpId
//                                                       && c.MedicineID == returnRequest.MedicineID
//                                                       && c.BatchNumber == returnRequest.BatchNumber);

//                         if (centralInventory == null)
//                         {
//                             centralInventory = new CentralStoreInventory
//                             {
//                                 CentralPharmacyID = cpId,
//                                 MedicineID = returnRequest.MedicineID,
//                                 QuantityAvailable = 0,
//                                 ExpiryDate = DateTime.UtcNow.AddMonths(6),
//                                 BatchNumber = returnRequest.BatchNumber,
//                                 Source = "Return"
//                             };
//                             _context.CentralStoreInventories.Add(centralInventory);
//                         }
//                         centralInventory.QuantityAvailable += quantityToReceive;
//                         _context.CentralStoreInventories.Update(centralInventory);

//                         _context.InventoryTransactions.Add(new InventoryTransaction
//                         {
//                             TransactionType = TransactionType.TransferIn,
//                             MedicineID = returnRequest.MedicineID,
//                             BatchNumber = returnRequest.BatchNumber,
//                             Quantity = quantityToReceive,
//                             UnitPrice = returnRequest.Medicine?.UnitPrice ?? 0,
//                             SourceStoreType = StoreType.BranchPharmacy,
//                             SourceStoreID = returnRequest.BranchPharmacyID,
//                             DestinationStoreType = StoreType.CentralStore,
//                             DestinationStoreID = cpId,
//                             ReferenceNumber = returnRequest.ReturnID.ToString(),
//                             ReferenceID = returnRequest.ReturnID,
//                             CreatedByUserID = managerId,
//                             Notes = $"Return restocked from branch"
//                         });
//                     }

//                     returnRequest.Status = ReturnStatus.Completed;
//                     returnRequest.ReceivedDate = DateTime.UtcNow;
//                     returnRequest.ReceivedByManagerID = managerId;
//                     returnRequest.QuantityReturned = quantityToReceive;
//                     returnRequest.Notes = dto.ConditionNotes;

//                     await _context.SaveChangesAsync();
//                     await transaction.CommitAsync();

//                     return Ok(new { message = "Return received successfully.", returnId = returnRequest.ReturnID });
//                 }
//                 catch
//                 {
//                     await transaction.RollbackAsync();
//                     throw;
//                 }
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 10. Reports (Stubs)

//         [HttpGet("reports/inventory")]
//         public async Task<IActionResult> GetInventoryReport([FromQuery] DateTime? asOfDate)
//         {
//             try
//             {
//                 return Ok(new InventoryReportDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("reports/transfers")]
//         public async Task<IActionResult> GetTransferReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 return Ok(new TransferReportDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("reports/requests")]
//         public async Task<IActionResult> GetRequestReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 return Ok(new RequestReportDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("reports/consumption")]
//         public async Task<IActionResult> GetConsumptionReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 return Ok(new ConsumptionReportDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("reports/expiry")]
//         public async Task<IActionResult> GetExpiryReport([FromQuery] DateTime? asOfDate)
//         {
//             try
//             {
//                 return Ok(new ExpiryReportDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("reports/branch-performance")]
//         public async Task<IActionResult> GetBranchPerformanceReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 return Ok(new List<BranchPerformanceDto>());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("reports/stock-movement")]
//         public async Task<IActionResult> GetStockMovementReport([FromQuery] int medicineId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 return Ok(new List<StockMovementReportDto>());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion

//         #region 11. Transaction History (Stubs - Full implementation can be added later)

//         [HttpGet("inventory-transactions")]
//         public async Task<IActionResult> GetInventoryTransactions([FromQuery] int? medicineId, [FromQuery] int? branchId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 return Ok(new List<InventoryTransactionDto>());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("inventory-transactions/medicine/{medicineId}")]
//         public async Task<IActionResult> GetMedicineTransactionHistory(int medicineId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
//         {
//             try
//             {
//                 return Ok(new MedicineTransactionHistoryDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         [HttpGet("inventory-transactions/transfer/{transferId}")]
//         public async Task<IActionResult> GetTransferTransactions(int transferId)
//         {
//             try
//             {
//                 return Ok(new TransferTransactionHistoryDto());
//             }
//             catch (Exception ex) { return HandleException(ex); }
//         }

//         #endregion
//     }

//     #region Supporting DTOs (Not in main DTO file)

//     public class VerifyStockDto
//     {
//         public int MedicineID { get; set; }
//         public string BatchNumber { get; set; } = "";
//         public float ActualQuantity { get; set; }
//     }

//     #endregion
// }