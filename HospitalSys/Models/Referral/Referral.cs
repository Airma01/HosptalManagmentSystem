using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.ReferralManagement
{
    public enum ReferralStatus
    {
        Draft,
        Pending,
        Accepted,
        InTransit,
        Completed,
        Cancelled,
        Rejected
    }

    public class Referral
    {
        [Key]
        public int ReferralID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int PatientVisitID { get; set; }

        [ForeignKey(nameof(PatientVisitID))]
        public PatientVisit? PatientVisit { get; set; }

        public int? ReferringDoctorID { get; set; }

        public int? ReceivingDoctorID { get; set; }

        public int? ReferringDepartmentID { get; set; }

        public int? ReceivingDepartmentID { get; set; }

        public string? ReferralReason { get; set; }

        public string? ClinicalSummary { get; set; }

        public string? Diagnosis { get; set; }

        public string? Urgency { get; set; }

        public string? ReferralType { get; set; }

        public DateTime ReferralDate { get; set; } = DateTime.UtcNow;

        public DateTime? ExpectedArrivalDate { get; set; }

        public ReferralStatus Status { get; set; } = ReferralStatus.Pending;

        public string? DestinationFacility { get; set; }

        public string? Notes { get; set; }

        public int? CreatedByUserID { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<ReferralService> ReferralServices { get; set; } = new();

        public List<ReferralFeedback> Feedbacks { get; set; } = new();

        public List<CounterReferral> CounterReferrals { get; set; } = new();

        public List<AmbulanceRequest> AmbulanceRequests { get; set; } = new();
    }
}