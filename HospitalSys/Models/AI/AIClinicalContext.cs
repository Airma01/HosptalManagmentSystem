namespace HospitalSys.Models.AI
{
    /// <summary>
    /// In-memory clinical context assembled from authorized EF entities.
    /// Never persisted. Never contains secrets or auth tokens.
    /// </summary>
    public class AIClinicalContext
    {
        public int PatientId { get; set; }
        public int VisitId { get; set; }
        public string Module { get; set; } = string.Empty;
        public string PatientLabel { get; set; } = string.Empty; // e.g. "MRN-xxx, Age, Sex" — no full name if preferred
        public string ContextText { get; set; } = string.Empty;
        public DateTime BuiltAtUtc { get; set; } = DateTime.UtcNow;
    }
}
