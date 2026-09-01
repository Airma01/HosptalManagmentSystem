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
    public class RadiologyRequestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RadiologyRequestController(AppDbContext context)
        {
            _context = context;
        }

        private int? GetAuthenticatedDoctorId()
        {
            var claim = User.FindFirst("DoctorID")?.Value;
            if (int.TryParse(claim, out int id))
                return id;
            return null;
        }

        private bool IsInRole(string role) => User.IsInRole(role);

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

        private IQueryable<RadiologyRequest> BaseQuery()
        {
            return _context.RadiologyRequests
                .Include(r => r.Patient)
                .Include(r => r.Doctor)!.ThenInclude(d => d!.Users)
                .Include(r => r.RadiologyTestType)!.ThenInclude(t => t!.RadiologyDepartment)
                .Include(r => r.Consultation)
                .Include(r => r.RadiologyResult);
        }

        // ----------------------------------------------------------
        // POST: /radiology/RadiologyRequest
        // Single request (existing contract)
        // ----------------------------------------------------------
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Create([FromBody] CreateRadiologyRequestDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Request body is required." });

                var doctorId = GetAuthenticatedDoctorId();
                if (doctorId == null)
                    return Unauthorized(new { message = "Doctor identity not found in token." });

                var effectiveDoctorId = doctorId.Value;

                if (dto.DoctorID != 0 && dto.DoctorID != effectiveDoctorId)
                    return BadRequest(new { message = "DoctorID must match the authenticated doctor." });

                var patientExists = await _context.Patients.AnyAsync(p => p.PatientID == dto.PatientID);
                if (!patientExists)
                    return BadRequest(new { message = "PatientID does not exist." });

                var consultation = await _context.Consultations
                    .FirstOrDefaultAsync(c => c.ConsultationID == dto.ConsultationID);

                if (consultation == null)
                    return BadRequest(new { message = "ConsultationID does not exist." });

                if (consultation.DoctorID != effectiveDoctorId)
                    return BadRequest(new { message = "Consultation does not belong to the authenticated doctor." });

                var testTypeExists = await _context.RadiologyTestTypes
                    .AnyAsync(t => t.RadiologyTestTypeID == dto.RadiologyTestTypeID);

                if (!testTypeExists)
                    return BadRequest(new { message = "RadiologyTestTypeID does not exist." });

                var entity = new RadiologyRequest
                {
                    ConsultationID = dto.ConsultationID,
                    PatientID = dto.PatientID,
                    DoctorID = effectiveDoctorId,
                    RadiologyTestTypeID = dto.RadiologyTestTypeID,
                    RequestDate = DateTime.UtcNow,
                    Status = string.IsNullOrWhiteSpace(dto.Status) ? "Requested" : dto.Status.Trim()
                };

                _context.RadiologyRequests.Add(entity);
                await _context.SaveChangesAsync();

                var created = await BaseQuery()
                    .AsNoTracking()
                    .FirstAsync(r => r.RadiologyRequestID == entity.RadiologyRequestID);

                return StatusCode(201, MapDetail(created));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create radiology request.", error = ex.Message });
            }
        }

        // ----------------------------------------------------------
        // POST: /radiology/RadiologyRequest/bulk
        // Multiple tests under one consultation (same patient/doctor)
        // Body shape (if you add CreateRadiologyRequestsBulkDto):
        // {
        //   "consultationID": 1,
        //   "patientID": 1,
        //   "status": "Requested",
        //   "items": [ { "radiologyTestTypeID": 1 }, { "radiologyTestTypeID": 2 } ]
        // }
        // If you prefer not to add a new DTO, use the doctor consultation
        // endpoint instead: POST /api/doctor/consultation/{id}/radiology-requests
        // ----------------------------------------------------------
        [HttpPost("bulk")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> CreateBulk([FromBody] CreateRadiologyRequestBulkDto dto)
        {
            try
            {
                if (dto == null || dto.Items == null || dto.Items.Count == 0)
                    return BadRequest(new { message = "At least one radiology test item is required." });

                var doctorId = GetAuthenticatedDoctorId();
                if (doctorId == null)
                    return Unauthorized(new { message = "Doctor identity not found in token." });

                var effectiveDoctorId = doctorId.Value;

                var patientExists = await _context.Patients.AnyAsync(p => p.PatientID == dto.PatientID);
                if (!patientExists)
                    return BadRequest(new { message = "PatientID does not exist." });

                var consultation = await _context.Consultations
                    .FirstOrDefaultAsync(c => c.ConsultationID == dto.ConsultationID);

                if (consultation == null)
                    return BadRequest(new { message = "ConsultationID does not exist." });

                if (consultation.DoctorID != effectiveDoctorId)
                    return BadRequest(new { message = "Consultation does not belong to the authenticated doctor." });

                var typeIds = dto.Items.Select(i => i.RadiologyTestTypeID).Distinct().ToList();
                var validCount = await _context.RadiologyTestTypes
                    .CountAsync(t => typeIds.Contains(t.RadiologyTestTypeID));

                if (validCount != typeIds.Count)
                    return BadRequest(new { message = "One or more RadiologyTestTypeID values are invalid." });

                var status = string.IsNullOrWhiteSpace(dto.Status) ? "Requested" : dto.Status.Trim();
                var createdIds = new List<int>();

                using var tx = await _context.Database.BeginTransactionAsync();
                try
                {
                    foreach (var item in dto.Items)
                    {
                        var entity = new RadiologyRequest
                        {
                            ConsultationID = dto.ConsultationID,
                            PatientID = dto.PatientID,
                            DoctorID = effectiveDoctorId,
                            RadiologyTestTypeID = item.RadiologyTestTypeID,
                            RequestDate = DateTime.UtcNow,
                            Status = string.IsNullOrWhiteSpace(item.Status) ? status : item.Status.Trim()
                        };
                        _context.RadiologyRequests.Add(entity);
                        await _context.SaveChangesAsync();
                        createdIds.Add(entity.RadiologyRequestID);
                    }

                    await tx.CommitAsync();
                }
                catch
                {
                    await tx.RollbackAsync();
                    throw;
                }

                var created = await BaseQuery()
                    .AsNoTracking()
                    .Where(r => createdIds.Contains(r.RadiologyRequestID))
                    .OrderBy(r => r.RadiologyRequestID)
                    .ToListAsync();

                return StatusCode(201, created.Select(MapDetail).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create radiology requests.", error = ex.Message });
            }
        }

        // ----------------------------------------------------------
        // GET: /radiology/RadiologyRequest
        // FIXED: was [HttpGet("/")] which mapped to site root
        // ----------------------------------------------------------
        [HttpGet]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> GetAll([FromQuery] string? status = null)
        {
            try
            {
                var query = BaseQuery().AsNoTracking();

                if (!string.IsNullOrWhiteSpace(status))
                {
                    var s = status.Trim().ToLower();
                    query = query.Where(r => r.Status.ToLower() == s);
                }

                var items = await query
                    .OrderByDescending(r => r.RequestDate)
                    .ToListAsync();

                return Ok(items.Select(MapListItem).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load radiology requests.", error = ex.Message });
            }
        }

        // GET: /radiology/RadiologyRequest/{id}
        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var r = await BaseQuery()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.RadiologyRequestID == id);

                if (r == null)
                    return NotFound(new { message = "Radiology request not found." });

                return Ok(MapDetail(r));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load radiology request.", error = ex.Message });
            }
        }

        // GET: /radiology/RadiologyRequest/patient/{patientId}
        [HttpGet("patient/{patientId:int}")]
        [Authorize]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            try
            {
                var items = await BaseQuery()
                    .AsNoTracking()
                    .Where(r => r.PatientID == patientId)
                    .OrderByDescending(r => r.RequestDate)
                    .ToListAsync();

                return Ok(items.Select(MapListItem).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load patient radiology requests.", error = ex.Message });
            }
        }

        // GET: /radiology/RadiologyRequest/my
        [HttpGet("my")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> GetMyRequests()
        {
            try
            {
                var doctorId = GetAuthenticatedDoctorId();
                if (doctorId == null)
                    return Unauthorized(new { message = "Doctor identity not found in token." });

                var items = await BaseQuery()
                    .AsNoTracking()
                    .Where(r => r.DoctorID == doctorId.Value)
                    .OrderByDescending(r => r.RequestDate)
                    .ToListAsync();

                return Ok(items.Select(MapListItem).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load doctor radiology requests.", error = ex.Message });
            }
        }

        // GET: /radiology/RadiologyRequest/queue
        // Radiographer work queue (Pending / Requested / InProgress)
        [HttpGet("queue")]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> GetQueue([FromQuery] string? status = null)
        {
            try
            {
                var query = BaseQuery().AsNoTracking();

                if (!string.IsNullOrWhiteSpace(status))
                {
                    var s = status.Trim().ToLower();
                    query = query.Where(r => r.Status.ToLower() == s);
                }
                else
                {
                    query = query.Where(r =>
                        r.Status.ToLower() == "pending" ||
                        r.Status.ToLower() == "requested" ||
                        r.Status.ToLower() == "inprogress" ||
                        r.Status == "");
                }

                var items = await query
                    .OrderBy(r => r.RequestDate)
                    .ToListAsync();

                return Ok(items.Select(MapListItem).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load radiographer queue.", error = ex.Message });
            }
        }

        // PUT: /radiology/RadiologyRequest/{id}/status
        [HttpPut("{id:int}/status")]
        [Authorize(Roles = "Doctor,Radiographer")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateRadiologyRequestDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
                    return BadRequest(new { message = "Status is required." });

                if (dto.RadiologyRequestID != 0 && dto.RadiologyRequestID != id)
                    return BadRequest(new { message = "Route id and body RadiologyRequestID must match." });

                var entity = await _context.RadiologyRequests
                    .FirstOrDefaultAsync(r => r.RadiologyRequestID == id);

                if (entity == null)
                    return NotFound(new { message = "Radiology request not found." });

                // Doctors may only update their own requests
                if (IsInRole("Doctor") && !IsInRole("Radiographer"))
                {
                    var doctorId = GetAuthenticatedDoctorId();
                    if (doctorId == null)
                        return Unauthorized(new { message = "Doctor identity not found in token." });

                    if (entity.DoctorID != doctorId.Value)
                        return Forbid();
                }

                entity.Status = dto.Status.Trim();
                await _context.SaveChangesAsync();

                var updated = await BaseQuery()
                    .AsNoTracking()
                    .FirstAsync(r => r.RadiologyRequestID == id);

                return Ok(MapDetail(updated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update request status.", error = ex.Message });
            }
        }
    }
}