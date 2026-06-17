using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreRequest
    {
        [Key]
        public int AidRequestID {get;set;}
        public int BranchPharmacyID {get;set;}
        public BranchPharmacy? BranchPharmacy {get;set;}
        public int RequestedByPharmacistID {get;set;}
        public Pharmacist? Pharmacist {get;set;}
        public DateTime RequestDate {get;set;}
        public string Status {get;set;} = "";

        public List<AidStoreRequestDetail> AidStoreRequestDetail {get;set;} = new();
        public List<AidStoreTransfer> AidStoreTransfer {get;set;} = new();
    
    }
}