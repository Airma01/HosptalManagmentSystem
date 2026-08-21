using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class ANCVisit
    {
        [Key]
        public int ANCVisitID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public int PatientVisitID { get; set; }

        [ForeignKey(nameof(PatientVisitID))]
        public PatientVisit? PatientVisit { get; set; }

        public DateTime VisitDate { get; set; } = DateTime.UtcNow;

        public int? GestationalAgeWeeks { get; set; }

        public string? ChiefComplaint { get; set; }

        public string? MaternalCondition { get; set; }

        public string? FetalCondition { get; set; }

        public string? FetalHeartRate { get; set; }

        public string? FundalHeight { get; set; }

        public string? Edema { get; set; }

        public string? CounselingProvided { get; set; }

        public string? TreatmentPlan { get; set; }

        public string? Notes { get; set; }

        public int? RecordedByUserID { get; set; }

        public List<PregnancyRiskAssessment> RiskAssessments { get; set; } = new();
    }
}