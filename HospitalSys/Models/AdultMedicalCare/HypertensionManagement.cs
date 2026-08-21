using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.AdultMedicalCare
{
    public class HypertensionManagement
    {
        [Key]
        public int HypertensionManagementID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public DateTime DiagnosisDate { get; set; }

        public string? HypertensionType { get; set; }

        public string? DiagnosisMethod { get; set; }

        public string? RiskFactors { get; set; }

        public string? TargetBloodPressure { get; set; }

        public string? Complications { get; set; }

        public string? CardiovascularRisk { get; set; }

        public string? ManagementPlan { get; set; }

        public string? LifestyleAdvice { get; set; }

        public string? TreatmentStatus { get; set; }

        public DateTime? LastFollowUpDate { get; set; }

        public DateTime? NextFollowUpDate { get; set; }

        public bool Active { get; set; } = true;

        public string? Notes { get; set; }

        public int? RecordedByUserID { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}