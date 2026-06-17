using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
    public class CentralStoreTransferDetail
    {
     [Key]
     public int CentralTransferDetailID {get;set;}
     public int CentralTransferID {get;set;}
     public CentralStoreTransfer? CentralStoreTransfer {get;set;}
     public int MedicineID {get;set;}
     public Medicine? Medicine {get;set;}
     public int  QuantityTransferred {get;set;}
    }
}