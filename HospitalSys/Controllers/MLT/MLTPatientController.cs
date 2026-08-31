using HospitalSys.Data;
using HospitalSys.Dto.MLT;
using HospitalSys.Models.PatientManagment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.MLT
{
    [ApiController]
    [Route("mlt/[controller]")]
    [Authorize(Roles = "LaboratoryTechnician")]
    public class MLTPatientController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MLTPatientController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /mlt/MLTPatient/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetPatientById(int id)
        {
            try
            {
                var patient = await _context.Patients
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.PatientID == id);

                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                return Ok(MapPatient(patient));
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTPatient/search?mrn=&phone=&firstName=&lastName=
        [HttpGet("search")]
        public async Task<IActionResult> SearchPatients(
            [FromQuery] string? mrn,
            [FromQuery] string? phone,
            [FromQuery] string? firstName,
            [FromQuery] string? lastName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(mrn) &&
                    string.IsNullOrWhiteSpace(phone) &&
                    string.IsNullOrWhiteSpace(firstName) &&
                    string.IsNullOrWhiteSpace(lastName))
                {
                    return BadRequest(new { message = "Provide at least one search criterion" });
                }

                var query = _context.Patients.AsNoTracking().AsQueryable();

                if (!string.IsNullOrWhiteSpace(mrn))
                    query = query.Where(p => p.MRN.Contains(mrn));

                if (!string.IsNullOrWhiteSpace(phone))
                    query = query.Where(p => p.Phone.Contains(phone));

                if (!string.IsNullOrWhiteSpace(firstName))
                    query = query.Where(p => p.FirstName.Contains(firstName));

                if (!string.IsNullOrWhiteSpace(lastName))
                    query = query.Where(p => p.LastName.Contains(lastName));

                var patients = await query
                    .OrderBy(p => p.LastName)
                    .ThenBy(p => p.FirstName)
                    .Take(50)
                    .ToListAsync();

                var result = patients.Select(MapPatient).ToList();
                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTPatient/with-lab-tests
        // Patients who have at least one LaboratoryTest
        [HttpGet("with-lab-tests")]
        public async Task<IActionResult> GetPatientsWithLabTests()
        {
            try
            {
                var patients = await _context.Patients
                    .AsNoTracking()
                    .Where(p => p.LaboratoryTest.Any())
                    .OrderBy(p => p.LastName)
                    .ThenBy(p => p.FirstName)
                    .Select(p => new MLTPatientDto
                    {
                        PatientID = p.PatientID,
                        MRN = p.MRN,
                        FaydaFIN = p.FaydaFIN,
                        FirstName = p.FirstName,
                        LastName = p.LastName,
                        Gender = p.Gender,
                        DateOfBirth = p.DateOfBirth,
                        Phone = p.Phone,
                        Address = p.Address,
                        EmergencyContact = p.EmergencyContact,
                        Created_at = p.Created_at
                    })
                    .ToListAsync();

                return Ok(patients);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: /mlt/MLTPatient/{patientId}/lab-history
        [HttpGet("{patientId:int}/lab-history")]
        public async Task<IActionResult> GetPatientLabHistory(int patientId)
        {
            try
            {
                var exists = await _context.Patients.AnyAsync(p => p.PatientID == patientId);
                if (!exists)
                    return NotFound(new { message = "Patient not found" });

                var tests = await _context.LaboratoryTests
                    .AsNoTracking()
                    .Where(t => t.PatientID == patientId)
                    .Include(t => t.Patient)
                    .Include(t => t.Doctor!)
                        .ThenInclude(d => d.Users)
                    .Include(t => t.Doctor!)
                        .ThenInclude(d => d.ClinicalDepartment)
                    .Include(t => t.LaboratoryTestType!)
                        .ThenInclude(tt => tt.LaboratorySection)
                    .Include(t => t.LaboratoryResult)
                    .OrderByDescending(t => t.RequestDate)
                    .ToListAsync();

                var list = tests.Select(t => new MLTTestListDto
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
                }).ToList();

                return Ok(list);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private static MLTPatientDto MapPatient(Patient p)
        {
            return new MLTPatientDto
            {
                PatientID = p.PatientID,
                MRN = p.MRN,
                FaydaFIN = p.FaydaFIN,
                FirstName = p.FirstName,
                LastName = p.LastName,
                Gender = p.Gender,
                DateOfBirth = p.DateOfBirth,
                Phone = p.Phone,
                Address = p.Address,
                EmergencyContact = p.EmergencyContact,
                Created_at = p.Created_at
            };
        }
    }
}