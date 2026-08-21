using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Consultation_M
{
    public class Allergy
{
    [Key]
    public int AllergyID { get; set; }

    public int PatientID { get; set; }

    [ForeignKey(nameof(PatientID))]
    public Patient? Patient { get; set; }
    public string Allergen { get; set; } = "";
    public string? Reaction { get; set; }

    public string? Severity { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? OnsetDate { get; set; }

    public string? Notes { get; set; }
}
}