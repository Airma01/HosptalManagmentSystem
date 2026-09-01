using HospitalSys.Data;
using HospitalSys.Dto.DoctorDtos;
using HospitalSys.Models.ChildHealth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Doctor
{
    [ApiController]
    [Route("api/doctor/patient/{patientId:int}/child-health")]
    [Authorize(Roles = "Doctor")]
    public class DoctorChildHealthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorChildHealthController(AppDbContext context)
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

        private async Task EnsureVisitBelongsToPatientAsync(int patientId, int patientVisitId)
        {
            bool ok = await _context.PatientVisits.AsNoTracking()
                .AnyAsync(v => v.VisitID == patientVisitId && v.PatientID == patientId);
            if (!ok)
                throw new KeyNotFoundException("Patient visit not found.");
        }

        // ============================================================
        // NEONATAL CARE
        // ============================================================

        [HttpGet("neonatal-care")]
        public async Task<IActionResult> GetNeonatalCare(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.NeonatalCares.AsNoTracking()
                    .Where(n => n.PatientID == patientId)
                    .OrderByDescending(n => n.AssessmentDate)
                    .ToListAsync();
                return Ok(list.Select(ToNeonatalCareDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving neonatal care records." }); }
        }

        [HttpGet("neonatal-care/{id:int}")]
        public async Task<IActionResult> GetNeonatalCareById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.NeonatalCares.AsNoTracking()
                    .FirstOrDefaultAsync(n => n.NeonatalCareID == id && n.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Neonatal care record not found." });
                return Ok(ToNeonatalCareDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving neonatal care record." }); }
        }

        [HttpPost("neonatal-care")]
        public async Task<IActionResult> CreateNeonatalCare(int patientId, [FromBody] CreateNeonatalCareDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);

                if (dto.PatientVisitID.HasValue)
                    await EnsureVisitBelongsToPatientAsync(patientId, dto.PatientVisitID.Value);

                if (dto.ChildBirthID.HasValue)
                {
                    bool childBirthOk = await _context.ChildBirths.AsNoTracking()
                        .AnyAsync(c => c.ChildBirthID == dto.ChildBirthID.Value
                            && (c.ChildPatientID == patientId
                                || (c.Delivery != null && c.Delivery.Pregnancy != null && c.Delivery.Pregnancy.PatientID == patientId)));
                    // Also allow if ChildPatientID matches, or link exists without full include
                    if (!childBirthOk)
                    {
                        childBirthOk = await _context.ChildBirths.AsNoTracking()
                            .Include(c => c.Delivery!)
                                .ThenInclude(d => d.Pregnancy)
                            .AnyAsync(c => c.ChildBirthID == dto.ChildBirthID.Value
                                && (c.ChildPatientID == patientId
                                    || (c.Delivery != null && c.Delivery.Pregnancy != null && c.Delivery.Pregnancy.PatientID == patientId)));
                    }
                    if (!childBirthOk)
                        return BadRequest(new { message = "Child birth record is not linked to this patient." });
                }

                var entity = new NeonatalCare
                {
                    PatientID = patientId,
                    ChildBirthID = dto.ChildBirthID,
                    PatientVisitID = dto.PatientVisitID,
                    AssessmentDate = DateTime.UtcNow,
                    AgeInDays = dto.AgeInDays,
                    GeneralCondition = dto.GeneralCondition,
                    FeedingStatus = dto.FeedingStatus,
                    BreastfeedingStatus = dto.BreastfeedingStatus,
                    Temperature = dto.Temperature,
                    RespiratoryRate = dto.RespiratoryRate,
                    HeartRate = dto.HeartRate,
                    OxygenSaturation = dto.OxygenSaturation,
                    JaundiceStatus = dto.JaundiceStatus,
                    CordCondition = dto.CordCondition,
                    Weight = dto.Weight,
                    Length = dto.Length,
                    HeadCircumference = dto.HeadCircumference,
                    ResuscitationRequired = dto.ResuscitationRequired,
                    NeonatalProblems = dto.NeonatalProblems,
                    Treatment = dto.Treatment,
                    CounselingProvided = dto.CounselingProvided,
                    ReferralRequired = dto.ReferralRequired,
                    Notes = dto.Notes
                };
                _context.NeonatalCares.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToNeonatalCareDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating neonatal care record." }); }
        }

        [HttpPut("neonatal-care/{id:int}")]
        public async Task<IActionResult> UpdateNeonatalCare(int patientId, int id, [FromBody] UpdateNeonatalCareDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.NeonatalCares
                    .FirstOrDefaultAsync(n => n.NeonatalCareID == id && n.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Neonatal care record not found." });

                entity.AgeInDays = dto.AgeInDays;
                entity.GeneralCondition = dto.GeneralCondition;
                entity.FeedingStatus = dto.FeedingStatus;
                entity.BreastfeedingStatus = dto.BreastfeedingStatus;
                entity.Temperature = dto.Temperature;
                entity.RespiratoryRate = dto.RespiratoryRate;
                entity.HeartRate = dto.HeartRate;
                entity.OxygenSaturation = dto.OxygenSaturation;
                entity.JaundiceStatus = dto.JaundiceStatus;
                entity.CordCondition = dto.CordCondition;
                entity.Weight = dto.Weight;
                entity.Length = dto.Length;
                entity.HeadCircumference = dto.HeadCircumference;
                entity.ResuscitationRequired = dto.ResuscitationRequired;
                entity.NeonatalProblems = dto.NeonatalProblems;
                entity.Treatment = dto.Treatment;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.ReferralRequired = dto.ReferralRequired;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToNeonatalCareDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating neonatal care record." }); }
        }

        // ============================================================
        // GROWTH MONITORING
        // ============================================================

        [HttpGet("growth-monitoring")]
        public async Task<IActionResult> GetGrowthMonitoring(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.GrowthMonitorings.AsNoTracking()
                    .Where(g => g.PatientID == patientId)
                    .OrderByDescending(g => g.MeasurementDate)
                    .ToListAsync();
                return Ok(list.Select(ToGrowthMonitoringDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving growth monitoring records." }); }
        }

        [HttpGet("growth-monitoring/{id:int}")]
        public async Task<IActionResult> GetGrowthMonitoringById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.GrowthMonitorings.AsNoTracking()
                    .FirstOrDefaultAsync(g => g.GrowthMonitoringID == id && g.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Growth monitoring record not found." });
                return Ok(ToGrowthMonitoringDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving growth monitoring record." }); }
        }

        [HttpPost("growth-monitoring")]
        public async Task<IActionResult> CreateGrowthMonitoring(int patientId, [FromBody] CreateGrowthMonitoringDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                if (dto.PatientVisitID.HasValue)
                    await EnsureVisitBelongsToPatientAsync(patientId, dto.PatientVisitID.Value);

                var entity = new GrowthMonitoring
                {
                    PatientID = patientId,
                    PatientVisitID = dto.PatientVisitID,
                    MeasurementDate = DateTime.UtcNow,
                    AgeInMonths = dto.AgeInMonths,
                    WeightKg = dto.WeightKg,
                    HeightCm = dto.HeightCm,
                    LengthCm = dto.LengthCm,
                    HeadCircumferenceCm = dto.HeadCircumferenceCm,
                    MUACCm = dto.MUACCm,
                    BMI = dto.BMI,
                    WeightForAge = dto.WeightForAge,
                    HeightForAge = dto.HeightForAge,
                    WeightForHeight = dto.WeightForHeight,
                    GrowthStatus = dto.GrowthStatus,
                    GrowthInterpretation = dto.GrowthInterpretation,
                    CounselingProvided = dto.CounselingProvided,
                    ActionTaken = dto.ActionTaken,
                    Notes = dto.Notes
                };
                _context.GrowthMonitorings.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToGrowthMonitoringDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating growth monitoring record." }); }
        }

        [HttpPut("growth-monitoring/{id:int}")]
        public async Task<IActionResult> UpdateGrowthMonitoring(int patientId, int id, [FromBody] UpdateGrowthMonitoringDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.GrowthMonitorings
                    .FirstOrDefaultAsync(g => g.GrowthMonitoringID == id && g.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Growth monitoring record not found." });

                entity.AgeInMonths = dto.AgeInMonths;
                entity.WeightKg = dto.WeightKg;
                entity.HeightCm = dto.HeightCm;
                entity.LengthCm = dto.LengthCm;
                entity.HeadCircumferenceCm = dto.HeadCircumferenceCm;
                entity.MUACCm = dto.MUACCm;
                entity.BMI = dto.BMI;
                entity.WeightForAge = dto.WeightForAge;
                entity.HeightForAge = dto.HeightForAge;
                entity.WeightForHeight = dto.WeightForHeight;
                entity.GrowthStatus = dto.GrowthStatus;
                entity.GrowthInterpretation = dto.GrowthInterpretation;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.ActionTaken = dto.ActionTaken;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToGrowthMonitoringDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating growth monitoring record." }); }
        }

        // ============================================================
        // DEVELOPMENT ASSESSMENT
        // ============================================================

        [HttpGet("development-assessment")]
        public async Task<IActionResult> GetDevelopmentAssessments(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.DevelopmentAssessments.AsNoTracking()
                    .Where(d => d.PatientID == patientId)
                    .OrderByDescending(d => d.AssessmentDate)
                    .ToListAsync();
                return Ok(list.Select(ToDevelopmentAssessmentDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving development assessments." }); }
        }

        [HttpGet("development-assessment/{id:int}")]
        public async Task<IActionResult> GetDevelopmentAssessmentById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.DevelopmentAssessments.AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DevelopmentAssessmentID == id && d.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Development assessment not found." });
                return Ok(ToDevelopmentAssessmentDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving development assessment." }); }
        }

        [HttpPost("development-assessment")]
        public async Task<IActionResult> CreateDevelopmentAssessment(int patientId, [FromBody] CreateDevelopmentAssessmentDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                if (dto.PatientVisitID.HasValue)
                    await EnsureVisitBelongsToPatientAsync(patientId, dto.PatientVisitID.Value);

                var entity = new DevelopmentAssessment
                {
                    PatientID = patientId,
                    PatientVisitID = dto.PatientVisitID,
                    AssessmentDate = DateTime.UtcNow,
                    AgeInMonths = dto.AgeInMonths,
                    GrossMotor = dto.GrossMotor,
                    FineMotor = dto.FineMotor,
                    Language = dto.Language,
                    CognitiveDevelopment = dto.CognitiveDevelopment,
                    SocialDevelopment = dto.SocialDevelopment,
                    DevelopmentalMilestones = dto.DevelopmentalMilestones,
                    DevelopmentStatus = dto.DevelopmentStatus,
                    ConcernIdentified = dto.ConcernIdentified,
                    ActionTaken = dto.ActionTaken,
                    ReferralRequired = dto.ReferralRequired,
                    Notes = dto.Notes
                };
                _context.DevelopmentAssessments.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToDevelopmentAssessmentDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating development assessment." }); }
        }

        [HttpPut("development-assessment/{id:int}")]
        public async Task<IActionResult> UpdateDevelopmentAssessment(int patientId, int id, [FromBody] UpdateDevelopmentAssessmentDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.DevelopmentAssessments
                    .FirstOrDefaultAsync(d => d.DevelopmentAssessmentID == id && d.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Development assessment not found." });

                entity.AgeInMonths = dto.AgeInMonths;
                entity.GrossMotor = dto.GrossMotor;
                entity.FineMotor = dto.FineMotor;
                entity.Language = dto.Language;
                entity.CognitiveDevelopment = dto.CognitiveDevelopment;
                entity.SocialDevelopment = dto.SocialDevelopment;
                entity.DevelopmentalMilestones = dto.DevelopmentalMilestones;
                entity.DevelopmentStatus = dto.DevelopmentStatus;
                entity.ConcernIdentified = dto.ConcernIdentified;
                entity.ActionTaken = dto.ActionTaken;
                entity.ReferralRequired = dto.ReferralRequired;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToDevelopmentAssessmentDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating development assessment." }); }
        }

        // ============================================================
        // IMMUNIZATION
        // ============================================================

        [HttpGet("immunization")]
        public async Task<IActionResult> GetImmunizations(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.Immunizations.AsNoTracking()
                    .Where(i => i.PatientID == patientId)
                    .OrderByDescending(i => i.VaccinationDate)
                    .ToListAsync();
                return Ok(list.Select(ToImmunizationDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving immunizations." }); }
        }

        [HttpGet("immunization/{id:int}")]
        public async Task<IActionResult> GetImmunizationById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.Immunizations.AsNoTracking()
                    .FirstOrDefaultAsync(i => i.ImmunizationID == id && i.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Immunization record not found." });
                return Ok(ToImmunizationDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving immunization record." }); }
        }

        [HttpPost("immunization")]
        public async Task<IActionResult> CreateImmunization(int patientId, [FromBody] CreateImmunizationDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                if (dto.PatientVisitID.HasValue)
                    await EnsureVisitBelongsToPatientAsync(patientId, dto.PatientVisitID.Value);

                if (string.IsNullOrWhiteSpace(dto.VaccineName))
                    return BadRequest(new { message = "VaccineName is required." });

                var entity = new Immunization
                {
                    PatientID = patientId,
                    PatientVisitID = dto.PatientVisitID,
                    VaccinationDate = dto.VaccinationDate,
                    VaccineName = dto.VaccineName,
                    VaccineCode = dto.VaccineCode,
                    Dose = dto.Dose,
                    DoseNumber = dto.DoseNumber,
                    Route = dto.Route,
                    AdministrationSite = dto.AdministrationSite,
                    BatchNumber = dto.BatchNumber,
                    ExpiryDate = dto.ExpiryDate,
                    VaccinationReason = dto.VaccinationReason,
                    Status = string.IsNullOrWhiteSpace(dto.Status) ? "Given" : dto.Status,
                    AdverseEvent = dto.AdverseEvent,
                    Notes = dto.Notes
                };
                _context.Immunizations.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToImmunizationDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating immunization record." }); }
        }

        [HttpPut("immunization/{id:int}")]
        public async Task<IActionResult> UpdateImmunization(int patientId, int id, [FromBody] UpdateImmunizationDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.Immunizations
                    .FirstOrDefaultAsync(i => i.ImmunizationID == id && i.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Immunization record not found." });

                entity.VaccinationDate = dto.VaccinationDate;
                entity.VaccineName = dto.VaccineName;
                entity.VaccineCode = dto.VaccineCode;
                entity.Dose = dto.Dose;
                entity.DoseNumber = dto.DoseNumber;
                entity.Route = dto.Route;
                entity.AdministrationSite = dto.AdministrationSite;
                entity.BatchNumber = dto.BatchNumber;
                entity.ExpiryDate = dto.ExpiryDate;
                entity.VaccinationReason = dto.VaccinationReason;
                entity.Status = dto.Status;
                entity.AdverseEvent = dto.AdverseEvent;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToImmunizationDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating immunization record." }); }
        }

        // ============================================================
        // NUTRITION ASSESSMENT
        // ============================================================

        [HttpGet("nutrition-assessment")]
        public async Task<IActionResult> GetNutritionAssessments(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.NutritionAssessments.AsNoTracking()
                    .Where(n => n.PatientID == patientId)
                    .OrderByDescending(n => n.AssessmentDate)
                    .ToListAsync();
                return Ok(list.Select(ToNutritionAssessmentDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving nutrition assessments." }); }
        }

        [HttpGet("nutrition-assessment/{id:int}")]
        public async Task<IActionResult> GetNutritionAssessmentById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.NutritionAssessments.AsNoTracking()
                    .FirstOrDefaultAsync(n => n.NutritionAssessmentID == id && n.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Nutrition assessment not found." });
                return Ok(ToNutritionAssessmentDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving nutrition assessment." }); }
        }

        [HttpPost("nutrition-assessment")]
        public async Task<IActionResult> CreateNutritionAssessment(int patientId, [FromBody] CreateNutritionAssessmentDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                if (dto.PatientVisitID.HasValue)
                    await EnsureVisitBelongsToPatientAsync(patientId, dto.PatientVisitID.Value);

                var entity = new NutritionAssessment
                {
                    PatientID = patientId,
                    PatientVisitID = dto.PatientVisitID,
                    AssessmentDate = DateTime.UtcNow,
                    WeightKg = dto.WeightKg,
                    HeightCm = dto.HeightCm,
                    MUACCm = dto.MUACCm,
                    BMI = dto.BMI,
                    Appetite = dto.Appetite,
                    FeedingHistory = dto.FeedingHistory,
                    BreastfeedingStatus = dto.BreastfeedingStatus,
                    DietaryHistory = dto.DietaryHistory,
                    NutritionalStatus = dto.NutritionalStatus,
                    MalnutritionClassification = dto.MalnutritionClassification,
                    Edema = dto.Edema,
                    CounselingProvided = dto.CounselingProvided,
                    TreatmentPlan = dto.TreatmentPlan,
                    ReferralRequired = dto.ReferralRequired,
                    Notes = dto.Notes
                };
                _context.NutritionAssessments.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToNutritionAssessmentDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating nutrition assessment." }); }
        }

        [HttpPut("nutrition-assessment/{id:int}")]
        public async Task<IActionResult> UpdateNutritionAssessment(int patientId, int id, [FromBody] UpdateNutritionAssessmentDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.NutritionAssessments
                    .FirstOrDefaultAsync(n => n.NutritionAssessmentID == id && n.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Nutrition assessment not found." });

                entity.WeightKg = dto.WeightKg;
                entity.HeightCm = dto.HeightCm;
                entity.MUACCm = dto.MUACCm;
                entity.BMI = dto.BMI;
                entity.Appetite = dto.Appetite;
                entity.FeedingHistory = dto.FeedingHistory;
                entity.BreastfeedingStatus = dto.BreastfeedingStatus;
                entity.DietaryHistory = dto.DietaryHistory;
                entity.NutritionalStatus = dto.NutritionalStatus;
                entity.MalnutritionClassification = dto.MalnutritionClassification;
                entity.Edema = dto.Edema;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.TreatmentPlan = dto.TreatmentPlan;
                entity.ReferralRequired = dto.ReferralRequired;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToNutritionAssessmentDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating nutrition assessment." }); }
        }

        // ============================================================
        // IMNCI
        // ============================================================

        [HttpGet("imnci")]
        public async Task<IActionResult> GetIMNCIEncounters(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.IMNCIEncounters.AsNoTracking()
                    .Where(i => i.PatientID == patientId)
                    .OrderByDescending(i => i.EncounterDate)
                    .ToListAsync();
                return Ok(list.Select(ToIMNCIEncounterDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving IMNCI encounters." }); }
        }

        [HttpGet("imnci/{id:int}")]
        public async Task<IActionResult> GetIMNCIEncounterById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.IMNCIEncounters.AsNoTracking()
                    .FirstOrDefaultAsync(i => i.IMNCIEncounterID == id && i.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "IMNCI encounter not found." });
                return Ok(ToIMNCIEncounterDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving IMNCI encounter." }); }
        }

        [HttpPost("imnci")]
        public async Task<IActionResult> CreateIMNCIEncounter(int patientId, [FromBody] CreateIMNCIEncounterDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsureVisitBelongsToPatientAsync(patientId, dto.PatientVisitID);

                var entity = new IMNCIEncounter
                {
                    PatientID = patientId,
                    PatientVisitID = dto.PatientVisitID,
                    EncounterDate = DateTime.UtcNow,
                    AgeInMonths = dto.AgeInMonths,
                    MainSymptoms = dto.MainSymptoms,
                    GeneralDangerSigns = dto.GeneralDangerSigns,
                    CoughClassification = dto.CoughClassification,
                    DiarrheaClassification = dto.DiarrheaClassification,
                    FeverClassification = dto.FeverClassification,
                    EarProblemClassification = dto.EarProblemClassification,
                    MalnutritionClassification = dto.MalnutritionClassification,
                    AnemiaClassification = dto.AnemiaClassification,
                    ImmunizationStatus = dto.ImmunizationStatus,
                    FeedingAssessment = dto.FeedingAssessment,
                    TreatmentPlan = dto.TreatmentPlan,
                    CounselingProvided = dto.CounselingProvided,
                    ReferralDecision = dto.ReferralDecision,
                    FollowUpPlan = dto.FollowUpPlan,
                    Notes = dto.Notes
                };
                _context.IMNCIEncounters.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToIMNCIEncounterDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating IMNCI encounter." }); }
        }

        [HttpPut("imnci/{id:int}")]
        public async Task<IActionResult> UpdateIMNCIEncounter(int patientId, int id, [FromBody] UpdateIMNCIEncounterDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.IMNCIEncounters
                    .FirstOrDefaultAsync(i => i.IMNCIEncounterID == id && i.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "IMNCI encounter not found." });

                entity.AgeInMonths = dto.AgeInMonths;
                entity.MainSymptoms = dto.MainSymptoms;
                entity.GeneralDangerSigns = dto.GeneralDangerSigns;
                entity.CoughClassification = dto.CoughClassification;
                entity.DiarrheaClassification = dto.DiarrheaClassification;
                entity.FeverClassification = dto.FeverClassification;
                entity.EarProblemClassification = dto.EarProblemClassification;
                entity.MalnutritionClassification = dto.MalnutritionClassification;
                entity.AnemiaClassification = dto.AnemiaClassification;
                entity.ImmunizationStatus = dto.ImmunizationStatus;
                entity.FeedingAssessment = dto.FeedingAssessment;
                entity.TreatmentPlan = dto.TreatmentPlan;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.ReferralDecision = dto.ReferralDecision;
                entity.FollowUpPlan = dto.FollowUpPlan;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToIMNCIEncounterDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating IMNCI encounter." }); }
        }

        // ============================================================
        // MAPPERS
        // ============================================================

        private static NeonatalCareDto ToNeonatalCareDto(NeonatalCare n) => new()
        {
            NeonatalCareID = n.NeonatalCareID,
            PatientID = n.PatientID,
            ChildBirthID = n.ChildBirthID,
            PatientVisitID = n.PatientVisitID,
            AssessmentDate = n.AssessmentDate,
            AgeInDays = n.AgeInDays,
            GeneralCondition = n.GeneralCondition,
            FeedingStatus = n.FeedingStatus,
            BreastfeedingStatus = n.BreastfeedingStatus,
            Temperature = n.Temperature,
            RespiratoryRate = n.RespiratoryRate,
            HeartRate = n.HeartRate,
            OxygenSaturation = n.OxygenSaturation,
            JaundiceStatus = n.JaundiceStatus,
            CordCondition = n.CordCondition,
            Weight = n.Weight,
            Length = n.Length,
            HeadCircumference = n.HeadCircumference,
            ResuscitationRequired = n.ResuscitationRequired,
            NeonatalProblems = n.NeonatalProblems,
            Treatment = n.Treatment,
            CounselingProvided = n.CounselingProvided,
            ReferralRequired = n.ReferralRequired,
            Notes = n.Notes,
            RecordedByUserID = n.RecordedByUserID
        };

        private static GrowthMonitoringDto ToGrowthMonitoringDto(GrowthMonitoring g) => new()
        {
            GrowthMonitoringID = g.GrowthMonitoringID,
            PatientID = g.PatientID,
            PatientVisitID = g.PatientVisitID,
            MeasurementDate = g.MeasurementDate,
            AgeInMonths = g.AgeInMonths,
            WeightKg = g.WeightKg,
            HeightCm = g.HeightCm,
            LengthCm = g.LengthCm,
            HeadCircumferenceCm = g.HeadCircumferenceCm,
            MUACCm = g.MUACCm,
            BMI = g.BMI,
            WeightForAge = g.WeightForAge,
            HeightForAge = g.HeightForAge,
            WeightForHeight = g.WeightForHeight,
            GrowthStatus = g.GrowthStatus,
            GrowthInterpretation = g.GrowthInterpretation,
            CounselingProvided = g.CounselingProvided,
            ActionTaken = g.ActionTaken,
            Notes = g.Notes,
            RecordedByUserID = g.RecordedByUserID
        };

        private static DevelopmentAssessmentDto ToDevelopmentAssessmentDto(DevelopmentAssessment d) => new()
        {
            DevelopmentAssessmentID = d.DevelopmentAssessmentID,
            PatientID = d.PatientID,
            PatientVisitID = d.PatientVisitID,
            AssessmentDate = d.AssessmentDate,
            AgeInMonths = d.AgeInMonths,
            GrossMotor = d.GrossMotor,
            FineMotor = d.FineMotor,
            Language = d.Language,
            CognitiveDevelopment = d.CognitiveDevelopment,
            SocialDevelopment = d.SocialDevelopment,
            DevelopmentalMilestones = d.DevelopmentalMilestones,
            DevelopmentStatus = d.DevelopmentStatus,
            ConcernIdentified = d.ConcernIdentified,
            ActionTaken = d.ActionTaken,
            ReferralRequired = d.ReferralRequired,
            Notes = d.Notes,
            AssessedByUserID = d.AssessedByUserID
        };

        private static ImmunizationDto ToImmunizationDto(Immunization i) => new()
        {
            ImmunizationID = i.ImmunizationID,
            PatientID = i.PatientID,
            PatientVisitID = i.PatientVisitID,
            VaccinationDate = i.VaccinationDate,
            VaccineName = i.VaccineName,
            VaccineCode = i.VaccineCode,
            Dose = i.Dose,
            DoseNumber = i.DoseNumber,
            Route = i.Route,
            AdministrationSite = i.AdministrationSite,
            BatchNumber = i.BatchNumber,
            ExpiryDate = i.ExpiryDate,
            VaccinationReason = i.VaccinationReason,
            Status = i.Status,
            AdverseEvent = i.AdverseEvent,
            Notes = i.Notes,
            AdministeredByUserID = i.AdministeredByUserID
        };

        private static NutritionAssessmentDto ToNutritionAssessmentDto(NutritionAssessment n) => new()
        {
            NutritionAssessmentID = n.NutritionAssessmentID,
            PatientID = n.PatientID,
            PatientVisitID = n.PatientVisitID,
            AssessmentDate = n.AssessmentDate,
            WeightKg = n.WeightKg,
            HeightCm = n.HeightCm,
            MUACCm = n.MUACCm,
            BMI = n.BMI,
            Appetite = n.Appetite,
            FeedingHistory = n.FeedingHistory,
            BreastfeedingStatus = n.BreastfeedingStatus,
            DietaryHistory = n.DietaryHistory,
            NutritionalStatus = n.NutritionalStatus,
            MalnutritionClassification = n.MalnutritionClassification,
            Edema = n.Edema,
            CounselingProvided = n.CounselingProvided,
            TreatmentPlan = n.TreatmentPlan,
            ReferralRequired = n.ReferralRequired,
            Notes = n.Notes,
            AssessedByUserID = n.AssessedByUserID
        };

        private static IMNCIEncounterDto ToIMNCIEncounterDto(IMNCIEncounter i) => new()
        {
            IMNCIEncounterID = i.IMNCIEncounterID,
            PatientID = i.PatientID,
            PatientVisitID = i.PatientVisitID,
            EncounterDate = i.EncounterDate,
            AgeInMonths = i.AgeInMonths,
            MainSymptoms = i.MainSymptoms,
            GeneralDangerSigns = i.GeneralDangerSigns,
            CoughClassification = i.CoughClassification,
            DiarrheaClassification = i.DiarrheaClassification,
            FeverClassification = i.FeverClassification,
            EarProblemClassification = i.EarProblemClassification,
            MalnutritionClassification = i.MalnutritionClassification,
            AnemiaClassification = i.AnemiaClassification,
            ImmunizationStatus = i.ImmunizationStatus,
            FeedingAssessment = i.FeedingAssessment,
            TreatmentPlan = i.TreatmentPlan,
            CounselingProvided = i.CounselingProvided,
            ReferralDecision = i.ReferralDecision,
            FollowUpPlan = i.FollowUpPlan,
            Notes = i.Notes,
            AssessedByUserID = i.AssessedByUserID
        };
    }
}
