using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreInventory
    {
        [Key]
        public int AidInventoryID {get;set;}
        public int AidPharmacyID {get;set;}
        [ForeignKey(nameof(AidPharmacyID))]
        public AidStorePharmacy? AidStorePharmacy {get;set;}
        public int MedicineID {get;set;}
        [ForeignKey(nameof(MedicineID))]
        public Medicine? Medicine {get;set;}
        public float QuantityAvailable {get;set;}
        public DateTime ExpiryDate {get;set;}
        public string BatchNumber {get;set;} = "";
    }
}