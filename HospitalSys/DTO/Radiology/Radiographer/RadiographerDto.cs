using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Radiology
{
    /// <summary>
    /// Profile representation for a Radiographer (RadiologyTechnician + Users).
    /// Compatible with existing RadiographerAuthController (role "Radiographer").
    /// Does NOT expose password / HashPassword.
    /// Reuses concepts from existing HospitalSys.Dto.RadiographerAuthDto.
    /// </summary>
    public class RadiographerDto
    {
        public int RadiologyTechnicianID { get; set; }

        public int UserID { get; set; }

        public string Username { get; set; } = "";

        public string FirstName { get; set; } = "";

        public string FatherName { get; set; } = "";

        public string FullName => $"{FirstName} {FatherName}".Trim();

        public string? Email { get; set; }

        public string? Phone { get; set; }

        public bool IsActive { get; set; }

        public string RoleName { get; set; } = "Radiographer";
    }

    // Note: Login and Auth DTOs already exist in HospitalSys.Dto.RadiographerDto.cs:
    //   - RadiographerLoginDto (Username, Password)
    //   - RadiographerAuthDto (Username, FullName, RoleName)
    // Reuse those; do not duplicate.
}
