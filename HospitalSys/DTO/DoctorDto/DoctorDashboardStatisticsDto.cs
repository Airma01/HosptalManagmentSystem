using System.Collections.Generic;

namespace HospitalSys.Dto.DoctorDtos
{
    public class DoctorDashboardStatisticsDto
    {
        public string Range { get; set; } = "all";
        public int TotalPatients { get; set; }
        public int TotalVisits { get; set; }
        public int CompletedVisits { get; set; }
        public int ActiveVisits { get; set; }
        public int TotalConsultations { get; set; }
        public int TotalDiagnoses { get; set; }
        public int LaboratoryRequests { get; set; }
        public int RadiologyRequests { get; set; }
        public int Prescriptions { get; set; }
        public int AdultCareRecords { get; set; }
        public int MaternalChildHealthRecords { get; set; }
        public int ChildHealthRecords { get; set; }

        public List<NameCountDto> VisitStatus { get; set; } = new();
        public List<NameCountDto> GenderStatistics { get; set; } = new();
        public List<NameCountDto> AgeGroupStatistics { get; set; } = new();
        public List<NameCountDto> ClinicalServiceStatistics { get; set; } = new();
        public List<NameCountDto> DiagnosisStatistics { get; set; } = new();
    }

    public class NameCountDto
    {
        public string Name { get; set; } = "";
        public int Count { get; set; }
    }
}
