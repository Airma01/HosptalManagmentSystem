using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.ReferralManagement
{
    public class ReferralFeedback
    {
        [Key]
        public int ReferralFeedbackID { get; set; }

        public int ReferralID { get; set; }

        [ForeignKey(nameof(ReferralID))]
        public Referral? Referral { get; set; }

        public DateTime FeedbackDate { get; set; } = DateTime.UtcNow;

        public string? PatientConditionOnArrival { get; set; }

        public string? Assessment { get; set; }

        public string? Diagnosis { get; set; }

        public string? TreatmentProvided { get; set; }

        public string? ProceduresPerformed { get; set; }

        public string? InvestigationResults { get; set; }

        public string? PatientOutcome { get; set; }

        public string? FollowUpRecommendation { get; set; }

        public bool FurtherCareRequired { get; set; }

        public string? Notes { get; set; }

        public int? SubmittedByUserID { get; set; }
    }
}