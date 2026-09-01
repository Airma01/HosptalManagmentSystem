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
    public class RadiologyTestTypeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RadiologyTestTypeController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /radiology/RadiologyTestType
        [HttpGet]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var list = await _context.RadiologyTestTypes
                    .AsNoTracking()
                    .Include(t => t.RadiologyDepartment)
                    .OrderBy(t => t.TestName)
                    .Select(t => new RadiologyTestTypeDto
                    {
                        RadiologyTestTypeID = t.RadiologyTestTypeID,
                        RadiologyDepartmentID = t.RadiologyDepartmentID,
                        DepartmentName = t.RadiologyDepartment != null ? t.RadiologyDepartment.DepartmentName : null,
                        TestName = t.TestName,
                        Price = t.Price,
                        Description = t.Description
                    })
                    .ToListAsync();

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load test types.", error = ex.Message });
            }
        }

        // GET: /radiology/RadiologyTestType/{id}
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var t = await _context.RadiologyTestTypes
                    .AsNoTracking()
                    .Include(x => x.RadiologyDepartment)
                    .FirstOrDefaultAsync(x => x.RadiologyTestTypeID == id);

                if (t == null)
                    return NotFound(new { message = "Radiology test type not found." });

                return Ok(new RadiologyTestTypeDto
                {
                    RadiologyTestTypeID = t.RadiologyTestTypeID,
                    RadiologyDepartmentID = t.RadiologyDepartmentID,
                    DepartmentName = t.RadiologyDepartment?.DepartmentName,
                    TestName = t.TestName,
                    Price = t.Price,
                    Description = t.Description
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load test type.", error = ex.Message });
            }
        }

        // GET: /radiology/RadiologyTestType/by-department/{departmentId}
        [HttpGet("by-department/{departmentId:int}")]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> GetByDepartment(int departmentId)
        {
            try
            {
                var deptExists = await _context.RadiologyDepartments
                    .AnyAsync(d => d.RadiologyDepartmentID == departmentId);

                if (!deptExists)
                    return NotFound(new { message = "Radiology department not found." });

                var list = await _context.RadiologyTestTypes
                    .AsNoTracking()
                    .Include(t => t.RadiologyDepartment)
                    .Where(t => t.RadiologyDepartmentID == departmentId)
                    .OrderBy(t => t.TestName)
                    .Select(t => new RadiologyTestTypeDto
                    {
                        RadiologyTestTypeID = t.RadiologyTestTypeID,
                        RadiologyDepartmentID = t.RadiologyDepartmentID,
                        DepartmentName = t.RadiologyDepartment != null ? t.RadiologyDepartment.DepartmentName : null,
                        TestName = t.TestName,
                        Price = t.Price,
                        Description = t.Description
                    })
                    .ToListAsync();

                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load test types for department.", error = ex.Message });
            }
        }

        // POST: /radiology/RadiologyTestType
        [HttpPost]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> Create([FromBody] CreateRadiologyTestTypeDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.TestName))
                    return BadRequest(new { message = "TestName is required." });

                var dept = await _context.RadiologyDepartments
                    .FirstOrDefaultAsync(d => d.RadiologyDepartmentID == dto.RadiologyDepartmentID);

                if (dept == null)
                    return BadRequest(new { message = "RadiologyDepartmentID does not exist." });

                var entity = new RadiologyTestType
                {
                    RadiologyDepartmentID = dto.RadiologyDepartmentID,
                    TestName = dto.TestName.Trim(),
                    Price = dto.Price,
                    Description = dto.Description?.Trim() ?? ""
                };

                _context.RadiologyTestTypes.Add(entity);
                await _context.SaveChangesAsync();

                return StatusCode(201, new RadiologyTestTypeDto
                {
                    RadiologyTestTypeID = entity.RadiologyTestTypeID,
                    RadiologyDepartmentID = entity.RadiologyDepartmentID,
                    DepartmentName = dept.DepartmentName,
                    TestName = entity.TestName,
                    Price = entity.Price,
                    Description = entity.Description
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create test type.", error = ex.Message });
            }
        }

        // PUT: /radiology/RadiologyTestType/{id}
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRadiologyTestTypeDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.TestName))
                    return BadRequest(new { message = "TestName is required." });

                if (id != dto.RadiologyTestTypeID)
                    return BadRequest(new { message = "Route id and body RadiologyTestTypeID must match." });

                var entity = await _context.RadiologyTestTypes
                    .FirstOrDefaultAsync(t => t.RadiologyTestTypeID == id);

                if (entity == null)
                    return NotFound(new { message = "Radiology test type not found." });

                var deptExists = await _context.RadiologyDepartments
                    .AnyAsync(d => d.RadiologyDepartmentID == dto.RadiologyDepartmentID);

                if (!deptExists)
                    return BadRequest(new { message = "RadiologyDepartmentID does not exist." });

                entity.RadiologyDepartmentID = dto.RadiologyDepartmentID;
                entity.TestName = dto.TestName.Trim();
                entity.Price = dto.Price;
                entity.Description = dto.Description?.Trim() ?? "";

                await _context.SaveChangesAsync();

                var deptName = await _context.RadiologyDepartments
                    .Where(d => d.RadiologyDepartmentID == entity.RadiologyDepartmentID)
                    .Select(d => d.DepartmentName)
                    .FirstOrDefaultAsync();

                return Ok(new RadiologyTestTypeDto
                {
                    RadiologyTestTypeID = entity.RadiologyTestTypeID,
                    RadiologyDepartmentID = entity.RadiologyDepartmentID,
                    DepartmentName = deptName,
                    TestName = entity.TestName,
                    Price = entity.Price,
                    Description = entity.Description
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update test type.", error = ex.Message });
            }
        }

        // DELETE: /radiology/RadiologyTestType/{id}
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Radiographer")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var entity = await _context.RadiologyTestTypes
                    .Include(t => t.RadiologyRequest)
                    .FirstOrDefaultAsync(t => t.RadiologyTestTypeID == id);

                if (entity == null)
                    return NotFound(new { message = "Radiology test type not found." });

                if (entity.RadiologyRequest.Any())
                    return Conflict(new { message = "Cannot delete test type that has existing requests." });

                _context.RadiologyTestTypes.Remove(entity);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Radiology test type deleted." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete test type.", error = ex.Message });
            }
        }
    }
}
