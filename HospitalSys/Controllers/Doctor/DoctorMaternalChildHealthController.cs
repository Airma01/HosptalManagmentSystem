using HospitalSys.Data;
using HospitalSys.Dto.DoctorDtos;
using HospitalSys.Models.MaternalChildHealth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Doctor
{
    [ApiController]
    [Route("api/doctor/patient/{patientId:int}/maternal-child")]
    [Authorize(Roles = "Doctor")]
    public class DoctorMaternalChildHealthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorMaternalChildHealthController(AppDbContext context)
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

        private async Task EnsurePregnancyBelongsToPatientAsync(int patientId, int pregnancyId)
        {
            bool ok = await _context.Pregnancies.AsNoTracking()
                .AnyAsync(p => p.PregnancyID == pregnancyId && p.PatientID == patientId);
            if (!ok)
                throw new KeyNotFoundException("Pregnancy not found.");
        }

        private async Task EnsureVisitBelongsToPatientAsync(int patientId, int patientVisitId)
        {
            bool ok = await _context.PatientVisits.AsNoTracking()
                .AnyAsync(v => v.VisitID == patientVisitId && v.PatientID == patientId);
            if (!ok)
                throw new KeyNotFoundException("Patient visit not found.");
        }

        // ============================================================
        // PREGNANCY
        // ============================================================

        [HttpGet("pregnancies")]
        public async Task<IActionResult> GetPregnancies(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.Pregnancies.AsNoTracking()
                    .Where(p => p.PatientID == patientId)
                    .Include(p => p.Patient)
                    .OrderByDescending(p => p.RegistrationDate)
                    .ToListAsync();

                var result = list.Select(p => new PregnancyListDto
                {
                    PregnancyID = p.PregnancyID,
                    PatientID = p.PatientID,
                    PatientName = p.Patient != null ? $"{p.Patient.FirstName} {p.Patient.LastName}" : "",
                    MRN = p.Patient?.MRN ?? "",
                    LastMenstrualPeriod = p.LastMenstrualPeriod,
                    ExpectedDeliveryDate = p.ExpectedDeliveryDate,
                    Gravida = p.Gravida,
                    Para = p.Para,
                    Status = p.Status,
                    RegistrationDate = p.RegistrationDate
                });
                return Ok(result);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving pregnancies." }); }
        }

        [HttpGet("pregnancies/{pregnancyId:int}")]
        public async Task<IActionResult> GetPregnancyDetails(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var p = await _context.Pregnancies.AsNoTracking()
                    .Include(x => x.Patient)
                    .Include(x => x.Registrations)
                    .Include(x => x.ANCVisits)
                    .Include(x => x.RiskAssessments)
                    .Include(x => x.HighRiskPregnancies)
                    .Include(x => x.BirthPreparednessPlans)
                    .Include(x => x.LaboratoryOrders)
                    .Include(x => x.Ultrasounds)
                    .Include(x => x.Medications)
                    .Include(x => x.LaborRecords)
                    .Include(x => x.PNCVisits)
                    .Include(x => x.FamilyPlanningRecords)
                    .FirstOrDefaultAsync(x => x.PregnancyID == pregnancyId && x.PatientID == patientId);

                if (p == null)
                    return NotFound(new { message = "Pregnancy not found." });

                var deliveries = await _context.Deliveries.AsNoTracking()
                    .Where(d => d.PregnancyID == pregnancyId)
                    .ToListAsync();

                var dto = new PregnancyDetailsDto
                {
                    PregnancyID = p.PregnancyID,
                    PatientID = p.PatientID,
                    Patient = p.Patient == null ? null : new PatientSummaryDto
                    {
                        PatientID = p.Patient.PatientID,
                        MRN = p.Patient.MRN,
                        FirstName = p.Patient.FirstName,
                        LastName = p.Patient.LastName,
                        Gender = p.Patient.Gender.ToString(),
                        DateOfBirth = p.Patient.DateOfBirth,
                        Phone = p.Patient.Phone,
                        Address = p.Patient.Address
                    },
                    LastMenstrualPeriod = p.LastMenstrualPeriod,
                    ExpectedDeliveryDate = p.ExpectedDeliveryDate,
                    Gravida = p.Gravida,
                    Para = p.Para,
                    Abortions = p.Abortions,
                    LivingChildren = p.LivingChildren,
                    Status = p.Status,
                    RegistrationDate = p.RegistrationDate,
                    Notes = p.Notes,
                    Registrations = p.Registrations.Select(ToPregnancyRegistrationDto).ToList(),
                    ANCVisits = p.ANCVisits.Select(ToANCVisitDto).ToList(),
                    RiskAssessments = p.RiskAssessments.Select(ToRiskAssessmentDto).ToList(),
                    HighRiskPregnancies = p.HighRiskPregnancies.Select(ToHighRiskPregnancyDto).ToList(),
                    BirthPreparednessPlans = p.BirthPreparednessPlans.Select(ToBirthPreparednessDto).ToList(),
                    LaboratoryOrders = p.LaboratoryOrders.Select(ToLabOrderDto).ToList(),
                    Ultrasounds = p.Ultrasounds.Select(ToUltrasoundDto).ToList(),
                    Medications = p.Medications.Select(ToMedicationDto).ToList(),
                    LaborRecords = p.LaborRecords.Select(ToLaborRecordDto).ToList(),
                    Deliveries = deliveries.Select(ToDeliveryDto).ToList(),
                    PNCVisits = p.PNCVisits.Select(ToPNCVisitDto).ToList(),
                    FamilyPlanningRecords = p.FamilyPlanningRecords.Select(ToFamilyPlanningDto).ToList()
                };
                return Ok(dto);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving pregnancy details." }); }
        }

        [HttpPost("pregnancies")]
        public async Task<IActionResult> CreatePregnancy(int patientId, [FromBody] CreatePregnancyDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var patientExists = await _context.Patients.AsNoTracking()
                    .AnyAsync(p => p.PatientID == patientId);
                if (!patientExists)
                    return NotFound(new { message = "Patient not found." });

                var pregnancy = new Pregnancy
                {
                    PatientID = patientId,
                    LastMenstrualPeriod = dto.LastMenstrualPeriod,
                    ExpectedDeliveryDate = dto.ExpectedDeliveryDate,
                    Gravida = dto.Gravida,
                    Para = dto.Para,
                    Abortions = dto.Abortions,
                    LivingChildren = dto.LivingChildren,
                    Status = PregnancyStatus.Active,
                    RegistrationDate = DateTime.UtcNow,
                    Notes = dto.Notes
                };
                _context.Pregnancies.Add(pregnancy);
                await _context.SaveChangesAsync();

                if (dto.GestationalAgeWeeks.HasValue
                    || !string.IsNullOrWhiteSpace(dto.RegistrationReason)
                    || !string.IsNullOrWhiteSpace(dto.PreviousPregnancyHistory)
                    || !string.IsNullOrWhiteSpace(dto.CurrentPregnancyHistory)
                    || !string.IsNullOrWhiteSpace(dto.RegistrationNotes))
                {
                    var registration = new PregnancyRegistration
                    {
                        PregnancyID = pregnancy.PregnancyID,
                        PatientID = patientId,
                        RegistrationDate = DateTime.UtcNow,
                        GestationalAgeWeeks = dto.GestationalAgeWeeks,
                        RegistrationReason = dto.RegistrationReason,
                        PreviousPregnancyHistory = dto.PreviousPregnancyHistory,
                        CurrentPregnancyHistory = dto.CurrentPregnancyHistory,
                        Notes = dto.RegistrationNotes
                    };
                    _context.PregnancyRegistrations.Add(registration);
                    await _context.SaveChangesAsync();
                }

                return StatusCode(201, ToPregnancyDto(pregnancy));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating pregnancy." }); }
        }

        [HttpPut("pregnancies/{pregnancyId:int}")]
        public async Task<IActionResult> UpdatePregnancy(int patientId, int pregnancyId, [FromBody] UpdatePregnancyDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.Pregnancies
                    .FirstOrDefaultAsync(p => p.PregnancyID == pregnancyId && p.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Pregnancy not found." });

                entity.LastMenstrualPeriod = dto.LastMenstrualPeriod;
                entity.ExpectedDeliveryDate = dto.ExpectedDeliveryDate;
                entity.Gravida = dto.Gravida;
                entity.Para = dto.Para;
                entity.Abortions = dto.Abortions;
                entity.LivingChildren = dto.LivingChildren;
                entity.Status = dto.Status;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToPregnancyDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating pregnancy." }); }
        }

        // ============================================================
        // PREGNANCY REGISTRATION
        // ============================================================

        [HttpGet("pregnancies/{pregnancyId:int}/registrations")]
        public async Task<IActionResult> GetPregnancyRegistrations(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                var list = await _context.PregnancyRegistrations.AsNoTracking()
                    .Where(r => r.PregnancyID == pregnancyId && r.PatientID == patientId)
                    .OrderByDescending(r => r.RegistrationDate)
                    .ToListAsync();
                return Ok(list.Select(ToPregnancyRegistrationDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error retrieving pregnancy registrations." }); }
        }

        [HttpPost("pregnancies/{pregnancyId:int}/registrations")]
        public async Task<IActionResult> CreatePregnancyRegistration(int patientId, int pregnancyId, [FromBody] CreatePregnancyRegistrationDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                if (dto.PregnancyID != pregnancyId)
                    return BadRequest(new { message = "PregnancyID in body does not match route." });

                var entity = new PregnancyRegistration
                {
                    PregnancyID = pregnancyId,
                    PatientID = patientId,
                    RegistrationDate = DateTime.UtcNow,
                    GestationalAgeWeeks = dto.GestationalAgeWeeks,
                    RegistrationReason = dto.RegistrationReason,
                    PreviousPregnancyHistory = dto.PreviousPregnancyHistory,
                    CurrentPregnancyHistory = dto.CurrentPregnancyHistory,
                    Notes = dto.Notes
                };
                _context.PregnancyRegistrations.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToPregnancyRegistrationDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating pregnancy registration." }); }
        }

        // ============================================================
        // ANC
        // ============================================================

        [HttpGet("anc")]
        public async Task<IActionResult> GetPatientANCVisits(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.ANCVisits.AsNoTracking()
                    .Include(a => a.Pregnancy)
                        .ThenInclude(p => p!.Patient)
                    .Where(a => a.Pregnancy != null && a.Pregnancy.PatientID == patientId)
                    .OrderByDescending(a => a.VisitDate)
                    .ToListAsync();

                var result = list.Select(a => new ANCVisitListDto
                {
                    ANCVisitID = a.ANCVisitID,
                    PregnancyID = a.PregnancyID,
                    PatientVisitID = a.PatientVisitID,
                    PatientID = patientId,
                    PatientName = a.Pregnancy?.Patient != null
                        ? $"{a.Pregnancy.Patient.FirstName} {a.Pregnancy.Patient.LastName}" : "",
                    MRN = a.Pregnancy?.Patient?.MRN ?? "",
                    VisitDate = a.VisitDate,
                    GestationalAgeWeeks = a.GestationalAgeWeeks,
                    ChiefComplaint = a.ChiefComplaint,
                    MaternalCondition = a.MaternalCondition,
                    FetalCondition = a.FetalCondition
                });
                return Ok(result);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving ANC visits." }); }
        }

        [HttpGet("anc/{ancVisitId:int}")]
        public async Task<IActionResult> GetANCVisitDetails(int patientId, int ancVisitId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.ANCVisits.AsNoTracking()
                    .Include(a => a.Pregnancy)
                    .Include(a => a.RiskAssessments)
                    .FirstOrDefaultAsync(a => a.ANCVisitID == ancVisitId
                        && a.Pregnancy != null
                        && a.Pregnancy.PatientID == patientId);

                if (entity == null)
                    return NotFound(new { message = "ANC visit not found." });

                var dto = new ANCVisitDetailsDto
                {
                    ANCVisitID = entity.ANCVisitID,
                    PregnancyID = entity.PregnancyID,
                    PatientVisitID = entity.PatientVisitID,
                    VisitDate = entity.VisitDate,
                    GestationalAgeWeeks = entity.GestationalAgeWeeks,
                    ChiefComplaint = entity.ChiefComplaint,
                    MaternalCondition = entity.MaternalCondition,
                    FetalCondition = entity.FetalCondition,
                    FetalHeartRate = entity.FetalHeartRate,
                    FundalHeight = entity.FundalHeight,
                    Edema = entity.Edema,
                    CounselingProvided = entity.CounselingProvided,
                    TreatmentPlan = entity.TreatmentPlan,
                    Notes = entity.Notes,
                    RecordedByUserID = entity.RecordedByUserID,
                    RiskAssessments = entity.RiskAssessments.Select(ToRiskAssessmentDto).ToList()
                };
                return Ok(dto);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving ANC visit." }); }
        }

        [HttpPost("anc")]
        public async Task<IActionResult> CreateANCVisit(int patientId, [FromBody] CreateANCVisitDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);
                await EnsureVisitBelongsToPatientAsync(patientId, dto.PatientVisitID);

                var entity = new ANCVisit
                {
                    PregnancyID = dto.PregnancyID,
                    PatientVisitID = dto.PatientVisitID,
                    VisitDate = DateTime.UtcNow,
                    GestationalAgeWeeks = dto.GestationalAgeWeeks,
                    ChiefComplaint = dto.ChiefComplaint,
                    MaternalCondition = dto.MaternalCondition,
                    FetalCondition = dto.FetalCondition,
                    FetalHeartRate = dto.FetalHeartRate,
                    FundalHeight = dto.FundalHeight,
                    Edema = dto.Edema,
                    CounselingProvided = dto.CounselingProvided,
                    TreatmentPlan = dto.TreatmentPlan,
                    Notes = dto.Notes
                };
                _context.ANCVisits.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToANCVisitDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating ANC visit." }); }
        }

        [HttpPut("anc/{ancVisitId:int}")]
        public async Task<IActionResult> UpdateANCVisit(int patientId, int ancVisitId, [FromBody] UpdateANCVisitDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.ANCVisits
                    .Include(a => a.Pregnancy)
                    .FirstOrDefaultAsync(a => a.ANCVisitID == ancVisitId
                        && a.Pregnancy != null
                        && a.Pregnancy.PatientID == patientId);

                if (entity == null)
                    return NotFound(new { message = "ANC visit not found." });

                entity.GestationalAgeWeeks = dto.GestationalAgeWeeks;
                entity.ChiefComplaint = dto.ChiefComplaint;
                entity.MaternalCondition = dto.MaternalCondition;
                entity.FetalCondition = dto.FetalCondition;
                entity.FetalHeartRate = dto.FetalHeartRate;
                entity.FundalHeight = dto.FundalHeight;
                entity.Edema = dto.Edema;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.TreatmentPlan = dto.TreatmentPlan;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToANCVisitDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating ANC visit." }); }
        }

        // ============================================================
        // RISK ASSESSMENT
        // ============================================================

        [HttpGet("pregnancies/{pregnancyId:int}/risk-assessments")]
        public async Task<IActionResult> GetRiskAssessments(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                var list = await _context.PregnancyRiskAssessments.AsNoTracking()
                    .Where(r => r.PregnancyID == pregnancyId)
                    .OrderByDescending(r => r.AssessmentDate)
                    .ToListAsync();
                return Ok(list.Select(ToRiskAssessmentDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error retrieving risk assessments." }); }
        }

        [HttpGet("risk-assessments/{id:int}")]
        public async Task<IActionResult> GetRiskAssessmentById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.PregnancyRiskAssessments.AsNoTracking()
                    .Include(r => r.Pregnancy)
                    .FirstOrDefaultAsync(r => r.PregnancyRiskAssessmentID == id
                        && r.Pregnancy != null
                        && r.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Risk assessment not found." });
                return Ok(ToRiskAssessmentDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving risk assessment." }); }
        }

        [HttpPost("risk-assessments")]
        public async Task<IActionResult> CreateRiskAssessment(int patientId, [FromBody] CreatePregnancyRiskAssessmentDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);

                if (dto.ANCVisitID.HasValue)
                {
                    bool ancOk = await _context.ANCVisits.AsNoTracking()
                        .AnyAsync(a => a.ANCVisitID == dto.ANCVisitID.Value && a.PregnancyID == dto.PregnancyID);
                    if (!ancOk)
                        return BadRequest(new { message = "ANC visit does not belong to this pregnancy." });
                }

                var entity = new PregnancyRiskAssessment
                {
                    PregnancyID = dto.PregnancyID,
                    ANCVisitID = dto.ANCVisitID,
                    AssessmentDate = DateTime.UtcNow,
                    IsHighRisk = dto.IsHighRisk,
                    RiskCategory = dto.RiskCategory,
                    RiskFactor = dto.RiskFactor,
                    RiskDescription = dto.RiskDescription,
                    ActionTaken = dto.ActionTaken,
                    ReferralRequired = dto.ReferralRequired,
                    Notes = dto.Notes
                };
                _context.PregnancyRiskAssessments.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToRiskAssessmentDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating risk assessment." }); }
        }

        // ============================================================
        // HIGH RISK PREGNANCY
        // ============================================================

        [HttpGet("pregnancies/{pregnancyId:int}/high-risk")]
        public async Task<IActionResult> GetHighRiskPregnancies(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                var list = await _context.HighRiskPregnancies.AsNoTracking()
                    .Where(h => h.PregnancyID == pregnancyId)
                    .OrderByDescending(h => h.IdentificationDate)
                    .ToListAsync();
                return Ok(list.Select(ToHighRiskPregnancyDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error retrieving high-risk pregnancy records." }); }
        }

        [HttpGet("high-risk/{id:int}")]
        public async Task<IActionResult> GetHighRiskById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HighRiskPregnancies.AsNoTracking()
                    .Include(h => h.Pregnancy)
                    .FirstOrDefaultAsync(h => h.HighRiskPregnancyID == id
                        && h.Pregnancy != null
                        && h.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "High-risk pregnancy record not found." });
                return Ok(ToHighRiskPregnancyDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving high-risk pregnancy record." }); }
        }

        [HttpPost("high-risk")]
        public async Task<IActionResult> CreateHighRiskPregnancy(int patientId, [FromBody] CreateHighRiskPregnancyDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);

                var entity = new HighRiskPregnancy
                {
                    PregnancyID = dto.PregnancyID,
                    IdentificationDate = DateTime.UtcNow,
                    RiskLevel = dto.RiskLevel,
                    RiskReason = dto.RiskReason,
                    ManagementPlan = dto.ManagementPlan,
                    SpecialistRequired = dto.SpecialistRequired,
                    ReferralPlan = dto.ReferralPlan,
                    FollowUpFrequency = dto.FollowUpFrequency,
                    Active = dto.Active,
                    Notes = dto.Notes
                };
                _context.HighRiskPregnancies.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToHighRiskPregnancyDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating high-risk pregnancy record." }); }
        }

        [HttpPut("high-risk/{id:int}")]
        public async Task<IActionResult> UpdateHighRiskPregnancy(int patientId, int id, [FromBody] UpdateHighRiskPregnancyDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.HighRiskPregnancies
                    .Include(h => h.Pregnancy)
                    .FirstOrDefaultAsync(h => h.HighRiskPregnancyID == id
                        && h.Pregnancy != null
                        && h.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "High-risk pregnancy record not found." });

                entity.RiskLevel = dto.RiskLevel;
                entity.RiskReason = dto.RiskReason;
                entity.ManagementPlan = dto.ManagementPlan;
                entity.SpecialistRequired = dto.SpecialistRequired;
                entity.ReferralPlan = dto.ReferralPlan;
                entity.FollowUpFrequency = dto.FollowUpFrequency;
                entity.Active = dto.Active;
                entity.ResolvedDate = dto.ResolvedDate;
                entity.Outcome = dto.Outcome;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToHighRiskPregnancyDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating high-risk pregnancy record." }); }
        }

        // ============================================================
        // BIRTH PREPAREDNESS
        // ============================================================

        [HttpGet("pregnancies/{pregnancyId:int}/birth-preparedness")]
        public async Task<IActionResult> GetBirthPreparedness(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                var list = await _context.BirthPreparednessPlans.AsNoTracking()
                    .Where(b => b.PregnancyID == pregnancyId)
                    .OrderByDescending(b => b.AssessmentDate)
                    .ToListAsync();
                return Ok(list.Select(ToBirthPreparednessDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error retrieving birth preparedness records." }); }
        }

        [HttpGet("birth-preparedness/{id:int}")]
        public async Task<IActionResult> GetBirthPreparednessById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.BirthPreparednessPlans.AsNoTracking()
                    .Include(b => b.Pregnancy)
                    .FirstOrDefaultAsync(b => b.BirthPreparednessID == id
                        && b.Pregnancy != null
                        && b.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Birth preparedness record not found." });
                return Ok(ToBirthPreparednessDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving birth preparedness record." }); }
        }

        [HttpPost("birth-preparedness")]
        public async Task<IActionResult> CreateBirthPreparedness(int patientId, [FromBody] CreateBirthPreparednessDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);

                var entity = new BirthPreparedness
                {
                    PregnancyID = dto.PregnancyID,
                    AssessmentDate = DateTime.UtcNow,
                    DeliveryFacilityIdentified = dto.DeliveryFacilityIdentified,
                    DeliveryFacility = dto.DeliveryFacility,
                    TransportArranged = dto.TransportArranged,
                    TransportPlan = dto.TransportPlan,
                    BirthCompanionIdentified = dto.BirthCompanionIdentified,
                    EmergencyContactIdentified = dto.EmergencyContactIdentified,
                    FinancialPreparation = dto.FinancialPreparation,
                    BloodDonorIdentified = dto.BloodDonorIdentified,
                    EmergencyPlan = dto.EmergencyPlan,
                    CounselingProvided = dto.CounselingProvided,
                    Notes = dto.Notes
                };
                _context.BirthPreparednessPlans.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToBirthPreparednessDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating birth preparedness record." }); }
        }

        [HttpPut("birth-preparedness/{id:int}")]
        public async Task<IActionResult> UpdateBirthPreparedness(int patientId, int id, [FromBody] UpdateBirthPreparednessDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.BirthPreparednessPlans
                    .Include(b => b.Pregnancy)
                    .FirstOrDefaultAsync(b => b.BirthPreparednessID == id
                        && b.Pregnancy != null
                        && b.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Birth preparedness record not found." });

                entity.DeliveryFacilityIdentified = dto.DeliveryFacilityIdentified;
                entity.DeliveryFacility = dto.DeliveryFacility;
                entity.TransportArranged = dto.TransportArranged;
                entity.TransportPlan = dto.TransportPlan;
                entity.BirthCompanionIdentified = dto.BirthCompanionIdentified;
                entity.EmergencyContactIdentified = dto.EmergencyContactIdentified;
                entity.FinancialPreparation = dto.FinancialPreparation;
                entity.BloodDonorIdentified = dto.BloodDonorIdentified;
                entity.EmergencyPlan = dto.EmergencyPlan;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToBirthPreparednessDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating birth preparedness record." }); }
        }

        // ============================================================
        // PREGNANCY LABORATORY ORDER
        // ============================================================

        [HttpGet("pregnancies/{pregnancyId:int}/laboratory-orders")]
        public async Task<IActionResult> GetLaboratoryOrders(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                var list = await _context.PregnancyLaboratoryOrders.AsNoTracking()
                    .Include(o => o.LaboratoryTestType)
                    .Where(o => o.PregnancyID == pregnancyId)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();
                return Ok(list.Select(ToLabOrderDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error retrieving laboratory orders." }); }
        }

        [HttpGet("laboratory-orders/{id:int}")]
        public async Task<IActionResult> GetLaboratoryOrderById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.PregnancyLaboratoryOrders.AsNoTracking()
                    .Include(o => o.Pregnancy)
                    .Include(o => o.LaboratoryTestType)
                    .FirstOrDefaultAsync(o => o.PregnancyLaboratoryOrderID == id
                        && o.Pregnancy != null
                        && o.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Laboratory order not found." });
                return Ok(ToLabOrderDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving laboratory order." }); }
        }

        [HttpPost("laboratory-orders")]
        public async Task<IActionResult> CreateLaboratoryOrder(int patientId, [FromBody] CreatePregnancyLaboratoryOrderDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);

                var testTypeExists = await _context.LaboratoryTestTypes.AsNoTracking()
                    .AnyAsync(t => t.LaboratoryTestTypeID == dto.LaboratoryTestTypeID);
                if (!testTypeExists)
                    return BadRequest(new { message = "Laboratory test type not found." });

                if (dto.ANCVisitID.HasValue)
                {
                    bool ancOk = await _context.ANCVisits.AsNoTracking()
                        .AnyAsync(a => a.ANCVisitID == dto.ANCVisitID.Value && a.PregnancyID == dto.PregnancyID);
                    if (!ancOk)
                        return BadRequest(new { message = "ANC visit does not belong to this pregnancy." });
                }

                var entity = new PregnancyLaboratoryOrder
                {
                    PregnancyID = dto.PregnancyID,
                    ANCVisitID = dto.ANCVisitID,
                    LaboratoryTestTypeID = dto.LaboratoryTestTypeID,
                    OrderDate = DateTime.UtcNow,
                    ClinicalReason = dto.ClinicalReason,
                    Status = "Ordered",
                    Notes = dto.Notes
                };
                _context.PregnancyLaboratoryOrders.Add(entity);
                await _context.SaveChangesAsync();

                await _context.Entry(entity).Reference(e => e.LaboratoryTestType).LoadAsync();
                return StatusCode(201, ToLabOrderDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating laboratory order." }); }
        }

        // ============================================================
        // PREGNANCY ULTRASOUND
        // ============================================================

        [HttpGet("pregnancies/{pregnancyId:int}/ultrasounds")]
        public async Task<IActionResult> GetUltrasounds(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                var list = await _context.PregnancyUltrasounds.AsNoTracking()
                    .Where(u => u.PregnancyID == pregnancyId)
                    .OrderByDescending(u => u.ExaminationDate)
                    .ToListAsync();
                return Ok(list.Select(ToUltrasoundDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error retrieving ultrasounds." }); }
        }

        [HttpGet("ultrasounds/{id:int}")]
        public async Task<IActionResult> GetUltrasoundById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.PregnancyUltrasounds.AsNoTracking()
                    .Include(u => u.Pregnancy)
                    .FirstOrDefaultAsync(u => u.PregnancyUltrasoundID == id
                        && u.Pregnancy != null
                        && u.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Ultrasound not found." });
                return Ok(ToUltrasoundDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving ultrasound." }); }
        }

        [HttpPost("ultrasounds")]
        public async Task<IActionResult> CreateUltrasound(int patientId, [FromBody] CreatePregnancyUltrasoundDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);

                if (dto.ANCVisitID.HasValue)
                {
                    bool ancOk = await _context.ANCVisits.AsNoTracking()
                        .AnyAsync(a => a.ANCVisitID == dto.ANCVisitID.Value && a.PregnancyID == dto.PregnancyID);
                    if (!ancOk)
                        return BadRequest(new { message = "ANC visit does not belong to this pregnancy." });
                }

                var entity = new PregnancyUltrasound
                {
                    PregnancyID = dto.PregnancyID,
                    ANCVisitID = dto.ANCVisitID,
                    ExaminationDate = DateTime.UtcNow,
                    GestationalAgeWeeks = dto.GestationalAgeWeeks,
                    FetalNumber = dto.FetalNumber,
                    FetalPresentation = dto.FetalPresentation,
                    PlacentaLocation = dto.PlacentaLocation,
                    AmnioticFluid = dto.AmnioticFluid,
                    FetalHeartRate = dto.FetalHeartRate,
                    EstimatedFetalWeight = dto.EstimatedFetalWeight,
                    Findings = dto.Findings,
                    Impression = dto.Impression,
                    Notes = dto.Notes
                };
                _context.PregnancyUltrasounds.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToUltrasoundDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating ultrasound." }); }
        }

        // ============================================================
        // PREGNANCY MEDICATION
        // ============================================================

        [HttpGet("pregnancies/{pregnancyId:int}/medications")]
        public async Task<IActionResult> GetMedications(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                var list = await _context.PregnancyMedications.AsNoTracking()
                    .Include(m => m.Medicine)
                    .Where(m => m.PregnancyID == pregnancyId)
                    .OrderByDescending(m => m.StartDate)
                    .ToListAsync();
                return Ok(list.Select(ToMedicationDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error retrieving medications." }); }
        }

        [HttpGet("medications/{id:int}")]
        public async Task<IActionResult> GetMedicationById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.PregnancyMedications.AsNoTracking()
                    .Include(m => m.Pregnancy)
                    .Include(m => m.Medicine)
                    .FirstOrDefaultAsync(m => m.PregnancyMedicationID == id
                        && m.Pregnancy != null
                        && m.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Medication not found." });
                return Ok(ToMedicationDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving medication." }); }
        }

        [HttpPost("medications")]
        public async Task<IActionResult> CreateMedication(int patientId, [FromBody] CreatePregnancyMedicationDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);

                var medicineExists = await _context.Medicines.AsNoTracking()
                    .AnyAsync(m => m.MedicineID == dto.MedicineID);
                if (!medicineExists)
                    return BadRequest(new { message = "Medicine not found." });

                var entity = new PregnancyMedication
                {
                    PregnancyID = dto.PregnancyID,
                    MedicineID = dto.MedicineID,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    Dosage = dto.Dosage,
                    Frequency = dto.Frequency,
                    Route = dto.Route,
                    Indication = dto.Indication,
                    Status = "Active",
                    Notes = dto.Notes
                };
                _context.PregnancyMedications.Add(entity);
                await _context.SaveChangesAsync();
                await _context.Entry(entity).Reference(e => e.Medicine).LoadAsync();
                return StatusCode(201, ToMedicationDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating medication." }); }
        }

        [HttpPut("medications/{id:int}")]
        public async Task<IActionResult> UpdateMedication(int patientId, int id, [FromBody] UpdatePregnancyMedicationDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.PregnancyMedications
                    .Include(m => m.Pregnancy)
                    .Include(m => m.Medicine)
                    .FirstOrDefaultAsync(m => m.PregnancyMedicationID == id
                        && m.Pregnancy != null
                        && m.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Medication not found." });

                entity.EndDate = dto.EndDate;
                entity.Dosage = dto.Dosage;
                entity.Frequency = dto.Frequency;
                entity.Route = dto.Route;
                entity.Indication = dto.Indication;
                entity.Status = dto.Status;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToMedicationDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating medication." }); }
        }

        // ============================================================
        // LABOR
        // ============================================================

        [HttpGet("pregnancies/{pregnancyId:int}/labor")]
        public async Task<IActionResult> GetLaborRecords(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                var list = await _context.LaborRecords.AsNoTracking()
                    .Where(l => l.PregnancyID == pregnancyId)
                    .OrderByDescending(l => l.AdmissionDate)
                    .ToListAsync();
                return Ok(list.Select(ToLaborRecordDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error retrieving labor records." }); }
        }

        [HttpGet("labor/{id:int}")]
        public async Task<IActionResult> GetLaborRecordDetails(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.LaborRecords.AsNoTracking()
                    .Include(l => l.Pregnancy)
                    .Include(l => l.Deliveries)
                    .FirstOrDefaultAsync(l => l.LaborRecordID == id
                        && l.Pregnancy != null
                        && l.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Labor record not found." });

                var dto = new LaborRecordDetailsDto
                {
                    LaborRecordID = entity.LaborRecordID,
                    PregnancyID = entity.PregnancyID,
                    AdmissionDate = entity.AdmissionDate,
                    LaborStartDate = entity.LaborStartDate,
                    MembraneRuptureDate = entity.MembraneRuptureDate,
                    MembraneStatus = entity.MembraneStatus,
                    CervicalDilation = entity.CervicalDilation,
                    ContractionPattern = entity.ContractionPattern,
                    FetalHeartRate = entity.FetalHeartRate,
                    LaborProgress = entity.LaborProgress,
                    LaborManagement = entity.LaborManagement,
                    DeliveryPlan = entity.DeliveryPlan,
                    Notes = entity.Notes,
                    RecordedByUserID = entity.RecordedByUserID,
                    Deliveries = entity.Deliveries.Select(ToDeliveryDto).ToList()
                };
                return Ok(dto);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving labor record." }); }
        }

        [HttpPost("labor")]
        public async Task<IActionResult> CreateLaborRecord(int patientId, [FromBody] CreateLaborRecordDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);

                var entity = new LaborRecord
                {
                    PregnancyID = dto.PregnancyID,
                    AdmissionDate = dto.AdmissionDate,
                    LaborStartDate = dto.LaborStartDate,
                    MembraneRuptureDate = dto.MembraneRuptureDate,
                    MembraneStatus = dto.MembraneStatus,
                    CervicalDilation = dto.CervicalDilation,
                    ContractionPattern = dto.ContractionPattern,
                    FetalHeartRate = dto.FetalHeartRate,
                    LaborProgress = dto.LaborProgress,
                    LaborManagement = dto.LaborManagement,
                    DeliveryPlan = dto.DeliveryPlan,
                    Notes = dto.Notes
                };
                _context.LaborRecords.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToLaborRecordDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating labor record." }); }
        }

        [HttpPut("labor/{id:int}")]
        public async Task<IActionResult> UpdateLaborRecord(int patientId, int id, [FromBody] UpdateLaborRecordDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.LaborRecords
                    .Include(l => l.Pregnancy)
                    .FirstOrDefaultAsync(l => l.LaborRecordID == id
                        && l.Pregnancy != null
                        && l.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Labor record not found." });

                entity.LaborStartDate = dto.LaborStartDate;
                entity.MembraneRuptureDate = dto.MembraneRuptureDate;
                entity.MembraneStatus = dto.MembraneStatus;
                entity.CervicalDilation = dto.CervicalDilation;
                entity.ContractionPattern = dto.ContractionPattern;
                entity.FetalHeartRate = dto.FetalHeartRate;
                entity.LaborProgress = dto.LaborProgress;
                entity.LaborManagement = dto.LaborManagement;
                entity.DeliveryPlan = dto.DeliveryPlan;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToLaborRecordDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating labor record." }); }
        }

        // ============================================================
        // DELIVERY
        // ============================================================

        [HttpGet("pregnancies/{pregnancyId:int}/deliveries")]
        public async Task<IActionResult> GetDeliveries(int patientId, int pregnancyId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, pregnancyId);
                var list = await _context.Deliveries.AsNoTracking()
                    .Where(d => d.PregnancyID == pregnancyId)
                    .OrderByDescending(d => d.DeliveryDate)
                    .ToListAsync();
                return Ok(list.Select(ToDeliveryDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error retrieving deliveries." }); }
        }

        [HttpGet("deliveries/{id:int}")]
        public async Task<IActionResult> GetDeliveryDetails(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.Deliveries.AsNoTracking()
                    .Include(d => d.Pregnancy)
                    .Include(d => d.Complications)
                    .Include(d => d.ChildBirths)
                    .FirstOrDefaultAsync(d => d.DeliveryID == id
                        && d.Pregnancy != null
                        && d.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Delivery not found." });

                var dto = new DeliveryDetailsDto
                {
                    DeliveryID = entity.DeliveryID,
                    PregnancyID = entity.PregnancyID,
                    LaborRecordID = entity.LaborRecordID,
                    DeliveryDate = entity.DeliveryDate,
                    DeliveryMode = entity.DeliveryMode,
                    DeliveryLocation = entity.DeliveryLocation,
                    NumberOfBabies = entity.NumberOfBabies,
                    MaternalCondition = entity.MaternalCondition,
                    PlacentaCondition = entity.PlacentaCondition,
                    BloodLoss = entity.BloodLoss,
                    DeliveryNotes = entity.DeliveryNotes,
                    RecordedByUserID = entity.RecordedByUserID,
                    Complications = entity.Complications.Select(ToDeliveryComplicationDto).ToList(),
                    ChildBirths = entity.ChildBirths.Select(ToChildBirthDto).ToList()
                };
                return Ok(dto);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving delivery." }); }
        }

        [HttpPost("deliveries")]
        public async Task<IActionResult> CreateDelivery(int patientId, [FromBody] CreateDeliveryDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);

                if (dto.LaborRecordID.HasValue)
                {
                    bool laborOk = await _context.LaborRecords.AsNoTracking()
                        .AnyAsync(l => l.LaborRecordID == dto.LaborRecordID.Value && l.PregnancyID == dto.PregnancyID);
                    if (!laborOk)
                        return BadRequest(new { message = "Labor record does not belong to this pregnancy." });
                }

                var entity = new Delivery
                {
                    PregnancyID = dto.PregnancyID,
                    LaborRecordID = dto.LaborRecordID,
                    DeliveryDate = dto.DeliveryDate,
                    DeliveryMode = dto.DeliveryMode,
                    DeliveryLocation = dto.DeliveryLocation,
                    NumberOfBabies = dto.NumberOfBabies,
                    MaternalCondition = dto.MaternalCondition,
                    PlacentaCondition = dto.PlacentaCondition,
                    BloodLoss = dto.BloodLoss,
                    DeliveryNotes = dto.DeliveryNotes
                };
                _context.Deliveries.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToDeliveryDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating delivery." }); }
        }

        [HttpPut("deliveries/{id:int}")]
        public async Task<IActionResult> UpdateDelivery(int patientId, int id, [FromBody] UpdateDeliveryDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.Deliveries
                    .Include(d => d.Pregnancy)
                    .FirstOrDefaultAsync(d => d.DeliveryID == id
                        && d.Pregnancy != null
                        && d.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Delivery not found." });

                entity.DeliveryDate = dto.DeliveryDate;
                entity.DeliveryMode = dto.DeliveryMode;
                entity.DeliveryLocation = dto.DeliveryLocation;
                entity.NumberOfBabies = dto.NumberOfBabies;
                entity.MaternalCondition = dto.MaternalCondition;
                entity.PlacentaCondition = dto.PlacentaCondition;
                entity.BloodLoss = dto.BloodLoss;
                entity.DeliveryNotes = dto.DeliveryNotes;

                await _context.SaveChangesAsync();
                return Ok(ToDeliveryDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating delivery." }); }
        }

        // ============================================================
        // DELIVERY COMPLICATION
        // ============================================================

        [HttpGet("deliveries/{deliveryId:int}/complications")]
        public async Task<IActionResult> GetDeliveryComplications(int patientId, int deliveryId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var deliveryOk = await _context.Deliveries.AsNoTracking()
                    .AnyAsync(d => d.DeliveryID == deliveryId
                        && d.Pregnancy != null
                        && d.Pregnancy.PatientID == patientId);
                if (!deliveryOk)
                {
                    // Ensure Pregnancy is navigable - reload with include check
                    deliveryOk = await _context.Deliveries.AsNoTracking()
                        .Include(d => d.Pregnancy)
                        .AnyAsync(d => d.DeliveryID == deliveryId
                            && d.Pregnancy != null
                            && d.Pregnancy.PatientID == patientId);
                }
                if (!deliveryOk)
                    return NotFound(new { message = "Delivery not found." });

                var list = await _context.DeliveryComplications.AsNoTracking()
                    .Where(c => c.DeliveryID == deliveryId)
                    .ToListAsync();
                return Ok(list.Select(ToDeliveryComplicationDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving delivery complications." }); }
        }

        [HttpPost("deliveries/{deliveryId:int}/complications")]
        public async Task<IActionResult> CreateDeliveryComplication(int patientId, int deliveryId, [FromBody] CreateDeliveryComplicationDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var delivery = await _context.Deliveries.AsNoTracking()
                    .Include(d => d.Pregnancy)
                    .FirstOrDefaultAsync(d => d.DeliveryID == deliveryId
                        && d.Pregnancy != null
                        && d.Pregnancy.PatientID == patientId);
                if (delivery == null)
                    return NotFound(new { message = "Delivery not found." });

                if (dto.DeliveryID != deliveryId)
                    return BadRequest(new { message = "DeliveryID in body does not match route." });

                var entity = new DeliveryComplication
                {
                    DeliveryID = deliveryId,
                    ComplicationType = dto.ComplicationType,
                    Description = dto.Description,
                    Severity = dto.Severity,
                    Management = dto.Management,
                    ReferralRequired = dto.ReferralRequired,
                    Outcome = dto.Outcome,
                    Notes = dto.Notes
                };
                _context.DeliveryComplications.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToDeliveryComplicationDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating delivery complication." }); }
        }

        // ============================================================
        // CHILD BIRTH
        // ============================================================

        [HttpGet("deliveries/{deliveryId:int}/childbirths")]
        public async Task<IActionResult> GetChildBirths(int patientId, int deliveryId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var delivery = await _context.Deliveries.AsNoTracking()
                    .Include(d => d.Pregnancy)
                    .FirstOrDefaultAsync(d => d.DeliveryID == deliveryId
                        && d.Pregnancy != null
                        && d.Pregnancy.PatientID == patientId);
                if (delivery == null)
                    return NotFound(new { message = "Delivery not found." });

                var list = await _context.ChildBirths.AsNoTracking()
                    .Where(c => c.DeliveryID == deliveryId)
                    .ToListAsync();
                return Ok(list.Select(ToChildBirthDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving child births." }); }
        }

        [HttpGet("childbirths/{id:int}")]
        public async Task<IActionResult> GetChildBirthDetails(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.ChildBirths.AsNoTracking()
                    .Include(c => c.Delivery!)
                        .ThenInclude(d => d.Pregnancy)
                    .Include(c => c.ChildPatient)
                    .Include(c => c.NeonatalCare)
                    .FirstOrDefaultAsync(c => c.ChildBirthID == id
                        && c.Delivery != null
                        && c.Delivery.Pregnancy != null
                        && c.Delivery.Pregnancy.PatientID == patientId);

                if (entity == null)
                    return NotFound(new { message = "Child birth not found." });

                var dto = new ChildBirthDetailsDto
                {
                    ChildBirthID = entity.ChildBirthID,
                    DeliveryID = entity.DeliveryID,
                    ChildPatientID = entity.ChildPatientID,
                    ChildPatient = entity.ChildPatient == null ? null : new PatientSummaryDto
                    {
                        PatientID = entity.ChildPatient.PatientID,
                        MRN = entity.ChildPatient.MRN,
                        FirstName = entity.ChildPatient.FirstName,
                        LastName = entity.ChildPatient.LastName,
                        Gender = entity.ChildPatient.Gender.ToString(),
                        DateOfBirth = entity.ChildPatient.DateOfBirth,
                        Phone = entity.ChildPatient.Phone,
                        Address = entity.ChildPatient.Address
                    },
                    Sex = entity.Sex,
                    BirthDate = entity.BirthDate,
                    BirthWeight = entity.BirthWeight,
                    BirthLength = entity.BirthLength,
                    HeadCircumference = entity.HeadCircumference,
                    ApgarScore = entity.ApgarScore,
                    BirthCondition = entity.BirthCondition,
                    ResuscitationRequired = entity.ResuscitationRequired,
                    Notes = entity.Notes,
                    NeonatalCare = entity.NeonatalCare.Select(n => new NeonatalCareDto
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
                    }).ToList()
                };
                return Ok(dto);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving child birth." }); }
        }

        [HttpPost("deliveries/{deliveryId:int}/childbirths")]
        public async Task<IActionResult> CreateChildBirth(int patientId, int deliveryId, [FromBody] CreateChildBirthDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var delivery = await _context.Deliveries.AsNoTracking()
                    .Include(d => d.Pregnancy)
                    .FirstOrDefaultAsync(d => d.DeliveryID == deliveryId
                        && d.Pregnancy != null
                        && d.Pregnancy.PatientID == patientId);
                if (delivery == null)
                    return NotFound(new { message = "Delivery not found." });

                if (dto.DeliveryID != deliveryId)
                    return BadRequest(new { message = "DeliveryID in body does not match route." });

                if (dto.ChildPatientID.HasValue)
                {
                    bool childExists = await _context.Patients.AsNoTracking()
                        .AnyAsync(p => p.PatientID == dto.ChildPatientID.Value);
                    if (!childExists)
                        return BadRequest(new { message = "Child patient not found." });
                }

                var entity = new ChildBirth
                {
                    DeliveryID = deliveryId,
                    ChildPatientID = dto.ChildPatientID,
                    Sex = dto.Sex,
                    BirthDate = dto.BirthDate,
                    BirthWeight = dto.BirthWeight,
                    BirthLength = dto.BirthLength,
                    HeadCircumference = dto.HeadCircumference,
                    ApgarScore = dto.ApgarScore,
                    BirthCondition = dto.BirthCondition,
                    ResuscitationRequired = dto.ResuscitationRequired,
                    Notes = dto.Notes
                };
                _context.ChildBirths.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToChildBirthDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error creating child birth." }); }
        }

        // ============================================================
        // PNC
        // ============================================================

        [HttpGet("pnc")]
        public async Task<IActionResult> GetPatientPNCVisits(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.PNCVisits.AsNoTracking()
                    .Include(p => p.Pregnancy)
                        .ThenInclude(pr => pr!.Patient)
                    .Where(p => p.Pregnancy != null && p.Pregnancy.PatientID == patientId)
                    .OrderByDescending(p => p.VisitDate)
                    .ToListAsync();

                var result = list.Select(p => new PNCVisitListDto
                {
                    PNCVisitID = p.PNCVisitID,
                    PregnancyID = p.PregnancyID,
                    PatientVisitID = p.PatientVisitID,
                    PatientID = patientId,
                    PatientName = p.Pregnancy?.Patient != null
                        ? $"{p.Pregnancy.Patient.FirstName} {p.Pregnancy.Patient.LastName}" : "",
                    MRN = p.Pregnancy?.Patient?.MRN ?? "",
                    DeliveryID = p.DeliveryID,
                    VisitDate = p.VisitDate,
                    DaysAfterDelivery = p.DaysAfterDelivery,
                    MaternalCondition = p.MaternalCondition,
                    BleedingStatus = p.BleedingStatus,
                    BreastfeedingStatus = p.BreastfeedingStatus
                });
                return Ok(result);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving PNC visits." }); }
        }

        [HttpGet("pnc/{id:int}")]
        public async Task<IActionResult> GetPNCVisitById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.PNCVisits.AsNoTracking()
                    .Include(p => p.Pregnancy)
                    .FirstOrDefaultAsync(p => p.PNCVisitID == id
                        && p.Pregnancy != null
                        && p.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "PNC visit not found." });
                return Ok(ToPNCVisitDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving PNC visit." }); }
        }

        [HttpPost("pnc")]
        public async Task<IActionResult> CreatePNCVisit(int patientId, [FromBody] CreatePNCVisitDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID);
                await EnsureVisitBelongsToPatientAsync(patientId, dto.PatientVisitID);

                if (dto.DeliveryID.HasValue)
                {
                    bool deliveryOk = await _context.Deliveries.AsNoTracking()
                        .AnyAsync(d => d.DeliveryID == dto.DeliveryID.Value && d.PregnancyID == dto.PregnancyID);
                    if (!deliveryOk)
                        return BadRequest(new { message = "Delivery does not belong to this pregnancy." });
                }

                var entity = new PNCVisit
                {
                    PregnancyID = dto.PregnancyID,
                    PatientVisitID = dto.PatientVisitID,
                    DeliveryID = dto.DeliveryID,
                    VisitDate = DateTime.UtcNow,
                    DaysAfterDelivery = dto.DaysAfterDelivery,
                    MaternalCondition = dto.MaternalCondition,
                    BleedingStatus = dto.BleedingStatus,
                    BreastfeedingStatus = dto.BreastfeedingStatus,
                    UterusCondition = dto.UterusCondition,
                    MentalHealthAssessment = dto.MentalHealthAssessment,
                    CounselingProvided = dto.CounselingProvided,
                    FamilyPlanningCounseling = dto.FamilyPlanningCounseling,
                    TreatmentPlan = dto.TreatmentPlan,
                    Notes = dto.Notes
                };
                _context.PNCVisits.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToPNCVisitDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating PNC visit." }); }
        }

        [HttpPut("pnc/{id:int}")]
        public async Task<IActionResult> UpdatePNCVisit(int patientId, int id, [FromBody] UpdatePNCVisitDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.PNCVisits
                    .Include(p => p.Pregnancy)
                    .FirstOrDefaultAsync(p => p.PNCVisitID == id
                        && p.Pregnancy != null
                        && p.Pregnancy.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "PNC visit not found." });

                entity.DaysAfterDelivery = dto.DaysAfterDelivery;
                entity.MaternalCondition = dto.MaternalCondition;
                entity.BleedingStatus = dto.BleedingStatus;
                entity.BreastfeedingStatus = dto.BreastfeedingStatus;
                entity.UterusCondition = dto.UterusCondition;
                entity.MentalHealthAssessment = dto.MentalHealthAssessment;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.FamilyPlanningCounseling = dto.FamilyPlanningCounseling;
                entity.TreatmentPlan = dto.TreatmentPlan;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToPNCVisitDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating PNC visit." }); }
        }

        // ============================================================
        // FAMILY PLANNING
        // ============================================================

        [HttpGet("family-planning")]
        public async Task<IActionResult> GetFamilyPlanning(int patientId)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var list = await _context.FamilyPlannings.AsNoTracking()
                    .Where(f => f.PatientID == patientId)
                    .OrderByDescending(f => f.VisitDate)
                    .ToListAsync();
                return Ok(list.Select(ToFamilyPlanningDto));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving family planning records." }); }
        }

        [HttpGet("family-planning/{id:int}")]
        public async Task<IActionResult> GetFamilyPlanningById(int patientId, int id)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.FamilyPlannings.AsNoTracking()
                    .FirstOrDefaultAsync(f => f.FamilyPlanningID == id && f.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Family planning record not found." });
                return Ok(ToFamilyPlanningDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error retrieving family planning record." }); }
        }

        [HttpPost("family-planning")]
        public async Task<IActionResult> CreateFamilyPlanning(int patientId, [FromBody] CreateFamilyPlanningDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);

                if (dto.PregnancyID.HasValue)
                    await EnsurePregnancyBelongsToPatientAsync(patientId, dto.PregnancyID.Value);

                var entity = new FamilyPlanning
                {
                    PatientID = patientId,
                    PregnancyID = dto.PregnancyID,
                    VisitDate = DateTime.UtcNow,
                    Method = dto.Method,
                    MethodType = dto.MethodType,
                    StartDate = dto.StartDate,
                    DiscontinuationDate = dto.DiscontinuationDate,
                    ReasonForDiscontinuation = dto.ReasonForDiscontinuation,
                    CounselingProvided = dto.CounselingProvided,
                    SideEffects = dto.SideEffects,
                    Notes = dto.Notes
                };
                _context.FamilyPlannings.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, ToFamilyPlanningDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch { return StatusCode(500, new { message = "Error creating family planning record." }); }
        }

        [HttpPut("family-planning/{id:int}")]
        public async Task<IActionResult> UpdateFamilyPlanning(int patientId, int id, [FromBody] UpdateFamilyPlanningDto dto)
        {
            try
            {
                await EnsurePatientAccessAsync(patientId);
                var entity = await _context.FamilyPlannings
                    .FirstOrDefaultAsync(f => f.FamilyPlanningID == id && f.PatientID == patientId);
                if (entity == null)
                    return NotFound(new { message = "Family planning record not found." });

                entity.Method = dto.Method;
                entity.MethodType = dto.MethodType;
                entity.StartDate = dto.StartDate;
                entity.DiscontinuationDate = dto.DiscontinuationDate;
                entity.ReasonForDiscontinuation = dto.ReasonForDiscontinuation;
                entity.CounselingProvided = dto.CounselingProvided;
                entity.SideEffects = dto.SideEffects;
                entity.Notes = dto.Notes;

                await _context.SaveChangesAsync();
                return Ok(ToFamilyPlanningDto(entity));
            }
            catch (UnauthorizedAccessException) { return Unauthorized(new { message = "Unauthorized" }); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found." }); }
            catch { return StatusCode(500, new { message = "Error updating family planning record." }); }
        }

        // ============================================================
        // MAPPERS
        // ============================================================

        private static PregnancyDto ToPregnancyDto(Pregnancy p) => new()
        {
            PregnancyID = p.PregnancyID,
            PatientID = p.PatientID,
            LastMenstrualPeriod = p.LastMenstrualPeriod,
            ExpectedDeliveryDate = p.ExpectedDeliveryDate,
            Gravida = p.Gravida,
            Para = p.Para,
            Abortions = p.Abortions,
            LivingChildren = p.LivingChildren,
            Status = p.Status,
            RegistrationDate = p.RegistrationDate,
            Notes = p.Notes
        };

        private static PregnancyRegistrationDto ToPregnancyRegistrationDto(PregnancyRegistration r) => new()
        {
            PregnancyRegistrationID = r.PregnancyRegistrationID,
            PregnancyID = r.PregnancyID,
            PatientID = r.PatientID,
            RegistrationDate = r.RegistrationDate,
            GestationalAgeWeeks = r.GestationalAgeWeeks,
            RegistrationReason = r.RegistrationReason,
            PreviousPregnancyHistory = r.PreviousPregnancyHistory,
            CurrentPregnancyHistory = r.CurrentPregnancyHistory,
            Notes = r.Notes,
            RecordedByUserID = r.RecordedByUserID
        };

        private static ANCVisitDto ToANCVisitDto(ANCVisit a) => new()
        {
            ANCVisitID = a.ANCVisitID,
            PregnancyID = a.PregnancyID,
            PatientVisitID = a.PatientVisitID,
            VisitDate = a.VisitDate,
            GestationalAgeWeeks = a.GestationalAgeWeeks,
            ChiefComplaint = a.ChiefComplaint,
            MaternalCondition = a.MaternalCondition,
            FetalCondition = a.FetalCondition,
            FetalHeartRate = a.FetalHeartRate,
            FundalHeight = a.FundalHeight,
            Edema = a.Edema,
            CounselingProvided = a.CounselingProvided,
            TreatmentPlan = a.TreatmentPlan,
            Notes = a.Notes,
            RecordedByUserID = a.RecordedByUserID
        };

        private static PregnancyRiskAssessmentDto ToRiskAssessmentDto(PregnancyRiskAssessment r) => new()
        {
            PregnancyRiskAssessmentID = r.PregnancyRiskAssessmentID,
            PregnancyID = r.PregnancyID,
            ANCVisitID = r.ANCVisitID,
            AssessmentDate = r.AssessmentDate,
            IsHighRisk = r.IsHighRisk,
            RiskCategory = r.RiskCategory,
            RiskFactor = r.RiskFactor,
            RiskDescription = r.RiskDescription,
            ActionTaken = r.ActionTaken,
            ReferralRequired = r.ReferralRequired,
            Notes = r.Notes,
            AssessedByUserID = r.AssessedByUserID
        };

        private static HighRiskPregnancyDto ToHighRiskPregnancyDto(HighRiskPregnancy h) => new()
        {
            HighRiskPregnancyID = h.HighRiskPregnancyID,
            PregnancyID = h.PregnancyID,
            IdentificationDate = h.IdentificationDate,
            RiskLevel = h.RiskLevel,
            RiskReason = h.RiskReason,
            ManagementPlan = h.ManagementPlan,
            SpecialistRequired = h.SpecialistRequired,
            ReferralPlan = h.ReferralPlan,
            FollowUpFrequency = h.FollowUpFrequency,
            Active = h.Active,
            ResolvedDate = h.ResolvedDate,
            Outcome = h.Outcome,
            Notes = h.Notes,
            ManagedByUserID = h.ManagedByUserID
        };

        private static BirthPreparednessDto ToBirthPreparednessDto(BirthPreparedness b) => new()
        {
            BirthPreparednessID = b.BirthPreparednessID,
            PregnancyID = b.PregnancyID,
            AssessmentDate = b.AssessmentDate,
            DeliveryFacilityIdentified = b.DeliveryFacilityIdentified,
            DeliveryFacility = b.DeliveryFacility,
            TransportArranged = b.TransportArranged,
            TransportPlan = b.TransportPlan,
            BirthCompanionIdentified = b.BirthCompanionIdentified,
            EmergencyContactIdentified = b.EmergencyContactIdentified,
            FinancialPreparation = b.FinancialPreparation,
            BloodDonorIdentified = b.BloodDonorIdentified,
            EmergencyPlan = b.EmergencyPlan,
            CounselingProvided = b.CounselingProvided,
            Notes = b.Notes,
            PreparedByUserID = b.PreparedByUserID
        };

        private static PregnancyLaboratoryOrderDto ToLabOrderDto(PregnancyLaboratoryOrder o) => new()
        {
            PregnancyLaboratoryOrderID = o.PregnancyLaboratoryOrderID,
            PregnancyID = o.PregnancyID,
            ANCVisitID = o.ANCVisitID,
            LaboratoryTestTypeID = o.LaboratoryTestTypeID,
            LaboratoryTestTypeName = o.LaboratoryTestType?.TestName,
            OrderDate = o.OrderDate,
            ClinicalReason = o.ClinicalReason,
            Status = o.Status,
            Notes = o.Notes,
            OrderedByUserID = o.OrderedByUserID
        };

        private static PregnancyUltrasoundDto ToUltrasoundDto(PregnancyUltrasound u) => new()
        {
            PregnancyUltrasoundID = u.PregnancyUltrasoundID,
            PregnancyID = u.PregnancyID,
            ANCVisitID = u.ANCVisitID,
            ExaminationDate = u.ExaminationDate,
            GestationalAgeWeeks = u.GestationalAgeWeeks,
            FetalNumber = u.FetalNumber,
            FetalPresentation = u.FetalPresentation,
            PlacentaLocation = u.PlacentaLocation,
            AmnioticFluid = u.AmnioticFluid,
            FetalHeartRate = u.FetalHeartRate,
            EstimatedFetalWeight = u.EstimatedFetalWeight,
            Findings = u.Findings,
            Impression = u.Impression,
            Notes = u.Notes,
            RequestedByUserID = u.RequestedByUserID
        };

        private static PregnancyMedicationDto ToMedicationDto(PregnancyMedication m) => new()
        {
            PregnancyMedicationID = m.PregnancyMedicationID,
            PregnancyID = m.PregnancyID,
            MedicineID = m.MedicineID,
            MedicineName = m.Medicine?.MedicineName,
            GenericName = m.Medicine?.GenericName,
            StartDate = m.StartDate,
            EndDate = m.EndDate,
            Dosage = m.Dosage,
            Frequency = m.Frequency,
            Route = m.Route,
            Indication = m.Indication,
            Status = m.Status,
            PrescribedByUserID = m.PrescribedByUserID,
            Notes = m.Notes
        };

        private static LaborRecordDto ToLaborRecordDto(LaborRecord l) => new()
        {
            LaborRecordID = l.LaborRecordID,
            PregnancyID = l.PregnancyID,
            AdmissionDate = l.AdmissionDate,
            LaborStartDate = l.LaborStartDate,
            MembraneRuptureDate = l.MembraneRuptureDate,
            MembraneStatus = l.MembraneStatus,
            CervicalDilation = l.CervicalDilation,
            ContractionPattern = l.ContractionPattern,
            FetalHeartRate = l.FetalHeartRate,
            LaborProgress = l.LaborProgress,
            LaborManagement = l.LaborManagement,
            DeliveryPlan = l.DeliveryPlan,
            Notes = l.Notes,
            RecordedByUserID = l.RecordedByUserID
        };

        private static DeliveryDto ToDeliveryDto(Delivery d) => new()
        {
            DeliveryID = d.DeliveryID,
            PregnancyID = d.PregnancyID,
            LaborRecordID = d.LaborRecordID,
            DeliveryDate = d.DeliveryDate,
            DeliveryMode = d.DeliveryMode,
            DeliveryLocation = d.DeliveryLocation,
            NumberOfBabies = d.NumberOfBabies,
            MaternalCondition = d.MaternalCondition,
            PlacentaCondition = d.PlacentaCondition,
            BloodLoss = d.BloodLoss,
            DeliveryNotes = d.DeliveryNotes,
            RecordedByUserID = d.RecordedByUserID
        };

        private static DeliveryComplicationDto ToDeliveryComplicationDto(DeliveryComplication c) => new()
        {
            DeliveryComplicationID = c.DeliveryComplicationID,
            DeliveryID = c.DeliveryID,
            ComplicationType = c.ComplicationType,
            Description = c.Description,
            Severity = c.Severity,
            Management = c.Management,
            ReferralRequired = c.ReferralRequired,
            Outcome = c.Outcome,
            Notes = c.Notes
        };

        private static ChildBirthDto ToChildBirthDto(ChildBirth c) => new()
        {
            ChildBirthID = c.ChildBirthID,
            DeliveryID = c.DeliveryID,
            ChildPatientID = c.ChildPatientID,
            Sex = c.Sex,
            BirthDate = c.BirthDate,
            BirthWeight = c.BirthWeight,
            BirthLength = c.BirthLength,
            HeadCircumference = c.HeadCircumference,
            ApgarScore = c.ApgarScore,
            BirthCondition = c.BirthCondition,
            ResuscitationRequired = c.ResuscitationRequired,
            Notes = c.Notes
        };

        private static PNCVisitDto ToPNCVisitDto(PNCVisit p) => new()
        {
            PNCVisitID = p.PNCVisitID,
            PregnancyID = p.PregnancyID,
            PatientVisitID = p.PatientVisitID,
            DeliveryID = p.DeliveryID,
            VisitDate = p.VisitDate,
            DaysAfterDelivery = p.DaysAfterDelivery,
            MaternalCondition = p.MaternalCondition,
            BleedingStatus = p.BleedingStatus,
            BreastfeedingStatus = p.BreastfeedingStatus,
            UterusCondition = p.UterusCondition,
            MentalHealthAssessment = p.MentalHealthAssessment,
            CounselingProvided = p.CounselingProvided,
            FamilyPlanningCounseling = p.FamilyPlanningCounseling,
            TreatmentPlan = p.TreatmentPlan,
            Notes = p.Notes,
            RecordedByUserID = p.RecordedByUserID
        };

        private static FamilyPlanningDto ToFamilyPlanningDto(FamilyPlanning f) => new()
        {
            FamilyPlanningID = f.FamilyPlanningID,
            PatientID = f.PatientID,
            PregnancyID = f.PregnancyID,
            VisitDate = f.VisitDate,
            Method = f.Method,
            MethodType = f.MethodType,
            StartDate = f.StartDate,
            DiscontinuationDate = f.DiscontinuationDate,
            ReasonForDiscontinuation = f.ReasonForDiscontinuation,
            CounselingProvided = f.CounselingProvided,
            SideEffects = f.SideEffects,
            Notes = f.Notes,
            ProvidedByUserID = f.ProvidedByUserID
        };
    }
}
