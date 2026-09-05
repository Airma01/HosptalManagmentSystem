using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.DTO.ReferralManagement;
using HospitalSys.Models;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.ReferralManagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.ReferralManagement
{
    [ApiController]
    [Route("api/referral")]
    [Authorize(Roles = "Doctor")]
    public class ReferralController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReferralController(AppDbContext context)
        {
            _context = context;
        }

        private int GetDoctorId()
        {
            var claim = User.FindFirst("DoctorID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid doctor authentication");
            return id;
        }

        private int GetDepartmentId()
        {
            var claim = User.FindFirst("DepartmentID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid department claim");
            return id;
        }

        private async Task<int?> GetCurrentUserIdAsync(int doctorId)
        {
            return await _context.Doctors
                .AsNoTracking()
                .Where(d => d.DoctorID == doctorId)
                .Select(d => (int?)d.UserID)
                .FirstOrDefaultAsync();
        }

        private async Task<string?> GetDoctorNameAsync(int? doctorId)
        {
            if (doctorId == null) return null;

            return await _context.Doctors
                .AsNoTracking()
                .Where(d => d.DoctorID == doctorId)
                .Select(d => d.Users != null
                    ? d.Users.FirstName + " " + d.Users.FatherName
                    : null)
                .FirstOrDefaultAsync();
        }

        private async Task<string?> GetDepartmentNameAsync(int? departmentId)
        {
            if (departmentId == null) return null;

            return await _context.ClinicalDepartments
                .AsNoTracking()
                .Where(d => d.ClinicalDepartmentID == departmentId)
                .Select(d => d.DepartmentName)
                .FirstOrDefaultAsync();
        }

        private async Task<ReferralResponseDto> MapToResponseDtoAsync(Referral referral)
        {
            return new ReferralResponseDto
            {
                ReferralID = referral.ReferralID,
                PatientID = referral.PatientID,
                PatientVisitID = referral.PatientVisitID,
                ReferringDoctorID = referral.ReferringDoctorID,
                ReferringDoctorName = await GetDoctorNameAsync(referral.ReferringDoctorID),
                ReceivingDoctorID = referral.ReceivingDoctorID,
                ReceivingDoctorName = await GetDoctorNameAsync(referral.ReceivingDoctorID),
                ReferringDepartmentID = referral.ReferringDepartmentID,
                ReferringDepartmentName = await GetDepartmentNameAsync(referral.ReferringDepartmentID),
                ReceivingDepartmentID = referral.ReceivingDepartmentID,
                ReceivingDepartmentName = await GetDepartmentNameAsync(referral.ReceivingDepartmentID),
                ReferralReason = referral.ReferralReason,
                ClinicalSummary = referral.ClinicalSummary,
                Diagnosis = referral.Diagnosis,
                Urgency = referral.Urgency,
                ReferralType = referral.ReferralType,
                ReferralDate = referral.ReferralDate,
                ExpectedArrivalDate = referral.ExpectedArrivalDate,
                Status = referral.Status,
                DestinationFacility = referral.DestinationFacility,
                Notes = referral.Notes,
                CreatedAt = referral.CreatedAt
            };
        }

        /// <summary>
        /// POST /api/referral
        /// Create a referral from the authenticated doctor's department to a destination department.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateReferral([FromBody] CreateReferralDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Request body is required." });

                if (dto.PatientID <= 0)
                    return BadRequest(new { message = "PatientID is required." });

                if (dto.PatientVisitID <= 0)
                    return BadRequest(new { message = "PatientVisitID is required." });

                if (dto.ReceivingDepartmentID <= 0)
                    return BadRequest(new { message = "ReceivingDepartmentID is required." });

                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                if (dto.ReceivingDepartmentID == departmentId)
                    return BadRequest(new { message = "Source and destination department cannot be the same." });

                var patientExists = await _context.Patients
                    .AsNoTracking()
                    .AnyAsync(p => p.PatientID == dto.PatientID);

                if (!patientExists)
                    return NotFound(new { message = "Patient not found." });

                var visit = await _context.PatientVisits
                    .AsNoTracking()
                    .FirstOrDefaultAsync(v => v.VisitID == dto.PatientVisitID);

                if (visit == null)
                    return NotFound(new { message = "Patient visit not found." });

                if (visit.PatientID != dto.PatientID)
                    return BadRequest(new { message = "The visit does not belong to the specified patient." });

                var destinationExists = await _context.ClinicalDepartments
                    .AsNoTracking()
                    .AnyAsync(d => d.ClinicalDepartmentID == dto.ReceivingDepartmentID);

                if (!destinationExists)
                    return NotFound(new { message = "Destination department not found." });

                int? createdByUserId = await GetCurrentUserIdAsync(doctorId);

                var referral = new Referral
                {
                    PatientID = dto.PatientID,
                    PatientVisitID = dto.PatientVisitID,
                    ReferringDoctorID = doctorId,
                    ReferringDepartmentID = departmentId,
                    ReceivingDepartmentID = dto.ReceivingDepartmentID,
                    ReferralReason = dto.ReferralReason,
                    ClinicalSummary = dto.ClinicalSummary,
                    Diagnosis = dto.Diagnosis,
                    Urgency = dto.Urgency,
                    ReferralType = dto.ReferralType,
                    ExpectedArrivalDate = dto.ExpectedArrivalDate,
                    DestinationFacility = dto.DestinationFacility,
                    Notes = dto.Notes,
                    Status = ReferralStatus.Pending,
                    ReferralDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserID = createdByUserId
                };

                _context.Referrals.Add(referral);
                await _context.SaveChangesAsync();

                var response = await MapToResponseDtoAsync(referral);
                return CreatedAtAction(nameof(GetReferralById), new { id = referral.ReferralID }, response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while creating the referral." });
            }
        }

        /// <summary>
        /// GET /api/referral/{id}
        /// Get a referral by ID. Accessible by referring or receiving department.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetReferralById(int id)
        {
            try
            {
                int departmentId = GetDepartmentId();

                var referral = await _context.Referrals
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.ReferralID == id);

                if (referral == null)
                    return NotFound(new { message = "Referral not found." });

                bool isReferring = referral.ReferringDepartmentID == departmentId;
                bool isReceiving = referral.ReceivingDepartmentID == departmentId;

                if (!isReferring && !isReceiving)
                    return Forbid();

                var response = await MapToResponseDtoAsync(referral);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the referral." });
            }
        }

        /// <summary>
        /// PUT /api/referral/{id}
        /// Update editable fields of a referral. Referring department can update while Pending/Draft.
        /// Receiving department can update status-related fields when appropriate.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateReferral(int id, [FromBody] UpdateReferralDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Request body is required." });

                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var referral = await _context.Referrals
                    .FirstOrDefaultAsync(r => r.ReferralID == id);

                if (referral == null)
                    return NotFound(new { message = "Referral not found." });

                bool isReferring = referral.ReferringDepartmentID == departmentId;
                bool isReceiving = referral.ReceivingDepartmentID == departmentId;

                if (!isReferring && !isReceiving)
                    return Forbid();

                if (referral.Status == ReferralStatus.Completed || referral.Status == ReferralStatus.Cancelled)
                    return Conflict(new { message = "Cannot update a completed or cancelled referral." });

                // Referring doctor may edit clinical content while still pending/draft
                if (isReferring &&
                    (referral.Status == ReferralStatus.Pending || referral.Status == ReferralStatus.Draft))
                {
                    if (dto.ReferralReason != null) referral.ReferralReason = dto.ReferralReason;
                    if (dto.ClinicalSummary != null) referral.ClinicalSummary = dto.ClinicalSummary;
                    if (dto.Diagnosis != null) referral.Diagnosis = dto.Diagnosis;
                    if (dto.Urgency != null) referral.Urgency = dto.Urgency;
                    if (dto.Notes != null) referral.Notes = dto.Notes;
                    if (dto.ExpectedArrivalDate.HasValue) referral.ExpectedArrivalDate = dto.ExpectedArrivalDate;
                    if (dto.DestinationFacility != null) referral.DestinationFacility = dto.DestinationFacility;
                }

                // Receiving doctor may set status / receiving doctor / notes
                if (isReceiving)
                {
                    if (dto.Status.HasValue)
                    {
                        referral.Status = dto.Status.Value;
                        if (dto.Status.Value == ReferralStatus.Accepted && referral.ReceivingDoctorID == null)
                            referral.ReceivingDoctorID = doctorId;
                    }

                    if (dto.ReceivingDoctorID.HasValue)
                        referral.ReceivingDoctorID = dto.ReceivingDoctorID;

                    if (dto.Notes != null)
                        referral.Notes = dto.Notes;
                }

                await _context.SaveChangesAsync();

                var response = await MapToResponseDtoAsync(referral);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while updating the referral." });
            }
        }

        /// <summary>
        /// POST /api/referral/{id}/accept
        /// Receiving department accepts the referral.
        /// </summary>
        [HttpPost("{id:int}/accept")]
        public async Task<IActionResult> AcceptReferral(int id)
        {
            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var referral = await _context.Referrals
                    .FirstOrDefaultAsync(r => r.ReferralID == id);

                if (referral == null)
                    return NotFound(new { message = "Referral not found." });

                if (referral.ReceivingDepartmentID != departmentId)
                    return Forbid();

                if (referral.Status != ReferralStatus.Pending && referral.Status != ReferralStatus.Draft)
                    return Conflict(new { message = $"Referral cannot be accepted from status '{referral.Status}'." });

                referral.Status = ReferralStatus.Accepted;
                referral.ReceivingDoctorID = doctorId;

                await _context.SaveChangesAsync();

                var response = await MapToResponseDtoAsync(referral);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while accepting the referral." });
            }
        }

        /// <summary>
        /// POST /api/referral/{id}/reject
        /// Receiving department rejects the referral. Optional notes can be sent in body.
        /// </summary>
        [HttpPost("{id:int}/reject")]
        public async Task<IActionResult> RejectReferral(int id, [FromBody] UpdateReferralDto? dto)
        {
            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var referral = await _context.Referrals
                    .FirstOrDefaultAsync(r => r.ReferralID == id);

                if (referral == null)
                    return NotFound(new { message = "Referral not found." });

                if (referral.ReceivingDepartmentID != departmentId)
                    return Forbid();

                if (referral.Status != ReferralStatus.Pending && referral.Status != ReferralStatus.Draft)
                    return Conflict(new { message = $"Referral cannot be rejected from status '{referral.Status}'." });

                referral.Status = ReferralStatus.Rejected;
                referral.ReceivingDoctorID = doctorId;

                if (dto?.Notes != null)
                    referral.Notes = dto.Notes;

                await _context.SaveChangesAsync();

                var response = await MapToResponseDtoAsync(referral);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while rejecting the referral." });
            }
        }

        /// <summary>
        /// POST /api/referral/{id}/cancel
        /// Referring department cancels a pending/draft referral.
        /// </summary>
        [HttpPost("{id:int}/cancel")]
        public async Task<IActionResult> CancelReferral(int id)
        {
            try
            {
                int departmentId = GetDepartmentId();

                var referral = await _context.Referrals
                    .FirstOrDefaultAsync(r => r.ReferralID == id);

                if (referral == null)
                    return NotFound(new { message = "Referral not found." });

                if (referral.ReferringDepartmentID != departmentId)
                    return Forbid();

                if (referral.Status != ReferralStatus.Pending && referral.Status != ReferralStatus.Draft)
                    return Conflict(new { message = $"Referral cannot be cancelled from status '{referral.Status}'." });

                referral.Status = ReferralStatus.Cancelled;

                await _context.SaveChangesAsync();

                var response = await MapToResponseDtoAsync(referral);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while cancelling the referral." });
            }
        }

        /// <summary>
        /// GET /api/referral/mine
        /// Referrals created by the authenticated doctor's department (outgoing).
        /// </summary>
        [HttpGet("mine")]
        public async Task<IActionResult> GetMyReferrals()
        {
            try
            {
                int departmentId = GetDepartmentId();

                var referrals = await _context.Referrals
                    .AsNoTracking()
                    .Where(r => r.ReferringDepartmentID == departmentId)
                    .OrderByDescending(r => r.ReferralDate)
                    .ToListAsync();

                var result = new List<ReferralResponseDto>();
                foreach (var referral in referrals)
                {
                    result.Add(await MapToResponseDtoAsync(referral));
                }

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving referrals." });
            }
        }

        [HttpGet("departments")]
public async Task<IActionResult> GetDepartments()
{
    try
    {
        _ = GetDoctorId();

        var departments = await _context.ClinicalDepartments
            .AsNoTracking()
            .OrderBy(d => d.DepartmentName)
            .Select(d => new
            {
                clinicalDepartmentID = d.ClinicalDepartmentID,
                departmentName = d.DepartmentName,
                description = d.Description
            })
            .ToListAsync();

        return Ok(departments);
    }
    catch (UnauthorizedAccessException ex)
    {
        return Unauthorized(new { message = ex.Message });
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "An error occurred while retrieving departments." });
    }
}

[HttpGet("patients/search")]
public async Task<IActionResult> SearchPatients([FromQuery] string? q)
{
    try
    {
        _ = GetDoctorId();

        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return BadRequest(new { message = "Enter at least 2 characters to search." });

        var term = q.Trim().ToLower();

        var patients = await _context.Patients
            .AsNoTracking()
            .Where(p =>
                p.MRN.ToLower().Contains(term) ||
                (p.FaydaFIN != null && p.FaydaFIN.ToLower().Contains(term)) ||
                p.FirstName.ToLower().Contains(term) ||
                p.LastName.ToLower().Contains(term) ||
                (p.FirstName + " " + p.LastName).ToLower().Contains(term) ||
                p.Phone.Contains(term))
            .OrderBy(p => p.FirstName)
            .Take(20)
            .Select(p => new
            {
                patientID = p.PatientID,
                mrn = p.MRN,
                faydaFIN = p.FaydaFIN,
                firstName = p.FirstName,
                lastName = p.LastName,
                patientName = p.FirstName + " " + p.LastName,
                gender = p.Gender.ToString(),
                dateOfBirth = p.DateOfBirth,
                phone = p.Phone
            })
            .ToListAsync();

        return Ok(patients);
    }
    catch (UnauthorizedAccessException ex)
    {
        return Unauthorized(new { message = ex.Message });
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "An error occurred while searching patients." });
    }
}

[HttpGet("patients/{patientId:int}/visits")]
public async Task<IActionResult> GetPatientVisitsForCreate(int patientId)
{
    try
    {
        _ = GetDoctorId();

        var exists = await _context.Patients.AsNoTracking()
            .AnyAsync(p => p.PatientID == patientId);
        if (!exists)
            return NotFound(new { message = "Patient not found." });

        var visits = await _context.PatientVisits
            .AsNoTracking()
            .Where(v => v.PatientID == patientId)
            .OrderByDescending(v => v.VisitDate)
            .Take(20)
            .Select(v => new
            {
                visitID = v.VisitID,
                patientID = v.PatientID,
                visitDate = v.VisitDate,
                visitType = v.VisitType,
                status = v.Status
            })
            .ToListAsync();

        return Ok(visits);
    }
    catch (UnauthorizedAccessException ex)
    {
        return Unauthorized(new { message = ex.Message });
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "An error occurred while retrieving visits." });
    }
}
    }
}