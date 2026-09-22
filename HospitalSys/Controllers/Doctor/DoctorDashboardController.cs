using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.Dto.DoctorDtos;
using HospitalSys.Models.PatientManagment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Doctor
{
    [ApiController]
    [Route("api/doctor/dashboard")]
    [Authorize(Roles = "Doctor")]
    public class DoctorDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorDashboardController(AppDbContext context)
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

        /// <summary>
        /// All-time (default) or date-filtered clinical statistics for the authenticated doctor.
        /// GET /api/doctor/dashboard/statistics?range=all|year|month|week|custom&amp;from=yyyy-MM-dd&amp;to=yyyy-MM-dd
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics(
            [FromQuery] string? range = "all",
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            try
            {
                int doctorId = GetDoctorId();
                range = (range ?? "all").Trim().ToLowerInvariant();

                DateTime? startUtc = null;
                DateTime? endUtc = null;
                var now = DateTime.UtcNow;

                switch (range)
                {
                    case "year":
                        startUtc = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                        endUtc = now;
                        break;
                    case "month":
                        startUtc = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                        endUtc = now;
                        break;
                    case "week":
                        var day = (int)now.DayOfWeek;
                        // Monday-based week
                        var mondayOffset = day == 0 ? -6 : 1 - day;
                        startUtc = now.Date.AddDays(mondayOffset);
                        if (startUtc.Value.Kind == DateTimeKind.Unspecified)
                            startUtc = DateTime.SpecifyKind(startUtc.Value, DateTimeKind.Utc);
                        endUtc = now;
                        break;
                    case "custom":
                        if (!from.HasValue || !to.HasValue)
                            return BadRequest(new { message = "Custom range requires from and to dates." });
                        if (from.Value.Date > to.Value.Date)
                            return BadRequest(new { message = "from must be on or before to." });
                        startUtc = DateTime.SpecifyKind(from.Value.Date, DateTimeKind.Utc);
                        endUtc = DateTime.SpecifyKind(to.Value.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
                        break;
                    default:
                        range = "all";
                        break;
                }

                // Consultations for this doctor (optionally date-filtered)
                var consultQuery = _context.Consultations.AsNoTracking()
                    .Where(c => c.DoctorID == doctorId);
                if (startUtc.HasValue)
                    consultQuery = consultQuery.Where(c => c.ConsultationDate >= startUtc.Value);
                if (endUtc.HasValue)
                    consultQuery = consultQuery.Where(c => c.ConsultationDate <= endUtc.Value);

                var doctorVisitIds = await consultQuery
                    .Select(c => c.VisitID)
                    .Distinct()
                    .ToListAsync();

                var doctorPatientIds = await _context.PatientVisits.AsNoTracking()
                    .Where(v => doctorVisitIds.Contains(v.VisitID))
                    .Select(v => v.PatientID)
                    .Distinct()
                    .ToListAsync();

                int totalConsultations = await consultQuery.CountAsync();
                int totalPatients = doctorPatientIds.Count;
                int totalVisits = doctorVisitIds.Count;

                // Visit status distribution (normalized)
                var visitStatuses = await _context.PatientVisits.AsNoTracking()
                    .Where(v => doctorVisitIds.Contains(v.VisitID))
                    .Select(v => v.Status)
                    .ToListAsync();

                string Norm(string? s)
                {
                    if (string.IsNullOrWhiteSpace(s)) return "Unknown";
                    var t = s.Trim();
                    if (t.Equals("Triaged", StringComparison.OrdinalIgnoreCase)
                        || t.Equals("InProgress", StringComparison.OrdinalIgnoreCase)
                        || t.Equals("In Progress", StringComparison.OrdinalIgnoreCase))
                        return "Progress";
                    if (t.Equals("Completed", StringComparison.OrdinalIgnoreCase))
                        return "Complete";
                    return t;
                }

                var statusOrder = new[] { "Scheduled", "Progress", "OnConsultation", "ANC", "PNC", "ChildHealth", "Complete", "Unknown" };
                var statusCounts = visitStatuses
                    .GroupBy(Norm)
                    .ToDictionary(g => g.Key, g => g.Count(), StringComparer.OrdinalIgnoreCase);

                var visitStatusList = statusOrder
                    .Where(k => statusCounts.ContainsKey(k) || k is "Scheduled" or "Progress" or "OnConsultation" or "Complete")
                    .Select(k => new NameCountDto
                    {
                        Name = k,
                        Count = statusCounts.TryGetValue(k, out var c) ? c : 0
                    })
                    .Where(x => x.Count > 0 || x.Name is "Scheduled" or "Progress" or "OnConsultation" or "Complete")
                    .ToList();

                // Ensure core statuses always appear
                foreach (var core in new[] { "Scheduled", "Progress", "OnConsultation", "Complete" })
                {
                    if (!visitStatusList.Any(x => x.Name.Equals(core, StringComparison.OrdinalIgnoreCase)))
                        visitStatusList.Insert(Array.IndexOf(new[] { "Scheduled", "Progress", "OnConsultation", "Complete" }, core),
                            new NameCountDto { Name = core, Count = 0 });
                }
                // de-dupe while keeping order
                visitStatusList = visitStatusList
                    .GroupBy(x => x.Name, StringComparer.OrdinalIgnoreCase)
                    .Select(g => g.First())
                    .ToList();

                int completedVisits = statusCounts.TryGetValue("Complete", out var cc) ? cc : 0;
                int activeVisits = totalVisits - completedVisits;

                // Diagnoses via consultations of this doctor
                var diagnosisQuery = _context.Diagnoses.AsNoTracking()
                    .Where(d => d.Consultation != null && d.Consultation.DoctorID == doctorId);
                if (startUtc.HasValue)
                    diagnosisQuery = diagnosisQuery.Where(d => d.Consultation!.ConsultationDate >= startUtc.Value);
                if (endUtc.HasValue)
                    diagnosisQuery = diagnosisQuery.Where(d => d.Consultation!.ConsultationDate <= endUtc.Value);

                int totalDiagnoses = await diagnosisQuery.CountAsync();

                var topDiagnoses = await diagnosisQuery
                    .GroupBy(d => string.IsNullOrWhiteSpace(d.Description) ? (d.Code ?? "Unknown") : d.Description)
                    .Select(g => new NameCountDto { Name = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .Take(10)
                    .ToListAsync();

                // Lab / Radiology / Prescription — direct DoctorID
                var labQ = _context.LaboratoryTests.AsNoTracking().Where(x => x.DoctorID == doctorId);
                var radQ = _context.RadiologyRequests.AsNoTracking().Where(x => x.DoctorID == doctorId);
                var rxQ = _context.Prescriptions.AsNoTracking().Where(x => x.DoctorID == doctorId);
                if (startUtc.HasValue)
                {
                    labQ = labQ.Where(x => x.RequestDate >= startUtc.Value);
                    radQ = radQ.Where(x => x.RequestDate >= startUtc.Value);
                    rxQ = rxQ.Where(x => x.PrescriptionDate >= startUtc.Value);
                }
                if (endUtc.HasValue)
                {
                    labQ = labQ.Where(x => x.RequestDate <= endUtc.Value);
                    radQ = radQ.Where(x => x.RequestDate <= endUtc.Value);
                    rxQ = rxQ.Where(x => x.PrescriptionDate <= endUtc.Value);
                }

                int labCount = await labQ.CountAsync();
                int radCount = await radQ.CountAsync();
                int rxCount = await rxQ.CountAsync();

                // Adult care records for patients this doctor has seen (patient-level chronic records)
                int adultCare = 0;
                if (doctorPatientIds.Count > 0)
                {
                    adultCare =
                        await _context.DiabetesManagements.AsNoTracking().CountAsync(x => doctorPatientIds.Contains(x.PatientID))
                      + await _context.HypertensionManagements.AsNoTracking().CountAsync(x => doctorPatientIds.Contains(x.PatientID))
                      + await _context.AsthmaManagements.AsNoTracking().CountAsync(x => doctorPatientIds.Contains(x.PatientID))
                      + await _context.HIVCares.AsNoTracking().CountAsync(x => doctorPatientIds.Contains(x.PatientID))
                      + await _context.TuberculosisManagements.AsNoTracking().CountAsync(x => doctorPatientIds.Contains(x.PatientID))
                      + await _context.HepatitisManagements.AsNoTracking().CountAsync(x => doctorPatientIds.Contains(x.PatientID))
                      + await _context.MentalHealthCares.AsNoTracking().CountAsync(x => doctorPatientIds.Contains(x.PatientID));
                }

                // MCH: ANC + PNC on visits this doctor consulted
                int mchCount = 0;
                if (doctorVisitIds.Count > 0)
                {
                    mchCount =
                        await _context.ANCVisits.AsNoTracking().CountAsync(a => doctorVisitIds.Contains(a.PatientVisitID))
                      + await _context.PNCVisits.AsNoTracking().CountAsync(p => doctorVisitIds.Contains(p.PatientVisitID));
                }

                // Child health records linked to those visits
                int childCount = 0;
                // Child health records linked to those visits
// IMNCIEncounter.PatientVisitID is int; others are int?

            if (doctorVisitIds.Count > 0)
            {
                childCount =
                    await _context.NeonatalCares.AsNoTracking()
                        .CountAsync(x => x.PatientVisitID.HasValue && doctorVisitIds.Contains(x.PatientVisitID.Value))
                + await _context.GrowthMonitorings.AsNoTracking()
                        .CountAsync(x => x.PatientVisitID.HasValue && doctorVisitIds.Contains(x.PatientVisitID.Value))
                + await _context.IMNCIEncounters.AsNoTracking()
                        .CountAsync(x => doctorVisitIds.Contains(x.PatientVisitID))
                + await _context.NutritionAssessments.AsNoTracking()
                        .CountAsync(x => x.PatientVisitID.HasValue && doctorVisitIds.Contains(x.PatientVisitID.Value))
                + await _context.Immunizations.AsNoTracking()
                        .CountAsync(x => x.PatientVisitID.HasValue && doctorVisitIds.Contains(x.PatientVisitID.Value));
            }

                // Gender
                var genders = await _context.Patients.AsNoTracking()
                    .Where(p => doctorPatientIds.Contains(p.PatientID))
                    .Select(p => p.Gender)
                    .ToListAsync();

                var genderStats = genders
                    .GroupBy(g => g.ToString())
                    .Select(g => new NameCountDto { Name = g.Key, Count = g.Count() })
                    .OrderBy(g => g.Name)
                    .ToList();
                if (!genderStats.Any(x => x.Name == "Male"))
                    genderStats.Insert(0, new NameCountDto { Name = "Male", Count = 0 });
                if (!genderStats.Any(x => x.Name == "Female"))
                    genderStats.Add(new NameCountDto { Name = "Female", Count = 0 });

                // Age groups from DOB
                var dobs = await _context.Patients.AsNoTracking()
                    .Where(p => doctorPatientIds.Contains(p.PatientID))
                    .Select(p => p.DateOfBirth)
                    .ToListAsync();

                int AgeYears(DateTime dob)
                {
                    var today = DateTime.UtcNow.Date;
                    var age = today.Year - dob.Year;
                    if (dob.Date > today.AddYears(-age)) age--;
                    return age < 0 ? 0 : age;
                }

                var ageBuckets = new Dictionary<string, int>
                {
                    ["0–5"] = 0,
                    ["6–17"] = 0,
                    ["18–35"] = 0,
                    ["36–59"] = 0,
                    ["60+"] = 0
                };
                foreach (var dob in dobs)
                {
                    var age = AgeYears(dob);
                    if (age <= 5) ageBuckets["0–5"]++;
                    else if (age <= 17) ageBuckets["6–17"]++;
                    else if (age <= 35) ageBuckets["18–35"]++;
                    else if (age <= 59) ageBuckets["36–59"]++;
                    else ageBuckets["60+"]++;
                }
                var ageStats = ageBuckets.Select(kv => new NameCountDto { Name = kv.Key, Count = kv.Value }).ToList();

                var services = new List<NameCountDto>
                {
                    new() { Name = "Consultations", Count = totalConsultations },
                    new() { Name = "Laboratory", Count = labCount },
                    new() { Name = "Radiology", Count = radCount },
                    new() { Name = "Prescriptions", Count = rxCount },
                    new() { Name = "Adult Care", Count = adultCare },
                    new() { Name = "MCH", Count = mchCount },
                    new() { Name = "Child Health", Count = childCount },
                };

                var dto = new DoctorDashboardStatisticsDto
                {
                    Range = range,
                    TotalPatients = totalPatients,
                    TotalVisits = totalVisits,
                    CompletedVisits = completedVisits,
                    ActiveVisits = activeVisits < 0 ? 0 : activeVisits,
                    TotalConsultations = totalConsultations,
                    TotalDiagnoses = totalDiagnoses,
                    LaboratoryRequests = labCount,
                    RadiologyRequests = radCount,
                    Prescriptions = rxCount,
                    AdultCareRecords = adultCare,
                    MaternalChildHealthRecords = mchCount,
                    ChildHealthRecords = childCount,
                    VisitStatus = visitStatusList,
                    GenderStatistics = genderStats,
                    AgeGroupStatistics = ageStats,
                    ClinicalServiceStatistics = services,
                    DiagnosisStatistics = topDiagnoses
                };

                return Ok(dto);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "Failed to load dashboard statistics." });
            }
        }
    }
}
