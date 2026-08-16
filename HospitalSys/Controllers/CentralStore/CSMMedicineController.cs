using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/csm/medicine")]
    [Authorize(Roles = "CSM")]
    public class CSMMedicineController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CSMMedicineController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCentralPharmacyId()
        {
            var claim = User.FindFirst("CentralPharmacyID");
            if (claim == null) throw new UnauthorizedAccessException("CentralPharmacyID claim missing");
            return int.Parse(claim.Value);
        }

        [HttpPost("create")]
        public async Task<ActionResult<Medicine>> CreateMedicine([FromBody] CreateMedicineDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var medicine = new Medicine
            {
                MedicineName = dto.MedicineName,
                GenericName = dto.GenericName,
                UnitPrice = dto.UnitPrice,
                UnitOfMeasure = dto.UnitOfMeasure
            };

            _context.Medicines.Add(medicine);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetMedicineById), new { id = medicine.MedicineID }, medicine);
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateMedicine(int id, [FromBody] UpdateMedicineDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (id != dto.MedicineID) return BadRequest("ID mismatch");

            var medicine = await _context.Medicines.FindAsync(id);
            if (medicine == null) return NotFound();

            medicine.MedicineName = dto.MedicineName;
            medicine.GenericName = dto.GenericName;
            medicine.UnitPrice = dto.UnitPrice;
            medicine.UnitOfMeasure = dto.UnitOfMeasure;

            await _context.SaveChangesAsync();

            return Ok(medicine);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteMedicine(int id)
        {
            var medicine = await _context.Medicines.FindAsync(id);
            if (medicine == null) return NotFound();

            _context.Medicines.Remove(medicine);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Medicine deleted successfully" });
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<MedicineListDto>>> GetAllMedicines()
        {
            var medicines = await _context.Medicines
                .Select(m => new MedicineListDto
                {
                    MedicineID = m.MedicineID,
                    MedicineName = m.MedicineName,
                    GenericName = m.GenericName,
                    UnitPrice = m.UnitPrice,
                    UnitOfMeasure = m.UnitOfMeasure,
                    TotalStock = _context.CentralStoreInventories
                        .Where(i => i.MedicineID == m.MedicineID && i.CentralPharmacyID == GetCentralPharmacyId())
                        .Sum(i => i.QuantityAvailable)
                })
                .ToListAsync();

            return Ok(medicines);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MedicineDetailsDto>> GetMedicineById(int id)
        {
            var medicine = await _context.Medicines
                .Include(m => m.CentralStoreInventory)
                .FirstOrDefaultAsync(m => m.MedicineID == id);

            if (medicine == null) return NotFound();

            var result = new MedicineDetailsDto
            {
                MedicineID = medicine.MedicineID,
                MedicineName = medicine.MedicineName,
                GenericName = medicine.GenericName,
                UnitPrice = medicine.UnitPrice,
                UnitOfMeasure = medicine.UnitOfMeasure,
                InventoryBatches = medicine.CentralStoreInventory
                    .Where(i => i.CentralPharmacyID == GetCentralPharmacyId())
                    .Select(i => new InventoryListDto
                    {
                        CentralInventoryID = i.CentralInventoryID,
                        MedicineID = i.MedicineID,
                        MedicineName = medicine.MedicineName,
                        QuantityAvailable = i.QuantityAvailable,
                        ExpiryDate = i.ExpiryDate,
                        BatchNumber = i.BatchNumber,
                        Source = i.Source
                    }).ToList()
            };

            return Ok(result);
        }

        [HttpPost("search")]
        public async Task<ActionResult<List<MedicineListDto>>> SearchMedicines([FromBody] MedicineSearchDto search)
        {
            var query = _context.Medicines.AsQueryable();

            if (!string.IsNullOrEmpty(search.MedicineName))
                query = query.Where(m => m.MedicineName.Contains(search.MedicineName));

            if (!string.IsNullOrEmpty(search.GenericName))
                query = query.Where(m => m.GenericName.Contains(search.GenericName));

            if (!string.IsNullOrEmpty(search.UnitOfMeasure))
                query = query.Where(m => m.UnitOfMeasure.Contains(search.UnitOfMeasure));

            var result = await query
                .Select(m => new MedicineListDto
                {
                    MedicineID = m.MedicineID,
                    MedicineName = m.MedicineName,
                    GenericName = m.GenericName,
                    UnitPrice = m.UnitPrice,
                    UnitOfMeasure = m.UnitOfMeasure,
                    TotalStock = _context.CentralStoreInventories
                        .Where(i => i.MedicineID == m.MedicineID && i.CentralPharmacyID == GetCentralPharmacyId())
                        .Sum(i => i.QuantityAvailable)
                })
                .ToListAsync();

            return Ok(result);
        }
    }
}