using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalSys.Data;
using HospitalSys.Dto.Nurse;
using HospitalSys.Models;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.HospitalStruct;
using HospitalSys.Models.Laboratory;
using HospitalSys.Models.Pharmacy.Common;
using HospitalSys.Models.Pharmacy.Branch;
using System.Security.Claims;
using HospitalSys.Dtos.Nurse;

namespace HospitalSys.Controllers.Nurse
{
    [ApiController]
    [Route("Hospital/nurse/[controller]")]
    [Authorize(Roles = "Nurse")]
    public class NurseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NurseController(AppDbContext context)
        {
            _context = context;
        }

        // ============================================================
        // Helper: Get NurseID from claims
        // ============================================================
        private int GetNurseId()
        {
            var nurseIdClaim = User.FindFirst("NurseID")?.Value;
            if (string.IsNullOrEmpty(nurseIdClaim) || !int.TryParse(nurseIdClaim, out int nurseId))
                throw new UnauthorizedAccessException("Invalid nurse authentication");
            return nurseId;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                throw new UnauthorizedAccessException("Invalid user authentication");
            return userId;
        }

        // ============================================================
        // 1. DASHBOARD
        // ============================================================
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                int nurseId = GetNurseId();
                var today = DateTime.UtcNow.Date;

                // Get nurse info
                var nurse = await _context.Nurses
                    .Include(n => n.Users)
                    .Include(n => n.ClinicalDepartment)
                    .FirstOrDefaultAsync(n => n.NurseID == nurseId);

                if (nurse == null)
                    return NotFound(new { message = "Nurse not found" });

                // Today's patients: distinct patients with a visit today
                var todayPatientCount = await _context.PatientVisits
                    .Where(pv => pv.VisitDate.Date == today)
                    .Select(pv => pv.PatientID)
                    .Distinct()
                    .CountAsync();

                // Today's visits
                var todayVisitCount = await _context.PatientVisits
                    .CountAsync(pv => pv.VisitDate.Date == today);

                // Pending triage: visits that have no triage yet (or any logic you define)
                // We'll assume pending = visit exists but no triage record.
                var pendingTriageCount = await _context.PatientVisits
                    .Where(pv => !_context.Triages.Any(t => t.VisitID == pv.VisitID))
                    .CountAsync();

                // Completed triage: visits that have at least one triage record
                var completedTriageCount = await _context.Triages.CountAsync();

                // Today's prescriptions
                var todayPrescriptionCount = await _context.Prescriptions
                    .CountAsync(p => p.PrescriptionDate.Date == today);

                var dashboard = new NurseDashboardDto
                {
                    NurseId = nurseId,
                    NurseName = $"{nurse.Users.FirstName} {nurse.Users.FatherName}",
                    DepartmentName = nurse.ClinicalDepartment?.DepartmentName,
                    TodayPatientCount = todayPatientCount,
                    TodayVisitCount = todayVisitCount,
                    PendingTriageCount = pendingTriageCount,
                    CompletedTriageCount = completedTriageCount,
                    TodayPrescriptionCount = todayPrescriptionCount
                };

                return Ok(dashboard);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Invalid nurse authentication" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // ============================================================
        // 2. PATIENT MANAGEMENT
        // ============================================================

        // POST: register-patient
        // POST: register-patient
[HttpPost("register-patient")]
public async Task<IActionResult> RegisterPatient([FromBody] RegisterPatientDto dto)
{
    try
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Generate MRN
        var mrn = $"MRN{DateTime.UtcNow.Ticks}";
        while (await _context.Patients.AnyAsync(p => p.MRN == mrn))
            mrn = $"MRN{DateTime.UtcNow.Ticks + new Random().Next(1000)}";

        // Check duplicate FaydaFIN if provided
        if (!string.IsNullOrEmpty(dto.FaydaFIN))
        {
            if (await _context.Patients.AnyAsync(p => p.FaydaFIN == dto.FaydaFIN))
                return Conflict(new { message = "A patient with this FaydaFIN already exists" });
        }

        // Check duplicate Phone if needed (optional)
        if (!string.IsNullOrEmpty(dto.Phone))
        {
            if (await _context.Patients.AnyAsync(p => p.Phone == dto.Phone))
                return Conflict(new { message = "A patient with this Phone already exists" });
        }

        var patient = new Patient
        {
            MRN = mrn,
            FaydaFIN = dto.FaydaFIN,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Gender = dto.Gender,
            // Convert DateOfBirth to UTC (treat as UTC without shifting)
            DateOfBirth = DateTime.SpecifyKind(dto.DateOfBirth, DateTimeKind.Utc),
            Phone = dto.Phone,
            Address = dto.Address ?? "",
            EmergencyContact = dto.EmergencyContact ?? "",
            Created_at = DateTime.UtcNow // already UTC
        };

        _context.Patients.Add(patient);
        await _context.SaveChangesAsync();

        var response = new PatientResponseDto
        {
            PatientId = patient.PatientID,
            MRN = patient.MRN,
            FaydaFIN = patient.FaydaFIN,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            Gender = patient.Gender,
            DateOfBirth = patient.DateOfBirth,
            Phone = patient.Phone,
            Address = patient.Address,
            EmergencyContact = patient.EmergencyContact,
            Created_at = patient.Created_at
        };

        return CreatedAtAction(nameof(GetPatient), new { id = patient.PatientID }, response);
    }
    catch (Exception ex)
    {
        // Log the full exception (optional)
        Console.WriteLine(ex);
        return StatusCode(500, new { message = "An unexpected error occurred" });
    }
}

        // GET: patient/{id}
        [HttpGet("patient/{id}")]
        public async Task<IActionResult> GetPatient(int id)
        {
            try
            {
                var patient = await _context.Patients
                    .Where(p => p.PatientID == id)
                    .Select(p => new PatientResponseDto
                    {
                        PatientId = p.PatientID,
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
                    .FirstOrDefaultAsync();

                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                return Ok(patient);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: search-patients
        [HttpGet("search-patients")]
        public async Task<IActionResult> SearchPatients([FromQuery] PatientSearchDto dto)
        {
            try
            {
                var query = _context.Patients.AsNoTracking();

                if (!string.IsNullOrEmpty(dto.MRN))
                    query = query.Where(p => p.MRN.Contains(dto.MRN));
                if (!string.IsNullOrEmpty(dto.FaydaFIN))
                    query = query.Where(p => p.FaydaFIN != null && p.FaydaFIN.Contains(dto.FaydaFIN));
                if (!string.IsNullOrEmpty(dto.Phone))
                    query = query.Where(p => p.Phone.Contains(dto.Phone));
                if (!string.IsNullOrEmpty(dto.FirstName))
                    query = query.Where(p => p.FirstName.Contains(dto.FirstName));
                if (!string.IsNullOrEmpty(dto.LastName))
                    query = query.Where(p => p.LastName.Contains(dto.LastName));

                var patients = await query
                    .Select(p => new PatientResponseDto
                    {
                        PatientId = p.PatientID,
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

        // PUT: patient/{id}
        [HttpPut("patient/{id}")]
        public async Task<IActionResult> UpdatePatient(int id, [FromBody] UpdatePatientDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var patient = await _context.Patients.FindAsync(id);
                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                // Update only provided fields
                if (!string.IsNullOrEmpty(dto.FirstName))
                    patient.FirstName = dto.FirstName;
                if (!string.IsNullOrEmpty(dto.LastName))
                    patient.LastName = dto.LastName;
                if (dto.Gender.HasValue)
                    patient.Gender = dto.Gender.Value;
                if (dto.DateOfBirth.HasValue)
                    patient.DateOfBirth = dto.DateOfBirth.Value;
                if (!string.IsNullOrEmpty(dto.Phone))
                    patient.Phone = dto.Phone;
                if (!string.IsNullOrEmpty(dto.Address))
                    patient.Address = dto.Address;
                if (!string.IsNullOrEmpty(dto.EmergencyContact))
                    patient.EmergencyContact = dto.EmergencyContact;
                if (!string.IsNullOrEmpty(dto.FaydaFIN))
                {
                    // Check uniqueness if changed
                    if (dto.FaydaFIN != patient.FaydaFIN)
                    {
                        if (await _context.Patients.AnyAsync(p => p.FaydaFIN == dto.FaydaFIN && p.PatientID != id))
                            return Conflict(new { message = "Another patient with this FaydaFIN already exists" });
                        patient.FaydaFIN = dto.FaydaFIN;
                    }
                }

                await _context.SaveChangesAsync();

                var response = new PatientResponseDto
                {
                    PatientId = patient.PatientID,
                    MRN = patient.MRN,
                    FaydaFIN = patient.FaydaFIN,
                    FirstName = patient.FirstName,
                    LastName = patient.LastName,
                    Gender = patient.Gender,
                    DateOfBirth = patient.DateOfBirth,
                    Phone = patient.Phone,
                    Address = patient.Address,
                    EmergencyContact = patient.EmergencyContact,
                    Created_at = patient.Created_at
                };

                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // ============================================================
        // 3. PATIENT VISITS
        // ============================================================

        // POST: create-visit
        [HttpPost("create-visit")]
        public async Task<IActionResult> CreateVisit([FromBody] CreatePatientVisitDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var patient = await _context.Patients.FindAsync(dto.PatientId);
                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                var visit = new PatientVisit
                {
                    PatientID = dto.PatientId,
                    VisitDate = DateTime.SpecifyKind(dto.VisitDate, DateTimeKind.Utc), // <-- FIX
                    VisitType = dto.VisitType,
                    Status = dto.Status,
                    Created_at = DateTime.UtcNow
                };

                _context.PatientVisits.Add(visit);
                await _context.SaveChangesAsync();

                var response = new PatientVisitResponseDto
                {
                    VisitId = visit.VisitID,
                    PatientId = visit.PatientID,
                    PatientName = $"{patient.FirstName} {patient.LastName}",
                    VisitDate = visit.VisitDate,
                    VisitType = visit.VisitType,
                    Status = visit.Status,
                    Created_at = visit.Created_at
                };

                return CreatedAtAction(nameof(GetVisit), new { id = visit.VisitID }, response);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // POST: create-visit-triage (one form)
        [HttpPost("create-visit-triage")]
        public async Task<IActionResult> CreateVisitAndTriage([FromBody] CreateVisitAndTriageDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                int nurseId = GetNurseId();

                var patient = await _context.Patients.FindAsync(dto.PatientId);
                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                var triageDept = await _context.TriageDepartments.FindAsync(dto.TriageDepartmentId);
                if (triageDept == null)
                    return NotFound(new { message = "Triage Department not found" });

                var clinicalDept = await _context.ClinicalDepartments.FindAsync(dto.ClinicalDepartmentId);
                if (clinicalDept == null)
                    return NotFound(new { message = "Clinical Department not found" });

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // 1. Create PatientVisit
                    var visit = new PatientVisit
                    {
                        PatientID = dto.PatientId,
                        VisitDate = DateTime.SpecifyKind(dto.VisitDate, DateTimeKind.Utc),
                        VisitType = dto.VisitType,
                        Status = dto.Status,
                        Created_at = DateTime.UtcNow
                    };
                    _context.PatientVisits.Add(visit);
                    await _context.SaveChangesAsync();

                    // 2. Create Triage using the generated VisitId
                    var triage = new Triage
                    {
                        VisitID = visit.VisitID,
                        NurseID = nurseId,
                        TriageDepartmentID = dto.TriageDepartmentId,
                        ClinicalDepartmentID = dto.ClinicalDepartmentId,
                        Temprature = dto.Temprature,
                        BloodPressure = dto.BloodPressure,
                        HeartRate = dto.HeartRate,
                        RespiratotyRate = dto.RespiratyRate,
                        Weight = dto.Weight,
                        Notes = dto.Notes
                    };
                    _context.Triages.Add(triage);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    // Return combined response (visit + triage)
                    var visitResponse = new PatientVisitResponseDto
                    {
                        VisitId = visit.VisitID,
                        PatientId = visit.PatientID,
                        PatientName = $"{patient.FirstName} {patient.LastName}",
                        VisitDate = visit.VisitDate,
                        VisitType = visit.VisitType,
                        Status = visit.Status,
                        Created_at = visit.Created_at
                    };

                    var triageResponse = new TriageResponseDto
                    {
                        TriageId = triage.TriageId,
                        VisitId = triage.VisitID,
                        NurseId = triage.NurseID,
                        TriageDepartmentId = triage.TriageDepartmentID,
                        ClinicalDepartmentId = triage.ClinicalDepartmentID,
                        Temprature = triage.Temprature,
                        BloodPressure = triage.BloodPressure,
                        HeartRate = triage.HeartRate,
                        RespiratyRate = triage.RespiratotyRate,
                        Weight = triage.Weight,
                        Notes = triage.Notes,
                        PatientName = $"{patient.FirstName} {patient.LastName}",
                        VisitDate = visit.VisitDate
                    };

                    return Ok(new { Visit = visitResponse, Triage = triageResponse });
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Invalid nurse authentication" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: visit/{id}
        [HttpGet("visit/{id}")]
        public async Task<IActionResult> GetVisit(int id)
        {
            try
            {
                var visit = await _context.PatientVisits
                    .Where(v => v.VisitID == id)
                    .Select(v => new PatientVisitResponseDto
                    {
                        VisitId = v.VisitID,
                        PatientId = v.PatientID,
                        PatientName = $"{v.Patient.FirstName} {v.Patient.LastName}",
                        VisitDate = v.VisitDate,
                        VisitType = v.VisitType,
                        Status = v.Status,
                        Created_at = v.Created_at
                    })
                    .FirstOrDefaultAsync();

                if (visit == null)
                    return NotFound(new { message = "Visit not found" });

                return Ok(visit);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: today-visits
        [HttpGet("today-visits")]
        public async Task<IActionResult> GetTodayVisits()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var visits = await _context.PatientVisits
                    .Where(v => v.VisitDate.Date == today)
                    .Select(v => new PatientVisitListDto
                    {
                        VisitId = v.VisitID,
                        PatientId = v.PatientID,
                        PatientName = $"{v.Patient.FirstName} {v.Patient.LastName}",
                        VisitDate = v.VisitDate,
                        Status = v.Status
                    })
                    .ToListAsync();

                return Ok(visits);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: patient/{patientId}/visits
        [HttpGet("patient/{patientId}/visits")]
        public async Task<IActionResult> GetPatientVisits(int patientId)
        {
            try
            {
                var patient = await _context.Patients.FindAsync(patientId);
                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                var visits = await _context.PatientVisits
                    .Where(v => v.PatientID == patientId)
                    .Select(v => new PatientVisitListDto
                    {
                        VisitId = v.VisitID,
                        PatientId = v.PatientID,
                        PatientName = $"{patient.FirstName} {patient.LastName}",
                        VisitDate = v.VisitDate,
                        Status = v.Status
                    })
                    .ToListAsync();

                return Ok(visits);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // PUT: visit/{id}
        [HttpPut("visit/{id}")]
        public async Task<IActionResult> UpdateVisit(int id, [FromBody] UpdatePatientVisitDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var visit = await _context.PatientVisits.FindAsync(id);
                if (visit == null)
                    return NotFound(new { message = "Visit not found" });

                if (dto.VisitDate.HasValue)
                    visit.VisitDate = dto.VisitDate.Value;
                if (!string.IsNullOrEmpty(dto.VisitType))
                    visit.VisitType = dto.VisitType;
                if (!string.IsNullOrEmpty(dto.Status))
                    visit.Status = dto.Status;

                await _context.SaveChangesAsync();

                var patient = await _context.Patients.FindAsync(visit.PatientID);
                var response = new PatientVisitResponseDto
                {
                    VisitId = visit.VisitID,
                    PatientId = visit.PatientID,
                    PatientName = $"{patient.FirstName} {patient.LastName}",
                    VisitDate = visit.VisitDate,
                    VisitType = visit.VisitType,
                    Status = visit.Status,
                    Created_at = visit.Created_at
                };

                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: triage-departments
[HttpGet("triage-departments")]
public async Task<IActionResult> GetTriageDepartments()
{
    try
    {
        var departments = await _context.TriageDepartments
            .Select(d => new { d.TriageDepartmentID, d.DepartmentName })
            .ToListAsync();
        return Ok(departments);
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "An unexpected error occurred" });
    }
}

// GET: clinical-departments
[HttpGet("clinical-departments")]
public async Task<IActionResult> GetClinicalDepartments()
{
    try
    {
        var departments = await _context.ClinicalDepartments
            .Select(d => new { d.ClinicalDepartmentID, d.DepartmentName })
            .ToListAsync();
        return Ok(departments);
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "An unexpected error occurred" });
    }
}

        // ============================================================
        // 4. TRIAGE
        // ============================================================

        // GET: pending-triage
        [HttpGet("pending-triage")]
        public async Task<IActionResult> GetPendingTriage()
        {
            try
            {
                // "Pending" = visits with no triage record yet
                var pending = await _context.PatientVisits
                    .Where(v => !_context.Triages.Any(t => t.VisitID == v.VisitID))
                    .Select(v => new PendingTriageDto
                    {
                        TriageId = 0, // no triage yet
                        VisitId = v.VisitID,
                        PatientName = $"{v.Patient.FirstName} {v.Patient.LastName}",
                        VisitDate = v.VisitDate,
                        NurseId = null,
                        Temprature = 0,
                        BloodPressure = 0,
                        HeartRate = 0,
                        RespiratyRate = 0,
                        Weight = 0,
                        Notes = null
                    })
                    .ToListAsync();

                return Ok(pending);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // POST: create-triage
        [HttpPost("create-triage")]
        public async Task<IActionResult> CreateTriage([FromBody] CreateTriageDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                int nurseId = GetNurseId();

                var visit = await _context.PatientVisits.FindAsync(dto.VisitId);
                if (visit == null)
                    return NotFound(new { message = "Visit not found" });

                var triageDept = await _context.TriageDepartments.FindAsync(dto.TriageDepartmentId);
                if (triageDept == null)
                    return NotFound(new { message = "Triage Department not found" });

                var clinicalDept = await _context.ClinicalDepartments.FindAsync(dto.ClinicalDepartmentId);
                if (clinicalDept == null)
                    return NotFound(new { message = "Clinical Department not found" });

                // Use authenticated nurse ID, ignore any NurseId from DTO
                var triage = new Triage
                {
                    VisitID = dto.VisitId,
                    NurseID = nurseId,
                    TriageDepartmentID = dto.TriageDepartmentId,
                    ClinicalDepartmentID = dto.ClinicalDepartmentId,
                    Temprature = dto.Temprature,
                    BloodPressure = dto.BloodPressure,
                    HeartRate = dto.HeartRate,
                    RespiratotyRate = dto.RespiratyRate,
                    Weight = dto.Weight,
                    Notes = dto.Notes
                };

                _context.Triages.Add(triage);
                await _context.SaveChangesAsync();

                var patient = await _context.Patients.FindAsync(visit.PatientID);
                var response = new TriageResponseDto
                {
                    TriageId = triage.TriageId,
                    VisitId = triage.VisitID,
                    NurseId = triage.NurseID,
                    TriageDepartmentId = triage.TriageDepartmentID,
                    ClinicalDepartmentId = triage.ClinicalDepartmentID,
                    Temprature = triage.Temprature,
                    BloodPressure = triage.BloodPressure,
                    HeartRate = triage.HeartRate,
                    RespiratyRate = triage.RespiratotyRate,
                    Weight = triage.Weight,
                    Notes = triage.Notes,
                    PatientName = $"{patient.FirstName} {patient.LastName}",
                    VisitDate = visit.VisitDate
                };

                return CreatedAtAction(nameof(GetTriage), new { id = triage.TriageId }, response);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Invalid nurse authentication" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: triage/{id}
        [HttpGet("triage/{id}")]
        public async Task<IActionResult> GetTriage(int id)
        {
            try
            {
                var triage = await _context.Triages
                    .Where(t => t.TriageId == id)
                    .Select(t => new TriageResponseDto
                    {
                        TriageId = t.TriageId,
                        VisitId = t.VisitID,
                        NurseId = t.NurseID,
                        TriageDepartmentId = t.TriageDepartmentID,
                        ClinicalDepartmentId = t.ClinicalDepartmentID,
                        Temprature = t.Temprature,
                        BloodPressure = t.BloodPressure,
                        HeartRate = t.HeartRate,
                        RespiratyRate = t.RespiratotyRate,
                        Weight = t.Weight,
                        Notes = t.Notes,
                        PatientName = $"{t.PatientVisit.Patient.FirstName} {t.PatientVisit.Patient.LastName}",
                        VisitDate = t.PatientVisit.VisitDate
                    })
                    .FirstOrDefaultAsync();

                if (triage == null)
                    return NotFound(new { message = "Triage not found" });

                return Ok(triage);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // PUT: triage/{id}
        [HttpPut("triage/{id}")]
        public async Task<IActionResult> UpdateTriage(int id, [FromBody] UpdateTriageDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                int nurseId = GetNurseId();

                var triage = await _context.Triages.FindAsync(id);
                if (triage == null)
                    return NotFound(new { message = "Triage not found" });

                // Check if this nurse is allowed to update (optional: allow only if same nurse or admin)
                // For now, allow any authenticated nurse to update any triage? Usually you might restrict.
                // Since requirement didn't specify restriction, we'll allow.

                if (dto.NurseId.HasValue)
                    triage.NurseID = dto.NurseId.Value; // but better to use authenticated? We'll keep as-is.
                if (dto.TriageDepartmentId.HasValue)
                    triage.TriageDepartmentID = dto.TriageDepartmentId.Value;
                if (dto.ClinicalDepartmentId.HasValue)
                    triage.ClinicalDepartmentID = dto.ClinicalDepartmentId.Value;
                if (dto.Temprature.HasValue)
                    triage.Temprature = dto.Temprature.Value;
                if (dto.BloodPressure.HasValue)
                    triage.BloodPressure = dto.BloodPressure.Value;
                if (dto.HeartRate.HasValue)
                    triage.HeartRate = dto.HeartRate.Value;
                if (dto.RespiratyRate.HasValue)
                    triage.RespiratotyRate = dto.RespiratyRate.Value;
                if (dto.Weight.HasValue)
                    triage.Weight = dto.Weight.Value;
                if (dto.Notes != null)
                    triage.Notes = dto.Notes;

                await _context.SaveChangesAsync();

                // Reload with related data for response
                var response = await _context.Triages
                    .Where(t => t.TriageId == id)
                    .Select(t => new TriageResponseDto
                    {
                        TriageId = t.TriageId,
                        VisitId = t.VisitID,
                        NurseId = t.NurseID,
                        TriageDepartmentId = t.TriageDepartmentID,
                        ClinicalDepartmentId = t.ClinicalDepartmentID,
                        Temprature = t.Temprature,
                        BloodPressure = t.BloodPressure,
                        HeartRate = t.HeartRate,
                        RespiratyRate = t.RespiratotyRate,
                        Weight = t.Weight,
                        Notes = t.Notes,
                        PatientName = $"{t.PatientVisit.Patient.FirstName} {t.PatientVisit.Patient.LastName}",
                        VisitDate = t.PatientVisit.VisitDate
                    })
                    .FirstOrDefaultAsync();

                return Ok(response);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Invalid nurse authentication" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // POST: triage/{id}/complete
        [HttpPost("triage/{id}/complete")]
        public async Task<IActionResult> CompleteTriage(int id)
        {
            try
            {
                // Since there is no explicit "Completed" status in Triage model,
                // we can update the PatientVisit.Status to something like "Triaged" or "Completed"
                // or we can mark it as completed by setting a flag if we had one.
                // As per the model, we don't have a status on Triage, so we interpret completion
                // as setting the PatientVisit.Status to "Triaged".
                var triage = await _context.Triages.FindAsync(id);
                if (triage == null)
                    return NotFound(new { message = "Triage not found" });

                var visit = await _context.PatientVisits.FindAsync(triage.VisitID);
                if (visit == null)
                    return NotFound(new { message = "Associated visit not found" });

                // Set visit status to "Triaged" or something meaningful
                visit.Status = "Triaged";
                await _context.SaveChangesAsync();

                return Ok(new { message = "Triage completed successfully" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // ============================================================
        // 5. LABORATORY
        // ============================================================

        // POST: laboratory/request
        [HttpPost("laboratory/request")]
        public async Task<IActionResult> RequestLaboratoryTest([FromBody] NurseLaboratoryRequestDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Verify existence of related entities
                var patient = await _context.Patients.FindAsync(dto.PatientId);
                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                var consultation = await _context.Consultations.FindAsync(dto.ConsultationId);
                if (consultation == null)
                    return NotFound(new { message = "Consultation not found" });

                var doctor = await _context.Doctors.FindAsync(dto.DoctorId);
                if (doctor == null)
                    return NotFound(new { message = "Doctor not found" });

                var testType = await _context.LaboratoryTestTypes.FindAsync(dto.LaboratoryTestTypeId);
                if (testType == null)
                    return NotFound(new { message = "Laboratory test type not found" });

                var test = new LaboratoryTest
                {
                    ConsultationID = dto.ConsultationId,
                    PatientID = dto.PatientId,
                    DoctorID = dto.DoctorId,
                    LaboratoryTestTypeID = dto.LaboratoryTestTypeId,
                    RequestDate = dto.RequestDate ?? DateTime.UtcNow,
                    Status = dto.Status ?? "Requested"
                };

                _context.LaboratoryTests.Add(test);
                await _context.SaveChangesAsync();

                // Build response
                var response = new NurseLaboratoryTestResponseDto
                {
                    TestId = test.TestID,
                    ConsultationId = test.ConsultationID,
                    PatientId = test.PatientID,
                    PatientMrn = patient.MRN,
                    PatientName = $"{patient.FirstName} {patient.LastName}",
                    DoctorId = test.DoctorID,
                    DoctorName = $"{doctor.Users.FirstName} {doctor.Users.FatherName}",
                    LaboratoryTestTypeId = test.LaboratoryTestTypeID,
                    TestTypeName = testType.TestName,
                    LaboratorySectionId = testType.LaboratorySectionID,
                    SectionName = testType.LaboratorySection.SectionName,
                    RequestDate = test.RequestDate,
                    Status = test.Status,
                    Result = null // no result yet
                };

                return CreatedAtAction(nameof(GetLaboratoryTest), new { id = test.TestID }, response);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: laboratory/test-types
        [HttpGet("laboratory/test-types")]
        public async Task<IActionResult> GetLaboratoryTestTypes()
        {
            try
            {
                var types = await _context.LaboratoryTestTypes
                    .Include(t => t.LaboratorySection)
                    .Select(t => new NurseLaboratoryTestTypeDto
                    {
                        LaboratoryTestTypeId = t.LaboratoryTestTypeID,
                        TestName = t.TestName,
                        Price = t.Price,
                        Description = t.Description,
                        LaboratorySectionId = t.LaboratorySectionID,
                        SectionName = t.LaboratorySection.SectionName
                    })
                    .ToListAsync();

                return Ok(types);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: laboratory/sections
        [HttpGet("laboratory/sections")]
        public async Task<IActionResult> GetLaboratorySections()
        {
            try
            {
                var sections = await _context.LaboratorySections
                    .Select(s => new NurseLaboratorySectionDto
                    {
                        LaboratorySectionId = s.LaboratorySectionID,
                        SectionName = s.SectionName,
                        Description = s.Description
                    })
                    .ToListAsync();

                return Ok(sections);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: laboratory/test/{id}
        [HttpGet("laboratory/test/{id}")]
        public async Task<IActionResult> GetLaboratoryTest(int id)
        {
            try
            {
                var test = await _context.LaboratoryTests
                    .Where(t => t.TestID == id)
                    .Select(t => new NurseLaboratoryTestResponseDto
                    {
                        TestId = t.TestID,
                        ConsultationId = t.ConsultationID,
                        PatientId = t.PatientID,
                        PatientMrn = t.Patient.MRN,
                        PatientName = $"{t.Patient.FirstName} {t.Patient.LastName}",
                        DoctorId = t.DoctorID,
                        DoctorName = $"{t.Doctor.Users.FirstName} {t.Doctor.Users.FatherName}",
                        LaboratoryTestTypeId = t.LaboratoryTestTypeID,
                        TestTypeName = t.LaboratoryTestType.TestName,
                        LaboratorySectionId = t.LaboratoryTestType.LaboratorySectionID,
                        SectionName = t.LaboratoryTestType.LaboratorySection.SectionName,
                        RequestDate = t.RequestDate,
                        Status = t.Status,
                        Result = t.LaboratoryResult.Any()
                            ? new NurseLaboratoryResultResponseDto
                            {
                                ResultId = t.LaboratoryResult.First().ResultID,
                                TestId = t.LaboratoryResult.First().TestID,
                                TechnicianId = t.LaboratoryResult.First().TechnicianID,
                                TechnicianName = $"{t.LaboratoryResult.First().LaboratoryTechnician.Users.FirstName} {t.LaboratoryResult.First().LaboratoryTechnician.Users.FatherName}",
                                ResultDescription = t.LaboratoryResult.First().ResultDescription,
                                ResultDate = t.LaboratoryResult.First().ResultDate
                            }
                            : null
                    })
                    .FirstOrDefaultAsync();

                if (test == null)
                    return NotFound(new { message = "Laboratory test not found" });

                return Ok(test);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: patient/{patientId}/laboratory-tests
        [HttpGet("patient/{patientId}/laboratory-tests")]
        public async Task<IActionResult> GetPatientLaboratoryTests(int patientId)
        {
            try
            {
                var patient = await _context.Patients.FindAsync(patientId);
                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                var tests = await _context.LaboratoryTests
                    .Where(t => t.PatientID == patientId)
                    .Select(t => new NurseLaboratoryTestListDto
                    {
                        TestId = t.TestID,
                        PatientId = t.PatientID,
                        PatientName = $"{t.Patient.FirstName} {t.Patient.LastName}",
                        PatientMrn = t.Patient.MRN,
                        TestTypeName = t.LaboratoryTestType.TestName,
                        SectionName = t.LaboratoryTestType.LaboratorySection.SectionName,
                        RequestDate = t.RequestDate,
                        Status = t.Status,
                        HasResult = t.LaboratoryResult.Any()
                    })
                    .ToListAsync();

                return Ok(tests);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: laboratory/today
        [HttpGet("laboratory/today")]
        public async Task<IActionResult> GetTodayLaboratoryTests()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var tests = await _context.LaboratoryTests
                    .Where(t => t.RequestDate.Date == today)
                    .Select(t => new NurseLaboratoryTestListDto
                    {
                        TestId = t.TestID,
                        PatientId = t.PatientID,
                        PatientName = $"{t.Patient.FirstName} {t.Patient.LastName}",
                        PatientMrn = t.Patient.MRN,
                        TestTypeName = t.LaboratoryTestType.TestName,
                        SectionName = t.LaboratoryTestType.LaboratorySection.SectionName,
                        RequestDate = t.RequestDate,
                        Status = t.Status,
                        HasResult = t.LaboratoryResult.Any()
                    })
                    .ToListAsync();

                return Ok(tests);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: laboratory/test/{id}/result
        [HttpGet("laboratory/test/{id}/result")]
        public async Task<IActionResult> GetLaboratoryResult(int id)
        {
            try
            {
                var result = await _context.LaboratoryResults
                    .Where(r => r.TestID == id)
                    .Select(r => new NurseLaboratoryResultResponseDto
                    {
                        ResultId = r.ResultID,
                        TestId = r.TestID,
                        TechnicianId = r.TechnicianID,
                        TechnicianName = $"{r.LaboratoryTechnician.Users.FirstName} {r.LaboratoryTechnician.Users.FatherName}",
                        ResultDescription = r.ResultDescription,
                        ResultDate = r.ResultDate
                    })
                    .FirstOrDefaultAsync();

                if (result == null)
                    return NotFound(new { message = "No result found for this test" });

                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // ============================================================
        // 6. PRESCRIPTION
        // ============================================================

        // GET: branch-pharmacies
[HttpGet("branch-pharmacies")]
public async Task<IActionResult> GetBranchPharmacies()
{
    try
    {
        var branches = await _context.BranchPharmacies
            .Select(b => new { b.BranchPharmacyID, b.BranchName })
            .OrderBy(b => b.BranchName)
            .ToListAsync();
        return Ok(branches);
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "An unexpected error occurred" });
    }
}

// GET: medicines
[HttpGet("medicines")]
public async Task<IActionResult> GetMedicines()
{
    try
    {
        var medicines = await _context.Medicines
            .Select(m => new { m.MedicineID, m.MedicineName, m.GenericName })
            .OrderBy(m => m.MedicineName)
            .ToListAsync();
        return Ok(medicines);
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "An unexpected error occurred" });
    }
}
        // POST: prescription/create
       [HttpPost("prescription/create")]
public async Task<IActionResult> CreatePrescription([FromBody] CreateBasicPrescriptionDto dto)
{
    try
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var patient = await _context.Patients.FindAsync(dto.PatientId);
        if (patient == null)
            return NotFound(new { message = "Patient not found" });

        var branch = await _context.BranchPharmacies.FindAsync(dto.BranchPharmacyId);
        if (branch == null)
            return NotFound(new { message = "Branch pharmacy not found" });

        var prescription = new Prescription
        {
            ConsultationID = null,
            DoctorID = null,
            PatientID = dto.PatientId,
            BranchPharmacyID = dto.BranchPharmacyId,
            PrescriptionDate = dto.PrescriptionDate
        };

        _context.Prescriptions.Add(prescription);
        await _context.SaveChangesAsync();

        var response = new PrescriptionResponseDto
        {
            PrescriptionId = prescription.PrescriptionID,
            PatientId = prescription.PatientID,
            PatientName = $"{patient.FirstName} {patient.LastName}",
            DoctorId = null,
            DoctorName = null,
            ConsultationId = null,
            BranchPharmacyId = prescription.BranchPharmacyID,
            PrescriptionDate = prescription.PrescriptionDate,
            Medicines = new List<PrescriptionMedicineDto>()
        };

        return CreatedAtAction(nameof(GetPrescription), new { id = prescription.PrescriptionID }, response);
    }
    catch (Exception)
    {
        return StatusCode(500, new { message = "An unexpected error occurred" });
    }
}

        // POST: prescription/{prescriptionId}/medicine
        [HttpPost("prescription/{prescriptionId}/medicine")]
        public async Task<IActionResult> AddPrescriptionMedicine(int prescriptionId, [FromBody] AddPrescriptionMedicineDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var prescription = await _context.Prescriptions.FindAsync(prescriptionId);
                if (prescription == null)
                    return NotFound(new { message = "Prescription not found" });

                var medicine = await _context.Medicines.FindAsync(dto.MedicineId);
                if (medicine == null)
                    return NotFound(new { message = "Medicine not found" });

                var detail = new PrescriptionDetail
                {
                    PrescriptionID = prescriptionId,
                    MedicineID = dto.MedicineId,
                    Dosage = dto.Dosage,
                    Frequency = dto.Frequency,
                    Duration = dto.Duration,
                    Quantity = dto.Quantity
                };

                _context.PrescriptionDetails.Add(detail);
                await _context.SaveChangesAsync();

                var response = new PrescriptionMedicineDto
                {
                    MedicineId = detail.MedicineID,
                    MedicineName = medicine.MedicineName,
                    GenericName = medicine.GenericName,
                    Dosage = detail.Dosage,
                    Frequency = detail.Frequency,
                    Duration = detail.Duration,
                    Quantity = detail.Quantity
                };

                return Ok(response);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // PUT: prescription/{id}
        [HttpPut("prescription/{id}")]
        public async Task<IActionResult> UpdatePrescription(int id, [FromBody] UpdatePrescriptionDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var prescription = await _context.Prescriptions.FindAsync(id);
                if (prescription == null)
                    return NotFound(new { message = "Prescription not found" });

                if (dto.PrescriptionDate.HasValue)
                    prescription.PrescriptionDate = dto.PrescriptionDate.Value;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Prescription updated" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // PUT: prescription-medicine/{id}
        [HttpPut("prescription-medicine/{id}")]
        public async Task<IActionResult> UpdatePrescriptionMedicine(int id, [FromBody] UpdatePrescriptionMedicineDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var detail = await _context.PrescriptionDetails.FindAsync(id);
                if (detail == null)
                    return NotFound(new { message = "Prescription detail not found" });

                if (!string.IsNullOrEmpty(dto.Dosage))
                    detail.Dosage = dto.Dosage;
                if (dto.Frequency.HasValue)
                    detail.Frequency = dto.Frequency.Value;
                if (dto.Duration.HasValue)
                    detail.Duration = dto.Duration.Value;
                if (dto.Quantity.HasValue)
                    detail.Quantity = dto.Quantity.Value;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Prescription medicine updated" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: prescription/{id}
        [HttpGet("prescription/{id}")]
        public async Task<IActionResult> GetPrescription(int id)
        {
            try
            {
                var prescription = await _context.Prescriptions
                    .Where(p => p.PrescriptionID == id)
                    .Select(p => new PrescriptionResponseDto
                    {
                        PrescriptionId = p.PrescriptionID,
                        PatientId = p.PatientID,
                        PatientName = $"{p.Patient.FirstName} {p.Patient.LastName}",
                        DoctorId = p.DoctorID,
                        DoctorName = $"{p.Doctor.Users.FirstName} {p.Doctor.Users.FatherName}",
                        ConsultationId = p.ConsultationID,
                        BranchPharmacyId = p.BranchPharmacyID,
                        PrescriptionDate = p.PrescriptionDate,
                        Medicines = p.PrescriptionDetail.Select(d => new PrescriptionMedicineDto
                        {
                            MedicineId = d.MedicineID,
                            MedicineName = d.Medicine.MedicineName,
                            GenericName = d.Medicine.GenericName,
                            Dosage = d.Dosage,
                            Frequency = d.Frequency,
                            Duration = d.Duration,
                            Quantity = d.Quantity
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (prescription == null)
                    return NotFound(new { message = "Prescription not found" });

                return Ok(prescription);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: patient/{patientId}/prescriptions
        [HttpGet("patient/{patientId}/prescriptions")]
        public async Task<IActionResult> GetPatientPrescriptions(int patientId)
        {
            try
            {
                var patient = await _context.Patients.FindAsync(patientId);
                if (patient == null)
                    return NotFound(new { message = "Patient not found" });

                var prescriptions = await _context.Prescriptions
                    .Where(p => p.PatientID == patientId)
                    .Select(p => new PrescriptionResponseDto
                    {
                        PrescriptionId = p.PrescriptionID,
                        PatientId = p.PatientID,
                        PatientName = $"{p.Patient.FirstName} {p.Patient.LastName}",
                        DoctorId = p.DoctorID,
                        DoctorName = $"{p.Doctor.Users.FirstName} {p.Doctor.Users.FatherName}",
                        ConsultationId = p.ConsultationID,
                        BranchPharmacyId = p.BranchPharmacyID,
                        PrescriptionDate = p.PrescriptionDate,
                        Medicines = p.PrescriptionDetail.Select(d => new PrescriptionMedicineDto
                        {
                            MedicineId = d.MedicineID,
                            MedicineName = d.Medicine.MedicineName,
                            GenericName = d.Medicine.GenericName,
                            Dosage = d.Dosage,
                            Frequency = d.Frequency,
                            Duration = d.Duration,
                            Quantity = d.Quantity
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(prescriptions);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // GET: prescription/today
        [HttpGet("prescription/today")]
        public async Task<IActionResult> GetTodayPrescriptions()
        {
            try
            {
                var today = DateTime.UtcNow.Date;
                var prescriptions = await _context.Prescriptions
                    .Where(p => p.PrescriptionDate.Date == today)
                    .Select(p => new PrescriptionResponseDto
                    {
                        PrescriptionId = p.PrescriptionID,
                        PatientId = p.PatientID,
                        PatientName = $"{p.Patient.FirstName} {p.Patient.LastName}",
                        DoctorId = p.DoctorID,
                        DoctorName = $"{p.Doctor.Users.FirstName} {p.Doctor.Users.FatherName}",
                        ConsultationId = p.ConsultationID,
                        BranchPharmacyId = p.BranchPharmacyID,
                        PrescriptionDate = p.PrescriptionDate,
                        Medicines = p.PrescriptionDetail.Select(d => new PrescriptionMedicineDto
                        {
                            MedicineId = d.MedicineID,
                            MedicineName = d.Medicine.MedicineName,
                            GenericName = d.Medicine.GenericName,
                            Dosage = d.Dosage,
                            Frequency = d.Frequency,
                            Duration = d.Duration,
                            Quantity = d.Quantity
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(prescriptions);
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        // POST: prescription/{id}/cancel
        [HttpPost("prescription/{id}/cancel")]
        public async Task<IActionResult> CancelPrescription(int id)
        {
            try
            {
                var prescription = await _context.Prescriptions.FindAsync(id);
                if (prescription == null)
                    return NotFound(new { message = "Prescription not found" });

                // Since there is no Status field in Prescription model,
                // we cannot mark it as cancelled. We'll return a clear message.
                return BadRequest(new { message = "Cancellation is not supported because the Prescription model does not have a Status field. Please implement a Status field first." });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }
    }
}