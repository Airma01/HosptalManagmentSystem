// using HospitalSys.Data;
// using HospitalSys.Dto;
// using HospitalSys.Models;
// using HospitalSys.Models.Consultation_M;
// using HospitalSys.Models.PatientManagment;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using System;
// using System.Threading.Tasks;

// namespace HospitalSys.Controllers
// {
//     [ApiController]
//     [Route("Hospital/[Controller]")]
//     public class DoctorController : ControllerBase
//     {
//         private readonly AppDbContext _context;

//         public DoctorController(AppDbContext context)
//         {
//             _context = context;
//         }

         
//         // POST: /Hospital/Doctor/consultation
//         [HttpPost("consultation")]
//         public async Task<IActionResult> CreateConsultation([FromBody] ConsultationDto consultationDto)
//         {
//             try
//             {
//                 var consultation = new Consultation
//                 {
//                     VisitID = consultationDto.VisitID,
//                     DoctorID = consultationDto.DoctorID,
//                     Diagnosis = consultationDto.Diagnose,
//                     TreatmentPlan = consultationDto.TreatmentPlan,
//                     ChiefComplaint = consultationDto.ChiefComplaint,
//                 };

//                 _context.Consultations.Add(consultation);
//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Consultation created successfully.", consultationId = consultation.ConsultationID });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while creating consultation.", error = ex.Message });
//             }
//         }


//        // GET: /Hospital/Doctor/doctor/{doctorId}
// [HttpGet("doctor/{doctorId}")]
// public async Task<IActionResult> GetConsultationsByDoctorId(int doctorId)
// {
//     try
//     {
//         var consultations = await _context.Consultations
//             .Include(c => c.PatientVisit)
//                 .ThenInclude(pv => pv.Patient)
//             .Where(c => c.DoctorID == doctorId)
//             .Select(c => new
//             {
//                 c.ConsultationID,
//                 Fullname = c.PatientVisit.Patient.FirstName + " " + c.PatientVisit.Patient.LastName,
//                 c.VisitID,
//                 c.DoctorID,
//                 c.Diagnose,
//                 c.TreatmentPlan,
//                 c.ChiefComplaint,
//                 c.ConsultationDate,
//                 c.PatientVisit.Patient.PatientID
//             })
//             .ToListAsync(); // Use ToListAsync to get all consultations

//         if (consultations == null || !consultations.Any())
//             return NotFound(new { message = "No consultations found for this doctor." });

//         return Ok(consultations);
//     }
//     catch (Exception ex)
//     {
//         return StatusCode(500, new { message = "An error occurred while retrieving consultations.", error = ex.Message });
//     }
// }

//         // GET: /Hospital/Doctor/patient/{patientId}
//         [HttpGet("patient/{patientId}")]
//         public async Task<IActionResult> GetConsultationsByPatient(int patientId)
//         {
//             try
//             {
//                 var consultations = await _context.Consultations
//                     .Include(c => c.PatientVisit)
//                         .ThenInclude(pv => pv.Patient)
//                     .Where(c => c.PatientVisit.PatientID == patientId)
//                     .Select(c => new
//                     {
//                         c.ConsultationID,
//                         c.VisitID,
//                         c.DoctorID,
//                         c.Diagnose,
//                         c.TreatmentPlan,
//                         c.ChiefComplaint,
//                         c.ConsultationDate,
//                         Patient = new
//                         {
//                             c.PatientVisit.Patient.PatientID,
//                             c.PatientVisit.Patient.FirstName,
//                             c.PatientVisit.Patient.LastName
//                         },
//                         Visit = new
//                         {
//                             c.PatientVisit.VisitID,
//                             c.PatientVisit.VisitDate,
//                             c.PatientVisit.VisitType,
//                             c.PatientVisit.Status
//                         }
//                     })
//                     .ToListAsync();

//                 return Ok(consultations);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while retrieving consultations.", error = ex.Message });
//             }
//         }

//         // PUT: /Hospital/Doctor/{id}
//         [HttpPut("{id}")]
//         public async Task<IActionResult> UpdateConsultation(int id, [FromBody] ConsultationUpdateDto consultationDto)
//         {
//             try
//             {
//                 var consultation = await _context.Consultations.FindAsync(id);
//                 if (consultation == null)
//                     return NotFound(new { message = "Consultation not found." });

//                 consultation.Diagnose = consultationDto.Diagnose;
//                 consultation.TreatmentPlan = consultationDto.TreatmentPlan;
//                 consultation.ChiefComplaint = consultationDto.ChiefComplaint;

//                 await _context.SaveChangesAsync();

//                 return Ok(new { message = "Consultation updated successfully.", consultation });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while updating consultation.", error = ex.Message });
//             }
//         }

//         [HttpPost("medical-record")]
//         public async Task<IActionResult> CreateMedicalHistory([FromBody] MedicalRecordDto dto)
//         {
//             try
//             {
//                 if (dto == null || dto.ConsultationID == 0 || dto.PatientID == 0 || dto.DoctorID == 0)
//                     return BadRequest(new { message = "ConsultationID, PatientID, and DoctorID are required." });

//                 // Optional: verify consultation exists
//                 var consultationExists = await _context.Consultations.AnyAsync(c => c.ConsultationID == dto.ConsultationID);
//                 if (!consultationExists)
//                     return BadRequest(new { message = "Consultation not found." });

//                 // Check if a medical record for this consultation already exists
//                 bool isFoundMedicalHistory = await _context.MedicalHistories
//                     .AnyAsync(m => m.ConsultationID == dto.ConsultationID);
//                 if (isFoundMedicalHistory)
//                 {
//                     return BadRequest(new { message = "Medical record for this consultation already exists." });
//                 }

//                 var MedicalHistory = new MedicalHistory
//                 {
//                     ConsultationID = dto.ConsultationID,
//                     PatientID = dto.PatientID,
//                     DoctorID = dto.DoctorID
//                     // RecordTime is not set here – it will default to DateTime.UtcNow in the entity constructor
//                 };

//                 _context.MedicalHistories.Add(MedicalHistory);
//                 await _context.SaveChangesAsync();

//                 return Ok(new
//                 {
//                     message = "Medical record created successfully.",
//                     medicalRecordId = MedicalHistory.MedicalRecordID
//                 });
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while creating medical record.", error = ex.Message });
//             }
//         }

//         [HttpGet("all")]
//         public async Task<IActionResult> GetAllConsultaion()
//         {
//             try
//             {
//                 var consultations = await _context.Consultations
//                     .Include(c =>c.PatientVisit)
//                     .ThenInclude(c=>c.Patient)
//                     .Select(c => new
//                     {
//                         c.ConsultationID,
//                         c.VisitID,
//                         c.DoctorID,
//                         c.Diagnose,
//                         c.TreatmentPlan,
//                         c.ChiefComplaint,
//                         c.ConsultationDate
//                     })
//                     .ToListAsync();

//                 return Ok(consultations);
//             }
//             catch (Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while retrieving consultations.", error = ex.Message });
//             }

//         }

//         [HttpGet("recent/{doctorID}")]
//         public async Task<IActionResult> GetRecentConsultationByDoctorID(int doctorID)
//         {
//             try
//             {
//                 var consultation = await _context.Consultations
//                                   .Include(c => c.PatientVisit)
//                                   .ThenInclude(pv => pv.Patient)
//                                   .Select(c=>new
//                                   {
//                                       fullName= c.PatientVisit.Patient.FirstName + " " + c.PatientVisit.Patient.FirstName,
//                                       c.ConsultationID,
//                                       c.PatientVisit.Patient.PatientID,
//                                       c.DoctorID
//                                   })
//                                   .Where(c => c.DoctorID == doctorID)
//                                   .ToListAsync();
//                 return Ok(consultation);
//             }
//             catch (System.Exception ex)
//             {
//                 return StatusCode(500, new { message = "An error occurred while retrieving recent consultation.", error = ex.Message });
//             }
//         }
//     }
// }
