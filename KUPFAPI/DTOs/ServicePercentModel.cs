using Microsoft.EntityFrameworkCore.Storage;

namespace API.DTOs
{
    public class ServicePercentModel
    {
        public int ServiceTypeId { get; set; }
        public int TotalCount { get; set; }
        public float Percent { get; set; }
        public string ServiceShortName { get; set; } = string.Empty;
    }
}
