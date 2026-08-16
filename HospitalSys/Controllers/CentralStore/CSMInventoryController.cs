using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models.Pharmacy.CentralStore;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/csm/inventory")]
    [Authorize(Roles = "CSM")]
    public class CSMInventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CSMInventoryController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCentralPharmacyId()
        {
            var claim = User.FindFirst("CentralPharmacyID");
            if (claim == null) throw new UnauthorizedAccessException("CentralPharmacyID claim missing");
            return int.Parse(claim.Value);
        }

        [HttpPost("receive-purchased")]
        public async Task<IActionResult> ReceivePurchasedMedicine([FromBody] ReceivePurchasedMedicineDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var inventory = new CentralStoreInventory
            {
                CentralPharmacyID = GetCentralPharmacyId(),
                MedicineID = dto.MedicineID,
                QuantityAvailable = dto.Quantity,
                ExpiryDate = dto.ExpiryDate,
                BatchNumber = dto.BatchNumber,
                Source = "Purchase"
            };

            _context.CentralStoreInventories.Add(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Inventory received successfully", inventory.CentralInventoryID });
        }

        [HttpPost("receive-aidstore")]
        public async Task<IActionResult> ReceiveAidStoreTransfer([FromBody] ReceiveAidStoreTransferDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Assuming AidStoreTransfer already exists and we are receiving items from it.
            // We'll just add the items to central inventory.
            foreach (var item in dto.Items)
            {
                var inventory = new CentralStoreInventory
                {
                    CentralPharmacyID = GetCentralPharmacyId(),
                    MedicineID = item.MedicineID,
                    QuantityAvailable = item.Quantity,
                    ExpiryDate = item.ExpiryDate,
                    BatchNumber = item.BatchNumber,
                    Source = "AidStoreTransfer"
                };
                _context.CentralStoreInventories.Add(inventory);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Aid store transfer received successfully" });
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateInventory([FromBody] CreateInventoryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var inventory = new CentralStoreInventory
            {
                CentralPharmacyID = GetCentralPharmacyId(),
                MedicineID = dto.MedicineID,
                QuantityAvailable = dto.QuantityAvailable,
                ExpiryDate = dto.ExpiryDate,
                BatchNumber = dto.BatchNumber,
                Source = dto.Source
            };

            _context.CentralStoreInventories.Add(inventory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInventoryById), new { id = inventory.CentralInventoryID }, inventory);
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateInventory(int id, [FromBody] UpdateInventoryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (id != dto.CentralInventoryID) return BadRequest("ID mismatch");

            var inventory = await _context.CentralStoreInventories.FindAsync(id);
            if (inventory == null) return NotFound();

            inventory.QuantityAvailable = dto.QuantityAvailable;
            inventory.ExpiryDate = dto.ExpiryDate;
            inventory.BatchNumber = dto.BatchNumber;
            inventory.Source = dto.Source;

            await _context.SaveChangesAsync();
            return Ok(inventory);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteInventory(int id)
        {
            var inventory = await _context.CentralStoreInventories.FindAsync(id);
            if (inventory == null) return NotFound();

            _context.CentralStoreInventories.Remove(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Inventory deleted successfully" });
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<InventoryListDto>>> GetAllInventory()
        {
            var list = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == GetCentralPharmacyId())
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

            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryDetailsDto>> GetInventoryById(int id)
        {
            var inventory = await _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .FirstOrDefaultAsync(i => i.CentralInventoryID == id && i.CentralPharmacyID == GetCentralPharmacyId());

            if (inventory == null) return NotFound();

            var result = new InventoryDetailsDto
            {
                CentralInventoryID = inventory.CentralInventoryID,
                CentralPharmacyID = inventory.CentralPharmacyID,
                MedicineID = inventory.MedicineID,
                MedicineName = inventory.Medicine.MedicineName,
                GenericName = inventory.Medicine.GenericName,
                QuantityAvailable = inventory.QuantityAvailable,
                ExpiryDate = inventory.ExpiryDate,
                BatchNumber = inventory.BatchNumber,
                Source = inventory.Source,
                UnitPrice = inventory.Medicine.UnitPrice
            };

            return Ok(result);
        }

        [HttpPost("search")]
        public async Task<ActionResult<List<InventoryListDto>>> SearchInventory([FromBody] InventorySearchDto search)
        {
            var query = _context.CentralStoreInventories
                .Include(i => i.Medicine)
                .Where(i => i.CentralPharmacyID == GetCentralPharmacyId());

            if (search.MedicineID.HasValue)
                query = query.Where(i => i.MedicineID == search.MedicineID);

            if (!string.IsNullOrEmpty(search.MedicineName))
                query = query.Where(i => i.Medicine.MedicineName.Contains(search.MedicineName));

            if (!string.IsNullOrEmpty(search.BatchNumber))
                query = query.Where(i => i.BatchNumber.Contains(search.BatchNumber));

            if (!string.IsNullOrEmpty(search.Source))
                query = query.Where(i => i.Source == search.Source);

            if (search.ExpiryFrom.HasValue)
                query = query.Where(i => i.ExpiryDate >= search.ExpiryFrom);

            if (search.ExpiryTo.HasValue)
                query = query.Where(i => i.ExpiryDate <= search.ExpiryTo);

            var list = await query
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
                .ToListAsync();

            return Ok(list);
        }

        [HttpPost("adjust-stock")]
        public async Task<IActionResult> AdjustStock([FromBody] InventoryAdjustmentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var inventory = await _context.CentralStoreInventories
                .FirstOrDefaultAsync(i => i.CentralInventoryID == dto.CentralInventoryID && i.CentralPharmacyID == GetCentralPharmacyId());

            if (inventory == null) return NotFound();

            // Ensure not negative
            if (inventory.QuantityAvailable + dto.AdjustmentQuantity < 0)
                return BadRequest("Insufficient stock");

            inventory.QuantityAvailable += dto.AdjustmentQuantity;

            // Optionally log adjustment in InventoryHistory (we'll just save)
            await _context.SaveChangesAsync();

            return Ok(new { message = "Stock adjusted", newQuantity = inventory.QuantityAvailable });
        }

        [HttpGet("history")]
        public async Task<ActionResult<List<InventoryHistoryDto>>> GetInventoryHistory()
        {
            // This is a simplified version; you would need a history table.
            // We'll simulate by returning current inventory changes from a hypothetical log.
            // Since we don't have a history table, we return empty list.
            return Ok(new List<InventoryHistoryDto>());
        }

        [HttpGet("low-stock")]
        public async Task<ActionResult<List<LowStockMedicineDto>>> GetLowStock()
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
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("expiring")]
        public async Task<ActionResult<List<ExpiringMedicineDto>>> GetExpiring([FromQuery] int days = 30)
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

        [HttpGet("expired")]
        public async Task<ActionResult<List<ExpiredMedicineDto>>> GetExpired()
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

        [HttpGet("total-inventory-value")]
        public async Task<ActionResult<decimal>> GetTotalInventoryValue()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var total = await _context.CentralStoreInventories
                .Where(i => i.CentralPharmacyID == centralPharmacyId)
                .Join(_context.Medicines,
                    inv => inv.MedicineID,
                    med => med.MedicineID,
                    (inv, med) => new { inv, med })
                .SumAsync(x => (decimal)x.inv.QuantityAvailable * x.med.UnitPrice);

            return Ok(total);
        }
    }
}