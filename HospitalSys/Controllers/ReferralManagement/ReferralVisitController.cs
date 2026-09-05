using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.DTO.ReferralManagement;
using HospitalSys.Models.ReferralManagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.ReferralManagement
{
    [ApiController]
    [Route("api/referral-visit")]
    [Authorize(Roles = "Doctor")]
    public class ReferralVisitController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReferralVisitController(AppDbContext context)
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

        /// <summary>
        /// Ensures the authenticated doctor's department is associated with the patient
        /// via an existing referral (receiving or referring side).
        /// </summary>
        private async Task<bool> DoctorHasReferralAccessToPatientAsync(int patientId, int departmentId)
        {
            return await _context.Referrals
                .AsNoTracking()
                .AnyAsync(r => r.PatientID == patientId
                               && (r.ReceivingDepartmentID == departmentId
                                   || r.ReferringDepartmentID == departmentId));
        }

        /// <summary>
        /// GET /api/referral-visit/patient/{patientId}
        /// All visits for a patient related to a referral involving the doctor's department.
        /// </summary>
        [HttpGet("patient/{patientId:int}")]
        public async Task<IActionResult> GetPatientVisits(int patientId)
        {
            try
            {
                int departmentId = GetDepartmentId();

                var patientExists = await _context.Patients
                    .AsNoTracking()
                    .AnyAsync(p => p.PatientID == patientId);

                if (!patientExists)
                    return NotFound(new { message = "Patient not found." });

                bool hasAccess = await DoctorHasReferralAccessToPatientAsync(patientId, departmentId);
                if (!hasAccess)
                    return Forbid();

                var visits = await _context.PatientVisits
                    .AsNoTracking()
                    .Where(v => v.PatientID == patientId)
                    .OrderByDescending(v => v.VisitDate)
                    .Select(v => new ReferralVisitDto
                    {
                        VisitID = v.VisitID,
                        PatientID = v.PatientID,
                        VisitDate = v.VisitDate,
                        VisitType = v.VisitType,
                        Status = v.Status,
                        Created_at = v.Created_at
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
                return StatusCode(500, new { message = "An error occurred while retrieving patient visits." });
            }
        }

        /// <summary>
        /// GET /api/referral-visit/patient/{patientId}/recent
        /// Most recent visit for a patient related to a referral involving the doctor's department.
        /// </summary>
        [HttpGet("patient/{patientId:int}/recent")]
        public async Task<IActionResult> GetRecentVisit(int patientId)
        {
            try
            {
                int departmentId = GetDepartmentId();

                var patientExists = await _context.Patients
                    .AsNoTracking()
                    .AnyAsync(p => p.PatientID == patientId);

                if (!patientExists)
                    return NotFound(new { message = "Patient not found." });

                bool hasAccess = await DoctorHasReferralAccessToPatientAsync(patientId, departmentId);
                if (!hasAccess)
                    return Forbid();

                var visit = await _context.PatientVisits
                    .AsNoTracking()
                    .Where(v => v.PatientID == patientId)
                    .OrderByDescending(v => v.VisitDate)
                    .Select(v => new ReferralVisitDto
                    {
                        VisitID = v.VisitID,
                        PatientID = v.PatientID,
                        VisitDate = v.VisitDate,
                        VisitType = v.VisitType,
                        Status = v.Status,
                        Created_at = v.Created_at
                    })
                    .FirstOrDefaultAsync();

                if (visit == null)
                    return NotFound(new { message = "No visits found for this patient." });

                return Ok(visit);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the recent visit." });
            }
        }

        /// <summary>
        /// GET /api/referral-visit/{visitId}
        /// Get a specific visit. Access requires a referral linking the patient to the doctor's department.
        /// </summary>
        [HttpGet("{visitId:int}")]
        public async Task<IActionResult> GetVisitById(int visitId)
        {
            try
            {
                int departmentId = GetDepartmentId();

                var visit = await _context.PatientVisits
                    .AsNoTracking()
                    .FirstOrDefaultAsync(v => v.VisitID == visitId);

                if (visit == null)
                    return NotFound(new { message = "Visit not found." });

                bool hasAccess = await DoctorHasReferralAccessToPatientAsync(visit.PatientID, departmentId);
                if (!hasAccess)
                    return Forbid();

                var dto = new ReferralVisitDto
                {
                    VisitID = visit.VisitID,
                    PatientID = visit.PatientID,
                    VisitDate = visit.VisitDate,
                    VisitType = visit.VisitType,
                    Status = visit.Status,
                    Created_at = visit.Created_at
                };

                return Ok(dto);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the visit." });
            }
        }

        /// <summary>
        /// GET /api/referral-visit/{visitId}/triage
        /// Triage records (including vital signs) for a visit.
        /// Access requires a referral linking the patient to the doctor's department.
        /// </summary>
        [HttpGet("{visitId:int}/triage")]
        public async Task<IActionResult> GetVisitTriage(int visitId)
        {
            try
            {
                int departmentId = GetDepartmentId();

                var visit = await _context.PatientVisits
                    .AsNoTracking()
                    .FirstOrDefaultAsync(v => v.VisitID == visitId);

                if (visit == null)
                    return NotFound(new { message = "Visit not found." });

                bool hasAccess = await DoctorHasReferralAccessToPatientAsync(visit.PatientID, departmentId);
                if (!hasAccess)
                    return Forbid();

                var triages = await _context.Triages
                    .AsNoTracking()
                    .Where(t => t.VisitID == visitId)
                    .OrderByDescending(t => t.TriageId)
                    .ToListAsync();

                var deptIds = triages.Select(t => t.ClinicalDepartmentID).Distinct().ToList();
                var deptNames = await _context.ClinicalDepartments
                    .AsNoTracking()
                    .Where(d => deptIds.Contains(d.ClinicalDepartmentID))
                    .ToDictionaryAsync(d => d.ClinicalDepartmentID, d => d.DepartmentName);

                var result = triages.Select(t => new ReferralTriageDto
                {
                    TriageId = t.TriageId,
                    VisitID = t.VisitID,
                    NurseID = t.NurseID,
                    TriageDepartmentID = t.TriageDepartmentID,
                    ClinicalDepartmentID = t.ClinicalDepartmentID,
                    ClinicalDepartmentName = deptNames.GetValueOrDefault(t.ClinicalDepartmentID),
                    Temprature = t.Temprature,
                    BloodPressure = t.BloodPressure,
                    HeartRate = t.HeartRate,
                    RespiratotyRate = t.RespiratotyRate,
                    Weight = t.Weight,
                    Notes = t.Notes
                }).ToList();

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving triage records." });
            }
        }
    }
}
