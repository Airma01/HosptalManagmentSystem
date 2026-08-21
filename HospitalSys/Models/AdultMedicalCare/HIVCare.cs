using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.AdultMedicalCare
{
    public class HIVCare
    {
        [Key]
        public int HIVCareID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

        public DateTime? DiagnosisDate { get; set; }

        public string? CareStatus { get; set; }

        public string? ClinicalStage { get; set; }

        public string? TreatmentStatus { get; set; }

        public DateTime? TreatmentStartDate { get; set; }

        public string? AdherenceStatus { get; set; }

        public string? TreatmentResponse { get; set; }

        public string? OpportunisticConditions { get; set; }

        public string? Complications { get; set; }

        public string? CounselingProvided { get; set; }

        public string? FollowUpPlan { get; set; }

        public DateTime? LastFollowUpDate { get; set; }

        public DateTime? NextFollowUpDate { get; set; }

        public string? Outcome { get; set; }

        public bool Active { get; set; } = true;

        public string? Notes { get; set; }

        public int? ManagedByUserID { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}