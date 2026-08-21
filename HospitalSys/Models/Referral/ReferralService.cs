using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.ReferralManagement
{
    public class ReferralService
    {
        [Key]
        public int ReferralServiceID { get; set; }

        public int ReferralID { get; set; }

        [ForeignKey(nameof(ReferralID))]
        public Referral? Referral { get; set; }

        public string ServiceName { get; set; } = "";

        public string? ServiceDescription { get; set; }

        public string? DepartmentName { get; set; }

        public string? Priority { get; set; }

        public string Status { get; set; } = "Requested";

        public string? Notes { get; set; }
    }
}