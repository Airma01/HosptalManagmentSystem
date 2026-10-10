using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.Dto.DoctorDtos;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HospitalSys.Controllers.Doctor
{
    [ApiController]
    [Route("api/doctor")]
    [Authorize(Roles = "Doctor")]
    public class DoctorAppointmentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly DoctorDepartmentAuthorizationService _deptAuth;

        public DoctorAppointmentController(
            AppDbContext context,
            DoctorDepartmentAuthorizationService deptAuth)
        {
            _context = context;
            _deptAuth = deptAuth;
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

        // GET /api/doctor/appointments?departmentId=optional
        // Returns appointments for the authenticated doctor across ALL authorized departments.
        // Optional departmentId filters to one authorized department only.
        [HttpGet("appointments")]
        public async Task<IActionResult> GetMyAppointments([FromQuery] int? departmentId = null)
        {
            try
            {
                int doctorId = GetDoctorId();

                // Authoritative list of departments this doctor may access
                var assignedDeptIds = await _deptAuth.GetAssignedDepartmentIdsAsync(doctorId);
                if (assignedDeptIds.Count == 0)
                {
                    // Fallback: legacy single ClinicalDepartmentID
                    var legacy = await _context.Doctors.AsNoTracking()
                        .Where(d => d.DoctorID == doctorId)
                        .Select(d => d.ClinicalDepartmentID)
                        .FirstOrDefaultAsync();
                    if (legacy > 0) assignedDeptIds.Add(legacy);
                }

                if (departmentId.HasValue && departmentId.Value > 0)
                {
                    if (!assignedDeptIds.Contains(departmentId.Value))
                        return StatusCode(403, new { message = "You are not authorized for this department." });
                }

                var query = _context.Appointments
                    .AsNoTracking()
                    .Where(a => a.DoctorID == doctorId)
                    .Include(a => a.Patient)
                    .Include(a => a.ClinicalDepartment)
                    .Include(a => a.Doctor!)
                        .ThenInclude(d => d.ClinicalDepartment)
                    .AsQueryable();

                // Filter by explicit appointment department when requested
                if (departmentId.HasValue && departmentId.Value > 0)
                {
                    int dept = departmentId.Value;
                    query = query.Where(a =>
                        (a.ClinicalDepartmentID.HasValue && a.ClinicalDepartmentID == dept)
                        || (!a.ClinicalDepartmentID.HasValue && a.Doctor != null && a.Doctor.ClinicalDepartmentID == dept));
                }
                else
                {
                    // All appointments belonging to this doctor (all authorized depts).
                    // Legacy rows without ClinicalDepartmentID are still included.
                }

                var list = await query
                    .OrderByDescending(a => a.AppointmentDate)
                    .Select(a => new DoctorAppointmentListItemDto
                    {
                        AppointmentID = a.AppointmentID,
                        PatientID = a.PatientID,
                        MRN = a.Patient != null ? a.Patient.MRN : "",
                        PatientName = a.Patient != null ? a.Patient.FirstName + " " + a.Patient.LastName : "",
                        Gender = a.Patient != null ? a.Patient.Gender.ToString() : "",
                        DateOfBirth = a.Patient != null ? a.Patient.DateOfBirth : default,
                        Phone = a.Patient != null ? a.Patient.Phone : "",
                        DoctorID = a.DoctorID,
                        ClinicalDepartmentID = a.ClinicalDepartmentID
                            ?? (a.Doctor != null ? a.Doctor.ClinicalDepartmentID : 0),
                        DepartmentName = a.ClinicalDepartment != null
                            ? a.ClinicalDepartment.DepartmentName
                            : (a.Doctor != null && a.Doctor.ClinicalDepartment != null
                                ? a.Doctor.ClinicalDepartment.DepartmentName
                                : ""),
                        AppointmentDate = a.AppointmentDate,
                        Status = a.Status,
                        Reason = a.Reason
                    })
                    .ToListAsync();

                return Ok(list);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving appointments." });
            }
        }

        // GET /api/doctor/appointments/{id}
        [HttpGet("appointments/{id:int}")]
        public async Task<IActionResult> GetAppointmentDetails(int id)
        {
            try
            {
                int doctorId = GetDoctorId();

                var a = await _context.Appointments
                    .AsNoTracking()
                    .Include(x => x.Patient)
                    .Include(x => x.ClinicalDepartment)
                    .Include(x => x.Doctor!)
                        .ThenInclude(d => d.ClinicalDepartment)
                    .FirstOrDefaultAsync(x => x.AppointmentID == id);

                if (a == null)
                    return NotFound(new { message = "Appointment not found." });

                if (a.DoctorID != doctorId)
                    return Forbid();

                // Optional: ensure doctor still has access to the appointment's department
                int effectiveDeptId = a.ClinicalDepartmentID
                    ?? a.Doctor?.ClinicalDepartmentID
                    ?? 0;
                if (effectiveDeptId > 0)
                {
                    bool hasAccess = await _deptAuth.HasDepartmentAccessAsync(doctorId, effectiveDeptId);
                    if (!hasAccess)
                    {
                        // Allow legacy rows tied only to doctor's primary dept
                        var legacyOk = a.Doctor != null && a.Doctor.ClinicalDepartmentID == effectiveDeptId;
                        if (!legacyOk)
                            return StatusCode(403, new { message = "You are not authorized for this appointment's department." });
                    }
                }

                var dto = new DoctorAppointmentDetailsDto
                {
                    AppointmentID = a.AppointmentID,
                    PatientID = a.PatientID,
                    MRN = a.Patient?.MRN ?? "",
                    PatientFirstName = a.Patient?.FirstName ?? "",
                    PatientLastName = a.Patient?.LastName ?? "",
                    Gender = a.Patient?.Gender.ToString() ?? "",
                    DateOfBirth = a.Patient?.DateOfBirth ?? default,
                    Phone = a.Patient?.Phone ?? "",
                    Address = a.Patient?.Address ?? "",
                    EmergencyContact = a.Patient?.EmergencyContact ?? "",
                    DoctorID = a.DoctorID,
                    ClinicalDepartmentID = effectiveDeptId,
                    DepartmentName = a.ClinicalDepartment?.DepartmentName
                        ?? a.Doctor?.ClinicalDepartment?.DepartmentName
                        ?? "",
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status,
                    Reason = a.Reason
                };

                return Ok(dto);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving appointment details." });
            }
        }

        // POST /api/doctor/appointments/start
        [HttpPost("appointments/start")]
        public async Task<IActionResult> StartAppointment([FromBody] StartAppointmentDto dto)
        {
            if (dto == null || dto.AppointmentID <= 0)
                return BadRequest(new { message = "AppointmentID is required." });

            try
            {
                int doctorId = GetDoctorId();

                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor)
                    .FirstOrDefaultAsync(a => a.AppointmentID == dto.AppointmentID);

                if (appointment == null)
                    return NotFound(new { message = "Appointment not found." });

                if (appointment.DoctorID != doctorId)
                    return Forbid();

                // Prefer the department stored on the appointment; fall back to JWT active department
                int clinicalDeptId = appointment.ClinicalDepartmentID
                    ?? (appointment.Doctor != null ? appointment.Doctor.ClinicalDepartmentID : 0);
                if (clinicalDeptId <= 0)
                    clinicalDeptId = GetDepartmentId();

                // Verify doctor is still authorized for that department
                bool hasAccess = await _deptAuth.HasDepartmentAccessAsync(doctorId, clinicalDeptId);
                if (!hasAccess)
                {
                    // Legacy fallback
                    var doctor = await _context.Doctors.AsNoTracking()
                        .FirstOrDefaultAsync(d => d.DoctorID == doctorId);
                    if (doctor == null || doctor.ClinicalDepartmentID != clinicalDeptId)
                        return StatusCode(403, new { message = "You are not authorized for this appointment's department." });
                }

                if (string.Equals(appointment.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "Cannot start a cancelled appointment." });

                if (string.Equals(appointment.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "Appointment is already completed." });

                // ===== IDEMPOTENCY =====
                if (string.Equals(appointment.Status, "InProgress", StringComparison.OrdinalIgnoreCase))
                {
                    var existingVisit = await _context.PatientVisits
                        .AsNoTracking()
                        .Where(v => v.PatientID == appointment.PatientID)
                        .OrderByDescending(v => v.Created_at)
                        .FirstOrDefaultAsync();

                    if (existingVisit == null)
                        return StatusCode(500, new { message = "Appointment is InProgress but no visit found." });

                    var existingTriage = await _context.Triages
                        .AsNoTracking()
                        .Where(t => t.VisitID == existingVisit.VisitID && t.ClinicalDepartmentID == clinicalDeptId)
                        .OrderByDescending(t => t.TriageId)
                        .FirstOrDefaultAsync();

                    if (existingTriage == null)
                        return StatusCode(500, new { message = "Appointment is InProgress but no triage found." });

                    return Ok(BuildResponse(appointment, existingVisit, existingTriage));
                }

                var triageDept = await _context.TriageDepartments
                    .AsNoTracking()
                    .OrderBy(t => t.TriageDepartmentID)
                    .FirstOrDefaultAsync();

                if (triageDept == null)
                    return BadRequest(new { message = "No TriageDepartment configured in the system." });

                int triageDepartmentId = triageDept.TriageDepartmentID;

                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var visit = new PatientVisit
                    {
                        PatientID = appointment.PatientID,
                        VisitDate = DateTime.UtcNow,
                        VisitType = "Appointment",
                        Status = "Progress",
                        Created_at = DateTime.UtcNow
                    };
                    _context.PatientVisits.Add(visit);
                    await _context.SaveChangesAsync();

                    var triage = new Triage
                    {
                        VisitID = visit.VisitID,
                        NurseID = null,
                        TriageDepartmentID = triageDepartmentId,
                        ClinicalDepartmentID = clinicalDeptId,
                        Temprature = 0,
                        BloodPressure = 0,
                        HeartRate = 0,
                        RespiratotyRate = 0,
                        Weight = 0,
                        Notes = "Created from doctor appointment start"
                    };
                    _context.Triages.Add(triage);

                    appointment.Status = "InProgress";
                    // Persist department on the appointment if it was missing (legacy row)
                    if (!appointment.ClinicalDepartmentID.HasValue)
                        appointment.ClinicalDepartmentID = clinicalDeptId;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(BuildResponse(appointment, visit, triage));
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
                return StatusCode(500, new { message = "An error occurred while starting the appointment." });
            }
        }

        private static StartAppointmentResponseDto BuildResponse(
            Appointment appointment,
            PatientVisit visit,
            Triage triage)
        {
            var p = appointment.Patient;
            return new StartAppointmentResponseDto
            {
                AppointmentID = appointment.AppointmentID,
                AppointmentStatus = appointment.Status,
                VisitID = visit.VisitID,
                VisitDate = visit.VisitDate,
                VisitType = visit.VisitType,
                VisitStatus = visit.Status,
                TriageId = triage.TriageId,
                ClinicalDepartmentID = triage.ClinicalDepartmentID,
                TriageDepartmentID = triage.TriageDepartmentID,
                PatientID = appointment.PatientID,
                MRN = p?.MRN ?? "",
                PatientName = p != null ? p.FirstName + " " + p.LastName : "",
                Gender = p?.Gender.ToString() ?? "",
                DateOfBirth = p?.DateOfBirth ?? default,
                Phone = p?.Phone ?? ""
            };
        }

        // POST /api/doctor/appointments
        [HttpPost("appointments")]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
        {
            if (dto == null || dto.PatientID <= 0)
                return BadRequest(new { message = "PatientID is required." });

            if (dto.AppointmentDate == default)
                return BadRequest(new { message = "AppointmentDate is required." });

            try
            {
                int doctorId = GetDoctorId();

                // Resolve target department: prefer request body, else JWT active department
                int targetDeptId = dto.ClinicalDepartmentID > 0
                    ? dto.ClinicalDepartmentID
                    : GetDepartmentId();

                if (targetDeptId <= 0)
                    return BadRequest(new { message = "ClinicalDepartmentID is required." });

                // Server-side authorization: doctor must be assigned to this department
                bool hasAccess = await _deptAuth.HasDepartmentAccessAsync(doctorId, targetDeptId);
                if (!hasAccess)
                {
                    // Legacy fallback for doctors not yet fully migrated to DoctorDepartment
                    var doctor = await _context.Doctors.AsNoTracking()
                        .FirstOrDefaultAsync(d => d.DoctorID == doctorId);
                    if (doctor == null || doctor.ClinicalDepartmentID != targetDeptId)
                        return StatusCode(403, new { message = "You are not authorized to create appointments in this department." });
                }

                var patient = await _context.Patients
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.PatientID == dto.PatientID);

                if (patient == null)
                    return NotFound(new { message = "Patient not found." });

                var dept = await _context.ClinicalDepartments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.ClinicalDepartmentID == targetDeptId);

                if (dept == null)
                    return NotFound(new { message = "Department not found." });

                // PostgreSQL-safe: force UTC
                var appointmentDateUtc = dto.AppointmentDate.Kind == DateTimeKind.Utc
                    ? dto.AppointmentDate
                    : DateTime.SpecifyKind(dto.AppointmentDate, DateTimeKind.Utc);

                var appointment = new Appointment
                {
                    PatientID = dto.PatientID,
                    DoctorID = doctorId,
                    ClinicalDepartmentID = targetDeptId,
                    AppointmentDate = appointmentDateUtc,
                    Status = "Scheduled",
                    Reason = dto.Reason?.Trim() ?? ""
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                return Ok(new CreateAppointmentResponseDto
                {
                    AppointmentID = appointment.AppointmentID,
                    PatientID = patient.PatientID,
                    MRN = patient.MRN,
                    PatientName = $"{patient.FirstName} {patient.LastName}",
                    AppointmentDate = appointment.AppointmentDate,
                    Status = appointment.Status,
                    Reason = appointment.Reason,
                    ClinicalDepartmentID = targetDeptId,
                    DepartmentName = dept.DepartmentName,
                    Message = "Appointment created successfully."
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while creating the appointment.",
                    detail = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        // GET /api/doctor/patients
        [HttpGet("patients")]
        public async Task<IActionResult> GetPatientsForSearch()
        {
            try
            {
                var patients = await _context.Patients
                    .AsNoTracking()
                    .OrderBy(p => p.FirstName)
                    .ThenBy(p => p.LastName)
                    .Select(p => new
                    {
                        p.PatientID,
                        p.MRN,
                        FaydaFIN = p.FaydaFIN ?? "",
                        p.FirstName,
                        p.LastName,
                        Gender = p.Gender.ToString(),
                        p.Phone,
                        p.DateOfBirth
                    })
                    .ToListAsync();

                return Ok(patients);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Failed to load patients.",
                    detail = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }
    }
}
