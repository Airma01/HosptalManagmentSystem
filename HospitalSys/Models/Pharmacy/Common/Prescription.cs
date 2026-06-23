using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.BillingAndPayment;
using HospitalSys.Models.Consultation_M;
using HospitalSys.Models.PatientManagment;
using HospitalSys.Models.Pharmacy.Branch;

namespace HospitalSys.Models.Pharmacy.Common
{
    public class Prescription
    {
       [Key]
       public int PrescriptionID {get;set;} 
       public int ConsultationID {get;set;}
       [ForeignKey(nameof(ConsultationID))]
       public Consultation? Consultation {get;set;}
       public int DoctorID {get;set;}
       [ForeignKey(nameof(DoctorID))]
       public Doctor? Doctor {get;set;}
       public int PatientID {get;set;}
       [ForeignKey(nameof(PatientID))]
       public Patient? Patient {get;set;}
       public int BranchPharmacyID {get;set;}
       [ForeignKey(nameof(BranchPharmacyID))]
       public BranchPharmacy? BranchPharmacy {get;set;}
       public DateTime PrescriptionDate {get;set;} = DateTime.UtcNow;

       public List<PrescriptionDetail> PrescriptionDetail {get;set;} = new();
       public List<DispenseMedicine> DispenseMedicine {get;set;} = new();
       public List<PharmacyPayment> PharmacyPayment {get;set;} = new();
    }
}