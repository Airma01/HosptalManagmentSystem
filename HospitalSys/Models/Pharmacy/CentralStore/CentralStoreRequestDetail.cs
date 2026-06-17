using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
    public class CentralStoreRequestDetail
    {
        [Key]
        public int CentralRequestDetailID {get;set;}
        public int CentralRequestID {get;set;}
        public CentralStoreRequest? CentralStoreRequest {get;set;}
        public int MedicineID {get;set;}
        public Medicine? Medicine {get;set;}
        public int RequestedQuantity {get;set;}
        public int ApprovedQuantity {get;set;}
    }
}