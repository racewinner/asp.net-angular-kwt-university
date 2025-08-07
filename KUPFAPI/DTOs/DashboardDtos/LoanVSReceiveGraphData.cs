namespace API.DTOs.DashboardDtos
{
    public class LoanVSReceiveGraphData
    {
        public string PeriodCode { get; set; }

        public decimal LoanAmt { get; set; }

        public decimal ReceivedAmt { get; set; }
    }
}
