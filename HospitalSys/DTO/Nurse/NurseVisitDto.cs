using System;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Nurse
{
    public class CreatePatientVisitDto
    {
        [Required]
        public int PatientId { get; set; }

        [Required]
        public DateTime VisitDate { get; set; }

        [Required]
        [MaxLength(100)] // approximate length from model
        public string VisitType { get; set; } = "";

        [Required]
        [MaxLength(100)]
        public string Status { get; set; } = "";
    }

    public class UpdatePatientVisitDto
    {
        [Required]
        public int VisitId { get; set; }

        public DateTime? VisitDate { get; set; }

        [MaxLength(100)]
        public string? VisitType { get; set; }

        [MaxLength(100)]
        public string? Status { get; set; }
    }

    public class PatientVisitResponseDto
    {
        public int VisitId { get; set; }
        public int PatientId { get; set; }
        public string? PatientName { get; set; }
        public DateTime VisitDate { get; set; }
        public string VisitType { get; set; } = "";
        public string Status { get; set; } = "";
        public DateTime Created_at { get; set; }
    }

    public class PatientVisitListDto
    {
        public int VisitId { get; set; }
        public int PatientId { get; set; }
        public string? PatientName { get; set; }
        public DateTime VisitDate { get; set; }
        public string Status { get; set; } = "";
        // Optionally include VisitType if needed
    }
    public class CreateVisitAndTriageDto
{
    // Patient Visit
    [Required]
    public int PatientId { get; set; }

    [Required]
    public DateTime VisitDate { get; set; }

    [Required]
    [MaxLength(100)]
    public string VisitType { get; set; } = "";

    [Required]
    [MaxLength(100)]
    public string Status { get; set; } = "";

    // Triage
    [Required]
    public int TriageDepartmentId { get; set; }

    [Required]
    public int ClinicalDepartmentId { get; set; }

    public double Temprature { get; set; }
    public double BloodPressure { get; set; }
    public double HeartRate { get; set; }
    public double RespiratyRate { get; set; }
    public double Weight { get; set; }

    public string? Notes { get; set; }
}
}