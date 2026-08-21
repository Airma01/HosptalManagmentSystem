using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.MaternalChildHealth
{
    public class BirthPreparedness
    {
        [Key]
        public int BirthPreparednessID { get; set; }

        public int PregnancyID { get; set; }

        [ForeignKey(nameof(PregnancyID))]
        public Pregnancy? Pregnancy { get; set; }

        public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;

        public bool DeliveryFacilityIdentified { get; set; }

        public string? DeliveryFacility { get; set; }

        public bool TransportArranged { get; set; }

        public string? TransportPlan { get; set; }

        public bool BirthCompanionIdentified { get; set; }

        public bool EmergencyContactIdentified { get; set; }

        public bool FinancialPreparation { get; set; }

        public bool BloodDonorIdentified { get; set; }

        public string? EmergencyPlan { get; set; }

        public string? CounselingProvided { get; set; }

        public string? Notes { get; set; }

        public int? PreparedByUserID { get; set; }
    }
}