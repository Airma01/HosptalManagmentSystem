using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.ReferralManagement
{
    public enum AmbulanceRequestStatus
    {
        Requested,
        Approved,
        Dispatched,
        Arrived,
        PatientPickedUp,
        Completed,
        Cancelled
    }

    public class AmbulanceRequest
    {
        [Key]
        public int AmbulanceRequestID { get; set; }

        public int ReferralID { get; set; }

        [ForeignKey(nameof(ReferralID))]
        public Referral? Referral { get; set; }

        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        public string? PickupLocation { get; set; }

        public string? Destination { get; set; }

        public string? Reason { get; set; }

        public string? PatientCondition { get; set; }

        public bool RequiresOxygen { get; set; }

        public bool RequiresMedicalStaff { get; set; }

        public string? SpecialRequirements { get; set; }

        public string? AmbulanceNumber { get; set; }

        public string? DriverName { get; set; }

        public string? StaffName { get; set; }

        public AmbulanceRequestStatus Status { get; set; }
            = AmbulanceRequestStatus.Requested;

        public DateTime? DispatchTime { get; set; }

        public DateTime? PickupTime { get; set; }

        public DateTime? ArrivalTime { get; set; }

        public string? Notes { get; set; }

        public int? RequestedByUserID { get; set; }
    }
}