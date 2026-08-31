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
    public class MLTTestController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MLTTestController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /mlt/MLTTest
        [HttpGet]
        public async Task<IActionResult> GetAllTests()
        {
            try
            {
                var tests = await LoadTestsQuery()
                    .OrderByDescending(t => t.RequestDate)
                    .ToListAsync();

                return Ok(tests.Select(MapList).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTTest/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetTestById(int id)
        {
            try
            {
                var test = await LoadTestsQuery()
                    .FirstOrDefaultAsync(t => t.TestID == id);

                if (test == null)
                    return NotFound(new { message = "Laboratory test not found" });

                return Ok(MapResponse(test));
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTTest/pending
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingTests()
        {
            try
            {
                var tests = await LoadTestsQuery()
                    .Where(t =>
                        string.IsNullOrWhiteSpace(t.Status) ||
                        t.Status.ToLower() == "requested" ||
                        t.Status.ToLower() == "pending")
                    .OrderBy(t => t.RequestDate)
                    .ToListAsync();

                return Ok(tests.Select(MapList).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTTest/today
        [HttpGet("today")]
        public async Task<IActionResult> GetTodayTests()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var tests = await LoadTestsQuery()
                    .Where(t => t.RequestDate.Date == today)
                    .OrderByDescending(t => t.RequestDate)
                    .ToListAsync();

                return Ok(tests.Select(MapList).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // PUT: /mlt/MLTTest/status
        // MLT may update Status only (e.g. Requested -> Processing -> Completed)
        [HttpPut("status")]
        public async Task<IActionResult> UpdateTestStatus([FromBody] MLTTestUpdateStatusDto dto)
        {
            try
            {
                if (dto == null || dto.TestID <= 0)
                    return BadRequest(new { message = "Valid TestID is required" });

                if (string.IsNullOrWhiteSpace(dto.Status))
                    return BadRequest(new { message = "Status is required" });

                if (dto.Status.Length > 50)
                    return BadRequest(new { message = "Status must be at most 50 characters" });

                var test = await _context.LaboratoryTests
                    .FirstOrDefaultAsync(t => t.TestID == dto.TestID);

                if (test == null)
                    return NotFound(new { message = "Laboratory test not found" });

                test.Status = dto.Status.Trim();
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Test status updated",
                    testID = test.TestID,
                    status = test.Status
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTTest/types
        [HttpGet("types")]
        public async Task<IActionResult> GetTestTypes()
        {
            try
            {
                var types = await _context.LaboratoryTestTypes
                    .AsNoTracking()
                    .Include(tt => tt.LaboratorySection)
                    .OrderBy(tt => tt.TestName)
                    .Select(tt => new MLTTestTypeDto
                    {
                        LaboratoryTestTypeID = tt.LaboratoryTestTypeID,
                        TestName = tt.TestName,
                        Price = tt.Price,
                        NormalRange = tt.NormalRange,
                        Description = tt.Description,
                        LaboratorySectionID = tt.LaboratorySectionID,
                        SectionName = tt.LaboratorySection != null
                            ? tt.LaboratorySection.SectionName
                            : null
                    })
                    .ToListAsync();

                return Ok(types);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTTest/sections
        [HttpGet("sections")]
        public async Task<IActionResult> GetSections()
        {
            try
            {
                var sections = await _context.LaboratorySections
                    .AsNoTracking()
                    .OrderBy(s => s.SectionName)
                    .Select(s => new MLTSectionDto
                    {
                        LaboratorySectionID = s.LaboratorySectionID,
                        SectionName = s.SectionName,
                        Description = s.Description
                    })
                    .ToListAsync();

                return Ok(sections);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private IQueryable<LaboratoryTest> LoadTestsQuery()
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

        private static MLTTestListDto MapList(LaboratoryTest t)
        {
            return new MLTTestListDto
            {
                TestID = t.TestID,
                PatientID = t.PatientID,
                PatientName = t.Patient != null
                    ? $"{t.Patient.FirstName} {t.Patient.LastName}".Trim()
                    : null,
                PatientMRN = t.Patient?.MRN,
                TestName = t.LaboratoryTestType?.TestName,
                SectionName = t.LaboratoryTestType?.LaboratorySection?.SectionName,
                RequestDate = t.RequestDate,
                Status = t.Status,
                HasResult = t.LaboratoryResult != null && t.LaboratoryResult.Any()
            };
        }

        private static MLTTestResponseDto MapResponse(LaboratoryTest t)
        {
            return new MLTTestResponseDto
            {
                TestID = t.TestID,
                ConsultationID = t.ConsultationID,
                PatientID = t.PatientID,
                PatientMRN = t.Patient?.MRN,
                PatientName = t.Patient != null
                    ? $"{t.Patient.FirstName} {t.Patient.LastName}".Trim()
                    : null,
                DoctorID = t.DoctorID,
                DoctorName = t.Doctor?.Users != null
                    ? $"{t.Doctor.Users.FirstName} {t.Doctor.Users.FatherName}".Trim()
                    : null,
                DepartmentName = t.Doctor?.ClinicalDepartment?.DepartmentName,
                LaboratoryTestTypeID = t.LaboratoryTestTypeID,
                TestName = t.LaboratoryTestType?.TestName,
                Price = t.LaboratoryTestType?.Price,
                NormalRange = t.LaboratoryTestType?.NormalRange,
                LaboratorySectionID = t.LaboratoryTestType?.LaboratorySectionID,
                SectionName = t.LaboratoryTestType?.LaboratorySection?.SectionName,
                RequestDate = t.RequestDate,
                Status = t.Status,
                Results = (t.LaboratoryResult ?? new List<LaboratoryResult>())
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
    }
}