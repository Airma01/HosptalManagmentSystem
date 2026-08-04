// DTOs/UserDto.cs
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto
{
    // Base User DTO for List/Display
    public class UserDto
    {
        public int UserID { get; set; }
        
        [MaxLength(100)]
        public string FirstName { get; set; } = "";

        [MaxLength(100)]
        public string FatherName { get; set; } = "";

        public string FullName { get; set; } = "";

        public string Gender { get; set; } = "";

        [MaxLength(20)]
        public string Phone { get; set; } = "";

        [MaxLength(100)]
        public string Email { get; set; } = "";

        [MaxLength(100)]
        public string Username { get; set; } = "";

        public int RoleID { get; set; }

        public string RoleName { get; set; } = "";

        public bool IsActive { get; set; }

        public DateTime Created_at { get; set; }
    }

    // For Creating a New User
    public class CreateUserDto
    {
        [Required(ErrorMessage = "First name is required")]
        [MaxLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
        public string FirstName { get; set; } = "";

        [Required(ErrorMessage = "Father name is required")]
        [MaxLength(100, ErrorMessage = "Father name cannot exceed 100 characters")]
        public string FatherName { get; set; } = "";

        [Required(ErrorMessage = "Gender is required")]
        public string Gender { get; set; } = ""; // "Male" or "Female"

        [Required(ErrorMessage = "Phone number is required")]
        [MaxLength(20, ErrorMessage = "Phone cannot exceed 20 characters")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = "";

        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Username is required")]
        [MaxLength(100, ErrorMessage = "Username cannot exceed 100 characters")]
        public string Username { get; set; } = "";

        [Required(ErrorMessage = "Password is required")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        [MaxLength(250, ErrorMessage = "Password cannot exceed 250 characters")]
        public string Password { get; set; } = "";

        [Required(ErrorMessage = "Role ID is required")]
        public int RoleID { get; set; }
    }

    // For Updating an Existing User
    public class UpdateUserDto
    {
        [MaxLength(100, ErrorMessage = "First name cannot exceed 100 characters")]
        public string FirstName { get; set; } = "";

        [MaxLength(100, ErrorMessage = "Father name cannot exceed 100 characters")]
        public string FatherName { get; set; } = "";

        public string Gender { get; set; } = ""; // "Male" or "Female"

        [MaxLength(20, ErrorMessage = "Phone cannot exceed 20 characters")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = "";

        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = "";

        [MaxLength(100, ErrorMessage = "Username cannot exceed 100 characters")]
        public string Username { get; set; } = "";

        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        [MaxLength(250, ErrorMessage = "Password cannot exceed 250 characters")]
        public string Password { get; set; } = "";

        public int? RoleID { get; set; }

        public bool? IsActive { get; set; }
    }

    // For Detailed User Response
    public class UserResponseDto
    {
        public int UserID { get; set; }
        public string FirstName { get; set; } = "";
        public string FatherName { get; set; } = "";
        public string FullName { get; set; } = "";
        public string Gender { get; set; } = "";
        public string Phone { get; set; } = "";
        public string Email { get; set; } = "";
        public string Username { get; set; } = "";
        public int RoleID { get; set; }
        public string RoleName { get; set; } = "";
        public bool IsActive { get; set; }
        public DateTime Created_at { get; set; }
    }

    // For Users Grouped by Role
    public class UserByRoleDto
    {
        public RoleDto Role { get; set; } = new();
        public List<UserResponseDto> Users { get; set; } = new();
        public int TotalCount { get; set; }
    }

    // For Assigning/Changing User Role
    public class UserRoleAssignmentDto
    {
        [Required(ErrorMessage = "User ID is required")]
        public int UserID { get; set; }

        [Required(ErrorMessage = "Role ID is required")]
        public int RoleID { get; set; }
    }

    // For Bulk Role Assignment
    public class BulkUserRoleAssignmentDto
    {
        [Required(ErrorMessage = "User IDs are required")]
        public List<int> UserIDs { get; set; } = new();

        [Required(ErrorMessage = "Role ID is required")]
        public int RoleID { get; set; }
    }

    // For User Login
    public class UserLoginDto
    {
        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; } = "";

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = "";
    }

    // For User Registration (Extended)
    
    public class RegisterUserDto
{
    public string FirstName { get; set; }
    public string FatherName { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public List<int> RoleIDs { get; set; }   // ← array of role IDs
}

    // For User Profile Update
    public class UpdateUserProfileDto
    {
        [MaxLength(100)]
        public string FirstName { get; set; } = "";

        [MaxLength(100)]
        public string FatherName { get; set; } = "";

        [MaxLength(20)]
        public string Phone { get; set; } = "";

        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = "";

        [MaxLength(100)]
        public string Username { get; set; } = "";

        [MinLength(6)]
        public string CurrentPassword { get; set; } = "";

        [MinLength(6)]
        public string NewPassword { get; set; } = "";
    }
}