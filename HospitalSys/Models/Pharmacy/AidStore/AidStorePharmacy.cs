using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStorePharmacy
    {
        [Key]
        public int AidPharmacyID {get;set;}
        public string Name {get;set;} = "";
        public string Location {get;set;} = "";
       

        public List<AidStoreInventory> AidStoreInventory {get;set;} = new();
        public List<AidStoreTransfer> AidStoreTransfer {get;set;} = new();
        public List<AidStoreManager> AidStoreManager {get;set;} = new();
    }
}