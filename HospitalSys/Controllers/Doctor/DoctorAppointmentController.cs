using System.Security.Claims;
using HospitalSys.Data;
using HospitalSys.Dto.DoctorDtos;
using HospitalSys.Models.PatientManagment;
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

        public DoctorAppointmentController(AppDbContext context)
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

        // GET /api/doctor/appointments
        [HttpGet("appointments")]
        public async Task<IActionResult> GetMyAppointments()
        {
            try
            {
                int doctorId = GetDoctorId();

                var list = await _context.Appointments
                    .AsNoTracking()
                    .Where(a => a.DoctorID == doctorId)
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor!)
                        .ThenInclude(d => d.ClinicalDepartment)
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
                        ClinicalDepartmentID = a.Doctor != null ? a.Doctor.ClinicalDepartmentID : 0,
                        DepartmentName = a.Doctor != null && a.Doctor.ClinicalDepartment != null
                            ? a.Doctor.ClinicalDepartment.DepartmentName : "",
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
                    .Include(x => x.Doctor!)
                        .ThenInclude(d => d.ClinicalDepartment)
                    .FirstOrDefaultAsync(x => x.AppointmentID == id);

                if (a == null)
                    return NotFound(new { message = "Appointment not found." });

                if (a.DoctorID != doctorId)
                    return Forbid(); // or Unauthorized per project convention

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
                    ClinicalDepartmentID = a.Doctor?.ClinicalDepartmentID ?? 0,
                    DepartmentName = a.Doctor?.ClinicalDepartment?.DepartmentName ?? "",
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
                int clinicalDeptId = GetDepartmentId();

                // Load appointment + patient (tracked for update)
                var appointment = await _context.Appointments
                    .Include(a => a.Patient)
                    .Include(a => a.Doctor)
                    .FirstOrDefaultAsync(a => a.AppointmentID == dto.AppointmentID);

                if (appointment == null)
                    return NotFound(new { message = "Appointment not found." });

                if (appointment.DoctorID != doctorId)
                    return Forbid();

                if (string.Equals(appointment.Status, "Cancelled", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "Cannot start a cancelled appointment." });

                if (string.Equals(appointment.Status, "Completed", StringComparison.OrdinalIgnoreCase))
                    return BadRequest(new { message = "Appointment is already completed." });

                // ===== IDEMPOTENCY =====
                // If already InProgress, return existing Visit + Triage (no duplicates)
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

                // Determine TriageDepartmentID – reuse existing system behaviour.
                // Nurse always supplies it. No mapping table exists.
                // Use the first available TriageDepartment (or the one most recently used for this clinical dept).
                // This is the least-invasive approach that does not invent models or change schema.
                var triageDept = await _context.TriageDepartments
                    .AsNoTracking()
                    .OrderBy(t => t.TriageDepartmentID)
                    .FirstOrDefaultAsync();

                if (triageDept == null)
                    return BadRequest(new { message = "No TriageDepartment configured in the system." });

                int triageDepartmentId = triageDept.TriageDepartmentID;

                // ===== TRANSACTION =====
                await using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // 1. Create PatientVisit (exact model properties)
                    var visit = new PatientVisit
                    {
                        PatientID = appointment.PatientID,
                        VisitDate = DateTime.UtcNow,
                        VisitType = "Appointment",          // conventional string used in project
                        Status = "InProgress",
                        Created_at = DateTime.UtcNow
                    };
                    _context.PatientVisits.Add(visit);
                    await _context.SaveChangesAsync(); // get VisitID

                    // 2. Create Triage (exact model – vitals default to 0 because non-nullable)
                    var triage = new Triage
                    {
                        VisitID = visit.VisitID,
                        NurseID = null,                     // doctor-started; nurse may update later
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

                    // 3. Update Appointment status
                    appointment.Status = "InProgress";

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

                // Verify patient exists
                var patient = await _context.Patients
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.PatientID == dto.PatientID);

                if (patient == null)
                    return NotFound(new { message = "Patient not found." });

                // Optional: prevent creating appointment in the past
                if (dto.AppointmentDate < DateTime.UtcNow.AddMinutes(-5))
                    return BadRequest(new { message = "Cannot create appointment in the past." });

                var appointment = new Appointment
                {
                    PatientID = dto.PatientID,
                    DoctorID = doctorId,                 // always from JWT
                    AppointmentDate = dto.AppointmentDate,
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
                    Message = "Appointment created successfully."
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized(new { message = "Unauthorized" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while creating the appointment." });
            }
        }
    }
}