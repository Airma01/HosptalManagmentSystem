using HospitalSys.Data;
using HospitalSys.Dto.DoctorDtos;
using HospitalSys.Models.AdultMedicalCare;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Doctor
{
    [ApiController]
    [Route("api/doctor/patient/{patientId:int}/adult-medical-care")]
    [Authorize(Roles = "Doctor")]
    public class DoctorAdultMedicalCareController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorAdultMedicalCareController(AppDbContext context)
        {
            _context = context;
        }

        private int GetDepartmentId()
        {
            var claim = User.FindFirst("DepartmentID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid department claim");
            return id;
        }

        private async Task EnsurePatientAccessAsync(int patientId)
        {
            int departmentId = GetDepartmentId();
            bool ok = await _context.Triages.AsNoTracking()
                .AnyAsync(t => t.ClinicalDepartmentID == departmentId
                            && t.PatientVisit != null
                            && t.PatientVisit.PatientID == patientId);
            if (!ok)
                throw new KeyNotFoundException("Patient not found.");
        }


        private static DateTime ToUtc(DateTime value)
            => value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);

        private static DateTime? ToUtc(DateTime? value)
            => value.HasValue ? ToUtc(value.Value) : null;

        // ASTHMA
        [HttpGet("asthma")]
        public async Task<IActionResult> GetAsthma(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.AsthmaManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                return Ok(list.Select(ToAsthmaDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving asthma records." }); }
        }

        [HttpGet("asthma/{id:int}")]
        public async Task<IActionResult> GetAsthmaById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.AsthmaManagements.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.AsthmaManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Asthma record not found." });
                return Ok(ToAsthmaDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving asthma record." }); }
        }

        [HttpPost("asthma")]
        public async Task<IActionResult> CreateAsthma(int patientId, [FromBody] CreateAsthmaManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = new AsthmaManagement
                {
                    PatientID = patientId,
                    DiagnosisDate = ToUtc(dto.DiagnosisDate),
                    AsthmaSeverity = dto.AsthmaSeverity,
                    AsthmaControlStatus = dto.AsthmaControlStatus,
                    Symptoms = dto.Symptoms,
                    Triggers = dto.Triggers,
                    Allergies = dto.Allergies,
                    ExacerbationHistory = dto.ExacerbationHistory,
                    HospitalizationHistory = dto.HospitalizationHistory,
                    ManagementPlan = dto.ManagementPlan,
                    InhalerTechniqueEducation = dto.InhalerTechniqueEducation,
                    TreatmentStatus = dto.TreatmentStatus,
                    LastFollowUpDate = ToUtc(dto.LastFollowUpDate),
                    NextFollowUpDate = ToUtc(dto.NextFollowUpDate),
                    Active = dto.Active,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.AsthmaManagements.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToAsthmaDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating asthma record." }); }
        }

        [HttpPut("asthma/{id:int}")]
        public async Task<IActionResult> UpdateAsthma(int patientId, int id, [FromBody] CreateAsthmaManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.AsthmaManagements
                    .FirstOrDefaultAsync(x => x.AsthmaManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Asthma record not found." });

                entity.DiagnosisDate = ToUtc(dto.DiagnosisDate);
                entity.AsthmaSeverity = dto.AsthmaSeverity;
                entity.AsthmaControlStatus = dto.AsthmaControlStatus;
                entity.Symptoms = dto.Symptoms;
                entity.Triggers = dto.Triggers;
                entity.Allergies = dto.Allergies;
                entity.ExacerbationHistory = dto.ExacerbationHistory;
                entity.HospitalizationHistory = dto.HospitalizationHistory;
                entity.ManagementPlan = dto.ManagementPlan;
                entity.InhalerTechniqueEducation = dto.InhalerTechniqueEducation;
                entity.TreatmentStatus = dto.TreatmentStatus;
                entity.LastFollowUpDate = ToUtc(dto.LastFollowUpDate);
                entity.NextFollowUpDate = ToUtc(dto.NextFollowUpDate);
                entity.Active = dto.Active;
                entity.Notes = dto.Notes;
                entity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(ToAsthmaDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating asthma record." }); }
        }

        [HttpDelete("asthma/{id:int}")]
        public async Task<IActionResult> DeleteAsthma(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.AsthmaManagements
                    .FirstOrDefaultAsync(x => x.AsthmaManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Asthma record not found." });
                _context.AsthmaManagements.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error deleting asthma record." }); }
        }

        // DIABETES
        [HttpGet("diabetes")]
        public async Task<IActionResult> GetDiabetes(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.DiabetesManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                return Ok(list.Select(ToDiabetesDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving diabetes records." }); }
        }

        [HttpGet("diabetes/{id:int}")]
        public async Task<IActionResult> GetDiabetesById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.DiabetesManagements.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.DiabetesManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Diabetes record not found." });
                return Ok(ToDiabetesDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving diabetes record." }); }
        }

        [HttpPost("diabetes")]
        public async Task<IActionResult> CreateDiabetes(int patientId, [FromBody] CreateDiabetesManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                if (!Enum.TryParse<DiabetesType>(dto.DiabetesType, true, out var diabetesType))
                    return BadRequest(new { message = "Invalid DiabetesType. Use Type1, Type2, Gestational, or Other." });

                var entity = new DiabetesManagement
                {
                    PatientID = patientId,
                    DiagnosisDate = ToUtc(dto.DiagnosisDate),
                    DiabetesType = diabetesType,
                    DiagnosisMethod = dto.DiagnosisMethod,
                    LastFastingBloodGlucose = dto.LastFastingBloodGlucose,
                    LastRandomBloodGlucose = dto.LastRandomBloodGlucose,
                    LastHbA1c = dto.LastHbA1c,
                    Symptoms = dto.Symptoms,
                    Complications = dto.Complications,
                    RiskFactors = dto.RiskFactors,
                    ManagementPlan = dto.ManagementPlan,
                    LifestyleAdvice = dto.LifestyleAdvice,
                    TreatmentStatus = dto.TreatmentStatus,
                    LastFollowUpDate = ToUtc(dto.LastFollowUpDate),
                    NextFollowUpDate = ToUtc(dto.NextFollowUpDate),
                    Active = dto.Active,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.DiabetesManagements.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToDiabetesDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating diabetes record." }); }
        }

        [HttpPut("diabetes/{id:int}")]
        public async Task<IActionResult> UpdateDiabetes(int patientId, int id, [FromBody] CreateDiabetesManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.DiabetesManagements
                    .FirstOrDefaultAsync(x => x.DiabetesManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Diabetes record not found." });

                if (!Enum.TryParse<DiabetesType>(dto.DiabetesType, true, out var diabetesType))
                    return BadRequest(new { message = "Invalid DiabetesType. Use Type1, Type2, Gestational, or Other." });

                entity.DiagnosisDate = ToUtc(dto.DiagnosisDate);
                entity.DiabetesType = diabetesType;
                entity.DiagnosisMethod = dto.DiagnosisMethod;
                entity.LastFastingBloodGlucose = dto.LastFastingBloodGlucose;
                entity.LastRandomBloodGlucose = dto.LastRandomBloodGlucose;
                entity.LastHbA1c = dto.LastHbA1c;
                entity.Symptoms = dto.Symptoms;
                entity.Complications = dto.Complications;
                entity.RiskFactors = dto.RiskFactors;
                entity.ManagementPlan = dto.ManagementPlan;
                entity.LifestyleAdvice = dto.LifestyleAdvice;
                entity.TreatmentStatus = dto.TreatmentStatus;
                entity.LastFollowUpDate = ToUtc(dto.LastFollowUpDate);
                entity.NextFollowUpDate = ToUtc(dto.NextFollowUpDate);
                entity.Active = dto.Active;
                entity.Notes = dto.Notes;
                entity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(ToDiabetesDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating diabetes record." }); }
        }

        [HttpDelete("diabetes/{id:int}")]
        public async Task<IActionResult> DeleteDiabetes(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.DiabetesManagements
                    .FirstOrDefaultAsync(x => x.DiabetesManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Diabetes record not found." });
                _context.DiabetesManagements.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error deleting diabetes record." }); }
        }

        // HIV
        [HttpGet("hiv")]
        public async Task<IActionResult> GetHiv(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.HIVCares.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                return Ok(list.Select(ToHivDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving HIV records." }); }
        }

        [HttpGet("hiv/{id:int}")]
        public async Task<IActionResult> GetHivById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HIVCares.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.HIVCareID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "HIV record not found." });
                return Ok(ToHivDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving HIV record." }); }
        }

        [HttpPost("hiv")]
        public async Task<IActionResult> CreateHiv(int patientId, [FromBody] CreateHIVCareDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = new HIVCare
                {
                    PatientID = patientId,
                    EnrollmentDate = ToUtc(dto.EnrollmentDate) ?? DateTime.UtcNow,
                    DiagnosisDate = ToUtc(dto.DiagnosisDate),
                    CareStatus = dto.CareStatus,
                    ClinicalStage = dto.ClinicalStage,
                    TreatmentStatus = dto.TreatmentStatus,
                    TreatmentStartDate = ToUtc(dto.TreatmentStartDate),
                    AdherenceStatus = dto.AdherenceStatus,
                    TreatmentResponse = dto.TreatmentResponse,
                    OpportunisticConditions = dto.OpportunisticConditions,
                    Complications = dto.Complications,
                    CounselingProvided = dto.CounselingProvided,
                    FollowUpPlan = dto.FollowUpPlan,
                    LastFollowUpDate = ToUtc(dto.LastFollowUpDate),
                    NextFollowUpDate = ToUtc(dto.NextFollowUpDate),
                    Outcome = dto.Outcome,
                    Active = dto.Active,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.HIVCares.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToHivDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating HIV record." }); }
        }

        [HttpPut("hiv/{id:int}")]
        public async Task<IActionResult> UpdateHiv(int patientId, int id, [FromBody] CreateHIVCareDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HIVCares
                    .FirstOrDefaultAsync(x => x.HIVCareID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "HIV record not found." });

                if (dto.EnrollmentDate.HasValue) entity.EnrollmentDate = ToUtc(dto.EnrollmentDate.Value);
                entity.DiagnosisDate = ToUtc(dto.DiagnosisDate);
                entity.CareStatus = dto.CareStatus;
                entity.ClinicalStage = dto.ClinicalStage;
                entity.TreatmentStatus = dto.TreatmentStatus;
                entity.TreatmentStartDate = ToUtc(dto.TreatmentStartDate);
                entity.AdherenceStatus = dto.AdherenceStatus;
                entity.TreatmentResponse = dto.TreatmentResponse;
                entity.OpportunisticConditions = dto.OpportunisticConditions;
                entity.Complications = dto.Complications;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.FollowUpPlan = dto.FollowUpPlan;
                entity.LastFollowUpDate = ToUtc(dto.LastFollowUpDate);
                entity.NextFollowUpDate = ToUtc(dto.NextFollowUpDate);
                entity.Outcome = dto.Outcome;
                entity.Active = dto.Active;
                entity.Notes = dto.Notes;
                entity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(ToHivDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating HIV record." }); }
        }

        [HttpDelete("hiv/{id:int}")]
        public async Task<IActionResult> DeleteHiv(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HIVCares
                    .FirstOrDefaultAsync(x => x.HIVCareID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "HIV record not found." });
                _context.HIVCares.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error deleting HIV record." }); }
        }

        // HEPATITIS
        [HttpGet("hepatitis")]
        public async Task<IActionResult> GetHepatitis(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.HepatitisManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                return Ok(list.Select(ToHepatitisDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving hepatitis records." }); }
        }

        [HttpGet("hepatitis/{id:int}")]
        public async Task<IActionResult> GetHepatitisById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HepatitisManagements.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.HepatitisManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Hepatitis record not found." });
                return Ok(ToHepatitisDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving hepatitis record." }); }
        }

        [HttpPost("hepatitis")]
        public async Task<IActionResult> CreateHepatitis(int patientId, [FromBody] CreateHepatitisManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = new HepatitisManagement
                {
                    PatientID = patientId,
                    DiagnosisDate = ToUtc(dto.DiagnosisDate),
                    HepatitisType = dto.HepatitisType,
                    DiagnosticMethod = dto.DiagnosticMethod,
                    DiseaseStatus = dto.DiseaseStatus,
                    Symptoms = dto.Symptoms,
                    LiverCondition = dto.LiverCondition,
                    Complications = dto.Complications,
                    TreatmentPlan = dto.TreatmentPlan,
                    TreatmentStatus = dto.TreatmentStatus,
                    LaboratoryMonitoringPlan = dto.LaboratoryMonitoringPlan,
                    LastFollowUpDate = ToUtc(dto.LastFollowUpDate),
                    NextFollowUpDate = ToUtc(dto.NextFollowUpDate),
                    Outcome = dto.Outcome,
                    Active = dto.Active,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.HepatitisManagements.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToHepatitisDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating hepatitis record." }); }
        }

        [HttpPut("hepatitis/{id:int}")]
        public async Task<IActionResult> UpdateHepatitis(int patientId, int id, [FromBody] CreateHepatitisManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HepatitisManagements
                    .FirstOrDefaultAsync(x => x.HepatitisManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Hepatitis record not found." });

                entity.DiagnosisDate = ToUtc(dto.DiagnosisDate);
                entity.HepatitisType = dto.HepatitisType;
                entity.DiagnosticMethod = dto.DiagnosticMethod;
                entity.DiseaseStatus = dto.DiseaseStatus;
                entity.Symptoms = dto.Symptoms;
                entity.LiverCondition = dto.LiverCondition;
                entity.Complications = dto.Complications;
                entity.TreatmentPlan = dto.TreatmentPlan;
                entity.TreatmentStatus = dto.TreatmentStatus;
                entity.LaboratoryMonitoringPlan = dto.LaboratoryMonitoringPlan;
                entity.LastFollowUpDate = ToUtc(dto.LastFollowUpDate);
                entity.NextFollowUpDate = ToUtc(dto.NextFollowUpDate);
                entity.Outcome = dto.Outcome;
                entity.Active = dto.Active;
                entity.Notes = dto.Notes;
                entity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(ToHepatitisDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating hepatitis record." }); }
        }

        [HttpDelete("hepatitis/{id:int}")]
        public async Task<IActionResult> DeleteHepatitis(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HepatitisManagements
                    .FirstOrDefaultAsync(x => x.HepatitisManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Hepatitis record not found." });
                _context.HepatitisManagements.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error deleting hepatitis record." }); }
        }

        // HYPERTENSION
        [HttpGet("hypertension")]
        public async Task<IActionResult> GetHypertension(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.HypertensionManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                return Ok(list.Select(ToHypertensionDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving hypertension records." }); }
        }

        [HttpGet("hypertension/{id:int}")]
        public async Task<IActionResult> GetHypertensionById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HypertensionManagements.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.HypertensionManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Hypertension record not found." });
                return Ok(ToHypertensionDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving hypertension record." }); }
        }

        [HttpPost("hypertension")]
        public async Task<IActionResult> CreateHypertension(int patientId, [FromBody] CreateHypertensionManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = new HypertensionManagement
                {
                    PatientID = patientId,
                    DiagnosisDate = ToUtc(dto.DiagnosisDate),
                    HypertensionType = dto.HypertensionType,
                    DiagnosisMethod = dto.DiagnosisMethod,
                    RiskFactors = dto.RiskFactors,
                    TargetBloodPressure = dto.TargetBloodPressure,
                    Complications = dto.Complications,
                    CardiovascularRisk = dto.CardiovascularRisk,
                    ManagementPlan = dto.ManagementPlan,
                    LifestyleAdvice = dto.LifestyleAdvice,
                    TreatmentStatus = dto.TreatmentStatus,
                    LastFollowUpDate = ToUtc(dto.LastFollowUpDate),
                    NextFollowUpDate = ToUtc(dto.NextFollowUpDate),
                    Active = dto.Active,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.HypertensionManagements.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToHypertensionDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating hypertension record." }); }
        }

        [HttpPut("hypertension/{id:int}")]
        public async Task<IActionResult> UpdateHypertension(int patientId, int id, [FromBody] CreateHypertensionManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HypertensionManagements
                    .FirstOrDefaultAsync(x => x.HypertensionManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Hypertension record not found." });

                entity.DiagnosisDate = ToUtc(dto.DiagnosisDate);
                entity.HypertensionType = dto.HypertensionType;
                entity.DiagnosisMethod = dto.DiagnosisMethod;
                entity.RiskFactors = dto.RiskFactors;
                entity.TargetBloodPressure = dto.TargetBloodPressure;
                entity.Complications = dto.Complications;
                entity.CardiovascularRisk = dto.CardiovascularRisk;
                entity.ManagementPlan = dto.ManagementPlan;
                entity.LifestyleAdvice = dto.LifestyleAdvice;
                entity.TreatmentStatus = dto.TreatmentStatus;
                entity.LastFollowUpDate = ToUtc(dto.LastFollowUpDate);
                entity.NextFollowUpDate = ToUtc(dto.NextFollowUpDate);
                entity.Active = dto.Active;
                entity.Notes = dto.Notes;
                entity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(ToHypertensionDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating hypertension record." }); }
        }

        [HttpDelete("hypertension/{id:int}")]
        public async Task<IActionResult> DeleteHypertension(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HypertensionManagements
                    .FirstOrDefaultAsync(x => x.HypertensionManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Hypertension record not found." });
                _context.HypertensionManagements.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error deleting hypertension record." }); }
        }

        // MENTAL HEALTH
        [HttpGet("mental-health")]
        public async Task<IActionResult> GetMentalHealth(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.MentalHealthCares.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                return Ok(list.Select(ToMentalHealthDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving mental health records." }); }
        }

        [HttpGet("mental-health/{id:int}")]
        public async Task<IActionResult> GetMentalHealthById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.MentalHealthCares.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.MentalHealthCareID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Mental health record not found." });
                return Ok(ToMentalHealthDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving mental health record." }); }
        }

        [HttpPost("mental-health")]
        public async Task<IActionResult> CreateMentalHealth(int patientId, [FromBody] CreateMentalHealthCareDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = new MentalHealthCare
                {
                    PatientID = patientId,
                    AssessmentDate = ToUtc(dto.AssessmentDate) ?? DateTime.UtcNow,
                    PresentingConcern = dto.PresentingConcern,
                    MentalHealthDiagnosis = dto.MentalHealthDiagnosis,
                    Symptoms = dto.Symptoms,
                    MentalStatusExamination = dto.MentalStatusExamination,
                    PsychosocialFactors = dto.PsychosocialFactors,
                    RiskAssessment = dto.RiskAssessment,
                    SafetyPlan = dto.SafetyPlan,
                    TreatmentPlan = dto.TreatmentPlan,
                    CounselingProvided = dto.CounselingProvided,
                    ReferralRequired = dto.ReferralRequired,
                    FollowUpPlan = dto.FollowUpPlan,
                    NextFollowUpDate = ToUtc(dto.NextFollowUpDate),
                    Active = dto.Active,
                    Notes = dto.Notes
                };
                _context.MentalHealthCares.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToMentalHealthDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating mental health record." }); }
        }

        [HttpPut("mental-health/{id:int}")]
        public async Task<IActionResult> UpdateMentalHealth(int patientId, int id, [FromBody] CreateMentalHealthCareDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.MentalHealthCares
                    .FirstOrDefaultAsync(x => x.MentalHealthCareID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Mental health record not found." });

                if (dto.AssessmentDate.HasValue) entity.AssessmentDate = ToUtc(dto.AssessmentDate.Value);
                entity.PresentingConcern = dto.PresentingConcern;
                entity.MentalHealthDiagnosis = dto.MentalHealthDiagnosis;
                entity.Symptoms = dto.Symptoms;
                entity.MentalStatusExamination = dto.MentalStatusExamination;
                entity.PsychosocialFactors = dto.PsychosocialFactors;
                entity.RiskAssessment = dto.RiskAssessment;
                entity.SafetyPlan = dto.SafetyPlan;
                entity.TreatmentPlan = dto.TreatmentPlan;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.ReferralRequired = dto.ReferralRequired;
                entity.FollowUpPlan = dto.FollowUpPlan;
                entity.NextFollowUpDate = ToUtc(dto.NextFollowUpDate);
                entity.Active = dto.Active;
                entity.Notes = dto.Notes;
                entity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(ToMentalHealthDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating mental health record." }); }
        }

        [HttpDelete("mental-health/{id:int}")]
        public async Task<IActionResult> DeleteMentalHealth(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.MentalHealthCares
                    .FirstOrDefaultAsync(x => x.MentalHealthCareID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Mental health record not found." });
                _context.MentalHealthCares.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error deleting mental health record." }); }
        }

        // TUBERCULOSIS
        [HttpGet("tuberculosis")]
        public async Task<IActionResult> GetTuberculosis(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.TuberculosisManagements.AsNoTracking()
                    .Where(x => x.PatientID == patientId).ToListAsync();
                return Ok(list.Select(ToTbDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving tuberculosis records." }); }
        }

        [HttpGet("tuberculosis/{id:int}")]
        public async Task<IActionResult> GetTuberculosisById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.TuberculosisManagements.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.TuberculosisManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Tuberculosis record not found." });
                return Ok(ToTbDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving tuberculosis record." }); }
        }

        [HttpPost("tuberculosis")]
        public async Task<IActionResult> CreateTuberculosis(int patientId, [FromBody] CreateTuberculosisManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = new TuberculosisManagement
                {
                    PatientID = patientId,
                    DiagnosisDate = ToUtc(dto.DiagnosisDate),
                    TBType = dto.TBType,
                    SiteOfTB = dto.SiteOfTB,
                    DiagnosticMethod = dto.DiagnosticMethod,
                    Symptoms = dto.Symptoms,
                    DrugResistanceStatus = dto.DrugResistanceStatus,
                    TreatmentStartDate = ToUtc(dto.TreatmentStartDate),
                    ExpectedTreatmentEndDate = ToUtc(dto.ExpectedTreatmentEndDate),
                    ActualTreatmentEndDate = ToUtc(dto.ActualTreatmentEndDate),
                    TreatmentRegimen = dto.TreatmentRegimen,
                    TreatmentStatus = dto.TreatmentStatus,
                    AdherenceStatus = dto.AdherenceStatus,
                    TreatmentResponse = dto.TreatmentResponse,
                    Complications = dto.Complications,
                    ContactTracingStatus = dto.ContactTracingStatus,
                    LastFollowUpDate = ToUtc(dto.LastFollowUpDate),
                    NextFollowUpDate = ToUtc(dto.NextFollowUpDate),
                    Outcome = dto.Outcome,
                    Active = dto.Active,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.TuberculosisManagements.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToTbDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating tuberculosis record." }); }
        }

        [HttpPut("tuberculosis/{id:int}")]
        public async Task<IActionResult> UpdateTuberculosis(int patientId, int id, [FromBody] CreateTuberculosisManagementDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.TuberculosisManagements
                    .FirstOrDefaultAsync(x => x.TuberculosisManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Tuberculosis record not found." });

                entity.DiagnosisDate = ToUtc(dto.DiagnosisDate);
                entity.TBType = dto.TBType;
                entity.SiteOfTB = dto.SiteOfTB;
                entity.DiagnosticMethod = dto.DiagnosticMethod;
                entity.Symptoms = dto.Symptoms;
                entity.DrugResistanceStatus = dto.DrugResistanceStatus;
                entity.TreatmentStartDate = ToUtc(dto.TreatmentStartDate);
                entity.ExpectedTreatmentEndDate = ToUtc(dto.ExpectedTreatmentEndDate);
                entity.ActualTreatmentEndDate = ToUtc(dto.ActualTreatmentEndDate);
                entity.TreatmentRegimen = dto.TreatmentRegimen;
                entity.TreatmentStatus = dto.TreatmentStatus;
                entity.AdherenceStatus = dto.AdherenceStatus;
                entity.TreatmentResponse = dto.TreatmentResponse;
                entity.Complications = dto.Complications;
                entity.ContactTracingStatus = dto.ContactTracingStatus;
                entity.LastFollowUpDate = ToUtc(dto.LastFollowUpDate);
                entity.NextFollowUpDate = ToUtc(dto.NextFollowUpDate);
                entity.Outcome = dto.Outcome;
                entity.Active = dto.Active;
                entity.Notes = dto.Notes;
                entity.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(ToTbDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating tuberculosis record." }); }
        }

        [HttpDelete("tuberculosis/{id:int}")]
        public async Task<IActionResult> DeleteTuberculosis(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.TuberculosisManagements
                    .FirstOrDefaultAsync(x => x.TuberculosisManagementID == id && x.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Tuberculosis record not found." });
                _context.TuberculosisManagements.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error deleting tuberculosis record." }); }
        }

        // MAPPERS
        private static AsthmaManagementDto ToAsthmaDto(AsthmaManagement x) => new()
        {
            AsthmaManagementID = x.AsthmaManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            AsthmaSeverity = x.AsthmaSeverity,
            AsthmaControlStatus = x.AsthmaControlStatus,
            Symptoms = x.Symptoms,
            Triggers = x.Triggers,
            Allergies = x.Allergies,
            ExacerbationHistory = x.ExacerbationHistory,
            HospitalizationHistory = x.HospitalizationHistory,
            ManagementPlan = x.ManagementPlan,
            InhalerTechniqueEducation = x.InhalerTechniqueEducation,
            TreatmentStatus = x.TreatmentStatus,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Active = x.Active,
            Notes = x.Notes,
            RecordedByUserID = x.RecordedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static DiabetesManagementDto ToDiabetesDto(DiabetesManagement x) => new()
        {
            DiabetesManagementID = x.DiabetesManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            DiabetesType = x.DiabetesType.ToString(),
            DiagnosisMethod = x.DiagnosisMethod,
            LastFastingBloodGlucose = x.LastFastingBloodGlucose,
            LastRandomBloodGlucose = x.LastRandomBloodGlucose,
            LastHbA1c = x.LastHbA1c,
            Symptoms = x.Symptoms,
            Complications = x.Complications,
            RiskFactors = x.RiskFactors,
            ManagementPlan = x.ManagementPlan,
            LifestyleAdvice = x.LifestyleAdvice,
            TreatmentStatus = x.TreatmentStatus,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Active = x.Active,
            Notes = x.Notes,
            RecordedByUserID = x.RecordedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static HIVCareDto ToHivDto(HIVCare x) => new()
        {
            HIVCareID = x.HIVCareID,
            PatientID = x.PatientID,
            EnrollmentDate = x.EnrollmentDate,
            DiagnosisDate = x.DiagnosisDate,
            CareStatus = x.CareStatus,
            ClinicalStage = x.ClinicalStage,
            TreatmentStatus = x.TreatmentStatus,
            TreatmentStartDate = x.TreatmentStartDate,
            AdherenceStatus = x.AdherenceStatus,
            TreatmentResponse = x.TreatmentResponse,
            OpportunisticConditions = x.OpportunisticConditions,
            Complications = x.Complications,
            CounselingProvided = x.CounselingProvided,
            FollowUpPlan = x.FollowUpPlan,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Outcome = x.Outcome,
            Active = x.Active,
            Notes = x.Notes,
            ManagedByUserID = x.ManagedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static HepatitisManagementDto ToHepatitisDto(HepatitisManagement x) => new()
        {
            HepatitisManagementID = x.HepatitisManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            HepatitisType = x.HepatitisType,
            DiagnosticMethod = x.DiagnosticMethod,
            DiseaseStatus = x.DiseaseStatus,
            Symptoms = x.Symptoms,
            LiverCondition = x.LiverCondition,
            Complications = x.Complications,
            TreatmentPlan = x.TreatmentPlan,
            TreatmentStatus = x.TreatmentStatus,
            LaboratoryMonitoringPlan = x.LaboratoryMonitoringPlan,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Outcome = x.Outcome,
            Active = x.Active,
            Notes = x.Notes,
            ManagedByUserID = x.ManagedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static HypertensionManagementDto ToHypertensionDto(HypertensionManagement x) => new()
        {
            HypertensionManagementID = x.HypertensionManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            HypertensionType = x.HypertensionType,
            DiagnosisMethod = x.DiagnosisMethod,
            RiskFactors = x.RiskFactors,
            TargetBloodPressure = x.TargetBloodPressure,
            Complications = x.Complications,
            CardiovascularRisk = x.CardiovascularRisk,
            ManagementPlan = x.ManagementPlan,
            LifestyleAdvice = x.LifestyleAdvice,
            TreatmentStatus = x.TreatmentStatus,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Active = x.Active,
            Notes = x.Notes,
            RecordedByUserID = x.RecordedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        private static MentalHealthCareDto ToMentalHealthDto(MentalHealthCare x) => new()
        {
            MentalHealthCareID = x.MentalHealthCareID,
            PatientID = x.PatientID,
            AssessmentDate = x.AssessmentDate,
            PresentingConcern = x.PresentingConcern,
            MentalHealthDiagnosis = x.MentalHealthDiagnosis,
            Symptoms = x.Symptoms,
            MentalStatusExamination = x.MentalStatusExamination,
            PsychosocialFactors = x.PsychosocialFactors,
            RiskAssessment = x.RiskAssessment,
            SafetyPlan = x.SafetyPlan,
            TreatmentPlan = x.TreatmentPlan,
            CounselingProvided = x.CounselingProvided,
            ReferralRequired = x.ReferralRequired,
            FollowUpPlan = x.FollowUpPlan,
            NextFollowUpDate = x.NextFollowUpDate,
            Active = x.Active,
            Notes = x.Notes,
            AssessedByUserID = x.AssessedByUserID,
            UpdatedAt = x.UpdatedAt
        };

        private static TuberculosisManagementDto ToTbDto(TuberculosisManagement x) => new()
        {
            TuberculosisManagementID = x.TuberculosisManagementID,
            PatientID = x.PatientID,
            DiagnosisDate = x.DiagnosisDate,
            TBType = x.TBType,
            SiteOfTB = x.SiteOfTB,
            DiagnosticMethod = x.DiagnosticMethod,
            Symptoms = x.Symptoms,
            DrugResistanceStatus = x.DrugResistanceStatus,
            TreatmentStartDate = x.TreatmentStartDate,
            ExpectedTreatmentEndDate = x.ExpectedTreatmentEndDate,
            ActualTreatmentEndDate = x.ActualTreatmentEndDate,
            TreatmentRegimen = x.TreatmentRegimen,
            TreatmentStatus = x.TreatmentStatus,
            AdherenceStatus = x.AdherenceStatus,
            TreatmentResponse = x.TreatmentResponse,
            Complications = x.Complications,
            ContactTracingStatus = x.ContactTracingStatus,
            LastFollowUpDate = x.LastFollowUpDate,
            NextFollowUpDate = x.NextFollowUpDate,
            Outcome = x.Outcome,
            Active = x.Active,
            Notes = x.Notes,
            ManagedByUserID = x.ManagedByUserID,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };
    }
}