
// Controllers/Doctor/DoctorTriageController.cs
using System.Security.Claims;
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
        /// Normalize VisitType for matching (handles ChildHealth / "Child Health", case, spaces).
        /// </summary>
        private static string NormalizeVisitType(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return "";
            return value.Trim().ToLowerInvariant()
                .Replace(" ", "")
                .Replace("_", "")
                .Replace("-", "");
        }

        /// <summary>
        /// Build accepted stored VisitType strings for a requested filter value.
        /// Nurse UI uses "Maternal" / "ChildHealth"; doctor child-health create may use "Child Health".
        /// </summary>
        private static List<string> VisitTypeMatchValues(string visitType)
        {
            var values = new List<string>();
            var raw = visitType.Trim();
            if (raw.Length == 0) return values;

            values.Add(raw);

            var n = NormalizeVisitType(raw);
            if (n == "maternal")
            {
                values.Add("Maternal");
                values.Add("maternal");
                values.Add("MATERNAL");
            }
            else if (n == "childhealth")
            {
                values.Add("ChildHealth");
                values.Add("Child Health");
                values.Add("childhealth");
                values.Add("child health");
                values.Add("CHILDHEALTH");
                values.Add("CHILD HEALTH");
            }

            return values.Distinct(StringComparer.Ordinal).ToList();
        }

        /// <summary>
        /// GET /api/doctor/triage
        /// GET /api/doctor/triage?visitType=Maternal
        /// GET /api/doctor/triage?visitType=ChildHealth
        /// GET /api/doctor/triage?visitType=ChildHealth&amp;triageDepartmentId=1
        /// Triage records for the authenticated doctor's ClinicalDepartment only.
        /// Optional visitType is applied in the database query (not after materialization).
        /// Optional triageDepartmentId further filters by Triage.TriageDepartmentID.
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

                // Active queue: exclude completed overall visits (PatientVisit.Status)
                query = query.Where(t =>
                    t.PatientVisit != null &&
                    t.PatientVisit.Status != "Complete" &&
                    t.PatientVisit.Status != "Completed");

                // Optional Triage Department filter (Central / Emergency / etc.)
                if (triageDepartmentId.HasValue && triageDepartmentId.Value > 0)
                {
                    query = query.Where(t => t.TriageDepartmentID == triageDepartmentId.Value);
                }

                // Optional VisitType filter — applied in SQL via EF, before ToListAsync
                if (!string.IsNullOrWhiteSpace(visitType))
                {
                    var matchValues = VisitTypeMatchValues(visitType);
                    if (matchValues.Count == 0)
                    {
                        return Ok(new List<DoctorTriageQueueItemDto>());
                    }

                    query = query.Where(t =>
                        t.PatientVisit != null &&
                        matchValues.Contains(t.PatientVisit.VisitType));
                }

                var queue = await query
                    .Include(t => t.PatientVisit!)
                        .ThenInclude(v => v.Patient)
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
    }
}