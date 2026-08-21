using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.MaternalChildHealth
{
    public enum DeliveryMode
    {
        NormalVaginalDelivery,
        AssistedVaginalDelivery,
        CesareanSection,
        Other
    }

    public class Delivery
    {
        [Key]
        public int DeliveryID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public int? LaborRecordID { get; set; }

        [ForeignKey(nameof(LaborRecordID))]
        public LaborRecord? LaborRecord { get; set; }

        public DateTime DeliveryDate { get; set; }

        public DeliveryMode DeliveryMode { get; set; }

        public string? DeliveryLocation { get; set; }

        public int? NumberOfBabies { get; set; }

        public string? MaternalCondition { get; set; }

        public string? PlacentaCondition { get; set; }

        public string? BloodLoss { get; set; }

        public string? DeliveryNotes { get; set; }

        public int? RecordedByUserID { get; set; }

        public List<DeliveryComplication> Complications { get; set; } = new();

        public List<ChildBirth> ChildBirths { get; set; } = new();
    }
}