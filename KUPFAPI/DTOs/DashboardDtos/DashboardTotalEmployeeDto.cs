namespace API.DTOs.DashboardDtos
{
    public class DashboardTotalEmployeeDto
    {
        public string PeriodCode { get; set; } = string.Empty;

        public int Count { get; set; }

        public int Year { get; set; }

        public int Month { get; set; }

    }
}
