using System.ComponentModel.DataAnnotations;
using HospitalSys.Models.Pharmacy.AidStore;
using HospitalSys.Models.Pharmacy.Branch;
using HospitalSys.Models.Pharmacy.CentralStore;

namespace HospitalSys.Models.Pharmacy.Common
{
    public class Medicine{

        [Key]
        public int MedicineID {get;set;}
        [MaxLength(200)]
        public string MedicineName {get;set;} = "";
        [MaxLength(200)]
        public string GenericName {get;set;} = "";
        public double UnitPrice {get;set;}
        [MaxLength(200)]
        public string UnitOfMeasure {get;set;} = "";
        
        public List<PrescriptionDetail> PrescriptionDetail {get;set;} = new();
        public List<DispenseMedicineDetail> DispenseMedicineDetail {get;set;} =new();
        public List<CentralStoreInventory> CentralStoreInventory {get;set;} = new();
        public List<CentralStoreRequestDetail> CentralStoreRequestDetail {get;set;} = new();
        public List<CentralStoreTransfer> CentralStoreTransfer {get;set;} = new();
        public List<AidStoreInventory> AidStoreInventory {get;set;} = new();
        public List<AidStoreRequestDetail> AidStoreRequestDetail {get;set;} = new();
        public List<BranchInventory> BranchInventory {get;set;} = new();

    }
}