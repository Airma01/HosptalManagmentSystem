// using HospitalSys.Data;
// using HospitalSys.Models.PatientManagment;
// using Microsoft.AspNetCore.Mvc;
// using HospitalSys.Dto;
// using HospitalSys.DTO;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.Authorization;
// namespace HospitalSys.Controllers
// {
//     [ApiController]
//     [Route("Hospital/[Controller]")]
//     public class PatientController : ControllerBase
//     {
//         private readonly AppDbContext _context;
//         public PatientController(AppDbContext context)
//         {
//             _context = context;
//         }

//         [HttpPost("add_patient")]
//         public async Task<IActionResult> CreatePatient([FromBody] PatientDto patientDto)
//         {
//             try
//             {
//                  if (patientDto == null)
//             {
//                 return BadRequest("Patient data is required.");
//             }

//            var patient = new Patient
//                 {
//                     FirstName = patientDto.FirstName,
//                     LastName = patientDto.LastName,
//                     DateOfBirth = DateTime.SpecifyKind(patientDto.DateOfBirth, DateTimeKind.Utc), // <-- add this line
//                     Gender = (Gender)patientDto.Gender,
//                     Phone = patientDto.Phone,
//                     Address = patientDto.Address,
//                     EmergencyContact = patientDto.EmergencyContact
//                 };
//             _context.Patients.Add(patient);
//             await _context.SaveChangesAsync();

//             return CreatedAtAction(nameof(CreatePatient), new { id = patient.PatientID }, patient);
//             }
//             catch (System.Exception)
//             {
                
//                 throw;
//             }
           
//         }
//         [HttpGet("get_patient/{id}")]
//         public async Task<IActionResult> GetPatientById(int id)
//         {
//             try
//             {
//             var patient = await _context.Patients.FindAsync(id);
//             if (patient == null)
//             {
//                 return NotFound();
//             }
//             return Ok(patient);
//             }
//             catch (Exception)
//             {
                
//                 throw;
//             }    
//         }
//       [HttpGet("get_all_visits")]
//     public async Task<IActionResult> GetAllVisits()
//     {
//         try
//         {
//             var visits = await _context.PatientVists
//                 .Include(v => v.Patient)   // still needed for patient data
//                 .Select(v => new
//                 {
//                     v.VisitID,
//                     v.VisitDate,
//                     v.VisitType,
//                     v.Status,
//                     Patient = new
//                     {
//                         v.Patient.FirstName,
//                         v.Patient.LastName
//                     }
//                 })
//                 .ToListAsync();

//             return Ok(visits);
//         }
//         catch (Exception ex)
//         {
//             return StatusCode(500, ex.Message);
//         }
//     }
//         [HttpGet("get_all_patients")]
//         public async Task<IActionResult> GetAllPatients()
//         {
//             try
//             {
//                 var patients = await _context.Patients.ToListAsync();
//                 return Ok(patients);
//             }
//             catch (Exception)
//             {
//                 throw;
//             }
//         }
//         [HttpDelete("delete_patient/{id}")]
//         public async Task<IActionResult> DeletePatient(int id)
//         {
//             try
//             {
//                 var patient = await _context.Patients.FindAsync(id);
//                 if (patient == null)
//                 {
//                     return NotFound();
//                 }

//                 _context.Patients.Remove(patient);
//                 await _context.SaveChangesAsync();

//                 return Ok("Patient deleted successfully.");
//             }
//             catch (Exception)
//             {
//                 throw;
//             }
//         }
//        [HttpPost("add_patient_visit")]
//     public async Task<IActionResult> CreatePatientVisit([FromBody] PatientVisitDto patientVisitDto)
//     {
//         try
//         {
//             if (patientVisitDto == null)
//                 return BadRequest("Patient visit data is required.");

//             var patientVisit = new PatientVisit
//             {
//                 PatientID = patientVisitDto.PatientID,
//                 VisitDate = DateTime.SpecifyKind(patientVisitDto.VisitDate, DateTimeKind.Utc), // 👈 add this line
//                 VisitType = patientVisitDto.VisitType,
//                 Status = patientVisitDto.Status
//             };

//             _context.PatientVists.Add(patientVisit);
//             await _context.SaveChangesAsync();

//             return CreatedAtAction(nameof(CreatePatientVisit), new { id = patientVisit.VisitID }, patientVisit);
//         }
//         catch (Exception)
//         {
//             throw;
//         }
//     }


//     }
// }