// DTO/Doctor/TriageAndAppointmentDtos.cs
namespace HospitalSys.Dto.DoctorDtos
{
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
}