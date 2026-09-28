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
            return value.Trim().ToLowerInvariant().Replace(" ", "").Replace("_", "").Replace("-", "");
        }

        private static List<string> VisitTypeMatchValues(string visitType)
        {
            var values = new List<string> { visitType.Trim() };
            var n = NormalizeVisitType(visitType);
            if (n == "maternal")
                values.AddRange(new[] { "Maternal", "maternal", "MATERNAL" });
            else if (n == "childhealth")
                values.AddRange(new[] { "ChildHealth", "Child Health", "childhealth", "child health", "CHILDHEALTH", "CHILD HEALTH" });
            else if (n == "adult" || n == "general")
                values.AddRange(new[] { "Adult", "General", "adult", "general" });
            return values.Distinct(StringComparer.Ordinal).ToList();
        }

        /// <summary>
        /// GET /api/doctor/triage — ONLY visits with Bill.Status = Paid
        /// </summary>
        [HttpGet("triage")]
        public async Task<IActionResult> GetDepartmentTriageQueue(
            [FromQuery] string? visitType = null,
            [FromQuery] int? triageDepartmentId = null)
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

                // *** HOSPITAL PAYMENT GATE ***
                query = query.Where(t =>
                    _context.Bills.Any(b => b.VisitID == t.VisitID && b.Status == "Paid"));

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
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving triage queue." });
            }
        }

        [HttpGet("visit/{visitId:int}/payment-ok")]
        public async Task<IActionResult> IsVisitPaid(int visitId)
        {
            var paid = await _context.Bills.AnyAsync(b => b.VisitID == visitId && b.Status == "Paid");
            if (!paid)
                return BadRequest(new { isPaid = false, message = "Visit bill unpaid. Cannot start consultation." });
            return Ok(new { isPaid = true });
        }
    }
}
