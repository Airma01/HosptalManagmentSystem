using HospitalSys.Data;
using HospitalSys.Dto.Radiology;
using HospitalSys.Models.Radiology;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Radiology
{
    [ApiController]
    [Route("radiology/[controller]")]
    public class RadiologyDepartmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RadiologyDepartmentController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /radiology/RadiologyDepartment
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var list = await _context.RadiologyDepartments
                    .AsNoTracking()
                    .Select(d => new RadiologyDepartmentDto
                    {
                        RadiologyDepartmentID = d.RadiologyDepartmentID,
                        DepartmentName = d.DepartmentName,
                        Description = d.Description,
                        TestTypeCount = d.RadiologyTestType.Count
                    })
                    .OrderBy(d => d.DepartmentName)
                    .ToListAsync();

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load radiology departments.", error = ex.Message });
            }
        }

        // GET: /radiology/RadiologyDepartment/{id}
        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var dept = await _context.RadiologyDepartments
                    .AsNoTracking()
                    .Include(d => d.RadiologyTestType)
                    .FirstOrDefaultAsync(d => d.RadiologyDepartmentID == id);

                if (dept == null)
                    return NotFound(new { message = "Radiology department not found." });

                var dto = new RadiologyDepartmentDetailDto
                {
                    RadiologyDepartmentID = dept.RadiologyDepartmentID,
                    DepartmentName = dept.DepartmentName,
                    Description = dept.Description,
                    TestTypes = dept.RadiologyTestType
                        .Select(t => new RadiologyTestTypeDto
                        {
                            RadiologyTestTypeID = t.RadiologyTestTypeID,
                            RadiologyDepartmentID = t.RadiologyDepartmentID,
                            DepartmentName = dept.DepartmentName,
                            TestName = t.TestName,
                            Price = t.Price,
                            Description = t.Description
                        })
                        .OrderBy(t => t.TestName)
                        .ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load radiology department.", error = ex.Message });
            }
        }

        // POST: /radiology/RadiologyDepartment
        [HttpPost]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> Create([FromBody] CreateRadiologyDepartmentDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.DepartmentName))
                    return BadRequest(new { message = "DepartmentName is required." });

                var exists = await _context.RadiologyDepartments
                    .AnyAsync(d => d.DepartmentName.ToLower() == dto.DepartmentName.Trim().ToLower());

                if (exists)
                    return Conflict(new { message = "A department with this name already exists." });

                var entity = new RadiologyDepartment
                {
                    DepartmentName = dto.DepartmentName.Trim(),
                    Description = dto.Description?.Trim() ?? ""
                };

                _context.RadiologyDepartments.Add(entity);
                await _context.SaveChangesAsync();

                return StatusCode(201, new RadiologyDepartmentDto
                {
                    RadiologyDepartmentID = entity.RadiologyDepartmentID,
                    DepartmentName = entity.DepartmentName,
                    Description = entity.Description,
                    TestTypeCount = 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create radiology department.", error = ex.Message });
            }
        }

        // PUT: /radiology/RadiologyDepartment/{id}
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRadiologyDepartmentDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.DepartmentName))
                    return BadRequest(new { message = "DepartmentName is required." });

                if (id != dto.RadiologyDepartmentID)
                    return BadRequest(new { message = "Route id and body RadiologyDepartmentID must match." });

                var entity = await _context.RadiologyDepartments
                    .FirstOrDefaultAsync(d => d.RadiologyDepartmentID == id);

                if (entity == null)
                    return NotFound(new { message = "Radiology department not found." });

                var nameTaken = await _context.RadiologyDepartments
                    .AnyAsync(d => d.RadiologyDepartmentID != id &&
                                   d.DepartmentName.ToLower() == dto.DepartmentName.Trim().ToLower());

                if (nameTaken)
                    return Conflict(new { message = "A department with this name already exists." });

                entity.DepartmentName = dto.DepartmentName.Trim();
                entity.Description = dto.Description?.Trim() ?? "";

                await _context.SaveChangesAsync();

                return Ok(new RadiologyDepartmentDto
                {
                    RadiologyDepartmentID = entity.RadiologyDepartmentID,
                    DepartmentName = entity.DepartmentName,
                    Description = entity.Description,
                    TestTypeCount = await _context.RadiologyTestTypes
                        .CountAsync(t => t.RadiologyDepartmentID == entity.RadiologyDepartmentID)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update radiology department.", error = ex.Message });
            }
        }

        // DELETE: /radiology/RadiologyDepartment/{id}
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var entity = await _context.RadiologyDepartments
                    .Include(d => d.RadiologyTestType)
                    .FirstOrDefaultAsync(d => d.RadiologyDepartmentID == id);

                if (entity == null)
                    return NotFound(new { message = "Radiology department not found." });

                if (entity.RadiologyTestType.Any())
                    return Conflict(new { message = "Cannot delete department that still has test types." });

                _context.RadiologyDepartments.Remove(entity);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Radiology department deleted." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete radiology department.", error = ex.Message });
            }
        }
    }
}