using System;
using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Dto.Nurse
{
    public class RegisterPatientDto
    {
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = "";

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = "";

        [Required]
        public Gender Gender { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = "";

        [MaxLength(100)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? EmergencyContact { get; set; }

        [MaxLength(12)]
        public string? FaydaFIN { get; set; }
    }

    public class UpdatePatientDto
    {
        [Required]
        public int PatientId { get; set; }

        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        public Gender? Gender { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? EmergencyContact { get; set; }

        [MaxLength(12)]
        public string? FaydaFIN { get; set; }
    }

    public class PatientSearchDto
    {
        public string? MRN { get; set; }
        public string? FaydaFIN { get; set; }
        public string? Phone { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }

    public class PatientResponseDto
    {
        public int PatientId { get; set; }
        public string MRN { get; set; } = "";
        public string? FaydaFIN { get; set; }
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string FullName => $"{FirstName} {LastName}";
        public Gender Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Phone { get; set; } = "";
        public string Address { get; set; } = "";
        public string EmergencyContact { get; set; } = "";
        public DateTime Created_at { get; set; }
    }
}