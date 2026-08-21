// using Microsoft.AspNetCore.Mvc;
// using HospitalSys.Data;
// using HospitalSys.Dto;
// using HospitalSys.Models;
// using HospitalSys.Models.PatientManagment;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.Authorization;
// namespace HospitalSys.Controllers
// {
//     [ApiController]
//     [Route("Hospital/[controller]")]   // => /Hospital/Triage/...
//     public class TriageController : ControllerBase
//     {
//         private readonly AppDbContext _context;

//         public TriageController(AppDbContext context)
//         {
//             _context = context;
//         }

//         // GET: /Hospital/Triage/triage_departments
//         [HttpGet("triage_departments")]
//         public async Task<IActionResult> GetTriageDepartments()
//         {
//             try
//             {
//                 var triageDepartments = await _context.TriageDepartments.ToListAsync();
//                 return Ok(triageDepartments);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while retrieving triage departments.", error = ex.Message });
//             }
//         }

//         // POST: /Hospital/Triage/add_triage
//         [HttpPost("add_triage")]
//         [Authorize(Roles = "Nurse")]   // Only nurses can create triage
//         public async Task<IActionResult> CreateTriage([FromBody] TriageDto triageDto)
//         {
//             try
//             {
//                 var triage = new Triage
//                 {
//                     VisitID = triageDto.VisitID,
//                     NurseID = triageDto.NurseID,
//                     TriageDepartmentID = triageDto.TriageDepartmentID,
//                     ClinicalDepartmentID = triageDto.ClinicalDepartmentID,
//                     Temprature = triageDto.Temprature,
//                     BloodPressure = triageDto.BloodPressure,
//                     HeartRate = triageDto.HeartRate,
//                     RespiratotyRate = triageDto.RespiratotyRate,
//                     Weight = triageDto.Weight,
//                     Notes = triageDto.Notes
//                 };

//                 _context.Triages.Add(triage);
//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Triage record created successfully." });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while creating the triage record.", error = ex.Message });
//             }
//         }

//         // GET: /Hospital/Triage/by-visit/{visitId}
//         [HttpGet("by-visit/{visitId}")]
//         public async Task<IActionResult> GetTriageByVisitId(int visitId)
//         {
//             try
//             {
//                 var triage = await _context.Triages
//                     .Include(t => t.PatientVisit)
//                     .Include(t => t.Nurse)
//                     .ThenInclude(t => t.Users)
//                     .Include(t => t.TriageDepartment)
//                     .Include(t => t.ClinicalDepartment)
//                     .FirstOrDefaultAsync(t => t.VisitID == visitId);
//                 if (triage == null)
//                 {
//                     return NotFound(new { message = "Triage record not found for the given Visit ID." });
//                 }

//                 // Use a projection to avoid circular references
//                 var result = new
//                 {
//                     triage.TriageId,
//                     triage.VisitID,
//                     triage.NurseID,
//                     triage.TriageDepartmentID,
//                     triage.ClinicalDepartmentID,
//                     triage.Temprature,
//                     triage.BloodPressure,
//                     triage.HeartRate,
//                     triage.RespiratotyRate,
//                     triage.Weight,
//                     triage.Notes,
//                     PatientVisit = triage.PatientVisit == null ? null : new { triage.PatientVisit.VisitID, triage.PatientVisit.VisitDate },
//                     Nurse = triage.Nurse == null ? null : new { triage.Nurse.UserID, triage.Nurse.Users.FirstName, triage.Nurse.Users.FatherName },
//                     TriageDepartment = triage.TriageDepartment == null ? null : new { triage.TriageDepartment.TriageDepartmentID, triage.TriageDepartment.DepartmentName },
//                     ClinicalDepartment = triage.ClinicalDepartment == null ? null : new { triage.ClinicalDepartment.ClinicalDepartmentID, triage.ClinicalDepartment.DepartmentName }
//                 };

//                 return Ok(result);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while retrieving the triage record.", error = ex.Message });
//             }
//         }

//         // GET: /Hospital/Triage/{id}
//         [HttpGet("{id}")]
//         public async Task<IActionResult> GetTriageById(int id)
//         {
//             try
//             {
//                 var triage = await _context.Triages
//                     .Include(t => t.PatientVisit)
//                     .Include(t => t.Nurse)
//                     .ThenInclude(t=>t.Users)
//                     .Include(t => t.TriageDepartment)
//                     .Include(t => t.ClinicalDepartment)
//                     .FirstOrDefaultAsync(t => t.TriageId == id);

//                 if (triage == null)
//                 {
//                     return NotFound(new { message = "Triage record not found for the given ID." });
//                 }

//                 // Same projection to avoid cycles
//                 var result = new
//                 {
//                     triage.TriageId,
//                     triage.VisitID,
//                     triage.NurseID,
//                     triage.TriageDepartmentID,
//                     triage.ClinicalDepartmentID,
//                     triage.Temprature,
//                     triage.BloodPressure,
//                     triage.HeartRate,
//                     triage.RespiratotyRate,
//                     triage.Weight,
//                     triage.Notes,
//                     PatientVisit = triage.PatientVisit == null ? null : new { triage.PatientVisit.VisitID, triage.PatientVisit.VisitDate },
//                     Nurse = triage.Nurse == null ? null : new { triage.Nurse.UserID, triage.Nurse.Users.FirstName, triage.Nurse.Users.FatherName },
//                     TriageDepartment = triage.TriageDepartment == null ? null : new { triage.TriageDepartment.TriageDepartmentID, triage.TriageDepartment.DepartmentName },
//                     ClinicalDepartment = triage.ClinicalDepartment == null ? null : new { triage.ClinicalDepartment.ClinicalDepartmentID, triage.ClinicalDepartment.DepartmentName }
//                 };

//                 return Ok(result);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while retrieving the triage record.", error = ex.Message });
//             }
//         }

//         [HttpGet("recent_visit")]
// public async Task<IActionResult> RecentTriageVist()
// {
//     try
//     {
//         var patient = await _context.PatientVisits
//                             .Include(t => t.Patient)
//                             .OrderBy(t=>t.VisitDate)
//                             .Select(t => new
//                             {
//                                 FullName = t.Patient.FirstName + " "+t.Patient.LastName,
//                                 t.VisitID,
//                                 t.PatientID
//                             })
//                             .ToListAsync();
//         return Ok(patient);
//     }
//     catch (System.Exception)
//     {
        
//         throw;
//     }
// }
//         // PUT: /Hospital/Triage/assign-department
//         [HttpPut("assign-department")]
//         [Authorize(Roles = "Nurse,Admin")]   // Nurses or Admins can assign
//         public async Task<IActionResult> AssignClinicalDepartment([FromBody] AssignDepartmentDto dto)
//         {
//             try
//             {
//                 var triage = await _context.Triages.FindAsync(dto.TriageId);
//                 if (triage == null)
//                 {
//                     return NotFound(new { message = "Triage record not found." });
//                 }

//                 triage.ClinicalDepartmentID = dto.ClinicalDepartmentId;
//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Clinical department assigned successfully." });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while assigning the clinical department.", error = ex.Message });
//             }
//         }

//         [HttpGet("get-recent-triage/{departmentID}")]
//         public async Task<IActionResult> GetRecentTriage(int departmentID)
//         {
//             if(departmentID == null)
//             {
//                 return BadRequest("");
//             }
//             try
//             {
//                 var triage = await _context.Triages
//                      .Include(u=>u.PatientVisit)
//                      .ThenInclude(u=>u.Patient)
//                     .OrderByDescending(t => t.TriageId)
//                     .Where(t=>t.ClinicalDepartmentID == departmentID)
//                     .Select(t => new
//                     {
//                         t.TriageId,
//                         t.VisitID,
//                         FullName = t.PatientVisit.Patient.FirstName + " " + t.PatientVisit.Patient.LastName,
//                         t.PatientVisit.Patient.PatientID,
//                         t.NurseID,
//                         t.TriageDepartmentID,
//                         t.ClinicalDepartmentID,
//                         t.Temprature,
//                         t.BloodPressure,
//                         t.HeartRate,
//                         t.RespiratotyRate,
//                         t.Weight,
//                         t.Notes
//                     })
//                     .ToListAsync();

//                 if (triage == null)
//                 {
//                     return NotFound(new { message = "No triage records found." });
//                 }

//                 return Ok(triage);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while retrieving the recent triage record.", error = ex.Message });
//             }
//         }
//         [HttpGet("clinical_departments")]
//         public async Task<IActionResult> GetClinicalDepartment()
//         {
//             try
//             {
    
//                 var clinicalDepartments = await _context.ClinicalDepartments
//                                            .Select(u=>new
//                                            {
//                                                u.ClinicalDepartmentID,
//                                                u.DepartmentName,
//                                                u.Description
//                                            })
//                                           .ToListAsync();
//                 return Ok(clinicalDepartments);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while retrieving clinical departments.", error = ex.Message });
//             }
//         }
//     }
// }