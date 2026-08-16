using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/csm/branch")]
    [Authorize(Roles = "CSM")]
    public class CSMBranchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CSMBranchController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCentralPharmacyId()
        {
            var claim = User.FindFirst("CentralPharmacyID");
            if (claim == null) throw new UnauthorizedAccessException("CentralPharmacyID claim missing");
            return int.Parse(claim.Value);
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<BranchPharmacyListDto>>> GetAllBranches()
        {
            var branches = await _context.BranchPharmacies
                .Select(b => new BranchPharmacyListDto
                {
                    BranchPharmacyID = b.BranchPharmacyID,
                    BranchName = b.BranchName,
                    Location = b.Location,
                    TotalMedicines = b.BranchInventory.Count,
                    TotalRequests = b.CentralStoreRequest.Count
                })
                .ToListAsync();

            return Ok(branches);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BranchPharmacyDetailsDto>> GetBranchById(int id)
        {
            var branch = await _context.BranchPharmacies
                .Include(b => b.BranchInventory)
                    .ThenInclude(i => i.Medicine)
                .FirstOrDefaultAsync(b => b.BranchPharmacyID == id);

            if (branch == null) return NotFound();

            var result = new BranchPharmacyDetailsDto
            {
                BranchPharmacyID = branch.BranchPharmacyID,
                BranchName = branch.BranchName,
                Location = branch.Location,
                Inventory = branch.BranchInventory.Select(i => new BranchInventoryDto
                {
                    BranchInventoryID = i.BranchInventoryID,
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    QuantityAvailable = i.QuantityAvailable,
                    ExpiryDate = i.ExpiryDate,
                    BatchNumber = i.BatchNumber
                }).ToList()
            };

            return Ok(result);
        }

        [HttpGet("inventory/{branchId}")]
        public async Task<ActionResult<List<BranchInventoryDto>>> GetBranchInventory(int branchId)
        {
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

            return Ok(inventory);
        }

        [HttpGet("requests/{branchId}")]
        public async Task<ActionResult<List<BranchRequestDto>>> GetBranchRequests(int branchId)
        {
            var requests = await _context.CentralStoreRequests
                .Where(r => r.BranchPharmacyID == branchId)
                .Select(r => new BranchRequestDto
                {
                    CentralRequestID = r.CentralRequestID,
                    RequestDate = r.RequestDate,
                    Status = r.Status,
                    TotalItems = r.CentralStoreRequestDetail.Count
                })
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            return Ok(requests);
        }

        [HttpGet("transfers/{branchId}")]
        public async Task<ActionResult<List<BranchTransferDto>>> GetBranchTransfers(int branchId)
        {
            var transfers = await _context.CentralStoreTransfers
                .Where(t => t.BranchPharmacyID == branchId)
                .Select(t => new BranchTransferDto
                {
                    CentralTransferID = t.CentralTransferID,
                    TransferDate = t.TransferDate,
                    Status = t.Status,
                    TotalItems = t.CentralStoreTransferDetail.Count
                })
                .OrderByDescending(t => t.TransferDate)
                .ToListAsync();

            return Ok(transfers);
        }

        [HttpGet("consumption/{branchId}")]
        public async Task<ActionResult<List<BranchConsumptionDto>>> GetBranchConsumption(int branchId, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var fromDate = from ?? DateTime.UtcNow.AddMonths(-1);
            var toDate = to ?? DateTime.UtcNow;

            var consumption = await _context.DispenseMedicineDetails
                .Include(d => d.DispenseMedicine)
                    .ThenInclude(dm => dm.BranchPharmacy)
                .Include(d => d.Medicine)
                .Where(d => d.DispenseMedicine.BranchPharmacyID == branchId
                            && d.DispenseMedicine.DispenceDate >= fromDate
                            && d.DispenseMedicine.DispenceDate <= toDate)
                .GroupBy(d => new { d.MedicineID, d.Medicine.MedicineName })
                .Select(g => new BranchConsumptionDto
                {
                    BranchPharmacyID = branchId,
                    BranchName = g.First().DispenseMedicine.BranchPharmacy.BranchName,
                    MedicineID = g.Key.MedicineID,
                    MedicineName = g.Key.MedicineName,
                    TotalConsumed = g.Sum(d => d.QuantityDispenced),
                    PeriodStart = fromDate,
                    PeriodEnd = toDate
                })
                .ToListAsync();

            return Ok(consumption);
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<List<LowStockBranchDto>>> GetLowStockBranches()
        {
            var lowStock = await _context.BranchInventories
                .Include(b => b.Medicine)
                .Include(b => b.BranchPharmacy)
                .Where(b => b.QuantityAvailable < 5)
                .Select(b => new LowStockBranchDto
                {
                    BranchPharmacyID = b.BranchPharmacyID,
                    BranchName = b.BranchPharmacy.BranchName,
                    MedicineID = b.MedicineID,
                    MedicineName = b.Medicine.MedicineName,
                    QuantityAvailable = b.QuantityAvailable,
                    ReorderLevel = 5 // placeholder
                })
                .OrderBy(b => b.QuantityAvailable)
                .ToListAsync();

            return Ok(lowStock);
        }
    }
}