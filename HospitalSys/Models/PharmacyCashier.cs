using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models
{
    public class PharmacyCashier
    {
        [Key]
        public int PharmacyCashierID {get;set;}
        public int UserID {get;set;}
        public Users? Users {get;set;}
        public int BranchPharmacyID {get;set;}
        public BranchPharmacy? BranchPharmacy {get;set;}
    }
}