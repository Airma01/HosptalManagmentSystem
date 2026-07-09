using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
 public class CentralStoreManager
 {
    [Key]
    public int CentralStoreManagerID {get;set;}
    [Required]
    public int CentralPharmacyID {get;set;}
    [ForeignKey(nameof(CentralPharmacyID))]
    public CentralStorePharmacy? CentralStorePharmacy{get;set;}
    [Required]
    public int ManagerID {get;set;}
    [ForeignKey(nameof(ManagerID))]
    public MainPharmacyManager? MainPharmacyManager {get;set;}
    public bool IsCurrent {get;set;} //it's explain if he former manager or 
    public bool IsActive {get;set;} = true;

    public List<CentralStoreTransfer> CentralStoreTransfer {get;set;} = new();

 }   
}