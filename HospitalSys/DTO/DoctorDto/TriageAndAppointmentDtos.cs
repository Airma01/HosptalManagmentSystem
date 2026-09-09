// DTO/DoctorDto/TriageAndAppointmentDtos.cs
namespace HospitalSys.Dto.DoctorDtos
{
    // ─── Existing (keep this) ───────────────────────────────────────────────
    public class DoctorTriageQueueItemDto
    {
        public int TriageId { get; set; }
        public int PatientID { get; set; }
        public string PatientName { get; set; } = "";
        public int VisitID { get; set; }
        public DateTime VisitDate { get; set; }
        public string VisitType { get; set; } = "";
        public string VisitStatus { get; set; } = "";
        public int ClinicalDepartmentID { get; set; }
        public string DepartmentName { get; set; } = "";
        public double Temprature { get; set; }
        public double BloodPressure { get; set; }
        public double HeartRate { get; set; }
        public double RespiratotyRate { get; set; }
        public double Weight { get; set; }
        public string Notes { get; set; } = "";
    }

    // ─── New Appointment DTOs ───────────────────────────────────────────────
    public class DoctorAppointmentListItemDto
    {
        public int AppointmentID { get; set; }
        public int PatientID { get; set; }
        public string MRN { get; set; } = "";
        public string PatientName { get; set; } = "";
        public string Gender { get; set; } = "";
        public DateTime DateOfBirth { get; set; }
        public string Phone { get; set; } = "";
        public int DoctorID { get; set; }
        public int ClinicalDepartmentID { get; set; }
        public string DepartmentName { get; set; } = "";
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = "";
        public string Reason { get; set; } = "";
    }

    public class DoctorAppointmentDetailsDto
    {
        public int AppointmentID { get; set; }
        public int PatientID { get; set; }
        public string MRN { get; set; } = "";
        public string PatientFirstName { get; set; } = "";
        public string PatientLastName { get; set; } = "";
        public string Gender { get; set; } = "";
        public DateTime DateOfBirth { get; set; }
        public string Phone { get; set; } = "";
        public string Address { get; set; } = "";
        public string EmergencyContact { get; set; } = "";
        public int DoctorID { get; set; }
        public int ClinicalDepartmentID { get; set; }
        public string DepartmentName { get; set; } = "";
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = "";
        public string Reason { get; set; } = "";
    }

    public class StartAppointmentDto
    {
        public int AppointmentID { get; set; }
    }

    public class StartAppointmentResponseDto
    {
        public int AppointmentID { get; set; }
        public string AppointmentStatus { get; set; } = "";
        public int VisitID { get; set; }
        public DateTime VisitDate { get; set; }
        public string VisitType { get; set; } = "";
        public string VisitStatus { get; set; } = "";
        public int TriageId { get; set; }
        public int ClinicalDepartmentID { get; set; }
        public int TriageDepartmentID { get; set; }
        public int PatientID { get; set; }
        public string MRN { get; set; } = "";
        public string PatientName { get; set; } = "";
        public string Gender { get; set; } = "";
        public DateTime DateOfBirth { get; set; }
        public string Phone { get; set; } = "";
    }
    public class CreateAppointmentDto
    {
        public int PatientID { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Reason { get; set; } = "";
    }

    public class CreateAppointmentResponseDto
    {
        public int AppointmentID { get; set; }
        public int PatientID { get; set; }
        public string MRN { get; set; } = "";
        public string PatientName { get; set; } = "";
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; } = "";
        public string Reason { get; set; } = "";
        public string Message { get; set; } = "";
    }
}