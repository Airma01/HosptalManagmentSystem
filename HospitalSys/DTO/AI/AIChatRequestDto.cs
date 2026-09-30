using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.AI
{
    public class AIChatRequestDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public int VisitId { get; set; }

        /// <summary>Clinical module context: Consultation | AdultMedicalCare | MaternalHealth | ChildHealth</summary>
        [Required]
        [MaxLength(50)]
        public string Module { get; set; } = "Consultation";

        [Required]
        [MinLength(3)]
        [MaxLength(2000)]
        public string Question { get; set; } = string.Empty;
    }
}
