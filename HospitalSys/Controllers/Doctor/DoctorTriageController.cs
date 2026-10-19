using HospitalSys.Data;
using HospitalSys.Dto.DoctorDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Doctor
{
    [ApiController]
    [Route("api/doctor")]
    [Authorize(Roles = "Doctor")]
    public class DoctorTriageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorTriageController(AppDbContext context)
        {
            _context = context;
        }

        private int GetDepartmentId()
        {
            var claim = User.FindFirst("DepartmentID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid department claim");
            return id;
        }

        private static string NormalizeVisitType(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return "";
            return value.Trim().ToLowerInvariant()
                .Replace(" ", "")
                .Replace("_", "")
                .Replace("-", "");
        }

        private static List<string> VisitTypeMatchValues(string visitType)
        {
            var values = new List<string> { visitType.Trim() };
            var n = NormalizeVisitType(visitType);

            if (n == "maternal")
            {
                values.AddRange(new[] { "Maternal", "maternal", "MATERNAL" });
            }
            else if (n == "childhealth")
            {
                values.AddRange(new[]
                {
                    "ChildHealth", "Child Health", "childhealth", "child health",
                    "CHILDHEALTH", "CHILD HEALTH"
                });
            }
            else if (n == "adult" || n == "general" || n == "outpatient")
            {
                // Include Outpatient — nurse create-visit-triage uses this VisitType
                values.AddRange(new[]
                {
                    "Adult", "General", "adult", "general",
                    "Outpatient", "outpatient", "OUTPATIENT"
                });
            }

            return values.Distinct(StringComparer.Ordinal).ToList();
        }

        /// <summary>
        /// GET /api/doctor/triage
        /// Default: only visits with a Paid bill for the doctor's active clinical department.
        /// Pass ?includeUnpaid=true to also include Unpaid bills (testing).
        /// </summary>
        [HttpGet("triage")]
        public async Task<IActionResult> GetDepartmentTriageQueue(
            [FromQuery] string? visitType = null,
            [FromQuery] int? triageDepartmentId = null,
            [FromQuery] bool includeUnpaid = false)
        {
            try
            {
                int departmentId = GetDepartmentId();

                var query = _context.Triages
                    .AsNoTracking()
                    .Where(t => t.ClinicalDepartmentID == departmentId);

                query = query.Where(t =>
                    t.PatientVisit != null &&
                    t.PatientVisit.Status != "Complete" &&
                    t.PatientVisit.Status != "Completed");

                // *** HOSPITAL PAYMENT GATE (case-insensitive) ***
                if (!includeUnpaid)
                {
                    query = query.Where(t =>
                        _context.Bills.Any(b =>
                            b.VisitID == t.VisitID &&
                            b.Status.ToLower() == "paid"));
                }
                else
                {
                    query = query.Where(t =>
                        _context.Bills.Any(b => b.VisitID == t.VisitID));
                }

                if (triageDepartmentId.HasValue && triageDepartmentId.Value > 0)
                    query = query.Where(t => t.TriageDepartmentID == triageDepartmentId.Value);

                if (!string.IsNullOrWhiteSpace(visitType))
                {
                    var matchValues = VisitTypeMatchValues(visitType);
                    if (matchValues.Count == 0)
                        return Ok(new List<DoctorTriageQueueItemDto>());

                    query = query.Where(t =>
                        t.PatientVisit != null &&
                        matchValues.Contains(t.PatientVisit.VisitType));
                }

                var queue = await query
                    .Include(t => t.PatientVisit!).ThenInclude(v => v.Patient)
                    .Include(t => t.ClinicalDepartment)
                    .Include(t => t.TriageDepartment)
                    .OrderByDescending(t => t.PatientVisit!.VisitDate)
                    .Select(t => new DoctorTriageQueueItemDto
                    {
                        TriageId = t.TriageId,
                        PatientID = t.PatientVisit!.PatientID,
                        PatientName = t.PatientVisit.Patient!.FirstName + " " + t.PatientVisit.Patient.LastName,
                        MRN = t.PatientVisit.Patient != null ? t.PatientVisit.Patient.MRN : "",
                        VisitID = t.VisitID,
                        VisitDate = t.PatientVisit.VisitDate,
                        VisitType = t.PatientVisit.VisitType,
                        VisitStatus = t.PatientVisit.Status,
                        ClinicalDepartmentID = t.ClinicalDepartmentID,
                        DepartmentName = t.ClinicalDepartment != null ? t.ClinicalDepartment.DepartmentName : "",
                        TriageDepartmentID = t.TriageDepartmentID,
                        TriageDepartmentName = t.TriageDepartment != null ? t.TriageDepartment.DepartmentName : "",
                        Temprature = t.Temprature,
                        BloodPressure = t.BloodPressure,
                        HeartRate = t.HeartRate,
                        RespiratotyRate = t.RespiratotyRate,
                        Weight = t.Weight,
                        Notes = t.Notes
                    })
                    .ToListAsync();

                return Ok(queue);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new
                {
                    message = "Unauthorized — missing or invalid DepartmentID claim. Switch department or log in again."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving triage queue.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Debug: shows doctor's department and why each triage would/wouldn't appear.
        /// GET /api/doctor/triage/debug
        /// </summary>
        [HttpGet("triage/debug")]
        public async Task<IActionResult> DebugTriageQueue()
        {
            try
            {
                int departmentId = GetDepartmentId();

                var rows = await _context.Triages
                    .AsNoTracking()
                    .OrderByDescending(t => t.TriageId)
                    .Take(20)
                    .Select(t => new
                    {
                        t.TriageId,
                        t.VisitID,
                        t.ClinicalDepartmentID,
                        MatchesDoctorDept = t.ClinicalDepartmentID == departmentId,
                        VisitStatus = t.PatientVisit != null ? t.PatientVisit.Status : null,
                        VisitType = t.PatientVisit != null ? t.PatientVisit.VisitType : null,
                        BillStatuses = _context.Bills
                            .Where(b => b.VisitID == t.VisitID)
                            .Select(b => b.Status)
                            .ToList(),
                        WouldShow = t.ClinicalDepartmentID == departmentId
                            && t.PatientVisit != null
                            && t.PatientVisit.Status != "Complete"
                            && t.PatientVisit.Status != "Completed"
                            && _context.Bills.Any(b =>
                                b.VisitID == t.VisitID &&
                                b.Status.ToLower() == "paid")
                    })
                    .ToListAsync();

                return Ok(new
                {
                    doctorDepartmentId = departmentId,
                    totalChecked = rows.Count,
                    wouldShowCount = rows.Count(r => r.WouldShow),
                    rows
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized — invalid DepartmentID claim" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("visit/{visitId:int}/payment-ok")]
        public async Task<IActionResult> IsVisitPaid(int visitId)
        {
            var paid = await _context.Bills.AnyAsync(b =>
                b.VisitID == visitId &&
                b.Status.ToLower() == "paid");

            if (!paid)
                return BadRequest(new
                {
                    isPaid = false,
                    message = "Visit bill unpaid. Cannot start consultation."
                });

            return Ok(new { isPaid = true });
        }
    }
}