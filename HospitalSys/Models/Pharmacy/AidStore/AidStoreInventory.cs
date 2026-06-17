using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreInventory
    {
        [Key]
        public int AidInventoryID {get;set;}
        public int AidPharmacyID {get;set;}
        public AidStorePharmacy? AidStorePharmacy {get;set;}
        public int MedicineID {get;set;}
        public Medicine? Medicine {get;set;}
        public float QuantityAvailable {get;set;}
        public DateTime ExpiryDate {get;set;}
        public string BatchNumber {get;set;} = "";
    }
}