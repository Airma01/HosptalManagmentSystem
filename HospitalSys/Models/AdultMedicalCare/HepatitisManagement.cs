using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.AdultMedicalCare
{
    public class HepatitisManagement
    {
        [Key]
        public int HepatitisManagementID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public DateTime DiagnosisDate { get; set; }

        public string? HepatitisType { get; set; }

        public string? DiagnosticMethod { get; set; }

        public string? DiseaseStatus { get; set; }

        public string? Symptoms { get; set; }

        public string? LiverCondition { get; set; }

        public string? Complications { get; set; }

        public string? TreatmentPlan { get; set; }

        public string? TreatmentStatus { get; set; }

        public string? LaboratoryMonitoringPlan { get; set; }

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