using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/csm/monitoring")]
    [Authorize(Roles = "CSM")]
    public class CSMMonitoringController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CSMMonitoringController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCentralPharmacyId()
        {
            var claim = User.FindFirst("CentralPharmacyID");
            if (claim == null) throw new UnauthorizedAccessException("CentralPharmacyID claim missing");
            return int.Parse(claim.Value);
        }

        [HttpGet("expired")]
        public async Task<ActionResult<List<ExpiredMedicineDto>>> GetExpiredMedicines()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var list = await _context.CentralStoreInventories
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
                .OrderByDescending(m => m.DaysOverdue)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("near-expiry")]
        public async Task<ActionResult<List<NearExpiryMedicineDto>>> GetNearExpiry([FromQuery] int days = 30)
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var list = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId && i.ExpiryDate > DateTime.UtcNow && i.ExpiryDate <= DateTime.UtcNow.AddDays(days))
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
                .OrderBy(m => m.DaysUntilExpiry)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("critical-stock")]
        public async Task<ActionResult<List<CriticalStockDto>>> GetCriticalStock()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var list = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId && i.QuantityAvailable < 5)
                .GroupBy(i => i.MedicineID)
                .Select(g => new CriticalStockDto
                {
                    MedicineID = g.Key,
                    MedicineName = g.First().Medicine.MedicineName,
                    QuantityAvailable = g.Sum(x => x.QuantityAvailable),
                    ReorderLevel = 5, // placeholder
                    UnitOfMeasure = g.First().Medicine.UnitOfMeasure
                })
                .OrderBy(m => m.QuantityAvailable)
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("replenishment-suggestions")]
        public async Task<ActionResult<List<ReplenishmentSuggestionDto>>> GetReplenishmentSuggestions()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            // Suggest replenishment for medicines below reorder level
            var suggestions = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == centralPharmacyId)
                .GroupBy(i => i.MedicineID)
                .Select(g => new
                {
                    MedicineID = g.Key,
                    MedicineName = g.First().Medicine.MedicineName,
                    CurrentStock = g.Sum(x => x.QuantityAvailable),
                    ReorderLevel = 10 // placeholder
                })
                .Where(x => x.CurrentStock < x.ReorderLevel)
                .Select(x => new ReplenishmentSuggestionDto
                {
                    MedicineID = x.MedicineID,
                    MedicineName = x.MedicineName,
                    CurrentStock = x.CurrentStock,
                    ReorderLevel = x.ReorderLevel,
                    SuggestedOrderQuantity = x.ReorderLevel - x.CurrentStock + 5, // plus buffer
                    Priority = x.CurrentStock < 5 ? "High" : "Medium"
                })
                .OrderByDescending(s => s.Priority)
                .ToListAsync();

            return Ok(suggestions);
        }

        [HttpGet("medicine-movement/{medicineId}")]
        public async Task<ActionResult<MedicineMovementDto>> GetMedicineMovement(int medicineId)
        {
            // Get movements from inventory, transfers, dispenses etc.
            // This is a simplified aggregation.
            var movements = new List<InventoryMovementDto>();

            // Transfers out (from central)
            var transfersOut = await _context.CentralStoreTransferDetails
                .Include(d => d.CentralStoreTransfer)
                .Where(d => d.MedicineID == medicineId && d.CentralStoreTransfer.CentralPharmacyID == GetCentralPharmacyId())
                .Select(d => new InventoryMovementDto
                {
                    InventoryID = d.CentralTransferDetailID,
                    MedicineID = d.MedicineID,
                    MedicineName = d.Medicine.MedicineName,
                    MovementType = "Transfer Out",
                    QuantityChange = -d.QuantityTransferred,
                    RemainingQuantity = 0, // we'd need to compute
                    MovementDate = d.CentralStoreTransfer.TransferDate,
                    Reference = $"Transfer {d.CentralStoreTransfer.CentralTransferID}"
                })
                .ToListAsync();

            movements.AddRange(transfersOut);

            // Received from AidStore or Purchase (we don't have direct events, but we can infer from inventory source)
            var receipts = await _context.CentralStoreInventories
                .Where(i => i.MedicineID == medicineId && i.CentralPharmacyID == GetCentralPharmacyId())
                .Select(i => new InventoryMovementDto
                {
                    InventoryID = i.CentralInventoryID,
                    MedicineID = i.MedicineID,
                    MedicineName = i.Medicine.MedicineName,
                    MovementType = $"Receipt ({i.Source})",
                    QuantityChange = i.QuantityAvailable, // not accurate, but placeholder
                    RemainingQuantity = 0,
                    MovementDate = DateTime.UtcNow, // we don't have created date
                    Reference = i.BatchNumber
                })
                .ToListAsync();

            movements.AddRange(receipts);

            var result = new MedicineMovementDto
            {
                MedicineID = medicineId,
                MedicineName = movements.FirstOrDefault()?.MedicineName ?? "",
                Movements = movements
            };

            return Ok(result);
        }

        [HttpGet("inventory-audit")]
        public async Task<ActionResult<List<InventoryAuditDto>>> GetInventoryAudit([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            // If you have an audit log table, query it.
            // Otherwise, return empty.
            return Ok(new List<InventoryAuditDto>());
        }
    }
}