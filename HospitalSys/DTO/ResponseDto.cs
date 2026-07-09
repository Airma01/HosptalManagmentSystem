// DTOs/ResponseDto.cs
namespace HospitalSys.Dto
{
    public class ResponseDto<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "";
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
        public int StatusCode { get; set; } = 200;
    }

    public class ErrorResponseDto
    {
        public bool Success { get; set; } = false;
        public string Message { get; set; } = "";
        public List<ErrorDetailDto> Errors { get; set; } = new();
        public int StatusCode { get; set; } = 400;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ErrorDetailDto
    {
        public string Field { get; set; } = "";
        public string Message { get; set; } = "";
        public string? Code { get; set; }
    }

    public class SuccessResponseDto
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "";
        public int StatusCode { get; set; } = 200;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class CreatedResponseDto<T>
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = "Created successfully";
        public T? Data { get; set; }
        public int Id { get; set; }
        public int StatusCode { get; set; } = 201;
    }
}