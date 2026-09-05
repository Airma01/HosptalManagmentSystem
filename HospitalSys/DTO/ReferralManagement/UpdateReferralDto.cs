using HospitalSys.Models.ReferralManagement;

namespace HospitalSys.DTO.ReferralManagement
{
    /// <summary>
    /// DTO for updating editable fields of an existing referral.
    /// Identity and relationship fields (PatientID, departments, referring doctor) are not updatable here.
    /// </summary>
    public class UpdateReferralDto
    {
        public ReferralStatus? Status { get; set; }

        public string? Urgency { get; set; }

        public string? ReferralReason { get; set; }

        public string? ClinicalSummary { get; set; }

        public string? Diagnosis { get; set; }

        public string? Notes { get; set; }

        public DateTime? ExpectedArrivalDate { get; set; }

        public string? DestinationFacility { get; set; }

        /// <summary>
        /// Optional: assign a receiving doctor when accepting the referral.
        /// </summary>
        public int? ReceivingDoctorID { get; set; }
    }
}
