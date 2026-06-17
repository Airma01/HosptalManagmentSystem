using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreTransferDetail
    {
     [Key]
     public int AidTransferDetailID {get;set;}
     public int AidTransferID {get;set;}
     public AidStoreTransfer? AidStoreTransfer {get;set;}
     public int MedicineID {get;set;}
     public Medicine? Medicine {get;set;}
     public int  QuantityTransferred {get;set;}
    }
}