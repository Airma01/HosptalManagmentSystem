using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class PregnancyMedication
    {
        [Key]
        public int PregnancyMedicationID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public int MedicineID { get; set; }

        [ForeignKey(nameof(MedicineID))]
        public Medicine? Medicine { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string Dosage { get; set; } = "";

        public string Frequency { get; set; } = "";

        public string Route { get; set; } = "";

        public string? Indication { get; set; }

        public string Status { get; set; } = "Active";

        public int? PrescribedByUserID { get; set; }

        public string? Notes { get; set; }
    }
}