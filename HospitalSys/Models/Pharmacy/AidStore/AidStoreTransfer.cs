using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreTransfer
    {
        [Key]
        public int AidTransferID {get;set;}
        public int AidRequestID {get;set;}
        public AidStoreRequest? AidStoreRequest {get;set;}
        public int AidPharmacyID {get;set;}
        public AidStorePharmacy? AidStorePharmacy {get;set;}
        public int BranchPharmacyID {get;set;}
        public BranchPharmacy? BranchPharmacy {get;set;}
        public DateTime TransferDate {get;set;}
        public string Status {get;set;} = "";

        public List<AidStoreTransferDetail> CentralStoreTransferDetail {get;set;} =new();
    }
}