using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
    public class CentralStoreInventory
    {
        [Key]
        public int CentralInventoryID {get;set;}
        public int CentralPharmacyID {get;set;}
        public CentralStorePharmacy? CentralStorePharmacy {get;set;}
        public int MedicineID {get;set;}
        public Medicine? Medicine {get;set;}
        public float QuantityAvailable {get;set;}
        public DateTime ExpiryDate {get;set;}
        public string BatchNumber {get;set;} = "";
    }
}