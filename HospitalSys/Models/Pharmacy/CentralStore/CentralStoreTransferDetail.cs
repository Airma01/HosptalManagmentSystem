using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
    public class CentralStoreTransferDetail
    {
     [Key]
     public int CentralTransferDetailID {get;set;}
     public int CentralTransferID {get;set;}
     [ForeignKey(nameof(CentralTransferID))]
     public CentralStoreTransfer? CentralStoreTransfer {get;set;}
     public int MedicineID {get;set;}
     [ForeignKey(nameof(MedicineID))]
     public Medicine? Medicine {get;set;}
     public int  QuantityTransferred {get;set;}
    }
}