using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.BillingAndPayment;

namespace HospitalSys.Models
{
    public class Cashier
    {
        [Key]
        public int CashierID {get;set;}
        public int UserID {get;set;}
        [ForeignKey(nameof(UserID))]
        public Users? Users {get;set;}

        public List<Bill> Bill {get;set;} = new();
        public List<PaymentHospital> PaymentHospital {get;set;} = new();
    }
}