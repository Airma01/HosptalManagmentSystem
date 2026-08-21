using System;
using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Dto.Nurse
{
    public class CreateTriageDto
    {
        [Required]
        public int VisitId { get; set; }

        public int? NurseId { get; set; }  // can be set from current user

        [Required]
        public int TriageDepartmentId { get; set; }

        [Required]
        public int ClinicalDepartmentId { get; set; }

        public double Temprature { get; set; }
        public double BloodPressure { get; set; }
        public double HeartRate { get; set; }
        public double RespiratyRate { get; set; }  // exact spelling from model
        public double Weight { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateTriageDto
    {
        [Required]
        public int TriageId { get; set; }

        public int? NurseId { get; set; }
        public int? TriageDepartmentId { get; set; }
        public int? ClinicalDepartmentId { get; set; }
        public double? Temprature { get; set; }
        public double? BloodPressure { get; set; }
        public double? HeartRate { get; set; }
        public double? RespiratyRate { get; set; }
        public double? Weight { get; set; }
        public string? Notes { get; set; }
    }

    public class TriageResponseDto
    {
        public int TriageId { get; set; }
        public int VisitId { get; set; }
        public int? NurseId { get; set; }
        public int TriageDepartmentId { get; set; }
        public int ClinicalDepartmentId { get; set; }
        public double Temprature { get; set; }
        public double BloodPressure { get; set; }
        public double HeartRate { get; set; }
        public double RespiratyRate { get; set; }
        public double Weight { get; set; }
        public string? Notes { get; set; }
        // Additional fields from related entities (not in Triage model)
        public string? PatientName { get; set; }
        public DateTime? VisitDate { get; set; }
    }

    public class PendingTriageDto
    {
        // Same as TriageResponseDto; pending status is determined by business logic elsewhere.
        public int TriageId { get; set; }
        public int VisitId { get; set; }
        public string? PatientName { get; set; }
        public DateTime? VisitDate { get; set; }
        public int? NurseId { get; set; }
        public double Temprature { get; set; }
        public double BloodPressure { get; set; }
        public double HeartRate { get; set; }
        public double RespiratyRate { get; set; }
        public double Weight { get; set; }
        public string? Notes { get; set; }
    }
}