using HospitalSys.Models.ReferralManagement;

namespace HospitalSys.DTO.ReferralManagement
{
    /// <summary>
    /// DTO returned after creating, updating, or retrieving a referral.
    /// Includes key identifiers and display-friendly department/doctor names when available.
    /// </summary>
    public class ReferralResponseDto
    {
        public int ReferralID { get; set; }

        public int PatientID { get; set; }

        public int PatientVisitID { get; set; }

        public int? ReferringDoctorID { get; set; }

        public string? ReferringDoctorName { get; set; }

        public int? ReceivingDoctorID { get; set; }

        public string? ReceivingDoctorName { get; set; }

        public int? ReferringDepartmentID { get; set; }

        public string? ReferringDepartmentName { get; set; }

        public int? ReceivingDepartmentID { get; set; }

        public string? ReceivingDepartmentName { get; set; }

        public string? ReferralReason { get; set; }

        public string? ClinicalSummary { get; set; }

        public string? Diagnosis { get; set; }

        public string? Urgency { get; set; }

        public string? ReferralType { get; set; }

        public DateTime ReferralDate { get; set; }

        public DateTime? ExpectedArrivalDate { get; set; }

        public ReferralStatus Status { get; set; }

        public string? DestinationFacility { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
