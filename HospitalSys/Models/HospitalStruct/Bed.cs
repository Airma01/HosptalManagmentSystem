using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HospitalSys.Models.Inpatient;

namespace HospitalSys.Models.HospitalStruct
{
    public class Bed
    {
        [Key]
        public int BedID {get;set;}
        public int RoomID {get;set;}
        [ForeignKey(nameof(RoomID))]
        public Room? Room {get;set;}
        [MaxLength(200)]
        public string BedNumber {get;set;} = "";

        public string Status {get;set;} = "";

        public List<Admission> Admission {get;set;} = new();
    }
}