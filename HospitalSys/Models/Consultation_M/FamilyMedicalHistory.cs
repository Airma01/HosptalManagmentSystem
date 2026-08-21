using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Consultation_M
{
    public class FamilyMedicalHistory
{
    [Key]
    public int FamilyMedicalHistoryID { get; set; }

    public int PatientID { get; set; }

    [ForeignKey(nameof(PatientID))]
    public Patient? Patient { get; set; }

    public string Relative { get; set; } = "";

    public string ConditionName { get; set; } = "";

    public string? Notes { get; set; }
}
}