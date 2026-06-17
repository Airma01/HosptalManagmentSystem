using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.Pharmacy.Common
{
    public class DispenseMedicineDetail
    {
        [Key]
        public int DispenseDetailID {get;set;}
        public int DispenseID {get;set;}
        public DispenseMedicine? DispenseMedicine {get;set;}
        public int MedicineID {get;set;}
        public Medicine? Medicine {get;set;}
        public float QuantityDispenced {get;set;}
    }
}