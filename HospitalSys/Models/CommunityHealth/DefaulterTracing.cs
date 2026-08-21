using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.CommunityHealth
{
    public class DefaulterTracing
    {
        [Key]
        public int DefaulterTracingID { get; set; }

        public int? PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int? HouseholdID { get; set; }

        [ForeignKey(nameof(HouseholdID))]
        public Household? Household { get; set; }

        public string ServiceType { get; set; } = "";

        public DateTime? ExpectedDate { get; set; }

        public DateTime? IdentificationDate { get; set; }

        public string? ReasonForDefaulting { get; set; }

        public string? ContactMethod { get; set; }

        public string? ContactResult { get; set; }

        public string? TracingOutcome { get; set; }

        public string? ActionTaken { get; set; }

        public DateTime? TracingDate { get; set; }

        public DateTime? NextFollowUpDate { get; set; }

        public string Status { get; set; } = "Pending";

        public int? HealthWorkerID { get; set; }

        public string? Notes { get; set; }
    }
}