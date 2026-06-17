using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.Pharmacy.Common
{
    public class PrescriptionDetail
    {
        [Key]
        public int PrescriptionDetailID {get;set;}
        public int PrescriptionID {get;set;}
        public Prescription? Prescription {get;set;}
        public int MedicineID {get;set;}
        public Medicine? Medicine {get;set;}
        public string Dosage {get;set;} = "";
        public float Frequency {get;set;}
        public float Duration {get;set;}
        public float Quantity {get;set;}
    }
}