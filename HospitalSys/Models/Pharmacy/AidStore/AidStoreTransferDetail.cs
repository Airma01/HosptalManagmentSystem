using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreTransferDetail
    {
     [Key]
     public int AidTransferDetailID {get;set;}
     public int AidTransferID {get;set;}
     [ForeignKey(nameof(AidTransferID))]
     public AidStoreTransfer? AidStoreTransfer {get;set;}
     public int MedicineID {get;set;}
     [ForeignKey(nameof(MedicineID))]
     public Medicine? Medicine {get;set;}
     public int  QuantityTransferred {get;set;}
    }
}