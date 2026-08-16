using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto;
using HospitalSys.Models.Pharmacy.CentralStore;

namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("api/csm/request")]
    [Authorize(Roles = "CSM")]
    public class CSMRequestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CSMRequestController(AppDbContext context)
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

        [HttpGet("pending")]
        public async Task<ActionResult<List<RequestListDto>>> GetPendingRequests()
        {
            var list = await _context.CentralStoreRequests
                .Include(r => r.BranchPharmacy)
                .Where(r => r.Status == "Pending")
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

            return Ok(list);
        }

        [HttpGet("approved")]
        public async Task<ActionResult<List<RequestListDto>>> GetApprovedRequests()
        {
            var list = await _context.CentralStoreRequests
                .Include(r => r.BranchPharmacy)
                .Where(r => r.Status == "Approved")
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

            return Ok(list);
        }

        [HttpGet("rejected")]
        public async Task<ActionResult<List<RequestListDto>>> GetRejectedRequests()
        {
            var list = await _context.CentralStoreRequests
                .Include(r => r.BranchPharmacy)
                .Where(r => r.Status == "Rejected")
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

            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RequestDetailsDto>> GetRequestById(int id)
        {
            var request = await _context.CentralStoreRequests
                .Include(r => r.BranchPharmacy)
                .Include(r => r.Pharmacist)
                    .ThenInclude(p => p.Users) // Added to access FirstName/FatherName
                .Include(r => r.CentralStoreRequestDetail)
                    .ThenInclude(d => d.Medicine)
                .FirstOrDefaultAsync(r => r.CentralRequestID == id);

            if (request == null) return NotFound();

            var result = new RequestDetailsDto
            {
                CentralRequestID = request.CentralRequestID,
                BranchPharmacyID = request.BranchPharmacyID,
                BranchName = request.BranchPharmacy.BranchName,
                RequestedByPharmacistID = request.RequestedByPharmacistID,
                PharmacistName = request.Pharmacist != null && request.Pharmacist.Users != null
                    ? $"{request.Pharmacist.Users.FirstName} {request.Pharmacist.Users.FatherName}"
                    : "",
                RequestDate = request.RequestDate,
                Status = request.Status,
                ApprovedByManagerID = request.ApprovedByManagerID,
                ApprovalDate = request.ApprovalDate,
                RejectionReason = request.RejectionReason,
                Items = request.CentralStoreRequestDetail.Select(d => new RequestItemDto
                {
                    MedicineID = d.MedicineID,
                    MedicineName = d.Medicine.MedicineName,
                    RequestedQuantity = d.RequestedQuantity,
                    ApprovedQuantity = d.ApprovedQuantity
                }).ToList()
            };

            return Ok(result);
        }

        [HttpGet("review/{id}")]
        public async Task<ActionResult<RequestReviewDto>> ReviewRequest(int id)
        {
            var request = await _context.CentralStoreRequests
                .Include(r => r.BranchPharmacy)
                .Include(r => r.CentralStoreRequestDetail)
                    .ThenInclude(d => d.Medicine)
                .FirstOrDefaultAsync(r => r.CentralRequestID == id);

            if (request == null) return NotFound();

            var stockDict = new Dictionary<int, float>();
            foreach (var detail in request.CentralStoreRequestDetail)
            {
                var totalStock = await _context.CentralStoreInventories
                    .Where(i => i.MedicineID == detail.MedicineID && i.CentralPharmacyID == GetCentralPharmacyId())
                    .SumAsync(i => i.QuantityAvailable);
                stockDict[detail.MedicineID] = totalStock;
            }

            var review = new RequestReviewDto
            {
                CentralRequestID = request.CentralRequestID,
                BranchName = request.BranchPharmacy.BranchName,
                RequestDate = request.RequestDate,
                Items = request.CentralStoreRequestDetail.Select(d => new RequestItemDto
                {
                    MedicineID = d.MedicineID,
                    MedicineName = d.Medicine.MedicineName,
                    RequestedQuantity = d.RequestedQuantity,
                    ApprovedQuantity = d.ApprovedQuantity
                }).ToList(),
                AvailableStock = stockDict
            };

            return Ok(review);
        }

        [HttpGet("availability/{id}")]
        public async Task<ActionResult<RequestAvailabilityDto>> CheckAvailability(int id)
        {
            var request = await _context.CentralStoreRequests
                .Include(r => r.CentralStoreRequestDetail)
                    .ThenInclude(d => d.Medicine)
                .FirstOrDefaultAsync(r => r.CentralRequestID == id);

            if (request == null) return NotFound();

            var availability = new RequestAvailabilityDto
            {
                CentralRequestID = request.CentralRequestID,
                Items = new List<RequestItemDto>(),
                AvailableQuantities = new Dictionary<int, float>(),
                AllAvailable = true
            };

            foreach (var detail in request.CentralStoreRequestDetail)
            {
                var stock = await _context.CentralStoreInventories
                    .Where(i => i.MedicineID == detail.MedicineID && i.CentralPharmacyID == GetCentralPharmacyId())
                    .SumAsync(i => i.QuantityAvailable);

                availability.AvailableQuantities[detail.MedicineID] = stock;
                availability.Items.Add(new RequestItemDto
                {
                    MedicineID = detail.MedicineID,
                    MedicineName = detail.Medicine.MedicineName,
                    RequestedQuantity = detail.RequestedQuantity,
                    ApprovedQuantity = detail.ApprovedQuantity
                });

                if (stock < detail.RequestedQuantity) availability.AllAvailable = false;
            }

            return Ok(availability);
        }

        [HttpPost("approve")]
        public async Task<IActionResult> ApproveRequest([FromBody] ApproveRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var managerId = GetManagerId();

            var request = await _context.CentralStoreRequests
                .Include(r => r.CentralStoreRequestDetail)
                .FirstOrDefaultAsync(r => r.CentralRequestID == dto.CentralRequestID);

            if (request == null) return NotFound();

            if (request.Status != "Pending")
                return BadRequest("Request is not pending");

            foreach (var detail in request.CentralStoreRequestDetail)
            {
                var stock = await _context.CentralStoreInventories
                    .Where(i => i.MedicineID == detail.MedicineID && i.CentralPharmacyID == GetCentralPharmacyId())
                    .SumAsync(i => i.QuantityAvailable);

                if (stock < detail.RequestedQuantity)
                    return BadRequest($"Insufficient stock for medicine {detail.MedicineID}. Available: {stock}, Requested: {detail.RequestedQuantity}");
            }

            request.Status = "Approved";
            request.ApprovedByManagerID = managerId;
            request.ApprovalDate = DateTime.UtcNow;

            foreach (var detail in request.CentralStoreRequestDetail)
            {
                detail.ApprovedQuantity = detail.RequestedQuantity;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Request approved successfully" });
        }

        [HttpPost("partial-approve")]
        public async Task<IActionResult> PartialApproveRequest([FromBody] PartialApproveRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var managerId = GetManagerId();

            var request = await _context.CentralStoreRequests
                .Include(r => r.CentralStoreRequestDetail)
                    .ThenInclude(d => d.Medicine)
                .FirstOrDefaultAsync(r => r.CentralRequestID == dto.CentralRequestID);

            if (request == null) return NotFound();

            if (request.Status != "Pending")
                return BadRequest("Request is not pending");

            foreach (var item in dto.ApprovedItems)
            {
                var detail = request.CentralStoreRequestDetail.FirstOrDefault(d => d.MedicineID == item.MedicineID);
                if (detail == null) return BadRequest($"Medicine {item.MedicineID} not in request");

                if (item.ApprovedQuantity > detail.RequestedQuantity)
                    return BadRequest($"Approved quantity for medicine {item.MedicineID} exceeds requested");

                var stock = await _context.CentralStoreInventories
                    .Where(i => i.MedicineID == item.MedicineID && i.CentralPharmacyID == GetCentralPharmacyId())
                    .SumAsync(i => i.QuantityAvailable);

                if (stock < item.ApprovedQuantity)
                    return BadRequest($"Insufficient stock for medicine {item.MedicineID}. Available: {stock}, Approved: {item.ApprovedQuantity}");
            }

            foreach (var item in dto.ApprovedItems)
            {
                var detail = request.CentralStoreRequestDetail.First(d => d.MedicineID == item.MedicineID);
                detail.ApprovedQuantity = item.ApprovedQuantity;
            }

            bool allFullyApproved = request.CentralStoreRequestDetail.All(d => d.ApprovedQuantity == d.RequestedQuantity);
            if (allFullyApproved)
                request.Status = "Approved";
            else
                request.Status = "PartiallyApproved";

            request.ApprovedByManagerID = managerId;
            request.ApprovalDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Request partially approved" });
        }

        [HttpPost("reject")]
        public async Task<IActionResult> RejectRequest([FromBody] RejectRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var managerId = GetManagerId();

            var request = await _context.CentralStoreRequests
                .FirstOrDefaultAsync(r => r.CentralRequestID == dto.CentralRequestID);

            if (request == null) return NotFound();

            if (request.Status != "Pending")
                return BadRequest("Request is not pending");

            request.Status = "Rejected";
            request.RejectionReason = dto.RejectionReason;
            request.ApprovedByManagerID = managerId;
            request.ApprovalDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Request rejected" });
        }

        [HttpPost("cancel")]
        public async Task<IActionResult> CancelRequest([FromBody] CancelRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var request = await _context.CentralStoreRequests
                .FirstOrDefaultAsync(r => r.CentralRequestID == dto.CentralRequestID);

            if (request == null) return NotFound();

            if (request.Status == "Approved" || request.Status == "PartiallyApproved")
                return BadRequest("Cannot cancel an approved request");

            request.Status = "Cancelled";

            await _context.SaveChangesAsync();

            return Ok(new { message = "Request cancelled" });
        }
    }
}