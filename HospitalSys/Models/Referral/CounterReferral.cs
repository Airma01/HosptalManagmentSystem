using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.ReferralManagement
{
    public class CounterReferral
    {
        [Key]
        public int CounterReferralID { get; set; }

        public int ReferralID { get; set; }

        [ForeignKey(nameof(ReferralID))]
        public Referral? Referral { get; set; }

        public DateTime CounterReferralDate { get; set; }
            = DateTime.UtcNow;

        public string? Reason { get; set; }

        public string? FinalDiagnosis { get; set; }

        public string? TreatmentProvided { get; set; }

        public string? ProceduresPerformed { get; set; }

        public string? CurrentCondition { get; set; }

        public string? MedicationInstructions { get; set; }

        public string? FollowUpInstructions { get; set; }

        public string? FollowUpFacility { get; set; }

        public string? Recommendations { get; set; }

        public string? Notes { get; set; }

        public int? ReturnedByUserID { get; set; }
    }
}