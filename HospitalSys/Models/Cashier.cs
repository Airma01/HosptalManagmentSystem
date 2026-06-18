using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.BillingAndPayment;

namespace HospitalSys.Models
{
    public class Cashier
    {
        [Key]
        public int CashierID {get;set;}
        public int UserID {get;set;}
        public Users? Users {get;set;}

        public List<Bill> Bill {get;set;} = new();
        public List<PaymentHospital> PaymentHospital {get;set;} = new();
    }
}