using API.DTOs.DashboardDtos;
using System.Collections.Generic;

namespace API.DTOs
{
    public class TotalEmployeeDto
    {
        public TotalEmployeeDto()
        {
            employeeGraph = new List<DashboardTotalEmployeeDto>();
        }

        public int totalEmployee { get; set; }

        public List<DashboardTotalEmployeeDto> employeeGraph { get; set; }
    }
}
