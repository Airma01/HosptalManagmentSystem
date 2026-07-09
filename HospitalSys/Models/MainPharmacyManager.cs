using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.AidStore;
using HospitalSys.Models.Pharmacy.CentralStore;

namespace HospitalSys.Models
{
    public class MainPharmacyManager
    {
        [Key]
       public int ManagerID {get;set;}
       public int UserID {get;set;}
       [ForeignKey(nameof(UserID))]
       public Users? Users {get;set;}

       public List<CentralStoreManager> CentralStoreManager {get;set;} = new();
       public List<AidStoreManager> AidStoreManager {get;set;} = new();
    }
}