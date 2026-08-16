using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models.Pharmacy.CentralStore
{

    public enum RequestStatus
        {
            Pending = 1,
            Approved = 2,
            PartiallyApproved = 3,
            Rejected = 4,
            InTransit = 5,
            Received = 6,
            Closed = 7,
            Cancelled = 8
        }
        public class CentralStoreRequest
        {
            [Key]
            public int CentralRequestID { get; set; }
            public int BranchPharmacyID { get; set; }
            [ForeignKey(nameof(BranchPharmacyID))]
            public BranchPharmacy? BranchPharmacy { get; set; }
            public int RequestedByPharmacistID { get; set; }
            [ForeignKey(nameof(RequestedByPharmacistID))]
            public Pharmacist? Pharmacist { get; set; }
            public DateTime RequestDate { get; set; }
            public string Status { get; set; } = "";
            public int? ApprovedByManagerID { get; set; }
            public DateTime? ApprovalDate { get; set; }
            public string? RejectionReason { get; set; }

            public List<CentralStoreRequestDetail> CentralStoreRequestDetail { get; set; } = new();
            public List<CentralStoreTransfer> CentralStoreTransfer { get; set; } = new();
        }
}