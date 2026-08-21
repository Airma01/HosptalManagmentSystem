using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Consultation_M
{
    public class SocialHistory
{
    [Key]
    public int SocialHistoryID { get; set; }

    public int PatientID { get; set; }

    [ForeignKey(nameof(PatientID))]
    public Patient? Patient { get; set; }

    public string? SmokingStatus { get; set; }

    public string? AlcoholUse { get; set; }

    public string? Occupation { get; set; }

    public string? LivingSituation { get; set; }

    public string? PhysicalActivity { get; set; }

    public string? Notes { get; set; }
}
}