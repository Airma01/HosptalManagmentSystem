namespace HospitalSys.Dto
{
    public class TriageDto
    {
        public int VisitID {get;set;}
        public int NurseID {get;set;}
        public int TriageDepartmentID {get;set;}
        public int ClinicalDepartmentID {get;set;}
        public double Temprature {get;set;}
        public double BloodPressure {get;set;}
        public double HeartRate {get;set;}
        public double RespiratotyRate {get;set;}
        public double Weight {get;set;}
        public string Notes {get;set;} = "";
        
    }

    public class AssignDepartmentDto
        {
            public int TriageId { get; set; }
            public int ClinicalDepartmentId { get; set; }
        }
    public class CreateTriageDepartmentDto
{
    public string DepartmentName { get; set; } = "";
    public string Description { get; set; } = "";
}
}