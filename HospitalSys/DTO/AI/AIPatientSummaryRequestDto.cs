using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.AI
{
    public class AIPatientSummaryRequestDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public int VisitId { get; set; }

        /// <summary>Consultation | AdultMedicalCare | MaternalHealth | ChildHealth</summary>
        [Required]
        [MaxLength(50)]
        public string Module { get; set; } = "Consultation";
    }

    public class AIPatientSummaryResponseDto
    {
        public string Summary { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public int PatientId { get; set; }
        public int VisitId { get; set; }
        public bool IsAIGenerated { get; set; } = true;
        public string Disclaimer { get; set; } =
            "This content is AI-generated decision support only. It is not a diagnosis or treatment order. The attending doctor must review and decide.";
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
