using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HospitalSys.Models.Pharmacy.Common
{
    public class PrescriptionDetail
    {
        [Key]
        public int PrescriptionDetailID {get;set;}
        public int PrescriptionID {get;set;}
        [ForeignKey(nameof(PrescriptionID))]
        public Prescription? Prescription {get;set;}
        public int MedicineID {get;set;}
        [ForeignKey(nameof(MedicineID))]
        public Medicine? Medicine {get;set;}
        public string Dosage {get;set;} = "";
        public decimal Frequency {get;set;}
        public decimal Duration {get;set;}
        public decimal Quantity {get;set;}
    }
}