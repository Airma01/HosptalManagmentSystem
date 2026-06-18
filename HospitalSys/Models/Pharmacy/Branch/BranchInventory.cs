using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.Branch
{
    public class BranchInventory
    {
        [Key]
        public int BranchInventoryID {get;set;}
        public int BranchPharmacyID {get;set;}
        public BranchPharmacy? BranchPharmacy {get;set;}
        public int MedicineID {get;set;}
        public Medicine? Medicine {get;set;}
        public int QuantityAvailable {get;set;}
        public DateTime ExpiryDate {get;set;}
        public string BatchNumber {get;set;} = "";
    }
}