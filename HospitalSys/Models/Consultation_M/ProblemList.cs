using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Consultation_M
{
    public class ProblemList
    {
        [Key]
        public int ProblemListID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public string ProblemName { get; set; } = "";

        public string? Code { get; set; }

        public string? CodingSystem { get; set; }

        public string Status { get; set; } = "Active";

        public DateTime? OnsetDate { get; set; }

        public DateTime? ResolvedDate { get; set; }

        public string? Notes { get; set; }
    }
}