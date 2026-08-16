using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/csm/report")]
    [Authorize(Roles = "CSM")]
    public class CSMReportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CSMReportController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCentralPharmacyId()
        {
            var claim = User.FindFirst("CentralPharmacyID");
            if (claim == null) throw new UnauthorizedAccessException("CentralPharmacyID claim missing");
            return int.Parse(claim.Value);
        }

        [HttpGet("inventory")]
        public async Task<ActionResult<InventoryReportDto>> GetInventoryReport()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var inventory = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId)
                .Select(i => new InventoryListDto
                {
                    CentralInventoryID = i.CentralInventoryID,
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    QuantityAvailable = i.QuantityAvailable,
                    ExpiryDate = i.ExpiryDate,
                    BatchNumber = i.BatchNumber,
                    Source = i.Source
                })
                .OrderBy(i => i.ExpiryDate)
                .ToListAsync();

            return Ok(new InventoryReportDto
            {
                ReportDate = DateTime.UtcNow,
                Inventory = inventory
            });
        }

        [HttpGet("branch-inventory/{branchId}")]
        public async Task<ActionResult<BranchInventoryReportDto>> GetBranchInventoryReport(int branchId)
        {
            var branch = await _context.BranchPharmacies
                .FirstOrDefaultAsync(b => b.BranchPharmacyID == branchId);

            if (branch == null) return NotFound();

            var inventory = await _context.BranchInventories
                .Include(i => i.Medicine)
                .Where(i => i.BranchPharmacyID == branchId)
                .Select(i => new BranchInventoryDto
                {
                    BranchInventoryID = i.BranchInventoryID,
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    QuantityAvailable = i.QuantityAvailable,
                    ExpiryDate = i.ExpiryDate,
                    BatchNumber = i.BatchNumber
                })
                .ToListAsync();

            return Ok(new BranchInventoryReportDto
            {
                BranchPharmacyID = branchId,
                BranchName = branch.BranchName,
                ReportDate = DateTime.UtcNow,
                Inventory = inventory
            });
        }

        [HttpGet("requests")]
        public async Task<ActionResult<RequestReportDto>> GetRequestReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var fromDate = from ?? DateTime.UtcNow.AddMonths(-1);
            var toDate = to ?? DateTime.UtcNow;

            var requests = await _context.CentralStoreRequests
                .Include(r => r.BranchPharmacy)
                .Where(r => r.RequestDate >= fromDate && r.RequestDate <= toDate) // removed invalid filter
                .Select(r => new RequestListDto
                {
                    CentralRequestID = r.CentralRequestID,
                    BranchPharmacyID = r.BranchPharmacyID,
                    BranchName = r.BranchPharmacy.BranchName,
                    RequestDate = r.RequestDate,
                    Status = r.Status,
                    TotalItems = r.CentralStoreRequestDetail.Count
                })
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            return Ok(new RequestReportDto
            {
                FromDate = fromDate,
                ToDate = toDate,
                Requests = requests
            });
        }

        [HttpGet("transfers")]
        public async Task<ActionResult<TransferReportDto>> GetTransferReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var centralPharmacyId = GetCentralPharmacyId();
            var fromDate = from ?? DateTime.UtcNow.AddMonths(-1);
            var toDate = to ?? DateTime.UtcNow;

            var transfers = await _context.CentralStoreTransfers
                .Include(t => t.BranchPharmacy)
                .Where(t => t.CentralPharmacyID == centralPharmacyId && t.TransferDate >= fromDate && t.TransferDate <= toDate)
                .Select(t => new TransferListDto
                {
                    CentralTransferID = t.CentralTransferID,
                    CentralRequestID = t.CentralRequestID,
                    BranchName = t.BranchPharmacy.BranchName,
                    TransferDate = t.TransferDate,
                    Status = t.Status,
                    TotalItems = t.CentralStoreTransferDetail.Count
                })
                .OrderByDescending(t => t.TransferDate)
                .ToListAsync();

            return Ok(new TransferReportDto
            {
                FromDate = fromDate,
                ToDate = toDate,
                Transfers = transfers
            });
        }

        [HttpGet("expiry")]
        public async Task<ActionResult<ExpiryReportDto>> GetExpiryReport()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var expired = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId && i.ExpiryDate < DateTime.UtcNow)
                .Select(i => new ExpiredMedicineDto
                {
                    CentralInventoryID = i.CentralInventoryID,
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    BatchNumber = i.BatchNumber,
                    ExpiryDate = i.ExpiryDate,
                    Quantity = i.QuantityAvailable,
                    DaysOverdue = (int)(DateTime.UtcNow - i.ExpiryDate).TotalDays
                })
                .ToListAsync();

            var nearExpiry = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId && i.ExpiryDate > DateTime.UtcNow && i.ExpiryDate <= DateTime.UtcNow.AddDays(30))
                .Select(i => new NearExpiryMedicineDto
                {
                    CentralInventoryID = i.CentralInventoryID,
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    BatchNumber = i.BatchNumber,
                    ExpiryDate = i.ExpiryDate,
                    Quantity = i.QuantityAvailable,
                    DaysUntilExpiry = (int)(i.ExpiryDate - DateTime.UtcNow).TotalDays
                })
                .ToListAsync();

            return Ok(new ExpiryReportDto
            {
                ReportDate = DateTime.UtcNow,
                Expired = expired,
                NearExpiry = nearExpiry
            });
        }

        [HttpGet("consumption")]
        public async Task<ActionResult<ConsumptionReportDto>> GetConsumptionReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var fromDate = from ?? DateTime.UtcNow.AddMonths(-1);
            var toDate = to ?? DateTime.UtcNow;

            var consumption = await _context.DispenseMedicineDetails
                .Include(d => d.Medicine)
                .Include(d => d.DispenseMedicine)
                .Where(d => d.DispenseMedicine.DispenceDate >= fromDate && d.DispenseMedicine.DispenceDate <= toDate)
                .GroupBy(d => new { d.MedicineID, d.Medicine.MedicineName })
                .Select(g => new MedicineConsumptionDto
                {
                    MedicineID = g.Key.MedicineID,
                    MedicineName = g.Key.MedicineName,
                    TotalConsumed = g.Sum(d => d.QuantityDispenced),
                    NumberOfDispenses = g.Count(),
                    PeriodStart = fromDate,
                    PeriodEnd = toDate
                })
                .OrderByDescending(c => c.TotalConsumed)
                .ToListAsync();

            return Ok(new ConsumptionReportDto
            {
                FromDate = fromDate,
                ToDate = toDate,
                Consumption = consumption
            });
        }

        [HttpGet("inventory-value")]
        public async Task<ActionResult<InventoryValueReportDto>> GetInventoryValueReport()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var items = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId)
                .GroupBy(i => i.MedicineID)
                .Select(g => new MedicineInventoryValueDto
                {
                    MedicineID = g.Key,
                    MedicineName = g.First().Medicine.MedicineName,
                    TotalQuantity = g.Sum(x => x.QuantityAvailable),
                    UnitPrice = g.First().Medicine.UnitPrice
                })
                .ToListAsync();

            var totalValue = items.Sum(x => x.TotalValue);

            return Ok(new InventoryValueReportDto
            {
                ReportDate = DateTime.UtcNow,
                TotalValue = totalValue,
                Items = items
            });
        }

        [HttpGet("stock-movement")]
        public async Task<ActionResult<StockMovementReportDto>> GetStockMovementReport([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var fromDate = from ?? DateTime.UtcNow.AddMonths(-1);
            var toDate = to ?? DateTime.UtcNow;

            return Ok(new StockMovementReportDto
            {
                FromDate = fromDate,
                ToDate = toDate,
                Movements = new List<StockMovementDto>()
            });
        }
    }
}