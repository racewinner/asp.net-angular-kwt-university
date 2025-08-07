using System.Collections.Generic;

namespace API.DTOs.DashboardDtos
{
    public class DashboardServiceSetupDto
    {

        public DashboardServiceSetupDto()
        {
            Percents = new List<ServiceSetupPercentDto>();

            GraphDatas = new List<ServiceSetupGraphData>();
        }
        public List<ServiceSetupPercentDto> Percents { get; set; }

        public List<ServiceSetupGraphData> GraphDatas { get; set; }
    }
}
