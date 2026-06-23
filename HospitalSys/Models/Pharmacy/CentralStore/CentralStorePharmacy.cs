using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
    public class CentralStorePharmacy
    {
        [Key]
        public int CentralPharmacyID {get;set;}
        public string Name {get;set;} = "";
        public string Location {get;set;} = "";
        public int ManagerPharmacistID {get;set;}
        [ForeignKey(nameof(ManagerPharmacistID))]
        public Users? Users {get;set;}

        public List<CentralStoreInventory> CentralStoreInventory {get;set;} = new();
        public List<CentralStoreTransfer> CentralStoreTransfer {get;set;} = new();

    }
}