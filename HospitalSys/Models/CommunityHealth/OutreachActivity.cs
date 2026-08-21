using System.ComponentModel.DataAnnotations;

namespace HospitalSys.Models.CommunityHealth
{
    public class OutreachActivity
    {
        [Key]
        public int OutreachActivityID { get; set; }

        public string ActivityName { get; set; } = "";

        public string? ActivityType { get; set; }

        public string? Description { get; set; }

        public DateTime ActivityDate { get; set; }

        public string? Location { get; set; }

        public string? TargetPopulation { get; set; }

        public int? TargetPopulationCount { get; set; }

        public int? PeopleReached { get; set; }

        public int? PeopleScreened { get; set; }

        public int? PeopleReferred { get; set; }

        public string? ServicesProvided { get; set; }

        public string? Outcome { get; set; }

        public string? Notes { get; set; }

        public int? OrganizedByUserID { get; set; }

        public string Status { get; set; } = "Planned";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}