using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using HospitalSys.Configuration;
using Microsoft.Extensions.Options;

namespace HospitalSys.Services.AI
{
    public class GeminiAIService : IGeminiAIService
    {
        private readonly HttpClient _http;
        private readonly GeminiAIOptions _options;
        private readonly ILogger<GeminiAIService> _logger;

        public bool IsConfigured => !string.IsNullOrWhiteSpace(_options.ApiKey);

        public GeminiAIService(HttpClient http, IOptions<GeminiAIOptions> options, ILogger<GeminiAIService> logger)
        {
            _http = http;
            _options = options.Value;
            _logger = logger;
            _http.Timeout = TimeSpan.FromSeconds(Math.Max(10, _options.TimeoutSeconds));
        }

        public async Task<string> GenerateAsync(string systemInstruction, string userPrompt, CancellationToken ct = default)
        {
            if (!IsConfigured)
                throw new InvalidOperationException(
                    "Gemini API key is not configured. Set GeminiAI:ApiKey or environment variable GEMINI_API_KEY.");

            var model = string.IsNullOrWhiteSpace(_options.Model) ? "gemini-1.5-flash" : _options.Model;
            var url = $"{_options.BaseUrl.TrimEnd('/')}/models/{model}:generateContent?key={Uri.EscapeDataString(_options.ApiKey)}";

            var payload = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemInstruction } }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = userPrompt } }
                    }
                },
                generationConfig = new
                {
                    temperature = _options.Temperature,
                    maxOutputTokens = _options.MaxOutputTokens
                },
                safetySettings = new[]
                {
                    new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_ONLY_HIGH" },
                    new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_ONLY_HIGH" },
                    new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_ONLY_HIGH" },
                    new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_ONLY_HIGH" }
                }
            };

            using var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            using var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            HttpResponseMessage response;
            try
            {
                response = await _http.SendAsync(request, ct);
            }
            catch (TaskCanceledException) when (!ct.IsCancellationRequested)
            {
                _logger.LogWarning("Gemini API request timed out");
                throw new TimeoutException("Gemini API request timed out. Try again or increase GeminiAI:TimeoutSeconds.");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Gemini API network failure");
                throw new InvalidOperationException("Unable to reach Gemini API. Check network connectivity.", ex);
            }

            var body = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Gemini API error {Status}: {Body}", (int)response.StatusCode, Truncate(body, 500));
                if ((int)response.StatusCode == 429)
                    throw new InvalidOperationException("Gemini API rate limit exceeded. Please wait and retry.");
                if ((int)response.StatusCode == 400 || (int)response.StatusCode == 401 || (int)response.StatusCode == 403)
                    throw new InvalidOperationException("Gemini API rejected the request (invalid key or model). Check configuration.");
                throw new InvalidOperationException($"Gemini API returned {(int)response.StatusCode}.");
            }

            try
            {
                using var doc = JsonDocument.Parse(body);
                var root = doc.RootElement;
                if (root.TryGetProperty("candidates", out var candidates) &&
                    candidates.GetArrayLength() > 0)
                {
                    var first = candidates[0];
                    if (first.TryGetProperty("content", out var contentEl) &&
                        contentEl.TryGetProperty("parts", out var parts) &&
                        parts.GetArrayLength() > 0 &&
                        parts[0].TryGetProperty("text", out var textEl))
                    {
                        return textEl.GetString()?.Trim() ?? string.Empty;
                    }
                }

                if (root.TryGetProperty("promptFeedback", out var feedback))
                {
                    _logger.LogWarning("Gemini prompt feedback: {Feedback}", feedback.ToString());
                    throw new InvalidOperationException("Gemini blocked or could not generate a response for this prompt.");
                }

                return string.Empty;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse Gemini response");
                throw new InvalidOperationException("Invalid response from Gemini API.", ex);
            }
        }

        private static string Truncate(string s, int max) =>
            string.IsNullOrEmpty(s) ? s : (s.Length <= max ? s : s.Substring(0, max) + "...");
    }
}
