using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Consultation_M
{
    public class Diagnosis
{
    [Key]
    public int DiagnosisID { get; set; }

    public int ConsultationID { get; set; }

    [ForeignKey(nameof(ConsultationID))]
    public Consultation? Consultation { get; set; }

    public string Code { get; set; } = "";

    public string Description { get; set; } = "";

    public string CodingSystem { get; set; } = ""; // ICD-10 / ICD-11

    public string? DiagnosisType { get; set; } // Primary / Secondary

    public bool IsPrimary { get; set; }
}
}