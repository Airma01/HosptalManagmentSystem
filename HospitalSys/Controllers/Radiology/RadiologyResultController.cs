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
    public class RadiologyResultController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RadiologyResultController(AppDbContext context)
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

        private static RadiologyResultDto MapDto(RadiologyResult r) => new()
        {
            RadiologyResultID = r.RadiologyResultID,
            RadiologyRequestID = r.RadiologyRequestID,
            RadiologyTechnicianName = r.RadiologyTechnicianName,
            ImageName = r.ImageName,
            ImagePath = r.ImagePath,
            ResultDescription = r.ResultDescription,
            ResultDate = r.ResultDate
        };

        private static RadiologyResultResponseDto MapResponse(RadiologyResult r)
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

        private IQueryable<RadiologyResult> BaseQuery()
        {
            return _context.RadiologyResults
                .Include(r => r.RadiologyRequest)!.ThenInclude(req => req!.Patient)
                .Include(r => r.RadiologyRequest)!.ThenInclude(req => req!.Doctor)!.ThenInclude(d => d!.Users)
                .Include(r => r.RadiologyRequest)!.ThenInclude(req => req!.RadiologyTestType)!.ThenInclude(t => t!.RadiologyDepartment)
                .Include(r => r.RadiologyRequest)!.ThenInclude(req => req!.Consultation);
        }

        // POST: /radiology/RadiologyResult
        [HttpPost]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> Create([FromBody] CreateRadiologyResultDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Request body is required." });

                var request = await _context.RadiologyRequests
                    .FirstOrDefaultAsync(r => r.RadiologyRequestID == dto.RadiologyRequestID);

                if (request == null)
                    return BadRequest(new { message = "RadiologyRequestID does not exist." });

                var techName = GetAuthenticatedName();
                if (string.IsNullOrWhiteSpace(techName) && !string.IsNullOrWhiteSpace(dto.RadiologyTechnicianName))
                    techName = dto.RadiologyTechnicianName.Trim();

                var entity = new RadiologyResult
                {
                    RadiologyRequestID = dto.RadiologyRequestID,
                    RadiologyTechnicianName = techName,
                    ImageName = dto.ImageName ?? "",
                    ImagePath = dto.ImagePath ?? "",
                    ResultDescription = dto.ResultDescription?.Trim() ?? "",
                    ResultDate = dto.ResultDate ?? DateTime.UtcNow
                };

                _context.RadiologyResults.Add(entity);

                // Move request toward completed workflow when a result is recorded
                if (string.IsNullOrWhiteSpace(request.Status) ||
                    request.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                {
                    request.Status = "InProgress";
                }

                await _context.SaveChangesAsync();

                var created = await BaseQuery()
                    .AsNoTracking()
                    .FirstAsync(r => r.RadiologyResultID == entity.RadiologyResultID);

                return StatusCode(201, MapResponse(created));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create radiology result.", error = ex.Message });
            }
        }

        // GET: /radiology/RadiologyResult/{id}
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var r = await BaseQuery()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.RadiologyResultID == id);

                if (r == null)
                    return NotFound(new { message = "Radiology result not found." });

                return Ok(MapResponse(r));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load radiology result.", error = ex.Message });
            }
        }

        // GET: /radiology/RadiologyResult/by-request/{requestId}
        [HttpGet("by-request/{requestId:int}")]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> GetByRequest(int requestId)
        {
            try
            {
                var list = await BaseQuery()
                    .AsNoTracking()
                    .Where(r => r.RadiologyRequestID == requestId)
                    .OrderByDescending(r => r.ResultDate)
                    .ToListAsync();

                return Ok(list.Select(MapResponse).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load results for request.", error = ex.Message });
            }
        }

        // PUT: /radiology/RadiologyResult/{id}
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRadiologyResultDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Request body is required." });

                if (dto.RadiologyResultID != 0 && dto.RadiologyResultID != id)
                    return BadRequest(new { message = "Route id and body RadiologyResultID must match." });

                var entity = await _context.RadiologyResults
                    .FirstOrDefaultAsync(r => r.RadiologyResultID == id);

                if (entity == null)
                    return NotFound(new { message = "Radiology result not found." });

                if (dto.RadiologyTechnicianName != null)
                    entity.RadiologyTechnicianName = dto.RadiologyTechnicianName.Trim();

                if (dto.ImageName != null)
                    entity.ImageName = dto.ImageName;

                if (dto.ImagePath != null)
                    entity.ImagePath = dto.ImagePath;

                if (dto.ResultDescription != null)
                    entity.ResultDescription = dto.ResultDescription.Trim();

                if (dto.ResultDate.HasValue)
                    entity.ResultDate = dto.ResultDate.Value;

                await _context.SaveChangesAsync();

                var updated = await BaseQuery()
                    .AsNoTracking()
                    .FirstAsync(r => r.RadiologyResultID == id);

                return Ok(MapResponse(updated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update radiology result.", error = ex.Message });
            }
        }

        // PUT: /radiology/RadiologyResult/{id}/finalize
        // No dedicated finalize flag on model — sets non-empty report and marks parent request Completed.
        [HttpPut("{id:int}/finalize")]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> Finalize(int id, [FromBody] UpdateRadiologyResultDto? dto)
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
                    return BadRequest(new { message = "ResultDescription (report) is required to finalize." });

                if (entity.RadiologyRequest != null)
                    entity.RadiologyRequest.Status = "Completed";

                entity.ResultDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var updated = await BaseQuery()
                    .AsNoTracking()
                    .FirstAsync(r => r.RadiologyResultID == id);

                return Ok(MapResponse(updated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to finalize radiology result.", error = ex.Message });
            }
        }
    }
}
