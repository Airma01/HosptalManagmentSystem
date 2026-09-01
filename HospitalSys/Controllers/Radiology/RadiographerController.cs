using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.Dto.Radiology;
using HospitalSys.Models.Radiology;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Radiology
{
    [ApiController]
    [Route("radiology/[controller]")]
    [Authorize(Roles = "Radiographer")]
    public class RadiographerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;

        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".dcm" };
        private const long MaxFileBytes = 15 * 1024 * 1024; // 15 MB

        public RadiographerController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        private string GetAuthenticatedName()
        {
            var name = User.FindFirst(ClaimTypes.Name)?.Value
                       ?? User.FindFirst(ClaimTypes.GivenName)?.Value;
            if (string.IsNullOrWhiteSpace(name))
                name = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return name?.Trim() ?? "";
        }

        private static RadiologyRequestDto MapListItem(RadiologyRequest r)
        {
            var patientName = r.Patient == null
                ? null
                : $"{r.Patient.FirstName} {r.Patient.LastName}".Trim();

            string? doctorName = null;
            if (r.Doctor?.Users != null)
                doctorName = $"{r.Doctor.Users.FirstName} {r.Doctor.Users.FatherName}".Trim();

            return new RadiologyRequestDto
            {
                RadiologyRequestID = r.RadiologyRequestID,
                ConsultationID = r.ConsultationID,
                PatientID = r.PatientID,
                PatientMRN = r.Patient?.MRN,
                PatientName = patientName,
                DoctorID = r.DoctorID,
                DoctorName = doctorName,
                RadiologyTestTypeID = r.RadiologyTestTypeID,
                TestName = r.RadiologyTestType?.TestName,
                DepartmentName = r.RadiologyTestType?.RadiologyDepartment?.DepartmentName,
                RequestDate = r.RequestDate,
                Status = r.Status,
                HasResult = r.RadiologyResult != null && r.RadiologyResult.Any()
            };
        }

        private static RadiologyRequestResponseDto MapDetail(RadiologyRequest r)
        {
            string? doctorName = null;
            if (r.Doctor?.Users != null)
                doctorName = $"{r.Doctor.Users.FirstName} {r.Doctor.Users.FatherName}".Trim();

            return new RadiologyRequestResponseDto
            {
                RadiologyRequestID = r.RadiologyRequestID,
                ConsultationID = r.ConsultationID,
                PatientID = r.PatientID,
                PatientMRN = r.Patient?.MRN ?? "",
                PatientFaydaFIN = r.Patient?.FaydaFIN,
                PatientFirstName = r.Patient?.FirstName ?? "",
                PatientLastName = r.Patient?.LastName ?? "",
                PatientGender = r.Patient?.Gender,
                PatientDateOfBirth = r.Patient?.DateOfBirth,
                PatientPhone = r.Patient?.Phone,
                DoctorID = r.DoctorID,
                DoctorName = doctorName,
                RadiologyTestTypeID = r.RadiologyTestTypeID,
                TestName = r.RadiologyTestType?.TestName ?? "",
                TestDescription = r.RadiologyTestType?.Description,
                Price = r.RadiologyTestType?.Price,
                RadiologyDepartmentID = r.RadiologyTestType?.RadiologyDepartmentID,
                DepartmentName = r.RadiologyTestType?.RadiologyDepartment?.DepartmentName,
                RequestDate = r.RequestDate,
                Status = r.Status,
                ChiefComplaint = r.Consultation?.ChiefComplaint,
                HistoryOfPresentIllness = r.Consultation?.HistoryOfPresentIllness,
                Assessment = r.Consultation?.Assessment,
                ClinicalNotes = r.Consultation?.ClinicalNotes,
                Results = (r.RadiologyResult ?? new List<RadiologyResult>())
                    .Select(res => new RadiologyResultDto
                    {
                        RadiologyResultID = res.RadiologyResultID,
                        RadiologyRequestID = res.RadiologyRequestID,
                        RadiologyTechnicianName = res.RadiologyTechnicianName,
                        ImageName = res.ImageName,
                        ImagePath = res.ImagePath,
                        ResultDescription = res.ResultDescription,
                        ResultDate = res.ResultDate
                    })
                    .OrderByDescending(x => x.ResultDate)
                    .ToList()
            };
        }

        private IQueryable<RadiologyRequest> BaseRequestQuery()
        {
            return _context.RadiologyRequests
                .Include(r => r.Patient)
                .Include(r => r.Doctor)!.ThenInclude(d => d!.Users)
                .Include(r => r.RadiologyTestType)!.ThenInclude(t => t!.RadiologyDepartment)
                .Include(r => r.Consultation)
                .Include(r => r.RadiologyResult);
        }

        // GET: /radiology/Radiographer/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);

                var requests = await _context.RadiologyRequests
                    .AsNoTracking()
                    .Include(r => r.RadiologyResult)
                    .ToListAsync();

                var pending = requests.Where(r =>
                    string.IsNullOrWhiteSpace(r.Status) ||
                    r.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase)).ToList();

                var inProgress = requests.Where(r =>
                    r.Status.Equals("InProgress", StringComparison.OrdinalIgnoreCase)).ToList();

                var completedToday = requests.Where(r =>
                    r.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase) &&
                    r.RequestDate >= today && r.RequestDate < tomorrow).Count();

                var todayCount = requests.Count(r => r.RequestDate >= today && r.RequestDate < tomorrow);
                var withResults = requests.Count(r => r.RadiologyResult != null && r.RadiologyResult.Any());
                var withoutResults = requests.Count - withResults;

                var recentPending = await BaseRequestQuery()
                    .AsNoTracking()
                    .Where(r =>
                        string.IsNullOrWhiteSpace(r.Status) ||
                        r.Status.ToLower() == "pending")
                    .OrderBy(r => r.RequestDate)
                    .Take(10)
                    .ToListAsync();

                var dto = new RadiographerDashboardDto
                {
                    RadiographerName = GetAuthenticatedName(),
                    PendingRequestsCount = pending.Count,
                    InProgressRequestsCount = inProgress.Count,
                    CompletedTodayCount = completedToday,
                    TodayRequestsCount = todayCount,
                    TotalRequestsCount = requests.Count,
                    RequestsWithResultsCount = withResults,
                    RequestsWithoutResultsCount = withoutResults,
                    RecentPendingRequests = recentPending.Select(MapListItem).ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load radiographer dashboard.", error = ex.Message });
            }
        }

        // GET: /radiology/Radiographer/queue
        [HttpGet("queue")]
        public async Task<IActionResult> Queue([FromQuery] string? status = null)
        {
            try
            {
                var query = BaseRequestQuery().AsNoTracking();

                if (!string.IsNullOrWhiteSpace(status))
                {
                    var s = status.Trim().ToLower();
                    query = query.Where(r => r.Status.ToLower() == s);
                }
                else
                {
                    query = query.Where(r =>
                        r.Status.ToLower() == "pending" ||
                        r.Status.ToLower() == "inprogress" ||
                        r.Status == "");
                }

                var items = await query.OrderBy(r => r.RequestDate).ToListAsync();
                return Ok(items.Select(MapListItem).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load queue.", error = ex.Message });
            }
        }

        // GET: /radiology/Radiographer/requests/{id}
        [HttpGet("requests/{id:int}")]
        public async Task<IActionResult> GetRequestDetails(int id)
        {
            try
            {
                var r = await BaseRequestQuery()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.RadiologyRequestID == id);

                if (r == null)
                    return NotFound(new { message = "Radiology request not found." });

                return Ok(MapDetail(r));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load request details.", error = ex.Message });
            }
        }

        // POST: /radiology/Radiographer/results
        // Create result (optional image fields already set by a prior upload)
        [HttpPost("results")]
        public async Task<IActionResult> CreateResult([FromBody] CreateRadiologyResultDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Request body is required." });

                var request = await _context.RadiologyRequests
                    .FirstOrDefaultAsync(r => r.RadiologyRequestID == dto.RadiologyRequestID);

                if (request == null)
                    return BadRequest(new { message = "RadiologyRequestID does not exist." });

                var entity = new RadiologyResult
                {
                    RadiologyRequestID = dto.RadiologyRequestID,
                    RadiologyTechnicianName = GetAuthenticatedName(),
                    ImageName = dto.ImageName ?? "",
                    ImagePath = dto.ImagePath ?? "",
                    ResultDescription = dto.ResultDescription?.Trim() ?? "",
                    ResultDate = dto.ResultDate ?? DateTime.UtcNow
                };

                _context.RadiologyResults.Add(entity);

                if (string.IsNullOrWhiteSpace(request.Status) ||
                    request.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                {
                    request.Status = "InProgress";
                }

                await _context.SaveChangesAsync();

                return StatusCode(201, new RadiologyResultDto
                {
                    RadiologyResultID = entity.RadiologyResultID,
                    RadiologyRequestID = entity.RadiologyRequestID,
                    RadiologyTechnicianName = entity.RadiologyTechnicianName,
                    ImageName = entity.ImageName,
                    ImagePath = entity.ImagePath,
                    ResultDescription = entity.ResultDescription,
                    ResultDate = entity.ResultDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create result.", error = ex.Message });
            }
        }

        // POST: /radiology/Radiographer/results/{requestId}/upload
        // Multipart form: file + optional resultDescription
        [HttpPost("results/{requestId:int}/upload")]
        [RequestSizeLimit(MaxFileBytes)]
        public async Task<IActionResult> UploadImage(int requestId, IFormFile file, [FromForm] string? resultDescription = null)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "Image file is required." });

                if (file.Length > MaxFileBytes)
                    return BadRequest(new { message = "File exceeds maximum allowed size (15 MB)." });

                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant() ?? "";
                if (!AllowedExtensions.Contains(ext))
                    return BadRequest(new { message = $"File type not allowed. Allowed: {string.Join(", ", AllowedExtensions)}" });

                var request = await _context.RadiologyRequests
                    .FirstOrDefaultAsync(r => r.RadiologyRequestID == requestId);

                if (request == null)
                    return NotFound(new { message = "Radiology request not found." });

                var webRoot = _env.WebRootPath;
                if (string.IsNullOrWhiteSpace(webRoot))
                {
                    webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
                }

                var uploadDir = Path.Combine(webRoot, "uploads", "radiology");
                Directory.CreateDirectory(uploadDir);

                var storedName = $"{Guid.NewGuid():N}{ext}";
                var physicalPath = Path.Combine(uploadDir, storedName);
                var relativePath = $"/uploads/radiology/{storedName}";

                await using (var stream = new FileStream(physicalPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var entity = new RadiologyResult
                {
                    RadiologyRequestID = requestId,
                    RadiologyTechnicianName = GetAuthenticatedName(),
                    ImageName = storedName,
                    ImagePath = relativePath,
                    ResultDescription = resultDescription?.Trim() ?? "",
                    ResultDate = DateTime.UtcNow
                };

                _context.RadiologyResults.Add(entity);

                if (string.IsNullOrWhiteSpace(request.Status) ||
                    request.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                {
                    request.Status = "InProgress";
                }

                await _context.SaveChangesAsync();

                return StatusCode(201, new RadiologyResultDto
                {
                    RadiologyResultID = entity.RadiologyResultID,
                    RadiologyRequestID = entity.RadiologyRequestID,
                    RadiologyTechnicianName = entity.RadiologyTechnicianName,
                    ImageName = entity.ImageName,
                    ImagePath = entity.ImagePath,
                    ResultDescription = entity.ResultDescription,
                    ResultDate = entity.ResultDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to upload radiology image.", error = ex.Message });
            }
        }

        // PUT: /radiology/Radiographer/results/{id}
        [HttpPut("results/{id:int}")]
        public async Task<IActionResult> UpdateResult(int id, [FromBody] UpdateRadiologyResultDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Request body is required." });

                var entity = await _context.RadiologyResults
                    .FirstOrDefaultAsync(r => r.RadiologyResultID == id);

                if (entity == null)
                    return NotFound(new { message = "Radiology result not found." });

                if (dto.ImageName != null)
                    entity.ImageName = dto.ImageName;
                if (dto.ImagePath != null)
                    entity.ImagePath = dto.ImagePath;
                if (dto.ResultDescription != null)
                    entity.ResultDescription = dto.ResultDescription.Trim();
                if (dto.ResultDate.HasValue)
                    entity.ResultDate = dto.ResultDate.Value;

                // Always stamp authenticated technician name on update
                entity.RadiologyTechnicianName = GetAuthenticatedName();

                await _context.SaveChangesAsync();

                return Ok(new RadiologyResultDto
                {
                    RadiologyResultID = entity.RadiologyResultID,
                    RadiologyRequestID = entity.RadiologyRequestID,
                    RadiologyTechnicianName = entity.RadiologyTechnicianName,
                    ImageName = entity.ImageName,
                    ImagePath = entity.ImagePath,
                    ResultDescription = entity.ResultDescription,
                    ResultDate = entity.ResultDate
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update result.", error = ex.Message });
            }
        }

        // PUT: /radiology/Radiographer/requests/{id}/complete
        // Mark examination done / ready for interpretation (request Status = Completed or keep InProgress with result)
        [HttpPut("requests/{id:int}/complete")]
        public async Task<IActionResult> CompleteExamination(int id)
        {
            try
            {
                var request = await _context.RadiologyRequests
                    .Include(r => r.RadiologyResult)
                    .FirstOrDefaultAsync(r => r.RadiologyRequestID == id);

                if (request == null)
                    return NotFound(new { message = "Radiology request not found." });

                if (request.RadiologyResult == null || !request.RadiologyResult.Any())
                    return BadRequest(new { message = "Cannot complete examination without at least one result/image." });

                // Ready for radiologist review: still interpretable; status signals work finished by tech
                request.Status = "ReadyForReview";
                await _context.SaveChangesAsync();

                var detail = await BaseRequestQuery()
                    .AsNoTracking()
                    .FirstAsync(r => r.RadiologyRequestID == id);

                return Ok(MapDetail(detail));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to complete examination.", error = ex.Message });
            }
        }
    }
}
