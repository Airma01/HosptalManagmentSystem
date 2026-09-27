namespace HospitalSys.Dto
{
    public class RegClinicalDepDto
    {
        public string DepartmentName {get;set;} = "";
        public string Description {get;set;} = "";
    }

    public class UpdateClinicalDepartmentDto
    {
        public string DepartmentName { get; set; } = "";
        public string Description { get; set; } = "";
    }
}
