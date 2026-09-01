// Controllers/Doctor/DoctorConsultationController.cs
using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.Dto.DoctorDtos;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.Laboratory;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Radiology;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Doctor
{
    [ApiController]
    [Route("api/doctor")]
    [Authorize(Roles = "Doctor")]
    public class DoctorConsultationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorConsultationController(AppDbContext context)
        {
            _context = context;
        }

        private int GetDoctorId()
        {
            var claim = User.FindFirst("DoctorID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid doctor authentication");
            return id;
        }

        private int GetDepartmentId()
        {
            var claim = User.FindFirst("DepartmentID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid department claim");
            return id;
        }

        private async Task<(PatientVisit? visit, bool forbidden)> ValidateVisitAccessAsync(
            int patientId, int visitId, int departmentId)
        {
            var visit = await _context.PatientVisits
                .AsNoTracking()
                .Include(v => v.Patient)
                .Include(v => v.Triage)
                    .ThenInclude(t => t.ClinicalDepartment)
                .FirstOrDefaultAsync(v => v.VisitID == visitId && v.PatientID == patientId);

            if (visit == null)
                return (null, false);

            bool inDepartment = visit.Triage != null &&
                                visit.Triage.Any(t => t.ClinicalDepartmentID == departmentId);

            if (!inDepartment)
                return (null, true);

            return (visit, false);
        }

        private async Task EnsureDoctorCanAccessPatientAsync(int patientId)
        {
            int departmentId = GetDepartmentId();
            bool accessible = await _context.Triages
                .AsNoTracking()
                .AnyAsync(t => t.ClinicalDepartmentID == departmentId &&
                               t.PatientVisit!.PatientID == patientId);
            if (!accessible)
                throw new KeyNotFoundException();
        }

        private async Task<Consultation?> GetAuthorizedConsultationAsync(int consultationId, int doctorId, int departmentId)
        {
            var consultation = await _context.Consultations
                .Include(c => c.PatientVisit!)
                    .ThenInclude(v => v.Triage)
                .FirstOrDefaultAsync(c => c.ConsultationID == consultationId);

            if (consultation == null) return null;
            if (consultation.DoctorID != doctorId) return null;

            bool inDept = consultation.PatientVisit!.Triage
                .Any(t => t.ClinicalDepartmentID == departmentId);
            if (!inDept) return null;

            return consultation;
        }

        // ============================================================
        // GET /api/doctor/patient/{patientId}/visit/{visitId}
        // ============================================================
        [HttpGet("patient/{patientId:int}/visit/{visitId:int}")]
        public async Task<IActionResult> GetPatientVisitDetails(int patientId, int visitId)
        {
            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var (visit, forbidden) = await ValidateVisitAccessAsync(patientId, visitId, departmentId);
                if (visit == null)
                    return NotFound(new { message = "Patient visit not found." });

                var currentTriage = await _context.Triages
                    .AsNoTracking()
                    .Where(t => t.VisitID == visitId && t.ClinicalDepartmentID == departmentId)
                    .OrderByDescending(t => t.TriageId)
                    .Select(t => new TriageDetailDto
                    {
                        TriageId = t.TriageId,
                        VisitID = t.VisitID,
                        NurseID = t.NurseID,
                        TriageDepartmentID = t.TriageDepartmentID,
                        ClinicalDepartmentID = t.ClinicalDepartmentID,
                        Temprature = t.Temprature,
                        BloodPressure = t.BloodPressure,
                        HeartRate = t.HeartRate,
                        RespiratotyRate = t.RespiratotyRate,
                        Weight = t.Weight,
                        Notes = t.Notes
                    })
                    .FirstOrDefaultAsync();

                var patient = visit.Patient!;

                var allergies = await _context.Allergies
                    .AsNoTracking()
                    .Where(a => a.PatientID == patientId)
                    .Select(a => new AllergyDto
                    {
                        AllergyID = a.AllergyID,
                        PatientID = a.PatientID,
                        Allergen = a.Allergen,
                        Reaction = a.Reaction,
                        Severity = a.Severity,
                        IsActive = a.IsActive,
                        OnsetDate = a.OnsetDate,
                        Notes = a.Notes
                    })
                    .ToListAsync();

                var medicalHistory = await _context.MedicalHistories
                    .AsNoTracking()
                    .Where(m => m.PatientID == patientId)
                    .Select(m => new MedicalHistoryDto
                    {
                        MedicalHistoryID = m.MedicalHistoryID,
                        PatientID = m.PatientID,
                        ConditionName = m.ConditionName,
                        DiagnosedDate = m.DiagnosedDate,
                        Status = m.Status,
                        Treatment = m.Treatment,
                        Notes = m.Notes
                    })
                    .ToListAsync();

                var familyHistory = await _context.FamilyMedicalHistories
                    .AsNoTracking()
                    .Where(f => f.PatientID == patientId)
                    .Select(f => new FamilyMedicalHistoryDto
                    {
                        FamilyMedicalHistoryID = f.FamilyMedicalHistoryID,
                        PatientID = f.PatientID,
                        Relative = f.Relative,
                        ConditionName = f.ConditionName,
                        Notes = f.Notes
                    })
                    .ToListAsync();

                var problemList = await _context.ProblemLists
                    .AsNoTracking()
                    .Where(p => p.PatientID == patientId)
                    .Select(p => new ProblemListDto
                    {
                        ProblemListID = p.ProblemListID,
                        PatientID = p.PatientID,
                        ProblemName = p.ProblemName,
                        Code = p.Code,
                        CodingSystem = p.CodingSystem,
                        Status = p.Status,
                        OnsetDate = p.OnsetDate,
                        ResolvedDate = p.ResolvedDate,
                        Notes = p.Notes
                    })
                    .ToListAsync();

                var socialHistory = await _context.SocialHistories
                    .AsNoTracking()
                    .Where(s => s.PatientID == patientId)
                    .Select(s => new SocialHistoryDto
                    {
                        SocialHistoryID = s.SocialHistoryID,
                        PatientID = s.PatientID,
                        SmokingStatus = s.SmokingStatus,
                        AlcoholUse = s.AlcoholUse,
                        Occupation = s.Occupation,
                        LivingSituation = s.LivingSituation,
                        PhysicalActivity = s.PhysicalActivity,
                        Notes = s.Notes
                    })
                    .ToListAsync();

                var previousConsultations = await _context.Consultations
                    .AsNoTracking()
                    .Where(c => c.PatientVisit!.PatientID == patientId)
                    .OrderByDescending(c => c.ConsultationDate)
                    .Select(c => new ConsultationSummaryDto
                    {
                        ConsultationID = c.ConsultationID,
                        VisitID = c.VisitID,
                        DoctorID = c.DoctorID,
                        ConsultationDate = c.ConsultationDate,
                        ChiefComplaint = c.ChiefComplaint,
                        HistoryOfPresentIllness = c.HistoryOfPresentIllness,
                        Assessment = c.Assessment,
                        TreatmentPlan = c.TreatmentPlan,
                        ClinicalNotes = c.ClinicalNotes,
                        PhysicalExaminations = c.PhysicalExaminations.Select(pe => new PhysicalExaminationDto
                        {
                            PhysicalExaminationID = pe.PhysicalExaminationID,
                            ConsultationID = pe.ConsultationID,
                            ExaminationArea = pe.ExaminationArea,
                            Findings = pe.Findings,
                            Notes = pe.Notes
                        }).ToList(),
                        Diagnoses = c.Diagnose.Select(d => new DiagnosisDto
                        {
                            DiagnosisID = d.DiagnosisID,
                            ConsultationID = d.ConsultationID,
                            Code = d.Code,
                            Description = d.Description,
                            CodingSystem = d.CodingSystem,
                            DiagnosisType = d.DiagnosisType,
                            IsPrimary = d.IsPrimary
                        }).ToList()
                    })
                    .ToListAsync();

                var latestPrescription = await _context.Prescriptions
                    .AsNoTracking()
                    .Where(p => p.PatientID == patientId)
                    .OrderByDescending(p => p.PrescriptionDate)
                    .Select(p => new PrescriptionDetailViewDto
                    {
                        PrescriptionID = p.PrescriptionID,
                        ConsultationID = p.ConsultationID,
                        DoctorID = p.DoctorID,
                        PatientID = p.PatientID,
                        BranchPharmacyID = p.BranchPharmacyID,
                        PrescriptionDate = p.PrescriptionDate,
                        Items = p.PrescriptionDetail.Select(pd => new PrescriptionItemDto
                        {
                            PrescriptionDetailID = pd.PrescriptionDetailID,
                            PrescriptionID = pd.PrescriptionID,
                            MedicineID = pd.MedicineID,
                            MedicineName = pd.Medicine != null ? pd.Medicine.MedicineName : "",
                            GenericName = pd.Medicine != null ? pd.Medicine.GenericName : "",
                            Dosage = pd.Dosage,
                            Frequency = pd.Frequency,
                            Duration = pd.Duration,
                            Quantity = pd.Quantity
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                // Laboratory tests linked to consultations of this patient (current + previous)
                var laboratoryTests = await _context.LaboratoryTests
                    .AsNoTracking()
                    .Where(lt => lt.PatientID == patientId)
                    .OrderByDescending(lt => lt.RequestDate)
                    .Select(lt => new LaboratoryTestViewDto
                    {
                        TestID = lt.TestID,
                        ConsultationID = lt.ConsultationID,
                        PatientID = lt.PatientID,
                        DoctorID = lt.DoctorID,
                        LaboratoryTestTypeID = lt.LaboratoryTestTypeID,
                        TestName = lt.LaboratoryTestType != null ? lt.LaboratoryTestType.TestName : "",
                        LaboratorySectionID = lt.LaboratoryTestType != null ? lt.LaboratoryTestType.LaboratorySectionID : 0,
                        SectionName = lt.LaboratoryTestType != null && lt.LaboratoryTestType.LaboratorySection != null
                            ? lt.LaboratoryTestType.LaboratorySection.SectionName : "",
                        RequestDate = lt.RequestDate,
                        Status = lt.Status
                    })
                    .ToListAsync();

                var radiologyRequests = await _context.RadiologyRequests
                    .AsNoTracking()
                    .Where(rr => rr.PatientID == patientId)
                    .OrderByDescending(rr => rr.RequestDate)
                    .Select(rr => new RadiologyRequestViewDto
                    {
                        RadiologyRequestID = rr.RadiologyRequestID,
                        ConsultationID = rr.ConsultationID,
                        PatientID = rr.PatientID,
                        DoctorID = rr.DoctorID,
                        RadiologyTestTypeID = rr.RadiologyTestTypeID,
                        TestName = rr.RadiologyTestType != null ? rr.RadiologyTestType.TestName : "",
                        RequestDate = rr.RequestDate,
                        Status = rr.Status
                    })
                    .ToListAsync();

                var result = new DoctorPatientVisitDetailsDto
                {
                    Patient = new PatientSummaryDto
                    {
                        PatientID = patient.PatientID,
                        MRN = patient.MRN,
                        FirstName = patient.FirstName,
                        LastName = patient.LastName,
                        Gender = patient.Gender.ToString(),
                        DateOfBirth = patient.DateOfBirth,
                        Phone = patient.Phone,
                        Address = patient.Address
                    },
                    CurrentVisit = new VisitSummaryDto
                    {
                        VisitID = visit.VisitID,
                        PatientID = visit.PatientID,
                        VisitDate = visit.VisitDate,
                        VisitType = visit.VisitType,
                        Status = visit.Status
                    },
                    CurrentTriage = currentTriage,
                    Allergies = allergies,
                    MedicalHistory = medicalHistory,
                    FamilyMedicalHistory = familyHistory,
                    ProblemList = problemList,
                    SocialHistory = socialHistory,
                    PreviousConsultations = previousConsultations,
                    LatestPrescription = latestPrescription,
                    LaboratoryTests = laboratoryTests,
                    RadiologyRequests = radiologyRequests
                };

                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while loading patient visit details." });
            }
        }

        // ============================================================
        // POST /api/doctor/patient/{patientId}/visit/{visitId}/consultation
        // ============================================================
        [HttpPost("patient/{patientId:int}/visit/{visitId:int}/consultation")]
        public async Task<IActionResult> CreateConsultation(
            int patientId, int visitId, [FromBody] CreateConsultationDto dto)
        {
            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var (visit, _) = await ValidateVisitAccessAsync(patientId, visitId, departmentId);
                if (visit == null)
                    return NotFound(new { message = "Patient visit not found." });

                var consultation = new Consultation
                {
                    VisitID = visitId,
                    DoctorID = doctorId,
                    ConsultationDate = DateTime.UtcNow,
                    ChiefComplaint = dto.ChiefComplaint ?? "",
                    HistoryOfPresentIllness = dto.HistoryOfPresentIllness ?? "",
                    Assessment = dto.Assessment,
                    TreatmentPlan = dto.TreatmentPlan,
                    ClinicalNotes = dto.ClinicalNotes
                };

                _context.Consultations.Add(consultation);
                await _context.SaveChangesAsync();

                var response = new ConsultationSummaryDto
                {
                    ConsultationID = consultation.ConsultationID,
                    VisitID = consultation.VisitID,
                    DoctorID = consultation.DoctorID,
                    ConsultationDate = consultation.ConsultationDate,
                    ChiefComplaint = consultation.ChiefComplaint,
                    HistoryOfPresentIllness = consultation.HistoryOfPresentIllness,
                    Assessment = consultation.Assessment,
                    TreatmentPlan = consultation.TreatmentPlan,
                    ClinicalNotes = consultation.ClinicalNotes,
                    PhysicalExaminations = new List<PhysicalExaminationDto>(),
                    Diagnoses = new List<DiagnosisDto>()
                };

                return CreatedAtAction(nameof(GetPatientVisitDetails),
                    new { patientId, visitId }, response);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while creating consultation." });
            }
        }

        // ============================================================
        // POST /api/doctor/consultation/{consultationId}/physical-examination
        // ============================================================
        [HttpPost("consultation/{consultationId:int}/physical-examination")]
        public async Task<IActionResult> AddPhysicalExamination(
            int consultationId, [FromBody] CreatePhysicalExaminationDto dto)
        {
            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var consultation = await GetAuthorizedConsultationAsync(consultationId, doctorId, departmentId);
                if (consultation == null)
                    return NotFound(new { message = "Consultation not found." });

                var pe = new PhysicalExamination
                {
                    ConsultationID = consultationId,
                    ExaminationArea = dto.ExaminationArea ?? "",
                    Findings = dto.Findings ?? "",
                    Notes = dto.Notes
                };

                _context.PhysicalExaminations.Add(pe);
                await _context.SaveChangesAsync();

                return StatusCode(201, new PhysicalExaminationDto
                {
                    PhysicalExaminationID = pe.PhysicalExaminationID,
                    ConsultationID = pe.ConsultationID,
                    ExaminationArea = pe.ExaminationArea,
                    Findings = pe.Findings,
                    Notes = pe.Notes
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while adding physical examination." });
            }
        }

        // ============================================================
        // POST /api/doctor/consultation/{consultationId}/diagnosis
        // ============================================================
        [HttpPost("consultation/{consultationId:int}/diagnosis")]
        public async Task<IActionResult> AddDiagnosis(
            int consultationId, [FromBody] CreateDiagnosisDto dto)
        {
            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var consultation = await GetAuthorizedConsultationAsync(consultationId, doctorId, departmentId);
                if (consultation == null)
                    return NotFound(new { message = "Consultation not found." });

                var diagnosis = new Diagnosis
                {
                    ConsultationID = consultationId,
                    Code = dto.Code ?? "",
                    Description = dto.Description ?? "",
                    CodingSystem = dto.CodingSystem ?? "",
                    DiagnosisType = dto.DiagnosisType,
                    IsPrimary = dto.IsPrimary
                };

                _context.Diagnoses.Add(diagnosis);
                await _context.SaveChangesAsync();

                return StatusCode(201, new DiagnosisDto
                {
                    DiagnosisID = diagnosis.DiagnosisID,
                    ConsultationID = diagnosis.ConsultationID,
                    Code = diagnosis.Code,
                    Description = diagnosis.Description,
                    CodingSystem = diagnosis.CodingSystem,
                    DiagnosisType = diagnosis.DiagnosisType,
                    IsPrimary = diagnosis.IsPrimary
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while adding diagnosis." });
            }
        }

        // ============================================================
        // NEW: PRESCRIPTION (multi-medicine)
        // POST /api/doctor/consultation/{consultationId}/prescription
        // ============================================================
        [HttpPost("consultation/{consultationId:int}/prescription")]
        public async Task<IActionResult> CreatePrescription(
            int consultationId, [FromBody] CreatePrescriptionDto dto)
        {
            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                if (dto.Items == null || !dto.Items.Any())
                    return BadRequest(new { message = "At least one medicine item is required." });

                var consultation = await GetAuthorizedConsultationAsync(consultationId, doctorId, departmentId);
                if (consultation == null)
                    return NotFound(new { message = "Consultation not found." });

                var patientId = consultation.PatientVisit!.PatientID;

                // Validate BranchPharmacy
                var branchExists = await _context.BranchPharmacies
                    .AsNoTracking()
                    .AnyAsync(b => b.BranchPharmacyID == dto.BranchPharmacyID);
                if (!branchExists)
                    return BadRequest(new { message = "Branch pharmacy not found." });

                // Validate all medicines
                var medicineIds = dto.Items.Select(i => i.MedicineID).Distinct().ToList();
                var validMedicines = await _context.Medicines
                    .AsNoTracking()
                    .Where(m => medicineIds.Contains(m.MedicineID))
                    .Select(m => m.MedicineID)
                    .ToListAsync();

                if (validMedicines.Count != medicineIds.Count)
                    return BadRequest(new { message = "One or more medicines are invalid." });

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var prescription = new Prescription
                    {
                        ConsultationID = consultationId,
                        DoctorID = doctorId,
                        PatientID = patientId,
                        BranchPharmacyID = dto.BranchPharmacyID,
                        PrescriptionDate = DateTime.UtcNow
                    };

                    _context.Prescriptions.Add(prescription);
                    await _context.SaveChangesAsync();

                    foreach (var item in dto.Items)
                    {
                        if (item.Quantity <= 0)
                            throw new InvalidOperationException("Quantity must be greater than zero.");

                        var detail = new PrescriptionDetail
                        {
                            PrescriptionID = prescription.PrescriptionID,
                            MedicineID = item.MedicineID,
                            Dosage = item.Dosage ?? "",
                            Frequency = item.Frequency,
                            Duration = item.Duration,
                            Quantity = item.Quantity
                        };
                        _context.PrescriptionDetails.Add(detail);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // Reload for response
                    var created = await _context.Prescriptions
                        .AsNoTracking()
                        .Where(p => p.PrescriptionID == prescription.PrescriptionID)
                        .Select(p => new PrescriptionDetailViewDto
                        {
                            PrescriptionID = p.PrescriptionID,
                            ConsultationID = p.ConsultationID,
                            DoctorID = p.DoctorID,
                            PatientID = p.PatientID,
                            BranchPharmacyID = p.BranchPharmacyID,
                            PrescriptionDate = p.PrescriptionDate,
                            Items = p.PrescriptionDetail.Select(pd => new PrescriptionItemDto
                            {
                                PrescriptionDetailID = pd.PrescriptionDetailID,
                                PrescriptionID = pd.PrescriptionID,
                                MedicineID = pd.MedicineID,
                                MedicineName = pd.Medicine != null ? pd.Medicine.MedicineName : "",
                                GenericName = pd.Medicine != null ? pd.Medicine.GenericName : "",
                                Dosage = pd.Dosage,
                                Frequency = pd.Frequency,
                                Duration = pd.Duration,
                                Quantity = pd.Quantity
                            }).ToList()
                        })
                        .FirstAsync();

                    return StatusCode(201, created);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while creating prescription." });
            }
        }

        // ============================================================
        // NEW: LABORATORY TESTS (multiple tests → multiple LaboratoryTest rows)
        // POST /api/doctor/consultation/{consultationId}/laboratory-tests
        // ============================================================
        [HttpPost("consultation/{consultationId:int}/laboratory-tests")]
        public async Task<IActionResult> CreateLaboratoryTests(
            int consultationId, [FromBody] CreateLaboratoryTestsDto dto)
        {
            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                if (dto.Tests == null || !dto.Tests.Any())
                    return BadRequest(new { message = "At least one laboratory test is required." });

                var consultation = await GetAuthorizedConsultationAsync(consultationId, doctorId, departmentId);
                if (consultation == null)
                    return NotFound(new { message = "Consultation not found." });

                var patientId = consultation.PatientVisit!.PatientID;

                // Validate TestTypes and their Section relationship
                var testTypeIds = dto.Tests.Select(t => t.LaboratoryTestTypeID).Distinct().ToList();
                var validTypes = await _context.LaboratoryTestTypes
                    .AsNoTracking()
                    .Where(tt => testTypeIds.Contains(tt.LaboratoryTestTypeID))
                    .Select(tt => new { tt.LaboratoryTestTypeID, tt.LaboratorySectionID })
                    .ToListAsync();

                if (validTypes.Count != testTypeIds.Count)
                    return BadRequest(new { message = "One or more laboratory test types are invalid." });

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var createdIds = new List<int>();

                    foreach (var item in dto.Tests)
                    {
                        var labTest = new LaboratoryTest
                        {
                            ConsultationID = consultationId,
                            PatientID = patientId,
                            DoctorID = doctorId,
                            LaboratoryTestTypeID = item.LaboratoryTestTypeID,
                            RequestDate = DateTime.UtcNow,
                            Status = string.IsNullOrWhiteSpace(item.Status) ? "Requested" : item.Status
                        };
                        _context.LaboratoryTests.Add(labTest);
                        await _context.SaveChangesAsync();
                        createdIds.Add(labTest.TestID);
                    }

                    await transaction.CommitAsync();

                    var result = await _context.LaboratoryTests
                        .AsNoTracking()
                        .Where(lt => createdIds.Contains(lt.TestID))
                        .Select(lt => new LaboratoryTestViewDto
                        {
                            TestID = lt.TestID,
                            ConsultationID = lt.ConsultationID,
                            PatientID = lt.PatientID,
                            DoctorID = lt.DoctorID,
                            LaboratoryTestTypeID = lt.LaboratoryTestTypeID,
                            TestName = lt.LaboratoryTestType != null ? lt.LaboratoryTestType.TestName : "",
                            LaboratorySectionID = lt.LaboratoryTestType != null ? lt.LaboratoryTestType.LaboratorySectionID : 0,
                            SectionName = lt.LaboratoryTestType != null && lt.LaboratoryTestType.LaboratorySection != null
                                ? lt.LaboratoryTestType.LaboratorySection.SectionName : "",
                            RequestDate = lt.RequestDate,
                            Status = lt.Status
                        })
                        .ToListAsync();

                    return StatusCode(201, result);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while creating laboratory tests." });
            }
        }

        // ============================================================
        // NEW: RADIOLOGY REQUESTS (multiple → multiple RadiologyRequest rows)
        // POST /api/doctor/consultation/{consultationId}/radiology-requests
        // ============================================================
        [HttpPost("consultation/{consultationId:int}/radiology-requests")]
        public async Task<IActionResult> CreateRadiologyRequests(
            int consultationId, [FromBody] CreateRadiologyRequestsDto dto)
        {
            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                if (dto.Requests == null || !dto.Requests.Any())
                    return BadRequest(new { message = "At least one radiology request is required." });

                var consultation = await GetAuthorizedConsultationAsync(consultationId, doctorId, departmentId);
                if (consultation == null)
                    return NotFound(new { message = "Consultation not found." });

                var patientId = consultation.PatientVisit!.PatientID;

                var testTypeIds = dto.Requests.Select(r => r.RadiologyTestTypeID).Distinct().ToList();
                var validTypes = await _context.RadiologyTestTypes
                    .AsNoTracking()
                    .Where(tt => testTypeIds.Contains(tt.RadiologyTestTypeID))
                    .Select(tt => tt.RadiologyTestTypeID)
                    .ToListAsync();

                if (validTypes.Count != testTypeIds.Count)
                    return BadRequest(new { message = "One or more radiology test types are invalid." });

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var createdIds = new List<int>();

                    foreach (var item in dto.Requests)
                    {
                        var req = new RadiologyRequest
                        {
                            ConsultationID = consultationId,
                            PatientID = patientId,
                            DoctorID = doctorId,
                            RadiologyTestTypeID = item.RadiologyTestTypeID,
                            RequestDate = DateTime.UtcNow,
                            Status = string.IsNullOrWhiteSpace(item.Status) ? "Requested" : item.Status
                        };
                        _context.RadiologyRequests.Add(req);
                        await _context.SaveChangesAsync();
                        createdIds.Add(req.RadiologyRequestID);
                    }

                    await transaction.CommitAsync();

                    var result = await _context.RadiologyRequests
                        .AsNoTracking()
                        .Where(rr => createdIds.Contains(rr.RadiologyRequestID))
                        .Select(rr => new RadiologyRequestViewDto
                        {
                            RadiologyRequestID = rr.RadiologyRequestID,
                            ConsultationID = rr.ConsultationID,
                            PatientID = rr.PatientID,
                            DoctorID = rr.DoctorID,
                            RadiologyTestTypeID = rr.RadiologyTestTypeID,
                            TestName = rr.RadiologyTestType != null ? rr.RadiologyTestType.TestName : "",
                            RequestDate = rr.RequestDate,
                            Status = rr.Status
                        })
                        .ToListAsync();

                    return StatusCode(201, result);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while creating radiology requests." });
            }
        }

        // ============================================================
        // PATIENT CLINICAL HISTORY – ALLERGIES (existing)
        // ============================================================
        [HttpGet("patient/{patientId:int}/allergies")]
        public async Task<IActionResult> GetAllergies(int patientId)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var list = await _context.Allergies.AsNoTracking()
                    .Where(a => a.PatientID == patientId)
                    .Select(a => new AllergyDto
                    {
                        AllergyID = a.AllergyID,
                        PatientID = a.PatientID,
                        Allergen = a.Allergen,
                        Reaction = a.Reaction,
                        Severity = a.Severity,
                        IsActive = a.IsActive,
                        OnsetDate = a.OnsetDate,
                        Notes = a.Notes
                    }).ToListAsync();
                return Ok(list);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error retrieving allergies." }); }
        }

        [HttpPost("patient/{patientId:int}/allergies")]
        public async Task<IActionResult> CreateAllergy(int patientId, [FromBody] CreateAllergyDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = new Allergy
                {
                    PatientID = patientId,
                    Allergen = dto.Allergen ?? "",
                    Reaction = dto.Reaction,
                    Severity = dto.Severity,
                    IsActive = dto.IsActive ?? true,
                    OnsetDate = dto.OnsetDate,
                    Notes = dto.Notes
                };
                _context.Allergies.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, new AllergyDto
                {
                    AllergyID = entity.AllergyID,
                    PatientID = entity.PatientID,
                    Allergen = entity.Allergen,
                    Reaction = entity.Reaction,
                    Severity = entity.Severity,
                    IsActive = entity.IsActive,
                    OnsetDate = entity.OnsetDate,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error creating allergy." }); }
        }

        [HttpPut("patient/{patientId:int}/allergies/{allergyId:int}")]
        public async Task<IActionResult> UpdateAllergy(int patientId, int allergyId, [FromBody] CreateAllergyDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.Allergies.FirstOrDefaultAsync(a => a.AllergyID == allergyId && a.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Allergy not found." });

                entity.Allergen = dto.Allergen ?? entity.Allergen;
                entity.Reaction = dto.Reaction ?? entity.Reaction;
                entity.Severity = dto.Severity ?? entity.Severity;
                if (dto.IsActive.HasValue) entity.IsActive = dto.IsActive.Value;
                entity.OnsetDate = dto.OnsetDate ?? entity.OnsetDate;
                entity.Notes = dto.Notes ?? entity.Notes;

                await _context.SaveChangesAsync();
                return Ok(new AllergyDto
                {
                    AllergyID = entity.AllergyID,
                    PatientID = entity.PatientID,
                    Allergen = entity.Allergen,
                    Reaction = entity.Reaction,
                    Severity = entity.Severity,
                    IsActive = entity.IsActive,
                    OnsetDate = entity.OnsetDate,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error updating allergy." }); }
        }

        [HttpDelete("patient/{patientId:int}/allergies/{allergyId:int}")]
        public async Task<IActionResult> DeleteAllergy(int patientId, int allergyId)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.Allergies.FirstOrDefaultAsync(a => a.AllergyID == allergyId && a.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Allergy not found." });
                _context.Allergies.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error deleting allergy." }); }
        }

        // ============================================================
        // MEDICAL HISTORY (existing)
        // ============================================================
        [HttpGet("patient/{patientId:int}/medical-history")]
        public async Task<IActionResult> GetMedicalHistory(int patientId)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var list = await _context.MedicalHistories.AsNoTracking()
                    .Where(m => m.PatientID == patientId)
                    .Select(m => new MedicalHistoryDto
                    {
                        MedicalHistoryID = m.MedicalHistoryID,
                        PatientID = m.PatientID,
                        ConditionName = m.ConditionName,
                        DiagnosedDate = m.DiagnosedDate,
                        Status = m.Status,
                        Treatment = m.Treatment,
                        Notes = m.Notes
                    }).ToListAsync();
                return Ok(list);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error retrieving medical history." }); }
        }

        [HttpPost("patient/{patientId:int}/medical-history")]
        public async Task<IActionResult> CreateMedicalHistory(int patientId, [FromBody] CreateMedicalHistoryDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = new MedicalHistory
                {
                    PatientID = patientId,
                    ConditionName = dto.ConditionName ?? "",
                    DiagnosedDate = dto.DiagnosedDate,
                    Status = dto.Status,
                    Treatment = dto.Treatment,
                    Notes = dto.Notes
                };
                _context.MedicalHistories.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, new MedicalHistoryDto
                {
                    MedicalHistoryID = entity.MedicalHistoryID,
                    PatientID = entity.PatientID,
                    ConditionName = entity.ConditionName,
                    DiagnosedDate = entity.DiagnosedDate,
                    Status = entity.Status,
                    Treatment = entity.Treatment,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error creating medical history." }); }
        }

        [HttpPut("patient/{patientId:int}/medical-history/{id:int}")]
        public async Task<IActionResult> UpdateMedicalHistory(int patientId, int id, [FromBody] CreateMedicalHistoryDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.MedicalHistories.FirstOrDefaultAsync(m => m.MedicalHistoryID == id && m.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Medical history not found." });

                entity.ConditionName = dto.ConditionName ?? entity.ConditionName;
                entity.DiagnosedDate = dto.DiagnosedDate ?? entity.DiagnosedDate;
                entity.Status = dto.Status ?? entity.Status;
                entity.Treatment = dto.Treatment ?? entity.Treatment;
                entity.Notes = dto.Notes ?? entity.Notes;

                await _context.SaveChangesAsync();
                return Ok(new MedicalHistoryDto
                {
                    MedicalHistoryID = entity.MedicalHistoryID,
                    PatientID = entity.PatientID,
                    ConditionName = entity.ConditionName,
                    DiagnosedDate = entity.DiagnosedDate,
                    Status = entity.Status,
                    Treatment = entity.Treatment,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error updating medical history." }); }
        }

        [HttpDelete("patient/{patientId:int}/medical-history/{id:int}")]
        public async Task<IActionResult> DeleteMedicalHistory(int patientId, int id)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.MedicalHistories.FirstOrDefaultAsync(m => m.MedicalHistoryID == id && m.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Medical history not found." });
                _context.MedicalHistories.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error deleting medical history." }); }
        }

        // ============================================================
        // FAMILY MEDICAL HISTORY (existing)
        // ============================================================
        [HttpGet("patient/{patientId:int}/family-medical-history")]
        public async Task<IActionResult> GetFamilyMedicalHistory(int patientId)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var list = await _context.FamilyMedicalHistories.AsNoTracking()
                    .Where(f => f.PatientID == patientId)
                    .Select(f => new FamilyMedicalHistoryDto
                    {
                        FamilyMedicalHistoryID = f.FamilyMedicalHistoryID,
                        PatientID = f.PatientID,
                        Relative = f.Relative,
                        ConditionName = f.ConditionName,
                        Notes = f.Notes
                    }).ToListAsync();
                return Ok(list);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error retrieving family medical history." }); }
        }

        [HttpPost("patient/{patientId:int}/family-medical-history")]
        public async Task<IActionResult> CreateFamilyMedicalHistory(int patientId, [FromBody] CreateFamilyMedicalHistoryDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = new FamilyMedicalHistory
                {
                    PatientID = patientId,
                    Relative = dto.Relative ?? "",
                    ConditionName = dto.ConditionName ?? "",
                    Notes = dto.Notes
                };
                _context.FamilyMedicalHistories.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, new FamilyMedicalHistoryDto
                {
                    FamilyMedicalHistoryID = entity.FamilyMedicalHistoryID,
                    PatientID = entity.PatientID,
                    Relative = entity.Relative,
                    ConditionName = entity.ConditionName,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error creating family medical history." }); }
        }

        [HttpPut("patient/{patientId:int}/family-medical-history/{id:int}")]
        public async Task<IActionResult> UpdateFamilyMedicalHistory(int patientId, int id, [FromBody] CreateFamilyMedicalHistoryDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.FamilyMedicalHistories.FirstOrDefaultAsync(f => f.FamilyMedicalHistoryID == id && f.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Record not found." });

                entity.Relative = dto.Relative ?? entity.Relative;
                entity.ConditionName = dto.ConditionName ?? entity.ConditionName;
                entity.Notes = dto.Notes ?? entity.Notes;

                await _context.SaveChangesAsync();
                return Ok(new FamilyMedicalHistoryDto
                {
                    FamilyMedicalHistoryID = entity.FamilyMedicalHistoryID,
                    PatientID = entity.PatientID,
                    Relative = entity.Relative,
                    ConditionName = entity.ConditionName,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error updating family medical history." }); }
        }

        [HttpDelete("patient/{patientId:int}/family-medical-history/{id:int}")]
        public async Task<IActionResult> DeleteFamilyMedicalHistory(int patientId, int id)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.FamilyMedicalHistories.FirstOrDefaultAsync(f => f.FamilyMedicalHistoryID == id && f.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Record not found." });
                _context.FamilyMedicalHistories.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error deleting family medical history." }); }
        }

        // ============================================================
        // PROBLEM LIST (existing)
        // ============================================================
        [HttpGet("patient/{patientId:int}/problem-list")]
        public async Task<IActionResult> GetProblemList(int patientId)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var list = await _context.ProblemLists.AsNoTracking()
                    .Where(p => p.PatientID == patientId)
                    .Select(p => new ProblemListDto
                    {
                        ProblemListID = p.ProblemListID,
                        PatientID = p.PatientID,
                        ProblemName = p.ProblemName,
                        Code = p.Code,
                        CodingSystem = p.CodingSystem,
                        Status = p.Status,
                        OnsetDate = p.OnsetDate,
                        ResolvedDate = p.ResolvedDate,
                        Notes = p.Notes
                    }).ToListAsync();
                return Ok(list);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error retrieving problem list." }); }
        }

        [HttpPost("patient/{patientId:int}/problem-list")]
        public async Task<IActionResult> CreateProblemList(int patientId, [FromBody] CreateProblemListDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = new ProblemList
                {
                    PatientID = patientId,
                    ProblemName = dto.ProblemName ?? "",
                    Code = dto.Code,
                    CodingSystem = dto.CodingSystem,
                    Status = dto.Status ?? "Active",
                    OnsetDate = dto.OnsetDate,
                    ResolvedDate = dto.ResolvedDate,
                    Notes = dto.Notes
                };
                _context.ProblemLists.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, new ProblemListDto
                {
                    ProblemListID = entity.ProblemListID,
                    PatientID = entity.PatientID,
                    ProblemName = entity.ProblemName,
                    Code = entity.Code,
                    CodingSystem = entity.CodingSystem,
                    Status = entity.Status,
                    OnsetDate = entity.OnsetDate,
                    ResolvedDate = entity.ResolvedDate,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error creating problem list entry." }); }
        }

        [HttpPut("patient/{patientId:int}/problem-list/{id:int}")]
        public async Task<IActionResult> UpdateProblemList(int patientId, int id, [FromBody] CreateProblemListDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.ProblemLists.FirstOrDefaultAsync(p => p.ProblemListID == id && p.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Problem list entry not found." });

                entity.ProblemName = dto.ProblemName ?? entity.ProblemName;
                entity.Code = dto.Code ?? entity.Code;
                entity.CodingSystem = dto.CodingSystem ?? entity.CodingSystem;
                entity.Status = dto.Status ?? entity.Status;
                entity.OnsetDate = dto.OnsetDate ?? entity.OnsetDate;
                entity.ResolvedDate = dto.ResolvedDate ?? entity.ResolvedDate;
                entity.Notes = dto.Notes ?? entity.Notes;

                await _context.SaveChangesAsync();
                return Ok(new ProblemListDto
                {
                    ProblemListID = entity.ProblemListID,
                    PatientID = entity.PatientID,
                    ProblemName = entity.ProblemName,
                    Code = entity.Code,
                    CodingSystem = entity.CodingSystem,
                    Status = entity.Status,
                    OnsetDate = entity.OnsetDate,
                    ResolvedDate = entity.ResolvedDate,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error updating problem list." }); }
        }

        [HttpDelete("patient/{patientId:int}/problem-list/{id:int}")]
        public async Task<IActionResult> DeleteProblemList(int patientId, int id)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.ProblemLists.FirstOrDefaultAsync(p => p.ProblemListID == id && p.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Problem list entry not found." });
                _context.ProblemLists.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error deleting problem list entry." }); }
        }

        // ============================================================
        // SOCIAL HISTORY (existing)
        // ============================================================
        [HttpGet("patient/{patientId:int}/social-history")]
        public async Task<IActionResult> GetSocialHistory(int patientId)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var list = await _context.SocialHistories.AsNoTracking()
                    .Where(s => s.PatientID == patientId)
                    .Select(s => new SocialHistoryDto
                    {
                        SocialHistoryID = s.SocialHistoryID,
                        PatientID = s.PatientID,
                        SmokingStatus = s.SmokingStatus,
                        AlcoholUse = s.AlcoholUse,
                        Occupation = s.Occupation,
                        LivingSituation = s.LivingSituation,
                        PhysicalActivity = s.PhysicalActivity,
                        Notes = s.Notes
                    }).ToListAsync();
                return Ok(list);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error retrieving social history." }); }
        }

        [HttpPost("patient/{patientId:int}/social-history")]
        public async Task<IActionResult> CreateSocialHistory(int patientId, [FromBody] CreateSocialHistoryDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = new SocialHistory
                {
                    PatientID = patientId,
                    SmokingStatus = dto.SmokingStatus,
                    AlcoholUse = dto.AlcoholUse,
                    Occupation = dto.Occupation,
                    LivingSituation = dto.LivingSituation,
                    PhysicalActivity = dto.PhysicalActivity,
                    Notes = dto.Notes
                };
                _context.SocialHistories.Add(entity);
                await _context.SaveChangesAsync();
                return StatusCode(201, new SocialHistoryDto
                {
                    SocialHistoryID = entity.SocialHistoryID,
                    PatientID = entity.PatientID,
                    SmokingStatus = entity.SmokingStatus,
                    AlcoholUse = entity.AlcoholUse,
                    Occupation = entity.Occupation,
                    LivingSituation = entity.LivingSituation,
                    PhysicalActivity = entity.PhysicalActivity,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error creating social history." }); }
        }

        [HttpPut("patient/{patientId:int}/social-history/{id:int}")]
        public async Task<IActionResult> UpdateSocialHistory(int patientId, int id, [FromBody] CreateSocialHistoryDto dto)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.SocialHistories.FirstOrDefaultAsync(s => s.SocialHistoryID == id && s.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Social history not found." });

                entity.SmokingStatus = dto.SmokingStatus ?? entity.SmokingStatus;
                entity.AlcoholUse = dto.AlcoholUse ?? entity.AlcoholUse;
                entity.Occupation = dto.Occupation ?? entity.Occupation;
                entity.LivingSituation = dto.LivingSituation ?? entity.LivingSituation;
                entity.PhysicalActivity = dto.PhysicalActivity ?? entity.PhysicalActivity;
                entity.Notes = dto.Notes ?? entity.Notes;

                await _context.SaveChangesAsync();
                return Ok(new SocialHistoryDto
                {
                    SocialHistoryID = entity.SocialHistoryID,
                    PatientID = entity.PatientID,
                    SmokingStatus = entity.SmokingStatus,
                    AlcoholUse = entity.AlcoholUse,
                    Occupation = entity.Occupation,
                    LivingSituation = entity.LivingSituation,
                    PhysicalActivity = entity.PhysicalActivity,
                    Notes = entity.Notes
                });
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error updating social history." }); }
        }

        [HttpDelete("patient/{patientId:int}/social-history/{id:int}")]
        public async Task<IActionResult> DeleteSocialHistory(int patientId, int id)
        {
            try
            {
                await EnsureDoctorCanAccessPatientAsync(patientId);
                var entity = await _context.SocialHistories.FirstOrDefaultAsync(s => s.SocialHistoryID == id && s.PatientID == patientId);
                if (entity == null) return NotFound(new { message = "Social history not found." });
                _context.SocialHistories.Remove(entity);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch (KeyNotFoundException) { return NotFound(new { message = "Patient not found or not accessible." }); }
            catch { return StatusCode(500, new { message = "Error deleting social history." }); }
        }
        
                // ============================================================
        // LOOKUPS (names for dropdowns — Doctor role)
        // ============================================================

        [HttpGet("lookups/branch-pharmacies")]
        public async Task<IActionResult> GetBranchPharmacies()
        {
            try
            {
                _ = GetDoctorId();
                var list = await _context.BranchPharmacies
                    .AsNoTracking()
                    .OrderBy(b => b.BranchName)
                    .Select(b => new BranchPharmacyLookupDto
                    {
                        BranchPharmacyID = b.BranchPharmacyID,
                        BranchName = b.BranchName,
                        Location = b.Location
                    })
                    .ToListAsync();
                return Ok(list);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch { return StatusCode(500, new { message = "Failed to load branch pharmacies." }); }
        }

        [HttpGet("lookups/medicines")]
        public async Task<IActionResult> GetMedicines()
        {
            try
            {
                _ = GetDoctorId();
                var list = await _context.Medicines
                    .AsNoTracking()
                    .OrderBy(m => m.MedicineName)
                    .Select(m => new MedicineLookupDto
                    {
                        MedicineID = m.MedicineID,
                        MedicineName = m.MedicineName,
                        GenericName = m.GenericName,
                        UnitOfMeasure = m.UnitOfMeasure
                    })
                    .ToListAsync();
                return Ok(list);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch { return StatusCode(500, new { message = "Failed to load medicines." }); }
        }

        [HttpGet("lookups/laboratory-test-types")]
        public async Task<IActionResult> GetLaboratoryTestTypes()
        {
            try
            {
                _ = GetDoctorId();
                var list = await _context.LaboratoryTestTypes
                    .AsNoTracking()
                    .Include(t => t.LaboratorySection)
                    .OrderBy(t => t.LaboratorySection!.SectionName)
                    .ThenBy(t => t.TestName)
                    .Select(t => new LaboratoryTestTypeLookupDto
                    {
                        LaboratoryTestTypeID = t.LaboratoryTestTypeID,
                        TestName = t.TestName,
                        LaboratorySectionID = t.LaboratorySectionID,
                        SectionName = t.LaboratorySection != null ? t.LaboratorySection.SectionName : ""
                    })
                    .ToListAsync();
                return Ok(list);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch { return StatusCode(500, new { message = "Failed to load laboratory test types." }); }
        }

        [HttpGet("lookups/radiology-test-types")]
        public async Task<IActionResult> GetRadiologyTestTypes()
        {
            try
            {
                _ = GetDoctorId();
                var list = await _context.RadiologyTestTypes
                    .AsNoTracking()
                    .Include(t => t.RadiologyDepartment)
                    .OrderBy(t => t.TestName)
                    .Select(t => new RadiologyTestTypeLookupDto
                    {
                        RadiologyTestTypeID = t.RadiologyTestTypeID,
                        TestName = t.TestName,
                        RadiologyDepartmentID = t.RadiologyDepartmentID,
                        DepartmentName = t.RadiologyDepartment != null ? t.RadiologyDepartment.DepartmentName : null
                    })
                    .ToListAsync();
                return Ok(list);
            }
            catch (UnauthorizedAccessException) { return Unauthorized(); }
            catch { return StatusCode(500, new { message = "Failed to load radiology test types." }); }
        }
    }
}