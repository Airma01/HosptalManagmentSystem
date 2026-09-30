namespace HospitalSys.Dto.AI
{
    public class AIChatResponseDto
    {
        public string Answer { get; set; } = string.Empty;
        public string Module { get; set; } = string.Empty;
        public int PatientId { get; set; }
        public int VisitId { get; set; }
        public bool IsAIGenerated { get; set; } = true;
        public string Disclaimer { get; set; } =
            "This content is AI-generated decision support only. It is not a diagnosis or treatment order. The attending doctor must review and decide.";
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
