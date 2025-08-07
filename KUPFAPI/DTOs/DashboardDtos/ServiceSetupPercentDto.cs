namespace API.DTOs.DashboardDtos
{
    public class ServiceSetupPercentDto
    {
        public int Count { get; set; } = 0;

        public string ServiceName { get; set; } = string.Empty;

        public decimal Percent { get; set; }
    }
}
