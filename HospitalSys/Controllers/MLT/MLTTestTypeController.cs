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
    public class MLTTestTypeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MLTTestTypeController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /mlt/MLTTestType
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var list = await _context.LaboratoryTestTypes
                    .AsNoTracking()
                    .Include(t => t.LaboratorySection)
                    .OrderBy(t => t.TestName)
                    .Select(t => new MLTTestTypeResponseDto
                    {
                        LaboratoryTestTypeID = t.LaboratoryTestTypeID,
                        LaboratorySectionID = t.LaboratorySectionID,
                        SectionName = t.LaboratorySection != null
                            ? t.LaboratorySection.SectionName
                            : null,
                        TestName = t.TestName,
                        Price = t.Price,
                        NormalRange = t.NormalRange,
                        Description = t.Description
                    })
                    .ToListAsync();

                return Ok(list);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTTestType/section/{sectionId}
        // Primary endpoint for frontend dropdown cascade.
        [HttpGet("section/{sectionId:int}")]
        public async Task<IActionResult> GetBySection(int sectionId)
        {
            try
            {
                var sectionExists = await _context.LaboratorySections
                    .AnyAsync(s => s.LaboratorySectionID == sectionId);

                if (!sectionExists)
                    return NotFound(new { message = "Laboratory section not found" });

                var list = await _context.LaboratoryTestTypes
                    .AsNoTracking()
                    .Where(t => t.LaboratorySectionID == sectionId)
                    .Include(t => t.LaboratorySection)
                    .OrderBy(t => t.TestName)
                    .Select(t => new MLTTestTypeResponseDto
                    {
                        LaboratoryTestTypeID = t.LaboratoryTestTypeID,
                        LaboratorySectionID = t.LaboratorySectionID,
                        SectionName = t.LaboratorySection != null
                            ? t.LaboratorySection.SectionName
                            : null,
                        TestName = t.TestName,
                        Price = t.Price,
                        NormalRange = t.NormalRange,
                        Description = t.Description
                    })
                    .ToListAsync();

                return Ok(list);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTTestType/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var t = await _context.LaboratoryTestTypes
                    .AsNoTracking()
                    .Include(x => x.LaboratorySection)
                    .FirstOrDefaultAsync(x => x.LaboratoryTestTypeID == id);

                if (t == null)
                    return NotFound(new { message = "Test type not found" });

                return Ok(new MLTTestTypeResponseDto
                {
                    LaboratoryTestTypeID = t.LaboratoryTestTypeID,
                    LaboratorySectionID = t.LaboratorySectionID,
                    SectionName = t.LaboratorySection?.SectionName,
                    TestName = t.TestName,
                    Price = t.Price,
                    NormalRange = t.NormalRange,
                    Description = t.Description
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // POST: /mlt/MLTTestType
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MLTTestTypeCreateDto dto)
        {
            try
            {
                if (dto == null || dto.LaboratorySectionID <= 0)
                    return BadRequest(new { message = "Valid LaboratorySectionID is required" });

                if (string.IsNullOrWhiteSpace(dto.TestName))
                    return BadRequest(new { message = "TestName is required" });

                var section = await _context.LaboratorySections
                    .FirstOrDefaultAsync(s => s.LaboratorySectionID == dto.LaboratorySectionID);

                if (section == null)
                    return NotFound(new { message = "Laboratory section not found" });

                var testName = dto.TestName.Trim();

                var duplicate = await _context.LaboratoryTestTypes
                    .AnyAsync(t =>
                        t.LaboratorySectionID == dto.LaboratorySectionID &&
                        t.TestName.ToLower() == testName.ToLower());

                if (duplicate)
                {
                    return Conflict(new
                    {
                        message = "Test type already exists in this laboratory section"
                    });
                }

                var entity = new LaboratoryTestType
                {
                    LaboratorySectionID = dto.LaboratorySectionID,
                    TestName = testName,
                    Price = dto.Price,
                    NormalRange = dto.NormalRange,
                    Description = dto.Description?.Trim() ?? ""
                };

                _context.LaboratoryTestTypes.Add(entity);
                await _context.SaveChangesAsync();

                return StatusCode(201, new MLTTestTypeResponseDto
                {
                    LaboratoryTestTypeID = entity.LaboratoryTestTypeID,
                    LaboratorySectionID = entity.LaboratorySectionID,
                    SectionName = section.SectionName,
                    TestName = entity.TestName,
                    Price = entity.Price,
                    NormalRange = entity.NormalRange,
                    Description = entity.Description
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // PUT: /mlt/MLTTestType
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] MLTTestTypeUpdateDto dto)
        {
            try
            {
                if (dto == null || dto.LaboratoryTestTypeID <= 0)
                    return BadRequest(new { message = "Valid LaboratoryTestTypeID is required" });

                if (dto.LaboratorySectionID <= 0)
                    return BadRequest(new { message = "Valid LaboratorySectionID is required" });

                if (string.IsNullOrWhiteSpace(dto.TestName))
                    return BadRequest(new { message = "TestName is required" });

                var entity = await _context.LaboratoryTestTypes
                    .FirstOrDefaultAsync(t => t.LaboratoryTestTypeID == dto.LaboratoryTestTypeID);

                if (entity == null)
                    return NotFound(new { message = "Test type not found" });

                var sectionExists = await _context.LaboratorySections
                    .AnyAsync(s => s.LaboratorySectionID == dto.LaboratorySectionID);

                if (!sectionExists)
                    return NotFound(new { message = "Laboratory section not found" });

                var testName = dto.TestName.Trim();

                var duplicate = await _context.LaboratoryTestTypes
                    .AnyAsync(t =>
                        t.LaboratoryTestTypeID != dto.LaboratoryTestTypeID &&
                        t.LaboratorySectionID == dto.LaboratorySectionID &&
                        t.TestName.ToLower() == testName.ToLower());

                if (duplicate)
                {
                    return Conflict(new
                    {
                        message = "Test type already exists in this laboratory section"
                    });
                }

                entity.LaboratorySectionID = dto.LaboratorySectionID;
                entity.TestName = testName;
                entity.Price = dto.Price;
                entity.NormalRange = dto.NormalRange;
                entity.Description = dto.Description?.Trim() ?? "";

                await _context.SaveChangesAsync();

                var sectionName = await _context.LaboratorySections
                    .AsNoTracking()
                    .Where(s => s.LaboratorySectionID == entity.LaboratorySectionID)
                    .Select(s => s.SectionName)
                    .FirstOrDefaultAsync();

                return Ok(new MLTTestTypeResponseDto
                {
                    LaboratoryTestTypeID = entity.LaboratoryTestTypeID,
                    LaboratorySectionID = entity.LaboratorySectionID,
                    SectionName = sectionName,
                    TestName = entity.TestName,
                    Price = entity.Price,
                    NormalRange = entity.NormalRange,
                    Description = entity.Description
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // DELETE: /mlt/MLTTestType/{id}
        // Hard delete only if no LaboratoryTest rows reference this type.
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var entity = await _context.LaboratoryTestTypes
                    .FirstOrDefaultAsync(t => t.LaboratoryTestTypeID == id);

                if (entity == null)
                    return NotFound(new { message = "Test type not found" });

                var inUse = await _context.LaboratoryTests
                    .AnyAsync(lt => lt.LaboratoryTestTypeID == id);

                if (inUse)
                {
                    return Conflict(new
                    {
                        message = "Cannot delete test type that is referenced by laboratory tests."
                    });
                }

                _context.LaboratoryTestTypes.Remove(entity);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Test type deleted" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }
    }
}