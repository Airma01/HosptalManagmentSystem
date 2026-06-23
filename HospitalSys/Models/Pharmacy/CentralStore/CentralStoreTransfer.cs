using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
    public class CentralStoreTransfer
    {
        [Key]
        public int CentralTransferID {get;set;}
        public int CentralRequestID {get;set;}
        [ForeignKey(nameof(CentralRequestID))]
        public CentralStoreRequest? CentralStoreRequest {get;set;}
        public int CentralPharmacyID {get;set;}
        [ForeignKey(nameof(CentralPharmacyID))]
        public CentralStorePharmacy? CentralStorePharmacy {get;set;}
        public int BranchPharmacyID {get;set;}
        [ForeignKey(nameof(BranchPharmacyID))]
        public BranchPharmacy? BranchPharmacy {get;set;}
        public DateTime TransferDate {get;set;}
        public string Status {get;set;} = "";

        public List<CentralStoreTransferDetail> CentralStoreTransferDetail {get;set;} =new();
    }
}