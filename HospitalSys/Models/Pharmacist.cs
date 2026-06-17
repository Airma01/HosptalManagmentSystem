using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.AidStore;
using HospitalSys.Models.Pharmacy.Branch;
using HospitalSys.Models.Pharmacy.CentralStore;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models
{
    public class Pharmacist
    {
        [Key]
        public int PharmacistID {get;set;}
        public int UserID {get;set;}
        public Users? Users {get;set;}
        public int BranchPharmacyID {get;set;}
        public BranchPharmacy? BranchPharmacy {get;set;}
        public List<DispenseMedicine> DispenseMedicine {get;set;} = new();
        public List<CentralStoreRequest> CentralStoreRequest {get;set;} = new();
        public List<AidStoreRequest> AidStoreRequest {get;set;} = new();
    }
}