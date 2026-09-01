using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.Dto.Radiology;
using HospitalSys.Models.Radiology;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Radiology
{
    /// <summary>
    /// Radiologist portal endpoints.
    /// NOTE: Repository has no dedicated Radiologist model or auth controller.
    /// Endpoints require authentication. Prefer seeding a "Radiologist" role in Roles
    /// and tightening [Authorize(Roles = "Radiologist")] when that role exists.
    /// Until then, Doctor and Radiographer can access review/report endpoints so the
    /// workflow remains usable with existing roles.
    /// Finalization uses ResultDescription + parent RadiologyRequest.Status (no finalize column).
    /// </summary>
    [ApiController]
    [Route("radiology/[controller]")]
    [Authorize(Roles = "Doctor,Radiographer")]
    public class RadiologistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RadiologistController(AppDbContext context)
        {
            _context = context;
        }

        private string GetAuthenticatedName()
        {
            var name = User.FindFirst(ClaimTypes.Name)?.Value
                       ?? User.FindFirst(ClaimTypes.GivenName)?.Value;
            if (string.IsNullOrWhiteSpace(name))
                name = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return name?.Trim() ?? "";
        }

        private static RadiologyResultResponseDto MapResultResponse(RadiologyResult r)
        {
            var req = r.RadiologyRequest;
            string? doctorName = null;
            if (req?.Doctor?.Users != null)
                doctorName = $"{req.Doctor.Users.FirstName} {req.Doctor.Users.FatherName}".Trim();

            var patientName = req?.Patient == null
                ? null
                : $"{req.Patient.FirstName} {req.Patient.LastName}".Trim();

            return new RadiologyResultResponseDto
            {
                RadiologyResultID = r.RadiologyResultID,
                RadiologyRequestID = r.RadiologyRequestID,
                RadiologyTechnicianName = r.RadiologyTechnicianName,
                ImageName = r.ImageName,
                ImagePath = r.ImagePath,
                ResultDescription = r.ResultDescription,
                ResultDate = r.ResultDate,
                RequestStatus = req?.Status,
                RequestDate = req?.RequestDate,
                PatientID = req?.PatientID,
                PatientMRN = req?.Patient?.MRN,
                PatientName = patientName,
                PatientGender = req?.Patient?.Gender,
                PatientDateOfBirth = req?.Patient?.DateOfBirth,
                RadiologyTestTypeID = req?.RadiologyTestTypeID,
                TestName = req?.RadiologyTestType?.TestName,
                DepartmentName = req?.RadiologyTestType?.RadiologyDepartment?.DepartmentName,
                ChiefComplaint = req?.Consultation?.ChiefComplaint,
                HistoryOfPresentIllness = req?.Consultation?.HistoryOfPresentIllness,
                Assessment = req?.Consultation?.Assessment,
                DoctorID = req?.DoctorID,
                DoctorName = doctorName
            };
        }

        private static RadiologyResultDto MapResultDto(RadiologyResult r) => new()
        {
            RadiologyResultID = r.RadiologyResultID,
            RadiologyRequestID = r.RadiologyRequestID,
            RadiologyTechnicianName = r.RadiologyTechnicianName,
            ImageName = r.ImageName,
            ImagePath = r.ImagePath,
            ResultDescription = r.ResultDescription,
            ResultDate = r.ResultDate
        };

        private static RadiologyRequestResponseDto MapRequestDetail(RadiologyRequest r)
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
                    .Select(MapResultDto)
                    .OrderByDescending(x => x.ResultDate)
                    .ToList()
            };
        }

        private IQueryable<RadiologyResult> ResultQuery()
        {
            return _context.RadiologyResults
                .Include(r => r.RadiologyRequest)!.ThenInclude(req => req!.Patient)
                .Include(r => r.RadiologyRequest)!.ThenInclude(req => req!.Doctor)!.ThenInclude(d => d!.Users)
                .Include(r => r.RadiologyRequest)!.ThenInclude(req => req!.RadiologyTestType)!.ThenInclude(t => t!.RadiologyDepartment)
                .Include(r => r.RadiologyRequest)!.ThenInclude(req => req!.Consultation);
        }

        private IQueryable<RadiologyRequest> RequestQuery()
        {
            return _context.RadiologyRequests
                .Include(r => r.Patient)
                .Include(r => r.Doctor)!.ThenInclude(d => d!.Users)
                .Include(r => r.RadiologyTestType)!.ThenInclude(t => t!.RadiologyDepartment)
                .Include(r => r.Consultation)
                .Include(r => r.RadiologyResult);
        }

        // GET: /radiology/Radiologist/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var tomorrow = today.AddDays(1);

                var results = await ResultQuery().AsNoTracking().ToListAsync();
                var requests = await _context.RadiologyRequests.AsNoTracking().ToListAsync();

                // Ready for interpretation: has image and request not yet Completed
                var ready = results
                    .Where(r =>
                        !string.IsNullOrWhiteSpace(r.ImagePath) &&
                        (r.RadiologyRequest == null ||
                         !r.RadiologyRequest.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase)))
                    .OrderByDescending(r => r.ResultDate)
                    .Take(20)
                    .Select(MapResultResponse)
                    .ToList();

                var completed = results
                    .Where(r =>
                        r.RadiologyRequest != null &&
                        r.RadiologyRequest.Status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
                    .ToList();

                var todayCompleted = completed.Count(r => r.ResultDate >= today && r.ResultDate < tomorrow);

                var pendingRequests = requests.Count(r =>
                    string.IsNullOrWhiteSpace(r.Status) ||
                    r.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase) ||
                    r.Status.Equals("InProgress", StringComparison.OrdinalIgnoreCase) ||
                    r.Status.Equals("ReadyForReview", StringComparison.OrdinalIgnoreCase));

                var dto = new RadiologistDashboardDto
                {
                    RadiologistName = GetAuthenticatedName(),
                    ReadyForInterpretationCount = ready.Count,
                    CompletedReportsCount = completed.Count,
                    TodayCompletedCount = todayCompleted,
                    PendingRequestsCount = pendingRequests,
                    TotalResultsCount = results.Count,
                    ReadyForInterpretation = ready,
                    RecentCompletedReports = completed
                        .OrderByDescending(r => r.ResultDate)
                        .Take(10)
                        .Select(MapResultDto)
                        .ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load radiologist dashboard.", error = ex.Message });
            }
        }

        // GET: /radiology/Radiologist/review-queue
        [HttpGet("review-queue")]
        public async Task<IActionResult> ReviewQueue()
        {
            try
            {
                var list = await ResultQuery()
                    .AsNoTracking()
                    .Where(r =>
                        r.ImagePath != null && r.ImagePath != "" &&
                        (r.RadiologyRequest == null ||
                         r.RadiologyRequest.Status.ToLower() != "completed"))
                    .OrderBy(r => r.ResultDate)
                    .ToListAsync();

                return Ok(list.Select(MapResultResponse).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load review queue.", error = ex.Message });
            }
        }

        // GET: /radiology/Radiologist/requests/{id}
        [HttpGet("requests/{id:int}")]
        public async Task<IActionResult> GetRequestDetails(int id)
        {
            try
            {
                var r = await RequestQuery()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.RadiologyRequestID == id);

                if (r == null)
                    return NotFound(new { message = "Radiology request not found." });

                return Ok(MapRequestDetail(r));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load request details.", error = ex.Message });
            }
        }

        // GET: /radiology/Radiologist/results/{id}
        [HttpGet("results/{id:int}")]
        public async Task<IActionResult> GetResult(int id)
        {
            try
            {
                var r = await ResultQuery()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.RadiologyResultID == id);

                if (r == null)
                    return NotFound(new { message = "Radiology result not found." });

                return Ok(MapResultResponse(r));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load result.", error = ex.Message });
            }
        }

        // PUT: /radiology/Radiologist/results/{id}/report
        [HttpPut("results/{id:int}/report")]
        public async Task<IActionResult> WriteReport(int id, [FromBody] UpdateRadiologyResultDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.ResultDescription))
                    return BadRequest(new { message = "ResultDescription (report/impression) is required." });

                var entity = await _context.RadiologyResults
                    .FirstOrDefaultAsync(r => r.RadiologyResultID == id);

                if (entity == null)
                    return NotFound(new { message = "Radiology result not found." });

                entity.ResultDescription = dto.ResultDescription.Trim();
                if (dto.ResultDate.HasValue)
                    entity.ResultDate = dto.ResultDate.Value;
                else
                    entity.ResultDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var updated = await ResultQuery()
                    .AsNoTracking()
                    .FirstAsync(r => r.RadiologyResultID == id);

                return Ok(MapResultResponse(updated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to save report.", error = ex.Message });
            }
        }

        // PUT: /radiology/Radiologist/results/{id}/finalize
        [HttpPut("results/{id:int}/finalize")]
        public async Task<IActionResult> FinalizeReport(int id, [FromBody] UpdateRadiologyResultDto? dto)
        {
            try
            {
                var entity = await _context.RadiologyResults
                    .Include(r => r.RadiologyRequest)
                    .FirstOrDefaultAsync(r => r.RadiologyResultID == id);

                if (entity == null)
                    return NotFound(new { message = "Radiology result not found." });

                if (dto?.ResultDescription != null)
                    entity.ResultDescription = dto.ResultDescription.Trim();

                if (string.IsNullOrWhiteSpace(entity.ResultDescription))
                    return BadRequest(new { message = "Report text (ResultDescription) is required before finalize." });

                entity.ResultDate = DateTime.UtcNow;

                if (entity.RadiologyRequest != null)
                    entity.RadiologyRequest.Status = "Completed";

                await _context.SaveChangesAsync();

                var updated = await ResultQuery()
                    .AsNoTracking()
                    .FirstAsync(r => r.RadiologyResultID == id);

                return Ok(MapResultResponse(updated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to finalize report.", error = ex.Message });
            }
        }
    }
}
