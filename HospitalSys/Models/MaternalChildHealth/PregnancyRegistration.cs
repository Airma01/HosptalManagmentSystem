using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class PregnancyRegistration
    {
        [Key]
        public int PregnancyRegistrationID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

        public int? GestationalAgeWeeks { get; set; }

        public string? RegistrationReason { get; set; }

        public string? PreviousPregnancyHistory { get; set; }

        public string? CurrentPregnancyHistory { get; set; }

        public string? Notes { get; set; }

        public int? RecordedByUserID { get; set; }
    }
}