// DTOs/RoleDto.cs
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto
{
    // Base Role DTO
    public class RoleDto
    {
        
        [MaxLength(200)]
        public string RoleName { get; set; } = "";
    }

    // For Creating a New Role
    public class CreateRoleDto
    {
        [Required(ErrorMessage = "Role name is required")]
        [MaxLength(200, ErrorMessage = "Role name cannot exceed 200 characters")]
        public string RoleName { get; set; } = "";
    }

    // For Updating an Existing Role
    public class UpdateRoleDto
    {
        [Required(ErrorMessage = "Role name is required")]
        [MaxLength(200, ErrorMessage = "Role name cannot exceed 200 characters")]
        public string RoleName { get; set; } = "";
    }

    // For Response with Additional Info
    public class RoleResponseDto
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; } = "";
        public int UserCount { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
    }

    // For Role Statistics
    public class RoleStatisticsDto
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; } = "";
        public int UserCount { get; set; }
        public int ActiveUsers { get; set; }
        public int InactiveUsers { get; set; }
        public double ActivePercentage { get; set; }
    }

    // For Dropdown/Select Options
    public class RoleSelectDto
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; } = "";
        public int UserCount { get; set; }
    }
}