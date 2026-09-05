using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.DTO.ReferralManagement;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.ReferralManagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.ReferralManagement
{
    [ApiController]
    [Route("api/referral-queue")]
    [Authorize(Roles = "Doctor")]
    public class ReferralQueueController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReferralQueueController(AppDbContext context)
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

        private async Task<List<ReferralQueueDto>> MapQueueAsync(List<Referral> referrals)
        {
            var result = new List<ReferralQueueDto>();

            foreach (var r in referrals)
            {
                string patientName = "";
                string? mrn = null;

                if (r.Patient != null)
                {
                    patientName = $"{r.Patient.FirstName} {r.Patient.LastName}".Trim();
                    mrn = r.Patient.MRN;
                }

                result.Add(new ReferralQueueDto
                {
                    ReferralID = r.ReferralID,
                    PatientID = r.PatientID,
                    PatientName = patientName,
                    MRN = mrn,
                    PatientVisitID = r.PatientVisitID,
                    ReferringDepartmentID = r.ReferringDepartmentID,
                    ReferringDepartmentName = await GetDepartmentNameAsync(r.ReferringDepartmentID),
                    ReceivingDepartmentID = r.ReceivingDepartmentID,
                    ReceivingDepartmentName = await GetDepartmentNameAsync(r.ReceivingDepartmentID),
                    ReferringDoctorID = r.ReferringDoctorID,
                    ReferringDoctorName = await GetDoctorNameAsync(r.ReferringDoctorID),
                    ReferralReason = r.ReferralReason,
                    Urgency = r.Urgency,
                    Status = r.Status,
                    ReferralDate = r.ReferralDate,
                    ReferralType = r.ReferralType
                });
            }

            return result;
        }

        private async Task<List<Referral>> GetIncomingReferralsAsync(int departmentId, ReferralStatus? statusFilter)
        {
            var query = _context.Referrals
                .AsNoTracking()
                .Include(r => r.Patient)
                .Where(r => r.ReceivingDepartmentID == departmentId);

            if (statusFilter.HasValue)
                query = query.Where(r => r.Status == statusFilter.Value);

            return await query
                .OrderByDescending(r => r.ReferralDate)
                .ToListAsync();
        }

        /// <summary>
        /// GET /api/referral-queue
        /// All incoming referrals for the authenticated doctor's department.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetIncomingQueue()
        {
            try
            {
                int departmentId = GetDepartmentId();
                var referrals = await GetIncomingReferralsAsync(departmentId, null);
                var result = await MapQueueAsync(referrals);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving the referral queue." });
            }
        }

        /// <summary>
        /// GET /api/referral-queue/pending
        /// Pending (and Draft) incoming referrals for the authenticated doctor's department.
        /// </summary>
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingQueue()
        {
            try
            {
                int departmentId = GetDepartmentId();

                var referrals = await _context.Referrals
                    .AsNoTracking()
                    .Include(r => r.Patient)
                    .Where(r => r.ReceivingDepartmentID == departmentId
                                && (r.Status == ReferralStatus.Pending || r.Status == ReferralStatus.Draft))
                    .OrderByDescending(r => r.ReferralDate)
                    .ToListAsync();

                var result = await MapQueueAsync(referrals);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving pending referrals." });
            }
        }

        /// <summary>
        /// GET /api/referral-queue/accepted
        /// Accepted incoming referrals for the authenticated doctor's department.
        /// </summary>
        [HttpGet("accepted")]
        public async Task<IActionResult> GetAcceptedQueue()
        {
            try
            {
                int departmentId = GetDepartmentId();
                var referrals = await GetIncomingReferralsAsync(departmentId, ReferralStatus.Accepted);
                var result = await MapQueueAsync(referrals);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving accepted referrals." });
            }
        }

        /// <summary>
        /// GET /api/referral-queue/rejected
        /// Rejected incoming referrals for the authenticated doctor's department.
        /// </summary>
        [HttpGet("rejected")]
        public async Task<IActionResult> GetRejectedQueue()
        {
            try
            {
                int departmentId = GetDepartmentId();
                var referrals = await GetIncomingReferralsAsync(departmentId, ReferralStatus.Rejected);
                var result = await MapQueueAsync(referrals);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving rejected referrals." });
            }
        }

        /// <summary>
        /// GET /api/referral-queue/{referralId}
        /// Full referral detail for a referral addressed to the authenticated doctor's department.
        /// </summary>
        [HttpGet("{referralId:int}")]
        public async Task<IActionResult> GetReferralDetail(int referralId)
        {
            try
            {
                int departmentId = GetDepartmentId();

                var referral = await _context.Referrals
                    .AsNoTracking()
                    .Include(r => r.Patient)
                    .Include(r => r.PatientVisit)
                        .ThenInclude(v => v!.Triage)
                    .FirstOrDefaultAsync(r => r.ReferralID == referralId);

                if (referral == null)
                    return NotFound(new { message = "Referral not found." });

                // Receiving department always allowed; referring department also allowed for visibility
                bool isReceiving = referral.ReceivingDepartmentID == departmentId;
                bool isReferring = referral.ReferringDepartmentID == departmentId;

                if (!isReceiving && !isReferring)
                    return Forbid();

                string? referringDoctorName = null;
                if (referral.ReferringDoctorID.HasValue)
                {
                    referringDoctorName = await _context.Doctors
                        .AsNoTracking()
                        .Where(d => d.DoctorID == referral.ReferringDoctorID)
                        .Select(d => d.Users != null
                            ? d.Users.FirstName + " " + d.Users.FatherName
                            : null)
                        .FirstOrDefaultAsync();
                }

                string? receivingDoctorName = null;
                if (referral.ReceivingDoctorID.HasValue)
                {
                    receivingDoctorName = await _context.Doctors
                        .AsNoTracking()
                        .Where(d => d.DoctorID == referral.ReceivingDoctorID)
                        .Select(d => d.Users != null
                            ? d.Users.FirstName + " " + d.Users.FatherName
                            : null)
                        .FirstOrDefaultAsync();
                }

                string? referringDeptName = await GetDepartmentNameAsync(referral.ReferringDepartmentID);
                string? receivingDeptName = await GetDepartmentNameAsync(referral.ReceivingDepartmentID);

                ReferralPatientDto? patientDto = null;
                if (referral.Patient != null)
                {
                    var p = referral.Patient;
                    int age = 0;
                    if (p.DateOfBirth != default)
                    {
                        age = DateTime.UtcNow.Year - p.DateOfBirth.Year;
                        if (p.DateOfBirth.Date > DateTime.UtcNow.AddYears(-age)) age--;
                        if (age < 0) age = 0;
                    }

                    patientDto = new ReferralPatientDto
                    {
                        PatientID = p.PatientID,
                        MRN = p.MRN,
                        FirstName = p.FirstName,
                        LastName = p.LastName,
                        PatientName = $"{p.FirstName} {p.LastName}".Trim(),
                        Gender = p.Gender,
                        DateOfBirth = p.DateOfBirth,
                        Age = age,
                        Phone = p.Phone,
                        Address = p.Address,
                        EmergencyContact = p.EmergencyContact
                    };
                }

                ReferralVisitDto? visitDto = null;
                List<ReferralTriageDto> triageDtos = new();

                if (referral.PatientVisit != null)
                {
                    var v = referral.PatientVisit;
                    visitDto = new ReferralVisitDto
                    {
                        VisitID = v.VisitID,
                        PatientID = v.PatientID,
                        VisitDate = v.VisitDate,
                        VisitType = v.VisitType,
                        Status = v.Status,
                        Created_at = v.Created_at
                    };

                    if (v.Triage != null)
                    {
                        var deptIds = v.Triage.Select(t => t.ClinicalDepartmentID).Distinct().ToList();
                        var deptNames = await _context.ClinicalDepartments
                            .AsNoTracking()
                            .Where(d => deptIds.Contains(d.ClinicalDepartmentID))
                            .ToDictionaryAsync(d => d.ClinicalDepartmentID, d => d.DepartmentName);

                        triageDtos = v.Triage.Select(t => new ReferralTriageDto
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
                    }
                }

                var recentVisits = await _context.PatientVisits
                    .AsNoTracking()
                    .Where(v => v.PatientID == referral.PatientID)
                    .OrderByDescending(v => v.VisitDate)
                    .Take(10)
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

                var detail = new ReferralDetailDto
                {
                    ReferralID = referral.ReferralID,
                    PatientID = referral.PatientID,
                    PatientVisitID = referral.PatientVisitID,
                    ReferringDoctorID = referral.ReferringDoctorID,
                    ReferringDoctorName = referringDoctorName,
                    ReceivingDoctorID = referral.ReceivingDoctorID,
                    ReceivingDoctorName = receivingDoctorName,
                    ReferringDepartmentID = referral.ReferringDepartmentID,
                    ReferringDepartmentName = referringDeptName,
                    ReceivingDepartmentID = referral.ReceivingDepartmentID,
                    ReceivingDepartmentName = receivingDeptName,
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
                    CreatedAt = referral.CreatedAt,
                    Patient = patientDto,
                    Visit = visitDto,
                    Triages = triageDtos,
                    RecentVisits = recentVisits
                };

                return Ok(detail);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving referral detail." });
            }
        }
    }
}
