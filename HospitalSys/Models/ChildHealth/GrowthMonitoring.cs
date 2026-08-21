using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.ChildHealth
{
    public class GrowthMonitoring
    {
        [Key]
        public int GrowthMonitoringID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int? PatientVisitID { get; set; }

        [ForeignKey(nameof(PatientVisitID))]
        public PatientVisit? PatientVisit { get; set; }

        public DateTime MeasurementDate { get; set; } = DateTime.UtcNow;

        public int? AgeInMonths { get; set; }

        public decimal? WeightKg { get; set; }

        public decimal? HeightCm { get; set; }

        public decimal? LengthCm { get; set; }

        public decimal? HeadCircumferenceCm { get; set; }

        public decimal? MUACCm { get; set; }

        public decimal? BMI { get; set; }

        public decimal? WeightForAge { get; set; }

        public decimal? HeightForAge { get; set; }

        public decimal? WeightForHeight { get; set; }

        public string? GrowthStatus { get; set; }

        public string? GrowthInterpretation { get; set; }

        public string? CounselingProvided { get; set; }

        public string? ActionTaken { get; set; }

        public string? Notes { get; set; }

        public int? RecordedByUserID { get; set; }
    }
}