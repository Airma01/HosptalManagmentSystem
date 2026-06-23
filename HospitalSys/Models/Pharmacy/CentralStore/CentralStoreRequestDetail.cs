using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.CentralStore
{
    public class CentralStoreRequestDetail
    {
        [Key]
        public int CentralRequestDetailID {get;set;}
        public int CentralRequestID {get;set;}
        [ForeignKey(nameof(CentralRequestID))]
        public CentralStoreRequest? CentralStoreRequest {get;set;}
        public int MedicineID {get;set;}
        [ForeignKey(nameof(MedicineID))]
        public Medicine? Medicine {get;set;}
        public int RequestedQuantity {get;set;}
        public int ApprovedQuantity {get;set;}
    }
}