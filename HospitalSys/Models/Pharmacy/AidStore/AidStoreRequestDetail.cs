using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.AidStore
{
    public class AidStoreRequestDetail
    {
        [Key]
        public int AidRequestDetailID {get;set;}
        public int AidRequestID {get;set;}
        [ForeignKey(nameof(AidRequestID))]
        public AidStoreRequest? AidStoreRequest {get;set;}
        public int MedicineID {get;set;}
        [ForeignKey(nameof(MedicineID))]
        public Medicine? Medicine {get;set;}
        public int RequestedQuantity {get;set;}
        public int ApprovedQuantity {get;set;}
    }
}