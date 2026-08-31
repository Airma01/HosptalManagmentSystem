using HospitalSys.Data;
using HospitalSys.Dto.MLT;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.MLT
{
    [ApiController]
    [Route("mlt/[controller]")]
    [Authorize(Roles = "LaboratoryTechnician")]
    public class MLTDashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MLTDashboardController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /mlt/MLTDashboard/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var today = DateTime.UtcNow.Date;

                var tests = _context.LaboratoryTests.AsNoTracking();

                var totalTestsCount = await tests.CountAsync();

                var todayTestsCount = await tests
                    .CountAsync(t => t.RequestDate.Date == today);

                // Pending: empty, Requested, or Pending (matches Nurse default "Requested")
                var pendingTestsCount = await tests.CountAsync(t =>
                    string.IsNullOrWhiteSpace(t.Status) ||
                    t.Status.ToLower() == "requested" ||
                    t.Status.ToLower() == "pending");

                var processingTestsCount = await tests.CountAsync(t =>
                    t.Status.ToLower() == "processing");

                var completedTestsCount = await tests.CountAsync(t =>
                    t.Status.ToLower() == "completed");

                var testsWithResultsCount = await tests.CountAsync(t =>
                    t.LaboratoryResult.Any());

                var testsWithoutResultsCount = totalTestsCount - testsWithResultsCount;

                var dto = new MLTDashboardDto
                {
                    PendingTestsCount = pendingTestsCount,
                    ProcessingTestsCount = processingTestsCount,
                    CompletedTestsCount = completedTestsCount,
                    TodayTestsCount = todayTestsCount,
                    TotalTestsCount = totalTestsCount,
                    TestsWithResultsCount = testsWithResultsCount,
                    TestsWithoutResultsCount = testsWithoutResultsCount
                };

                return Ok(dto);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }
    }
}