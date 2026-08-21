using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.AdultMedicalCare
{
    public class TuberculosisManagement
    {
        [Key]
        public int TuberculosisManagementID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public DateTime DiagnosisDate { get; set; }

        public string? TBType { get; set; }

        public string? SiteOfTB { get; set; }

        public string? DiagnosticMethod { get; set; }

        public string? Symptoms { get; set; }

        public string? DrugResistanceStatus { get; set; }

        public DateTime? TreatmentStartDate { get; set; }

        public DateTime? ExpectedTreatmentEndDate { get; set; }

        public DateTime? ActualTreatmentEndDate { get; set; }

        public string? TreatmentRegimen { get; set; }

        public string? TreatmentStatus { get; set; }

        public string? AdherenceStatus { get; set; }

        public string? TreatmentResponse { get; set; }

        public string? Complications { get; set; }

        public string? ContactTracingStatus { get; set; }

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