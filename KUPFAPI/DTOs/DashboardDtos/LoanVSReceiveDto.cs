using API.DTOs.DashboardDtos;
using System.Collections.Generic;

namespace API.DTOs
{
    public class LoanVSReceiveDto
    {
        public LoanVSReceiveDto()
        {
            graphData = new List<LoanVSReceiveGraphData>();
        }

        public decimal TotalLoanAmt { get; set; }

        public decimal TotalReceivedAmt { get; set; }

        public List<LoanVSReceiveGraphData> graphData { get; set; }
    }
}
