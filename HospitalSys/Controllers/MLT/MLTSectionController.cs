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
    public class MLTSectionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MLTSectionController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /mlt/MLTSection
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var sections = await _context.LaboratorySections
                    .AsNoTracking()
                    .OrderBy(s => s.SectionName)
                    .Select(s => new MLTSectionResponseDto
                    {
                        LaboratorySectionID = s.LaboratorySectionID,
                        SectionName = s.SectionName,
                        Description = s.Description,
                        TestTypeCount = s.LaboratoryTestType.Count
                    })
                    .ToListAsync();

                return Ok(sections);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTSection/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var section = await _context.LaboratorySections
                    .AsNoTracking()
                    .Include(s => s.LaboratoryTestType)
                    .FirstOrDefaultAsync(s => s.LaboratorySectionID == id);

                if (section == null)
                    return NotFound(new { message = "Laboratory section not found" });

                var dto = new MLTSectionDetailDto
                {
                    LaboratorySectionID = section.LaboratorySectionID,
                    SectionName = section.SectionName,
                    Description = section.Description,
                    TestTypes = section.LaboratoryTestType
                        .OrderBy(t => t.TestName)
                        .Select(t => new MLTTestTypeResponseDto
                        {
                            LaboratoryTestTypeID = t.LaboratoryTestTypeID,
                            LaboratorySectionID = t.LaboratorySectionID,
                            SectionName = section.SectionName,
                            TestName = t.TestName,
                            Price = t.Price,
                            NormalRange = t.NormalRange,
                            Description = t.Description
                        })
                        .ToList()
                };

                return Ok(dto);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // POST: /mlt/MLTSection
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MLTSectionCreateDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.SectionName))
                    return BadRequest(new { message = "SectionName is required" });

                var name = dto.SectionName.Trim();
                if (name.Length > 100)
                    return BadRequest(new { message = "SectionName must be at most 100 characters" });

                var exists = await _context.LaboratorySections
                    .AnyAsync(s => s.SectionName.ToLower() == name.ToLower());

                if (exists)
                    return Conflict(new { message = "Laboratory section already exists" });

                var entity = new LaboratorySection
                {
                    SectionName = name,
                    Description = dto.Description?.Trim() ?? ""
                };

                _context.LaboratorySections.Add(entity);
                await _context.SaveChangesAsync();

                var response = new MLTSectionResponseDto
                {
                    LaboratorySectionID = entity.LaboratorySectionID,
                    SectionName = entity.SectionName,
                    Description = entity.Description,
                    TestTypeCount = 0
                };

                return StatusCode(201, response);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // PUT: /mlt/MLTSection
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] MLTSectionUpdateDto dto)
        {
            try
            {
                if (dto == null || dto.LaboratorySectionID <= 0)
                    return BadRequest(new { message = "Valid LaboratorySectionID is required" });

                if (string.IsNullOrWhiteSpace(dto.SectionName))
                    return BadRequest(new { message = "SectionName is required" });

                var name = dto.SectionName.Trim();
                if (name.Length > 100)
                    return BadRequest(new { message = "SectionName must be at most 100 characters" });

                var entity = await _context.LaboratorySections
                    .FirstOrDefaultAsync(s => s.LaboratorySectionID == dto.LaboratorySectionID);

                if (entity == null)
                    return NotFound(new { message = "Laboratory section not found" });

                var duplicate = await _context.LaboratorySections
                    .AnyAsync(s =>
                        s.LaboratorySectionID != dto.LaboratorySectionID &&
                        s.SectionName.ToLower() == name.ToLower());

                if (duplicate)
                    return Conflict(new { message = "Laboratory section already exists" });

                entity.SectionName = name;
                entity.Description = dto.Description?.Trim() ?? "";

                await _context.SaveChangesAsync();

                var count = await _context.LaboratoryTestTypes
                    .CountAsync(t => t.LaboratorySectionID == entity.LaboratorySectionID);

                return Ok(new MLTSectionResponseDto
                {
                    LaboratorySectionID = entity.LaboratorySectionID,
                    SectionName = entity.SectionName,
                    Description = entity.Description,
                    TestTypeCount = count
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // DELETE: /mlt/MLTSection/{id}
        // Hard delete only if no test types exist under the section.
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var entity = await _context.LaboratorySections
                    .Include(s => s.LaboratoryTestType)
                    .FirstOrDefaultAsync(s => s.LaboratorySectionID == id);

                if (entity == null)
                    return NotFound(new { message = "Laboratory section not found" });

                if (entity.LaboratoryTestType != null && entity.LaboratoryTestType.Any())
                {
                    return Conflict(new
                    {
                        message = "Cannot delete section that still has test types. Remove or reassign test types first."
                    });
                }

                _context.LaboratorySections.Remove(entity);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Laboratory section deleted" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }
    }
}