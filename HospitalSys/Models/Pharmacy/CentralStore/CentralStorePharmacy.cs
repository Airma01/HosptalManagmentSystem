using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
    public class CentralStorePharmacy
    {
        [Key]
        public int CentralPharmacyID {get;set;}
        public string Name {get;set;} = "";
        public string Location {get;set;} = "";
        public int ManagerPharmacistID {get;set;}
        public Users? Users {get;set;}

        public List<CentralStoreInventory> CentralStoreInventory {get;set;} = new();
        public List<CentralStoreTransfer> CentralStoreTransfer {get;set;} = new();

    }
}