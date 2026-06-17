using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.HospitalStruct
{
    public class Bed
    {
        public int BedID {get;set;}
        public int RoomID {get;set;}
        public Room? Room {get;set;}
        [MaxLength(200)]
        public string BedNumber {get;set;} = "";

        public string Status {get;set;} = "";
    }
}