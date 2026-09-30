
using System.Security.Claims;
using HospitalSys.Dto.AI;
using HospitalSys.Services.AI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalSys.Controllers.Doctor
{
    /// <summary>
    /// AI Clinical Assistant endpoints for authorized doctors.
    /// Reuses JWT cookie auth and Doctor role. Never exposes API key to clients.
    /// Does not auto-write diagnoses, prescriptions, or visit status.
    /// </summary>
    [ApiController]
    [Route("api/doctor/ai")]
    [Authorize(Roles = "Doctor")]
    public class DoctorAIController : ControllerBase
    {
        private readonly IClinicalContextService _contextService;
        private readonly IGeminiAIService _gemini;
        private readonly ILogger<DoctorAIController> _logger;

        public DoctorAIController(
            IClinicalContextService contextService,
            IGeminiAIService gemini,
            ILogger<DoctorAIController> logger)
        {
            _contextService = contextService;
            _gemini = gemini;
            _logger = logger;
        }

        private int GetDoctorId()
        {
            var claim = User.FindFirst("DoctorID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid doctor authentication");
            return id;
        }

        private int GetDepartmentId()
        {
            var claim = User.FindFirst("DepartmentID")?.Value;
            if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out int id))
                throw new UnauthorizedAccessException("Invalid department claim");
            return id;
        }

        /// <summary>POST /api/doctor/ai/chat</summary>
        [HttpPost("chat")]
        public async Task<ActionResult<AIChatResponseDto>> Chat([FromBody] AIChatRequestDto request, CancellationToken ct)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!_gemini.IsConfigured)
                return StatusCode(503, new { message = "Gemini AI is not configured. Set GeminiAI:ApiKey or GEMINI_API_KEY." });

            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var ctx = await _contextService.BuildContextAsync(
                    doctorId, departmentId, request.PatientId, request.VisitId, request.Module, ct);

                if (ctx == null)
                    return NotFound(new { message = "Patient or visit not found." });

                var prompt = AIPromptBuilder.BuildChatPrompt(ctx, request.Question);
                var answer = await _gemini.GenerateAsync(AIPromptBuilder.ClinicalDisclaimer, prompt, ct);

                _logger.LogInformation("AI chat used by DoctorID={DoctorId} PatientID={PatientId} VisitID={VisitId} Module={Module}",
                    doctorId, request.PatientId, request.VisitId, ctx.Module);

                return Ok(new AIChatResponseDto
                {
                    Answer = answer,
                    Module = ctx.Module,
                    PatientId = request.PatientId,
                    VisitId = request.VisitId
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (TimeoutException ex)
            {
                return StatusCode(504, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(502, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI chat failed");
                return StatusCode(500, new { message = "AI service error." });
            }
        }

        /// <summary>POST /api/doctor/ai/patient-summary</summary>
        [HttpPost("patient-summary")]
        public async Task<ActionResult<AIPatientSummaryResponseDto>> PatientSummary(
            [FromBody] AIPatientSummaryRequestDto request, CancellationToken ct)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!_gemini.IsConfigured)
                return StatusCode(503, new { message = "Gemini AI is not configured. Set GeminiAI:ApiKey or GEMINI_API_KEY." });

            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var ctx = await _contextService.BuildContextAsync(
                    doctorId, departmentId, request.PatientId, request.VisitId, request.Module, ct);

                if (ctx == null)
                    return NotFound(new { message = "Patient or visit not found." });

                var prompt = AIPromptBuilder.BuildPatientSummaryPrompt(ctx);
                var summary = await _gemini.GenerateAsync(AIPromptBuilder.ClinicalDisclaimer, prompt, ct);

                _logger.LogInformation("AI patient-summary DoctorID={DoctorId} PatientID={PatientId} VisitID={VisitId}",
                    doctorId, request.PatientId, request.VisitId);

                return Ok(new AIPatientSummaryResponseDto
                {
                    Summary = summary,
                    Module = ctx.Module,
                    PatientId = request.PatientId,
                    VisitId = request.VisitId
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (TimeoutException ex)
            {
                return StatusCode(504, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(502, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI patient-summary failed");
                return StatusCode(500, new { message = "AI service error." });
            }
        }

        /// <summary>POST /api/doctor/ai/lab-explanation</summary>
        [HttpPost("lab-explanation")]
        public async Task<ActionResult<AIChatResponseDto>> LabExplanation(
            [FromBody] AILabExplanationRequestDto request, CancellationToken ct)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!_gemini.IsConfigured)
                return StatusCode(503, new { message = "Gemini AI is not configured. Set GeminiAI:ApiKey or GEMINI_API_KEY." });

            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var ctx = await _contextService.BuildLabContextAsync(
                    doctorId, departmentId, request.PatientId, request.VisitId, request.LaboratoryResultIds, ct);

                if (ctx == null)
                    return NotFound(new { message = "Patient or visit not found." });

                var prompt = AIPromptBuilder.BuildLabExplanationPrompt(ctx);
                var answer = await _gemini.GenerateAsync(AIPromptBuilder.ClinicalDisclaimer, prompt, ct);

                _logger.LogInformation("AI lab-explanation DoctorID={DoctorId} PatientID={PatientId}",
                    doctorId, request.PatientId);

                return Ok(new AIChatResponseDto
                {
                    Answer = answer,
                    Module = ctx.Module,
                    PatientId = request.PatientId,
                    VisitId = request.VisitId
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (TimeoutException ex)
            {
                return StatusCode(504, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(502, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI lab-explanation failed");
                return StatusCode(500, new { message = "AI service error." });
            }
        }

        /// <summary>POST /api/doctor/ai/clinical-record-summary</summary>
        [HttpPost("clinical-record-summary")]
        public async Task<ActionResult<AIChatResponseDto>> ClinicalRecordSummary(
            [FromBody] AIClinicalRecordSummaryRequestDto request, CancellationToken ct)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (!_gemini.IsConfigured)
                return StatusCode(503, new { message = "Gemini AI is not configured. Set GeminiAI:ApiKey or GEMINI_API_KEY." });

            try
            {
                int doctorId = GetDoctorId();
                int departmentId = GetDepartmentId();

                var ctx = await _contextService.BuildContextAsync(
                    doctorId, departmentId, request.PatientId, request.VisitId, request.Module, ct);

                if (ctx == null)
                    return NotFound(new { message = "Patient or visit not found." });

                var prompt = AIPromptBuilder.BuildClinicalRecordSummaryPrompt(ctx);
                var answer = await _gemini.GenerateAsync(AIPromptBuilder.ClinicalDisclaimer, prompt, ct);

                return Ok(new AIChatResponseDto
                {
                    Answer = answer,
                    Module = ctx.Module,
                    PatientId = request.PatientId,
                    VisitId = request.VisitId
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (TimeoutException ex)
            {
                return StatusCode(504, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return StatusCode(502, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI clinical-record-summary failed");
                return StatusCode(500, new { message = "AI service error." });
            }
        }
    }
}