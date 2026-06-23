using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreTransfer
    {
        [Key]
        public int AidTransferID {get;set;}
        public int AidRequestID {get;set;}
        [ForeignKey(nameof(AidRequestID))]
        public AidStoreRequest? AidStoreRequest {get;set;}
        public int AidPharmacyID {get;set;}
        [ForeignKey(nameof(AidPharmacyID))]
        public AidStorePharmacy? AidStorePharmacy {get;set;}
        public int BranchPharmacyID {get;set;}
        [ForeignKey(nameof(BranchPharmacyID))]
        public BranchPharmacy? BranchPharmacy {get;set;}
        public DateTime TransferDate {get;set;}
        public string Status {get;set;} = "";

        public List<AidStoreTransferDetail> CentralStoreTransferDetail {get;set;} =new();
    }
}