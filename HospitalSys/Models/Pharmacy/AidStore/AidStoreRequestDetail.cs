using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreRequestDetail
    {
        [Key]
        public int AidRequestDetailID {get;set;}
        public int AidRequestID {get;set;}
        public AidStoreRequest? AidStoreRequest {get;set;}
        public int MedicineID {get;set;}
        public Medicine? Medicine {get;set;}
        public int RequestedQuantity {get;set;}
        public int ApprovedQuantity {get;set;}
    }
}