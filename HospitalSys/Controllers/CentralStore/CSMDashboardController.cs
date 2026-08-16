using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto;
using System.Security.Claims;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/csm/dashboard")]
    [Authorize(Roles = "CSM")]
    public class CSMDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CSMDashboardController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCentralPharmacyId()
        {
            var claim = User.FindFirst("CentralPharmacyID");
            if (claim == null) throw new UnauthorizedAccessException("CentralPharmacyID claim missing");
            return int.Parse(claim.Value);
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            // Removed invalid .CentralStoreRequest filter
            var pending = await _context.CentralStoreRequests
                .Where(r => r.Status == "Pending")
                .CountAsync();

            var approved = await _context.CentralStoreRequests
                .Where(r => r.Status == "Approved")
                .CountAsync();

            var rejected = await _context.CentralStoreRequests
                .Where(r => r.Status == "Rejected")
                .CountAsync();

            var todayTransfers = await _context.CentralStoreTransfers
                .Where(t => t.CentralPharmacyID == centralPharmacyId && t.TransferDate.Date == DateTime.UtcNow.Date)
                .CountAsync();

            var lowStock = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId && i.QuantityAvailable < 10)
                .Select(i => new LowStockMedicineDto
                {
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    GenericName = i.Medicine.GenericName,
                    QuantityAvailable = i.QuantityAvailable,
                    ReorderLevel = 10,
                    UnitOfMeasure = i.Medicine.UnitOfMeasure,
                    IsCritical = i.QuantityAvailable < 5
                })
                .ToListAsync();

            var expiring = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId && i.ExpiryDate <= DateTime.UtcNow.AddDays(30))
                .Select(i => new ExpiringMedicineDto
                {
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    BatchNumber = i.BatchNumber,
                    ExpiryDate = i.ExpiryDate,
                    QuantityAvailable = i.QuantityAvailable,
                    DaysUntilExpiry = (int)(i.ExpiryDate - DateTime.UtcNow).TotalDays
                })
                .ToListAsync();

            var totalValue = await _context.CentralStoreInventories
                .Where(i => i.CentralPharmacyID == centralPharmacyId)
                .Join(_context.Medicines,
                    inv => inv.MedicineID,
                    med => med.MedicineID,
                    (inv, med) => new { inv, med })
                .SumAsync(x => (decimal)x.inv.QuantityAvailable * x.med.UnitPrice);

            var branchAlerts = await _context.BranchInventories
                .Include(b => b.Medicine)
                .Include(b => b.BranchPharmacy)
                .Where(b => b.QuantityAvailable < 5)
                .Select(b => new BranchAlertDto
                {
                    BranchPharmacyID = b.BranchPharmacyID,
                    BranchName = b.BranchPharmacy.BranchName,
                    MedicineID = b.MedicineID,
                    MedicineName = b.Medicine.MedicineName,
                    QuantityAvailable = b.QuantityAvailable,
                    AlertType = "LowStock"
                })
                .Take(5)
                .ToListAsync();

            return Ok(new DashboardSummaryDto
            {
                PendingRequests = pending,
                ApprovedRequests = approved,
                RejectedRequests = rejected,
                TodayTransfers = todayTransfers,
                TotalInventoryValue = totalValue,
                LowStockMedicines = lowStock,
                ExpiringMedicines = expiring,
                BranchAlerts = branchAlerts
            });
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var medicines = await _context.Medicines.CountAsync();
            var branches = await _context.BranchPharmacies.CountAsync();
            // Removed invalid .CentralStoreRequest filter
            var requests = await _context.CentralStoreRequests.CountAsync();
            var transfers = await _context.CentralStoreTransfers
                .Where(t => t.CentralPharmacyID == centralPharmacyId)
                .CountAsync();
            var inventoryValue = await _context.CentralStoreInventories
                .Where(i => i.CentralPharmacyID == centralPharmacyId)
                .Join(_context.Medicines,
                    inv => inv.MedicineID,
                    med => med.MedicineID,
                    (inv, med) => new { inv, med })
                .SumAsync(x => (decimal)x.inv.QuantityAvailable * x.med.UnitPrice);

            return Ok(new DashboardStatsDto
            {
                TotalMedicines = medicines,
                TotalBranches = branches,
                TotalRequests = requests,
                TotalTransfers = transfers,
                TotalInventoryValue = inventoryValue
            });
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<List<LowStockMedicineDto>>> GetLowStockMedicines()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var list = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId && i.QuantityAvailable < 10)
                .Select(i => new LowStockMedicineDto
                {
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    GenericName = i.Medicine.GenericName,
                    QuantityAvailable = i.QuantityAvailable,
                    ReorderLevel = 10,
                    UnitOfMeasure = i.Medicine.UnitOfMeasure,
                    IsCritical = i.QuantityAvailable < 5
                })
                .OrderBy(m => m.QuantityAvailable)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("expiring-medicines")]
        public async Task<ActionResult<List<ExpiringMedicineDto>>> GetExpiringMedicines([FromQuery] int days = 30)
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var list = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId && i.ExpiryDate <= DateTime.UtcNow.AddDays(days))
                .Select(i => new ExpiringMedicineDto
                {
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    BatchNumber = i.BatchNumber,
                    ExpiryDate = i.ExpiryDate,
                    QuantityAvailable = i.QuantityAvailable,
                    DaysUntilExpiry = (int)(i.ExpiryDate - DateTime.UtcNow).TotalDays
                })
                .OrderBy(m => m.DaysUntilExpiry)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("inventory-value")]
        public async Task<ActionResult<List<InventoryValueDto>>> GetInventoryValue()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var list = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId)
                .GroupBy(i => i.MedicineID)
                .Select(g => new InventoryValueDto
                {
                    MedicineID = g.Key,
                    MedicineName = g.First().Medicine.MedicineName,
                    QuantityAvailable = g.Sum(x => x.QuantityAvailable),
                    UnitPrice = g.First().Medicine.UnitPrice,
                    TotalValue = (decimal)g.Sum(x => x.QuantityAvailable) * g.First().Medicine.UnitPrice
                })
                .OrderByDescending(x => x.TotalValue)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("branch-alerts")]
        public async Task<ActionResult<List<BranchAlertDto>>> GetBranchAlerts()
        {
            var alerts = await _context.BranchInventories
                .Include(b => b.Medicine)
                .Include(b => b.BranchPharmacy)
                .Where(b => b.QuantityAvailable < 5)
                .Select(b => new BranchAlertDto
                {
                    BranchPharmacyID = b.BranchPharmacyID,
                    BranchName = b.BranchPharmacy.BranchName,
                    MedicineID = b.MedicineID,
                    MedicineName = b.Medicine.MedicineName,
                    QuantityAvailable = b.QuantityAvailable,
                    AlertType = "LowStock"
                })
                .Take(10)
                .ToListAsync();

            return Ok(alerts);
        }
    }
}