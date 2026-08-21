using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Consultation_M
{
    public class PhysicalExamination
{
    [Key]
    public int PhysicalExaminationID { get; set; }

    public int ConsultationID { get; set; }

    [ForeignKey(nameof(ConsultationID))]
    public Consultation? Consultation { get; set; }

    public string ExaminationArea { get; set; } = "";

    public string Findings { get; set; } = "";

    public string? Notes { get; set; }
}
}