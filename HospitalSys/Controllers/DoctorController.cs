using HospitalSys.Data;
using Microsoft.AspNetCore.Mvc;
using HospitalSys.Dto;
using HospitalSys.Models;
using HospitalSys.Models.Consultation_M;
using Microsoft.EntityFrameworkCore;
namespace HospitalSys.Controllers
{
    [ApiController]
    [Route("Hospital/[Controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DoctorController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost]
        public async Task<IActionResult> CreateConsultation([FromBody] ConsultationDto consultationDto)
        {
            try
            {
             var consultaion = new Consultation
             {
                    VisitID = consultationDto.VisitID,
                    DoctorID = consultationDto.DoctorID,
                    Diagnosis = consultationDto.Diagnosis,
                    TreatmentPlan = consultationDto.TreatmentPlan,
                    ChiefComplaint = consultationDto.ChiefComplaint,
             };
             await _context.Consultations.AddAsync(consultaion);
             await _context.SaveChangesAsync();
             return Ok(new { message = "Consultation created successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetConsultationById(int id)
        {
            var consultation = await _context.Consultations.FindAsync(id);
            if (consultation == null)
            {
                return NotFound();
            }
            return Ok(consultation);
        }
        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetConsultationsByPatient(int patientId)
        {
            var consultations = await _context.Consultations
                                      .Include(u => u.PatientVisit)
                                        .ThenInclude(u => u.Patient)
                                      .Where(u => u.PatientVisit.PatientID == patientId)
                                      .ToListAsync();
            return Ok(consultations);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateConsultation(int id, [FromBody] ConsultationUpdateDto consultationDto)
        {
            var consultation = await _context.Consultations.FindAsync(id);
            if (consultation == null)
            {
                return NotFound();
            }

            consultation.Diagnosis = consultationDto.Diagnosis;
            consultation.TreatmentPlan = consultationDto.TreatmentPlan;
            consultation.ChiefComplaint = consultationDto.ChiefComplaint;
            await _context.SaveChangesAsync();
            return Ok(consultation);
        }
        [HttpPost]
        public async Task<IActionResult> CreateMedicalRecord(MedicalRecord medicalRecord)
        {
            try
            {
                _context.MedicalRecords.Add(medicalRecord);
                await _context.SaveChangesAsync();
                return Ok(medicalRecord);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}