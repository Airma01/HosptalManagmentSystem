using System;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Dto.MLT
{
    /// <summary>
    /// Patient information needed by MLT (from Patient model).
    /// Excludes sensitive account/auth fields.
    /// </summary>
    public class MLTPatientDto
    {
        public int PatientID { get; set; }
        public string MRN { get; set; } = "";
        public string? FaydaFIN { get; set; }
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string FullName => $"{FirstName} {LastName}".Trim();
        public Gender Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public int? Age
        {
            get
            {
                var today = DateTime.UtcNow.Date;
                var age = today.Year - DateOfBirth.Year;
                if (DateOfBirth.Date > today.AddYears(-age)) age--;
                return age < 0 ? null : age;
            }
        }
        public string Phone { get; set; } = "";
        public string Address { get; set; } = "";
        public string EmergencyContact { get; set; } = "";
        public DateTime Created_at { get; set; }
    }

    /// <summary>
    /// Compact patient + optional visit context for queue/list views.
    /// </summary>
    public class MLTPatientSummaryDto
    {
        public int PatientID { get; set; }
        public string MRN { get; set; } = "";
        public string FullName { get; set; } = "";
        public Gender Gender { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Phone { get; set; } = "";
        public int? VisitID { get; set; }
        public DateTime? VisitDate { get; set; }
        public string? VisitType { get; set; }
        public string? VisitStatus { get; set; }
    }
}