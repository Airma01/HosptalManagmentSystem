using System.ComponentModel.DataAnnotations;

namespace HospitalSys.DTO.ReferralManagement
{
    /// <summary>
    /// DTO used when a doctor creates a referral from one department to another.
    /// ReferringDoctorID and ReferringDepartmentID are expected to be set from the authenticated user.
    /// </summary>
    public class CreateReferralDto
    {
        [Required]
        public int PatientID { get; set; }

        [Required]
        public int PatientVisitID { get; set; }

        /// <summary>
        /// Destination / receiving clinical department.
        /// </summary>
        [Required]
        public int ReceivingDepartmentID { get; set; }

        public string? ReferralReason { get; set; }

        public string? ClinicalSummary { get; set; }

        public string? Diagnosis { get; set; }

        /// <summary>
        /// Maps to Referral.Urgency (e.g. Routine, Urgent, Emergency).
        /// </summary>
        public string? Urgency { get; set; }

        public string? ReferralType { get; set; }

        public DateTime? ExpectedArrivalDate { get; set; }

        public string? DestinationFacility { get; set; }

        public string? Notes { get; set; }
    }
}
