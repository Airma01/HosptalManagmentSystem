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
        /// GET /api/doctor/triage
        /// Triage records for the authenticated doctor's ClinicalDepartment only.
        /// </summary>
        [HttpGet("triage")]
        public async Task<IActionResult> GetDepartmentTriageQueue()
        {
            try
            {
                int departmentId = GetDepartmentId();

                var queue = await _context.Triages
                    .AsNoTracking()
                    .Where(t => t.ClinicalDepartmentID == departmentId)
                    .Include(t => t.PatientVisit!)
                        .ThenInclude(v => v.Patient)
                    .Include(t => t.ClinicalDepartment)
                    .OrderByDescending(t => t.PatientVisit!.VisitDate)
                    .Select(t => new DoctorTriageQueueItemDto
                    {
                        TriageId = t.TriageId,
                        PatientID = t.PatientVisit!.PatientID,
                        PatientName = t.PatientVisit.Patient!.FirstName + " " + t.PatientVisit.Patient.LastName,
                        VisitID = t.VisitID,
                        VisitDate = t.PatientVisit.VisitDate,
                        VisitType = t.PatientVisit.VisitType,
                        VisitStatus = t.PatientVisit.Status,
                        ClinicalDepartmentID = t.ClinicalDepartmentID,
                        DepartmentName = t.ClinicalDepartment != null ? t.ClinicalDepartment.DepartmentName : "",
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