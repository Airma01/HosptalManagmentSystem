using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreManager
    {
        [Key]
        public int AidStoreManagerID {get;set;}
        public int AidPharmacyID {get;set;}
        [ForeignKey(nameof(AidPharmacyID))]
        public AidStorePharmacy? AidStorePharmacy {get;set;}
        public int ManagerID {get;set;}
        [ForeignKey(nameof(ManagerID))]
        public MainPharmacyManager? MainPharmacyManager {get;set;}      
        public bool IsCurrent {get;set;} //it's explain if he former manager or 
        public bool IsActive {get;set;} = true;

        public List<AidStoreTransfer> AidStoreTransfer {get;set;} = new();
    }
}