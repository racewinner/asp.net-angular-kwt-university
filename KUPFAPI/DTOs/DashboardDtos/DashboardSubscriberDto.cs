namespace API.DTOs.DashboardDtos
{
    public class DashboardSubscriberDto
    {
        public int EmployeeId { get; set; }

        public string EnglishName { get; set; }

        public string ArabicName { get; set; }

        public int Status { get; set; } = 0;
    }
}
