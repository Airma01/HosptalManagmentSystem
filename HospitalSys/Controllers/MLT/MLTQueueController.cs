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
    public class MLTQueueController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MLTQueueController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /mlt/MLTQueue
        // Optional query: status, sectionId, testTypeId, fromDate, toDate, patientId, patientMrn
        [HttpGet]
        public async Task<IActionResult> GetQueue([FromQuery] MLTQueueFilterDto? filter)
        {
            try
            {
                var query = BuildBaseQuery();

                if (filter != null)
                {
                    if (!string.IsNullOrWhiteSpace(filter.Status))
                    {
                        var status = filter.Status.Trim().ToLower();
                        query = query.Where(t => t.Status.ToLower() == status);
                    }

                    if (filter.LaboratorySectionID.HasValue)
                    {
                        query = query.Where(t =>
                            t.LaboratoryTestType != null &&
                            t.LaboratoryTestType.LaboratorySectionID == filter.LaboratorySectionID.Value);
                    }

                    if (filter.LaboratoryTestTypeID.HasValue)
                        query = query.Where(t => t.LaboratoryTestTypeID == filter.LaboratoryTestTypeID.Value);

                    if (filter.FromDate.HasValue)
                        query = query.Where(t => t.RequestDate >= filter.FromDate.Value);

                    if (filter.ToDate.HasValue)
                        query = query.Where(t => t.RequestDate <= filter.ToDate.Value);

                    if (filter.PatientID.HasValue)
                        query = query.Where(t => t.PatientID == filter.PatientID.Value);

                    if (!string.IsNullOrWhiteSpace(filter.PatientMRN))
                        query = query.Where(t =>
                            t.Patient != null && t.Patient.MRN.Contains(filter.PatientMRN));
                }

                var items = await query
                    .OrderByDescending(t => t.RequestDate)
                    .ToListAsync();

                return Ok(items.Select(MapQueueItem).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTQueue/pending
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingQueue()
        {
            try
            {
                var items = await BuildBaseQuery()
                    .Where(t =>
                        string.IsNullOrWhiteSpace(t.Status) ||
                        t.Status.ToLower() == "requested" ||
                        t.Status.ToLower() == "pending")
                    .OrderBy(t => t.RequestDate)
                    .ToListAsync();

                return Ok(items.Select(MapQueueItem).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTQueue/processing
        [HttpGet("processing")]
        public async Task<IActionResult> GetProcessingQueue()
        {
            try
            {
                var items = await BuildBaseQuery()
                    .Where(t => t.Status.ToLower() == "processing")
                    .OrderBy(t => t.RequestDate)
                    .ToListAsync();

                return Ok(items.Select(MapQueueItem).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTQueue/completed
        [HttpGet("completed")]
        public async Task<IActionResult> GetCompletedQueue()
        {
            try
            {
                var items = await BuildBaseQuery()
                    .Where(t => t.Status.ToLower() == "completed")
                    .OrderByDescending(t => t.RequestDate)
                    .ToListAsync();

                return Ok(items.Select(MapQueueItem).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTQueue/{testId}
        [HttpGet("{testId:int}")]
        public async Task<IActionResult> GetQueueItem(int testId)
        {
            try
            {
                var item = await BuildBaseQuery()
                    .FirstOrDefaultAsync(t => t.TestID == testId);

                if (item == null)
                    return NotFound(new { message = "Laboratory test not found" });

                return Ok(MapQueueItem(item));
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private IQueryable<LaboratoryTest> BuildBaseQuery()
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

        private static MLTQueueDto MapQueueItem(LaboratoryTest t)
        {
            var latestResult = t.LaboratoryResult?
                .OrderByDescending(r => r.ResultDate)
                .FirstOrDefault();

            return new MLTQueueDto
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
                LaboratorySectionID = t.LaboratoryTestType?.LaboratorySectionID,
                SectionName = t.LaboratoryTestType?.LaboratorySection?.SectionName,
                RequestDate = t.RequestDate,
                Status = t.Status,
                HasResult = t.LaboratoryResult != null && t.LaboratoryResult.Any(),
                ResultDate = latestResult?.ResultDate
            };
        }
    }
}