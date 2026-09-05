using HospitalSys.Models.ReferralManagement;

namespace HospitalSys.DTO.ReferralManagement
{
    /// <summary>
    /// DTO for the receiving department's incoming referral queue (Department B dashboard).
    /// Provides display-ready patient, department, and doctor information.
    /// </summary>
    public class ReferralQueueDto
    {
        public int ReferralID { get; set; }

        public int PatientID { get; set; }

        public string PatientName { get; set; } = "";

        public string? MRN { get; set; }

        public int PatientVisitID { get; set; }

        public int? ReferringDepartmentID { get; set; }

        public string? ReferringDepartmentName { get; set; }

        public int? ReceivingDepartmentID { get; set; }

        public string? ReceivingDepartmentName { get; set; }

        public int? ReferringDoctorID { get; set; }

        public string? ReferringDoctorName { get; set; }

        public string? ReferralReason { get; set; }

        public string? Urgency { get; set; }

        public ReferralStatus Status { get; set; }

        public DateTime ReferralDate { get; set; }

        public string? ReferralType { get; set; }
    }
}
