using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.CommunityHealth
{
    public class Household
    {
        [Key]
        public int HouseholdID { get; set; }

        [MaxLength(50)]
        public string HouseholdNumber { get; set; } = "";

        [MaxLength(100)]
        public string? HeadOfHousehold { get; set; }

        [MaxLength(100)]
        public string? Region { get; set; }

        [MaxLength(100)]
        public string? Zone { get; set; }

        [MaxLength(100)]
        public string? Woreda { get; set; }

        [MaxLength(100)]
        public string? Kebele { get; set; }

        [MaxLength(100)]
        public string? Village { get; set; }

        [MaxLength(200)]
        public string? Address { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public string? HouseholdType { get; set; }

        public int? NumberOfMembers { get; set; }

        public string? WaterSource { get; set; }

        public string? ToiletFacility { get; set; }

        public string? Notes { get; set; }

        public DateTime RegisteredDate { get; set; } = DateTime.UtcNow;

        public bool Active { get; set; } = true;

        public List<HouseholdMember> Members { get; set; } = new();

        public List<HomeVisit> HomeVisits { get; set; } = new();

        public List<CommunityScreening> Screenings { get; set; } = new();
    }
}