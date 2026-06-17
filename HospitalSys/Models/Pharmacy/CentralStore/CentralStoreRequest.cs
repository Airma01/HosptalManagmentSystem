using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
    public class CentralStoreRequest
    {
        [Key]
        public int CentralRequestID {get;set;}
        public int BranchPharmacyID {get;set;}
        public BranchPharmacy? BranchPharmacy {get;set;}
        public int RequestedByPharmacistID {get;set;}
        public Pharmacist? Pharmacist {get;set;}
        public DateTime RequestDate {get;set;}
        public string Status {get;set;} = "";

        public List<CentralStoreRequestDetail> CentralStoreRequestDetail {get;set;} = new();
        public List<CentralStoreTransfer> CentralStoreTransfer {get;set;} = new();
    }
}