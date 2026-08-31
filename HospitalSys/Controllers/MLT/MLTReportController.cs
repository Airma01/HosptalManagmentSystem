using HospitalSys.Data;
using HospitalSys.Dto.MLT;
using HospitalSys.Models.Laboratory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.MLT
{
    [ApiController]
    [Route("mlt/[controller]")]
    [Authorize(Roles = "LaboratoryTechnician")]
    public class MLTReportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MLTReportController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /mlt/MLTReport/by-test/{testId}
        [HttpGet("by-test/{testId:int}")]
        public async Task<IActionResult> GetReportByTestId(int testId)
        {
            try
            {
                var test = await LoadReportQuery()
                    .FirstOrDefaultAsync(t => t.TestID == testId);

                if (test == null)
                    return NotFound(new { message = "Laboratory test not found" });

                return Ok(MapReport(test));
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTReport/by-result/{resultId}
        [HttpGet("by-result/{resultId:int}")]
        public async Task<IActionResult> GetReportByResultId(int resultId)
        {
            try
            {
                var result = await _context.LaboratoryResults
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.ResultID == resultId);

                if (result == null)
                    return NotFound(new { message = "Laboratory result not found" });

                var test = await LoadReportQuery()
                    .FirstOrDefaultAsync(t => t.TestID == result.TestID);

                if (test == null)
                    return NotFound(new { message = "Laboratory test not found for this result" });

                return Ok(MapReport(test));
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTReport/patient/{patientId}
        [HttpGet("patient/{patientId:int}")]
        public async Task<IActionResult> GetPatientReports(int patientId)
        {
            try
            {
                var patientExists = await _context.Patients.AnyAsync(p => p.PatientID == patientId);
                if (!patientExists)
                    return NotFound(new { message = "Patient not found" });

                var tests = await LoadReportQuery()
                    .Where(t => t.PatientID == patientId)
                    .OrderByDescending(t => t.RequestDate)
                    .ToListAsync();

                return Ok(tests.Select(MapReportList).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTReport/completed
        [HttpGet("completed")]
        public async Task<IActionResult> GetCompletedReports()
        {
            try
            {
                var tests = await LoadReportQuery()
                    .Where(t =>
                        t.Status.ToLower() == "completed" ||
                        t.LaboratoryResult.Any())
                    .OrderByDescending(t => t.RequestDate)
                    .ToListAsync();

                return Ok(tests.Select(MapReportList).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private IQueryable<LaboratoryTest> LoadReportQuery()
        {
            return _context.LaboratoryTests
                .AsNoTracking()
                .Include(t => t.Patient)
                .Include(t => t.Doctor!)
                    .ThenInclude(d => d.Users)
                .Include(t => t.Doctor!)
                    .ThenInclude(d => d.ClinicalDepartment)
                .Include(t => t.LaboratoryTestType!)
                    .ThenInclude(tt => tt.LaboratorySection)
                .Include(t => t.LaboratoryResult);
        }

        private static MLTReportDto MapReport(LaboratoryTest t)
        {
            return new MLTReportDto
            {
                TestID = t.TestID,
                RequestDate = t.RequestDate,
                Status = t.Status,

                PatientID = t.PatientID,
                PatientMRN = t.Patient?.MRN ?? "",
                PatientName = t.Patient != null
                    ? $"{t.Patient.FirstName} {t.Patient.LastName}".Trim()
                    : "",
                PatientGender = t.Patient?.Gender,
                PatientDateOfBirth = t.Patient?.DateOfBirth,
                PatientPhone = t.Patient?.Phone,

                DoctorID = t.DoctorID,
                DoctorName = t.Doctor?.Users != null
                    ? $"{t.Doctor.Users.FirstName} {t.Doctor.Users.FatherName}".Trim()
                    : null,
                DepartmentName = t.Doctor?.ClinicalDepartment?.DepartmentName,
                ConsultationID = t.ConsultationID,

                LaboratoryTestTypeID = t.LaboratoryTestTypeID,
                TestName = t.LaboratoryTestType?.TestName ?? "",
                TestDescription = t.LaboratoryTestType?.Description,
                NormalRange = t.LaboratoryTestType?.NormalRange,
                Price = t.LaboratoryTestType?.Price,
                LaboratorySectionID = t.LaboratoryTestType?.LaboratorySectionID,
                SectionName = t.LaboratoryTestType?.LaboratorySection?.SectionName,

                Results = (t.LaboratoryResult ?? new List<LaboratoryResult>())
                    .OrderByDescending(r => r.ResultDate)
                    .Select(r => new MLTResultResponseDto
                    {
                        ResultID = r.ResultID,
                        TestID = r.TestID,
                        TechnicianName = r.TechnicianName,
                        ResultDescription = r.ResultDescription,
                        ResultDate = r.ResultDate
                    })
                    .ToList()
            };
        }

        private static MLTReportListDto MapReportList(LaboratoryTest t)
        {
            var latest = t.LaboratoryResult?
                .OrderByDescending(r => r.ResultDate)
                .FirstOrDefault();

            return new MLTReportListDto
            {
                TestID = t.TestID,
                PatientID = t.PatientID,
                PatientMRN = t.Patient?.MRN ?? "",
                PatientName = t.Patient != null
                    ? $"{t.Patient.FirstName} {t.Patient.LastName}".Trim()
                    : "",
                TestName = t.LaboratoryTestType?.TestName ?? "",
                SectionName = t.LaboratoryTestType?.LaboratorySection?.SectionName,
                RequestDate = t.RequestDate,
                Status = t.Status,
                LatestResultDate = latest?.ResultDate,
                LatestTechnicianName = latest?.TechnicianName
            };
        }
    }
}