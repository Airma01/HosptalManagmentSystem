using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class FamilyPlanning
    {
        [Key]
        public int FamilyPlanningID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public int? PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public DateTime VisitDate { get; set; } = DateTime.UtcNow;

        public string? Method { get; set; }

        public string? MethodType { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? DiscontinuationDate { get; set; }

        public string? ReasonForDiscontinuation { get; set; }

        public string? CounselingProvided { get; set; }

        public string? SideEffects { get; set; }

        public string? Notes { get; set; }

        public int? ProvidedByUserID { get; set; }
    }
}