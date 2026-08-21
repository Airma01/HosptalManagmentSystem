using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class PNCVisit
    {
        [Key]
        public int PNCVisitID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public int PatientVisitID { get; set; }

        [ForeignKey(nameof(PatientVisitID))]
        public PatientVisit? PatientVisit { get; set; }

        public int? DeliveryID { get; set; }

        [ForeignKey(nameof(DeliveryID))]
        public Delivery? Delivery { get; set; }

        public DateTime VisitDate { get; set; } = DateTime.UtcNow;

        public int? DaysAfterDelivery { get; set; }

        public string? MaternalCondition { get; set; }

        public string? BleedingStatus { get; set; }

        public string? BreastfeedingStatus { get; set; }

        public string? UterusCondition { get; set; }

        public string? MentalHealthAssessment { get; set; }

        public string? CounselingProvided { get; set; }

        public string? FamilyPlanningCounseling { get; set; }

        public string? TreatmentPlan { get; set; }

        public string? Notes { get; set; }

        public int? RecordedByUserID { get; set; }
    }
}