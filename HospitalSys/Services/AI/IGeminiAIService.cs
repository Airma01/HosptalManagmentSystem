using HospitalSys.Dto.AI;

namespace HospitalSys.Services.AI
{
    public interface IGeminiAIService
    {
        Task<string> GenerateAsync(string systemInstruction, string userPrompt, CancellationToken ct = default);
        bool IsConfigured { get; }
    }
}
