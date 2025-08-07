using System;
using System.Collections.Generic;

namespace API.DTOs.DashboardDtos
{
    public class EmployeePerformanceDto
    {
        public EmployeePerformanceDto() { 
            Employees = new List<EmployeePerformance>();
        }

        public int Count { get; set; }

        public List<EmployeePerformance> Employees { get; set; }
    }

    public class EmployeePerformance
    {
        public int UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string LoginId { get; set; } = string.Empty;

    }

    public class EmployeePerformanceDetail
    {
        public DateTime AsOfDate { get; set; }

        public string MyLabel1 { get; set; }
    }
}
