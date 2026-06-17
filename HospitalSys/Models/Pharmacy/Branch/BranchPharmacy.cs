using HospitalSys.Models.Pharmacy.AidStore;
using HospitalSys.Models.Pharmacy.CentralStore;
using HospitalSys.Models.Pharmacy.Common;

namespace HospitalSys.Models.Pharmacy.Branch
{
    public class BranchPharmacy
    {
        
        public List<DispenseMedicine> DispenseMedicine {get;set;} = new();
        public List<Pharmacist> Pharmacist {get;set;} = new();
        public List<PharmacyCashier> PharmacyCashier {get;set;} = new();
        public List<Prescription> Prescription {get;set;} = new();
        public List<CentralStoreRequest> CentralStoreRequest {get;set;} = new();
        public List<CentralStoreTransfer> CentralStoreTransfer {get;set;} = new();
        public List<AidStoreRequest> AidStoreRequest {get;set;} = new();
        public List<AidStoreTransfer> AidStoreTransfer {get;set;} = new();

    }
}