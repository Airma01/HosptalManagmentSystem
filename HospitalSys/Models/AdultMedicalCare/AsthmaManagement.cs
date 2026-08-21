using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.AdultMedicalCare
{
    public class AsthmaManagement
    {
        [Key]
        public int AsthmaManagementID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public DateTime DiagnosisDate { get; set; }

        public string? AsthmaSeverity { get; set; }

        public string? AsthmaControlStatus { get; set; }

        public string? Symptoms { get; set; }

        public string? Triggers { get; set; }

        public string? Allergies { get; set; }

        public string? ExacerbationHistory { get; set; }

        public string? HospitalizationHistory { get; set; }

        public string? ManagementPlan { get; set; }

        public string? InhalerTechniqueEducation { get; set; }

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