using HospitalSys.Models.ReferralManagement;

namespace HospitalSys.DTO.ReferralManagement
{
    /// <summary>
    /// Full referral detail returned when Department B opens a referral (View action).
    /// Provides referral context plus nested patient, visit, and triage information
    /// so the doctor can navigate to clinical modules using PatientID + VisitID.
    /// </summary>
    public class ReferralDetailDto
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

        /// <summary>
        /// Patient details for the referral detail screen.
        /// </summary>
        public ReferralPatientDto? Patient { get; set; }

        /// <summary>
        /// The visit linked to this referral (PatientVisitID).
        /// </summary>
        public ReferralVisitDto? Visit { get; set; }

        /// <summary>
        /// Triage record(s) associated with the linked visit.
        /// </summary>
        public List<ReferralTriageDto> Triages { get; set; } = new();

        /// <summary>
        /// Optional list of recent/relevant visits for the same patient
        /// so the doctor can select the correct visit for clinical modules.
        /// </summary>
        public List<ReferralVisitDto> RecentVisits { get; set; } = new();
    }
}
