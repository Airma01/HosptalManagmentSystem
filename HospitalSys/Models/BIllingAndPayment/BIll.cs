using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.PatientManagment;

namespace HospitalSys.Models.BillingAndPayment
{
    public class Bill
    {
        [Key]
        public int BillID {get;set;}
        public int PatientID {get;set;}
        [ForeignKey(nameof(PatientID))]
        public Patient? Patient {get;set;}
        public int VisitID {get;set;}
        [ForeignKey(nameof(VisitID))]
        public PatientVisit? PatientVisit {get;set;}
        public int CashierID {get;set;}
        [ForeignKey(nameof(CashierID))]
        public Cashier? Cashier {get;set;}
        public double TotalAmount {get;set;}
        public DateTime BillDate {get;set;} = DateTime.UtcNow;
        public string Status {get;set;} = "";

        public List<BillItem> BillItem {get;set;} = new();
        public List<PaymentHospital> PaymentHospital {get;set;} = new();
    }
}