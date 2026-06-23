using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Pharmacy.Common
{
    public class DispenseMedicineDetail
    {
        [Key]
        public int DispenseDetailID {get;set;}
        public int DispenseID {get;set;}
        [ForeignKey(nameof(DispenseID))]
        public DispenseMedicine? DispenseMedicine {get;set;}
        public int MedicineID {get;set;}
        [ForeignKey(nameof(MedicineID))]
        public Medicine? Medicine {get;set;}
        public float QuantityDispenced {get;set;}
    }
}