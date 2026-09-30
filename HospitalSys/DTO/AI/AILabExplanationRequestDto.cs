using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.AI
{
    public class AILabExplanationRequestDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public int VisitId { get; set; }

        /// <summary>Optional specific laboratory result IDs. If empty, uses recent results for the visit/patient.</summary>
        public List<int>? LaboratoryResultIds { get; set; }

        [MaxLength(50)]
        public string Module { get; set; } = "Consultation";
    }

    public class AIClinicalRecordSummaryRequestDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public int VisitId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Module { get; set; } = "Consultation";
    }

    public class AIClinicalContextDto
    {
        public int PatientId { get; set; }
        public int VisitId { get; set; }
        public string Module { get; set; } = string.Empty;
        public string ContextText { get; set; } = string.Empty;
        public int CharacterCount { get; set; }
    }
}
