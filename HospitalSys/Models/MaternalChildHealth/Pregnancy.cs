using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.MaternalChildHealth
{
    public enum PregnancyStatus
    {
        Active,
        Delivered,
        Miscarriage,
        Abortion,
        Stillbirth,
        Terminated,
        Unknown
    }

    public class Pregnancy
    {
        [Key]
        public int PregnancyID { get; set; }

        public int PatientID { get; set; }

        [ForeignKey(nameof(PatientID))]
        public Patient? Patient { get; set; }

        public DateTime? LastMenstrualPeriod { get; set; }

        public DateTime? ExpectedDeliveryDate { get; set; }

        public int? Gravida { get; set; }

        public int? Para { get; set; }

        public int? Abortions { get; set; }

        public int? LivingChildren { get; set; }

        public PregnancyStatus Status { get; set; } = PregnancyStatus.Active;

        public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;

        public string? Notes { get; set; }

        public List<PregnancyRegistration> Registrations { get; set; } = new();

        public List<ANCVisit> ANCVisits { get; set; } = new();

        public List<PregnancyRiskAssessment> RiskAssessments { get; set; } = new();

        public List<PregnancyLaboratoryOrder> LaboratoryOrders { get; set; } = new();

        public List<PregnancyUltrasound> Ultrasounds { get; set; } = new();

        public List<PregnancyMedication> Medications { get; set; } = new();

        public List<BirthPreparedness> BirthPreparednessPlans { get; set; } = new();

        public List<LaborRecord> LaborRecords { get; set; } = new();

        public List<PNCVisit> PNCVisits { get; set; } = new();

        public List<FamilyPlanning> FamilyPlanningRecords { get; set; } = new();

        public List<HighRiskPregnancy> HighRiskPregnancies { get; set; } = new();
    }
}