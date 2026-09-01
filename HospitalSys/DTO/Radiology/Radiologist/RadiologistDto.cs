namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Profile representation for a Radiologist.
    /// NOTE: The repository has no dedicated Radiologist model.
    /// Radiologists are expected to be represented via the existing Users + UserRole
    /// (or Doctor) structure. This DTO is shaped accordingly and does not invent
    /// a new entity or properties beyond what Users / Role support.
    /// Do not expose passwords.
    /// </summary>
    public class RadiologistDto
    {
        public int UserID { get; set; }

        public string Username { get; set; } = "";

        public string FirstName { get; set; } = "";

        public string FatherName { get; set; } = "";

        public string FullName => $"{FirstName} {FatherName}".Trim();

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public bool IsActive { get; set; }

        public string RoleName { get; set; } = "Radiologist";
    }
}
