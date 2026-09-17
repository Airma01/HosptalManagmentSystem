
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models.Pharmacy.Branch;
using HospitalSys.Models.Pharmacy.CentralStore;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/csm/transfer")]
    [Authorize(Roles = "CSM")]
    public class CSMTransferController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CSMTransferController(AppDbContext context)
        {
            _context = context;
        }

        private int GetCentralPharmacyId()
        {
            var claim = User.FindFirst("CentralPharmacyID");
            if (claim == null) throw new UnauthorizedAccessException("CentralPharmacyID claim missing");
            return int.Parse(claim.Value);
        }

        private int GetManagerId()
        {
            var claim = User.FindFirst("ManagerID");
            if (claim == null) throw new UnauthorizedAccessException("ManagerID claim missing");
            return int.Parse(claim.Value);
        }

        // ============================================================
        // NEW: Get CentralStoreManagerID from DB using ManagerID and CentralPharmacyID
        // ============================================================
        private async Task<int> GetCentralStoreManagerIdAsync()
        {
            var managerId = GetManagerId();
            var centralPharmacyId = GetCentralPharmacyId();

            var centralManager = await _context.CentralStoreManagers
                .FirstOrDefaultAsync(cm => cm.ManagerID == managerId
                                           && cm.CentralPharmacyID == centralPharmacyId
                                           && cm.IsCurrent == true);

            if (centralManager == null)
                throw new UnauthorizedAccessException("No active Central Store Manager found for this user");

            return centralManager.CentralStoreManagerID;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateTransfer([FromBody] CreateTransferDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var centralPharmacyId = GetCentralPharmacyId();
            var centralStoreManagerId = await GetCentralStoreManagerIdAsync();

            CentralStoreRequest? request = null;
            if (dto.CentralRequestID.HasValue && dto.CentralRequestID.Value > 0)
            {
                request = await _context.CentralStoreRequests
                    .Include(r => r.CentralStoreRequestDetail)
                    .FirstOrDefaultAsync(r => r.CentralRequestID == dto.CentralRequestID.Value);

                if (request == null) return NotFound("Request not found");
                if (request.Status != "Approved" && request.Status != "PartiallyApproved")
                    return BadRequest("Request must be approved or partially approved");
            }

            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest("At least one transfer item is required.");

            // Validate each selected central inventory batch
            foreach (var item in dto.Items)
            {
                var inv = await _context.CentralStoreInventories
                    .FirstOrDefaultAsync(i =>
                        i.CentralInventoryID == item.CentralInventoryID &&
                        i.CentralPharmacyID == centralPharmacyId);

                if (inv == null)
                    return BadRequest($"Central inventory ID {item.CentralInventoryID} not found for this store.");

                if (inv.QuantityAvailable < item.QuantityTransferred)
                    return BadRequest(
                        $"Insufficient stock on batch '{inv.BatchNumber}' (inventory #{inv.CentralInventoryID}). " +
                        $"Available: {inv.QuantityAvailable}, requested: {item.QuantityTransferred}");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transfer = new CentralStoreTransfer
                {
                    CentralRequestID = dto.CentralRequestID,
                    CentralPharmacyID = centralPharmacyId,
                    BranchPharmacyID = dto.BranchPharmacyID,
                    CentralStoreManagerID = centralStoreManagerId,
                    TransferDate = dto.TransferDate,
                    Status = "Pending"
                };

                _context.CentralStoreTransfers.Add(transfer);
                await _context.SaveChangesAsync();

                // Link to inventory batches only — do NOT move stock yet.
                // Stock moves when branch accepts (Add to Inventory).
                foreach (var item in dto.Items)
                {
                    _context.CentralStoreTransferDetails.Add(new CentralStoreTransferDetail
                    {
                        CentralTransferID = transfer.CentralTransferID,
                        CentralInventoryID = item.CentralInventoryID,
                        QuantityTransferred = item.QuantityTransferred
                    });
                }

                if (request != null)
                    request.Status = "Closed";

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Transfer created successfully", transferId = transfer.CentralTransferID });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        
        [HttpGet("all")]
        public async Task<ActionResult<List<TransferListDto>>> GetAllTransfers()
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var list = await _context.CentralStoreTransfers
                .Include(t => t.BranchPharmacy)
                .Where(t => t.CentralPharmacyID == centralPharmacyId)
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

            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TransferDetailsDto>> GetTransferById(int id)
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var transfer = await _context.CentralStoreTransfers
                .Include(t => t.BranchPharmacy)
                .Include(t => t.CentralStoreManager)
                    .ThenInclude(m => m.MainPharmacyManager)
                        .ThenInclude(mm => mm.Users)
                .Include(t => t.CentralStoreTransferDetail)
                    .ThenInclude(d => d.CentralStoreInventory!)
                        .ThenInclude(i => i.Medicine)
                .FirstOrDefaultAsync(t => t.CentralTransferID == id && t.CentralPharmacyID == centralPharmacyId);

            if (transfer == null) return NotFound();

            var result = new TransferDetailsDto
            {
                CentralTransferID = transfer.CentralTransferID,
                CentralRequestID = transfer.CentralRequestID,
                CentralPharmacyID = transfer.CentralPharmacyID,
                BranchPharmacyID = transfer.BranchPharmacyID,
                BranchName = transfer.BranchPharmacy.BranchName,
                CentralStoreManagerID = transfer.CentralStoreManagerID,
                ManagerName = $"{transfer.CentralStoreManager.MainPharmacyManager.Users.FirstName} {transfer.CentralStoreManager.MainPharmacyManager.Users.FatherName}",
                TransferDate = transfer.TransferDate,
                Status = transfer.Status,
                Items = transfer.CentralStoreTransferDetail.Select(d => new TransferItemDto
                {
                    CentralInventoryID = d.CentralInventoryID,
                    QuantityTransferred = d.QuantityTransferred,
                    MedicineID = d.CentralStoreInventory?.MedicineID,
                    MedicineName = d.CentralStoreInventory?.Medicine?.MedicineName,
                    ExpiryDate = d.CentralStoreInventory?.ExpiryDate,
                    BatchNumber = d.CentralStoreInventory?.BatchNumber
                }).ToList()
            };

            return Ok(result);
        }

        [HttpGet("track/{id}")]
        public async Task<ActionResult<TransferTrackingDto>> TrackTransfer(int id)
        {
            var centralPharmacyId = GetCentralPharmacyId();

            var transfer = await _context.CentralStoreTransfers
                .FirstOrDefaultAsync(t => t.CentralTransferID == id && t.CentralPharmacyID == centralPharmacyId);

            if (transfer == null) return NotFound();

            var tracking = new TransferTrackingDto
            {
                CentralTransferID = transfer.CentralTransferID,
                Status = transfer.Status,
                DispatchedDate = transfer.Status == "Dispatched" || transfer.Status == "InTransit" || transfer.Status == "Received" ? transfer.TransferDate : (DateTime?)null,
                InTransitDate = transfer.Status == "InTransit" || transfer.Status == "Received" ? transfer.TransferDate.AddHours(1) : null,
                ReceivedDate = transfer.Status == "Received" ? transfer.TransferDate.AddHours(2) : null,
                History = new List<TransferStatusHistoryDto>
                {
                    new TransferStatusHistoryDto { Status = "Pending", ChangedDate = transfer.TransferDate },
                    new TransferStatusHistoryDto { Status = "Dispatched", ChangedDate = transfer.TransferDate.AddMinutes(10) },
                    new TransferStatusHistoryDto { Status = "InTransit", ChangedDate = transfer.TransferDate.AddMinutes(30) },
                    new TransferStatusHistoryDto { Status = "Received", ChangedDate = transfer.TransferDate.AddHours(2) }
                }.TakeWhile(h => h.Status != transfer.Status || h.Status == transfer.Status).ToList()
            };

            return Ok(tracking);
        }

        [HttpPost("dispatch")]
        public async Task<IActionResult> DispatchTransfer([FromBody] DispatchTransferDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var centralPharmacyId = GetCentralPharmacyId();

            var transfer = await _context.CentralStoreTransfers
                .FirstOrDefaultAsync(t => t.CentralTransferID == dto.CentralTransferID && t.CentralPharmacyID == centralPharmacyId);

            if (transfer == null) return NotFound();

            if (transfer.Status != "Pending")
                return BadRequest("Transfer is not pending");

            transfer.Status = "Dispatched";
            transfer.TransferDate = dto.DispatchDate;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Transfer dispatched" });
        }

        [HttpPut("update-status")]
        public async Task<IActionResult> UpdateTransferStatus([FromBody] TransferStatusDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var centralPharmacyId = GetCentralPharmacyId();

            var transfer = await _context.CentralStoreTransfers
                .FirstOrDefaultAsync(t => t.CentralTransferID == dto.CentralTransferID && t.CentralPharmacyID == centralPharmacyId);

            if (transfer == null) return NotFound();

            var allowedTransitions = new Dictionary<string, List<string>>
            {
                { "Pending", new List<string> { "Dispatched", "Cancelled" } },
                { "Dispatched", new List<string> { "InTransit", "Cancelled" } },
                { "InTransit", new List<string> { "Received", "Cancelled" } },
                { "Received", new List<string> { "Closed" } }
            };

            if (!allowedTransitions.ContainsKey(transfer.Status) || !allowedTransitions[transfer.Status].Contains(dto.Status))
                return BadRequest($"Invalid status transition from {transfer.Status} to {dto.Status}");

            transfer.Status = dto.Status;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Transfer status updated" });
        }

        [HttpPost("cancel")]
        public async Task<IActionResult> CancelTransfer([FromBody] CancelTransferDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var centralPharmacyId = GetCentralPharmacyId();

            var transfer = await _context.CentralStoreTransfers
                .FirstOrDefaultAsync(t => t.CentralTransferID == dto.CentralTransferID && t.CentralPharmacyID == centralPharmacyId);

            if (transfer == null) return NotFound();

            if (transfer.Status == "Received" || transfer.Status == "Closed")
                return BadRequest("Cannot cancel a completed transfer");

            transfer.Status = "Cancelled";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Transfer cancelled" });
        }
    }
}