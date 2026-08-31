using System.Security.Claims;
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
    public class MLTResultController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MLTResultController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Technician name from JWT (ClaimTypes.Name set by MLTAuthController).
        /// Does not accept client-supplied technician identity.
        /// </summary>
        private string GetAuthenticatedTechnicianName()
        {
            var name = User.FindFirst(ClaimTypes.Name)?.Value
                       ?? User.FindFirst(ClaimTypes.GivenName)?.Value;

            if (string.IsNullOrWhiteSpace(name))
            {
                var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrWhiteSpace(username))
                    return username;
            }

            return name?.Trim() ?? "";
        }

        // POST: /mlt/MLTResult
        [HttpPost]
        public async Task<IActionResult> CreateResult([FromBody] MLTResultCreateDto dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Result data is required" });

                if (dto.TestID <= 0)
                    return BadRequest(new { message = "Valid TestID is required" });

                if (string.IsNullOrWhiteSpace(dto.ResultDescription))
                    return BadRequest(new { message = "ResultDescription is required" });

                var test = await _context.LaboratoryTests
                    .FirstOrDefaultAsync(t => t.TestID == dto.TestID);

                if (test == null)
                    return NotFound(new { message = "Laboratory test not found" });

                var technicianName = GetAuthenticatedTechnicianName();
                if (string.IsNullOrWhiteSpace(technicianName))
                    return Unauthorized(new { message = "Cannot resolve authenticated technician identity" });

                var result = new LaboratoryResult
                {
                    TestID = dto.TestID,
                    TechnicianName = technicianName,
                    ResultDescription = dto.ResultDescription.Trim(),
                    ResultDate = dto.ResultDate ?? DateTime.UtcNow
                };

                _context.LaboratoryResults.Add(result);

                // Mark test completed when a result is entered
                if (string.IsNullOrWhiteSpace(test.Status) ||
                    test.Status.ToLower() == "requested" ||
                    test.Status.ToLower() == "pending" ||
                    test.Status.ToLower() == "processing")
                {
                    test.Status = "Completed";
                }

                await _context.SaveChangesAsync();

                var response = new MLTResultResponseDto
                {
                    ResultID = result.ResultID,
                    TestID = result.TestID,
                    TechnicianName = result.TechnicianName,
                    ResultDescription = result.ResultDescription,
                    ResultDate = result.ResultDate
                };

                return StatusCode(201, response);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTResult/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetResultById(int id)
        {
            try
            {
                var result = await _context.LaboratoryResults
                    .AsNoTracking()
                    .FirstOrDefaultAsync(r => r.ResultID == id);

                if (result == null)
                    return NotFound(new { message = "Laboratory result not found" });

                return Ok(MapResult(result));
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTResult/by-test/{testId}
        [HttpGet("by-test/{testId:int}")]
        public async Task<IActionResult> GetResultsByTest(int testId)
        {
            try
            {
                var testExists = await _context.LaboratoryTests.AnyAsync(t => t.TestID == testId);
                if (!testExists)
                    return NotFound(new { message = "Laboratory test not found" });

                var results = await _context.LaboratoryResults
                    .AsNoTracking()
                    .Where(r => r.TestID == testId)
                    .OrderByDescending(r => r.ResultDate)
                    .ToListAsync();

                return Ok(results.Select(MapResult).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTResult/completed
        [HttpGet("completed")]
        public async Task<IActionResult> GetCompletedResults()
        {
            try
            {
                var results = await _context.LaboratoryResults
                    .AsNoTracking()
                    .OrderByDescending(r => r.ResultDate)
                    .ToListAsync();

                return Ok(results.Select(MapResult).ToList());
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // PUT: /mlt/MLTResult
        [HttpPut]
        public async Task<IActionResult> UpdateResult([FromBody] MLTResultUpdateDto dto)
        {
            try
            {
                if (dto == null || dto.ResultID <= 0)
                    return BadRequest(new { message = "Valid ResultID is required" });

                if (string.IsNullOrWhiteSpace(dto.ResultDescription))
                    return BadRequest(new { message = "ResultDescription is required" });

                var result = await _context.LaboratoryResults
                    .FirstOrDefaultAsync(r => r.ResultID == dto.ResultID);

                if (result == null)
                    return NotFound(new { message = "Laboratory result not found" });

                // Keep TechnicianName as original author; optionally refresh from auth if empty
                if (string.IsNullOrWhiteSpace(result.TechnicianName))
                {
                    var name = GetAuthenticatedTechnicianName();
                    if (!string.IsNullOrWhiteSpace(name))
                        result.TechnicianName = name;
                }

                result.ResultDescription = dto.ResultDescription.Trim();
                if (dto.ResultDate.HasValue)
                    result.ResultDate = dto.ResultDate.Value;

                await _context.SaveChangesAsync();

                return Ok(MapResult(result));
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private static MLTResultResponseDto MapResult(LaboratoryResult r)
        {
            return new MLTResultResponseDto
            {
                ResultID = r.ResultID,
                TestID = r.TestID,
                TechnicianName = r.TechnicianName,
                ResultDescription = r.ResultDescription,
                ResultDate = r.ResultDate
            };
        }
    }
}