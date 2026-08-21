using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.Consultation_M
{
    public class MedicalHistory
        {
            [Key]
            public int MedicalHistoryID { get; set; }

            public int PatientID { get; set; }

            [ForeignKey(nameof(PatientID))]
            public Patient? Patient { get; set; }

            public string ConditionName { get; set; } = "";

            public DateTime? DiagnosedDate { get; set; }

            public string? Status { get; set; }

            public string? Treatment { get; set; }

            public string? Notes { get; set; }
        }
}