using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models
{
    public class Cashier
    {
        [Key]
        public int CashierID {get;set;}
        public int UserID {get;set;}
        public Users? Users {get;set;}
    }
}