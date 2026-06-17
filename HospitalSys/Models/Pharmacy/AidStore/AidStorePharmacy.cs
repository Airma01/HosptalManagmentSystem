using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStorePharmacy
    {
        [Key]
        public int AidPharmacyID {get;set;}
        public string Name {get;set;} = "";
        public string Location {get;set;} = "";
        public int ManagerPharmacistID {get;set;}
        public Users? Users {get;set;}

        public List<AidStoreInventory> AidStoreInventory {get;set;} = new();
        public List<AidStoreTransfer> AidStoreTransfer {get;set;} = new();
    }
}