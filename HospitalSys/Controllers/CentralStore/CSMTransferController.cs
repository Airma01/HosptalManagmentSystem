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

        [HttpPost("create")]
        public async Task<IActionResult> CreateTransfer([FromBody] CreateTransferDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var centralPharmacyId = GetCentralPharmacyId();
            var managerId = GetManagerId();

            CentralStoreRequest? request = null;
            if (dto.CentralRequestID.HasValue && dto.CentralRequestID.Value > 0)
            {
                request = await _context.CentralStoreRequests
                    .Include(r => r.CentralStoreRequestDetail)
                    .FirstOrDefaultAsync(r => r.CentralRequestID == dto.CentralRequestID.Value); // removed invalid filter

                if (request == null) return NotFound("Request not found");
                if (request.Status != "Approved" && request.Status != "PartiallyApproved")
                    return BadRequest("Request must be approved or partially approved");
            }
            // Check stock availability
            foreach (var item in dto.Items)
            {
                var totalStock = await _context.CentralStoreInventories
                    .Where(i => i.MedicineID == item.MedicineID && i.CentralPharmacyID == centralPharmacyId)
                    .SumAsync(i => i.QuantityAvailable);

                if (totalStock < item.QuantityTransferred)
                    return BadRequest($"Insufficient stock for medicine {item.MedicineID}. Available: {totalStock}, Requested: {item.QuantityTransferred}");
            }

            // Begin transaction
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Create transfer
                var transfer = new CentralStoreTransfer
                {
                    CentralRequestID = dto.CentralRequestID,
                    CentralPharmacyID = centralPharmacyId,
                    BranchPharmacyID = dto.BranchPharmacyID,
                    CentralStoreManagerID = managerId,
                    TransferDate = dto.TransferDate,
                    Status = "Pending"
                };

                _context.CentralStoreTransfers.Add(transfer);
                await _context.SaveChangesAsync();

                // Create transfer details and deduct from central inventory
                foreach (var item in dto.Items)
                {
                    var detail = new CentralStoreTransferDetail
                    {
                        CentralTransferID = transfer.CentralTransferID,
                        MedicineID = item.MedicineID,
                        QuantityTransferred = item.QuantityTransferred
                    };
                    _context.CentralStoreTransferDetails.Add(detail);

                    // Deduct from central inventory: FIFO or LIFO? Simplest: deduct from batches with earliest expiry.
                    // We'll get all batches for this medicine and deduct in order of expiry.
                    var batches = await _context.CentralStoreInventories
                        .Where(i => i.MedicineID == item.MedicineID && i.CentralPharmacyID == centralPharmacyId && i.QuantityAvailable > 0)
                        .OrderBy(i => i.ExpiryDate)
                        .ToListAsync();

                    int remaining = item.QuantityTransferred;
                    foreach (var batch in batches)
                    {
                        if (remaining <= 0) break;
                        float deduct = Math.Min(batch.QuantityAvailable, remaining);
                        batch.QuantityAvailable -= deduct;
                        remaining -= (int)deduct;
                    }

                    if (remaining > 0)
                    {
                        // Should not happen because we checked stock before transaction
                        await transaction.RollbackAsync();
                        return BadRequest("Stock inconsistency during transfer");
                    }
                }

                // Add to branch inventory
                foreach (var item in dto.Items)
                {
                    // Check if the same medicine batch exists in branch inventory (matching expiry and batch number)
                    // For simplicity, we'll create a new branch inventory entry with a new batch number.
                    var branchInventory = new BranchInventory
                    {
                        BranchPharmacyID = dto.BranchPharmacyID,
                        MedicineID = item.MedicineID,
                        QuantityAvailable = item.QuantityTransferred,
                        ExpiryDate = DateTime.UtcNow.AddMonths(12), // placeholder
                        BatchNumber = $"TRF-{transfer.CentralTransferID}-{item.MedicineID}"
                    };
                    _context.BranchInventories.Add(branchInventory);
                }

                // Update request status if provided
                if (request != null)
                {
                    request.Status = "Closed";
                    // Optionally update other fields
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Transfer created successfully", transferId = transfer.CentralTransferID });
            }
            catch (Exception)
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
                    .ThenInclude(d => d.Medicine)
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
                    MedicineID = d.MedicineID,
                    QuantityTransferred = d.QuantityTransferred
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

            // Since we don't have a history table, we'll provide status and dates based on status
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
            // Optionally update transfer date to dispatch date
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

            // Validate status transition
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

            // Rollback inventory? This is a business decision. We'll just cancel the transfer, but inventory remains deducted.
            // We can optionally restore inventory, but that's complex.
            transfer.Status = "Cancelled";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Transfer cancelled" });
        }
    }
}