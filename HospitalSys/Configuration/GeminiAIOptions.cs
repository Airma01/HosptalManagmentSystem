namespace HospitalSys.Configuration
{
    /// <summary>
    /// Configuration for Google Gemini API.
    /// Bind from appsettings / environment / user-secrets.
    /// Never commit the API key. Use:
    ///   export GEMINI_API_KEY=YOUR_NEW_API_KEY
    /// or:  dotnet user-secrets set "GeminiAI:ApiKey" "YOUR_NEW_API_KEY"
    /// </summary>
    public class GeminiAIOptions
    {
        public const string SectionName = "GeminiAI";

        /// <summary>Google AI Studio API key. Prefer env var GEMINI_API_KEY.</summary>
        public string ApiKey { get; set; } = string.Empty;

        /// <summary>
        /// Model name. Defaults to a widely available Gemini 1.5/2.0 flash model.
        /// Override via config if your project has access to a different model.
        /// </summary>
        public string Model { get; set; } = "gemini-1.5-flash";

        /// <summary>Base URL for the Generative Language API.</summary>
        public string BaseUrl { get; set; } = "https://generativelanguage.googleapis.com/v1beta";

        /// <summary>HTTP timeout in seconds for Gemini calls.</summary>
        public int TimeoutSeconds { get; set; } = 60;

        /// <summary>Max output tokens requested from the model.</summary>
        public int MaxOutputTokens { get; set; } = 2048;

        /// <summary>Temperature for generation (0–1). Lower = more deterministic clinical answers.</summary>
        public double Temperature { get; set; } = 0.2;
    }
}
