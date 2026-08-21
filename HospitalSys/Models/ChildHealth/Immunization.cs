using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.ChildHealth
{
    public class Immunization
    {
        [Key]
        public int ImmunizationID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int? PatientVisitID { get; set; }

        [ForeignKey(nameof(PatientVisitID))]
        public PatientVisit? PatientVisit { get; set; }

        public DateTime VaccinationDate { get; set; } = DateTime.UtcNow;

        public string VaccineName { get; set; } = "";

        public string? VaccineCode { get; set; }

        public string? Dose { get; set; }

        public string? DoseNumber { get; set; }

        public string? Route { get; set; }

        public string? AdministrationSite { get; set; }

        public string? BatchNumber { get; set; }

        public DateTime? ExpiryDate { get; set; }

        public string? VaccinationReason { get; set; }

        public string Status { get; set; } = "Given";

        public string? AdverseEvent { get; set; }

        public string? Notes { get; set; }

        public int? AdministeredByUserID { get; set; }
    }
}