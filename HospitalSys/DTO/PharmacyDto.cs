
namespace HospitalSys.Dto
{
    public class PharmacistLoginDto
    {
        public string username { get; set; } = "";
        public string Password { get; set; } = "";
    }
    public class CSMLoginDto
    {
        public string username { get; set; } = "";
        public string Password { get; set; } = "";
    }
    public class PharmacistCookieDto
{
    public string username { get; set; } = "";
    public int UserID { get; set; }
    public int PharmacistID { get; set; }
    public int BranchPharmacyID { get; set; }
    public string Fullname { get; set; } = "";
    public string RoleName { get; set; } = "";
}
    public class CSMtCookieDto
    {
        public string username {get;set;} = "";
        public string Fullname {get;set;} = "";
        public string RoleName {get;set;} = "";
        public int UserID {get;set;}
        public int ManagerID {get;set;}
    }
    public class CreateNewBranchDto
    {
        public string BranchName {get;set;} = "";
        public string Location {get;set;} = "";
    }
    public class CreateCentralPharmacyDto
    {
        public string Name {get;set;} = "";
        public string Location {get;set;} = "";
       
    }
    public class CreateAidPharmacyDto
    {
        public string Name {get;set;} = "";
        public string Location {get;set;} = "";
       
    }
    public class RegisterMedicineDto
    {
        public string MedicineName {get;set;} = "";
        public string GenericName {get;set;} = "";
        public decimal UnitPrice {get;set;}
        public string UnitOfMeasure {get;set;} = "";
    }
    public class AddToCentralInventoryDto
    {
        public int CentralPharmacyID {get;set;}
        public int MedicineID {get;set;}       
        public float QuantityAvailable {get;set;}
        public DateTime ExpiryDate {get;set;}
        public string BatchNumber {get;set;} = "";
    }
    public class AddToAidInventoryDto
    {
        public int AidPharmacyID {get;set;} 
        public int MedicineID {get;set;}
        public float QuantityAvailable {get;set;}
        public DateTime ExpiryDate {get;set;}
        public string BatchNumber {get;set;} = "";   
    }

    public class RegisterPharmacistDto
    {
        public int UserID {get;set;}   
        public int BranchPharmacyID {get;set;}

    }
    public class RegisterMainPharmacyMangerDto
    {
            public int UserID {get;set;}
    }
   public class RegisterCentralStoreManagerDto
{
    public int CentralPharmacyID { get; set; }
    public int ManagerID { get; set; }
    public bool IsCurrent { get; set; }
}
    public class RegisterAidStoreManagerDto
    {
        public int AidPharmacyID {get;set;}
        public int ManagerID {get;set;}   
        public bool IsCurrent {get;set;} //it's explain if he former manager or 

    }
}