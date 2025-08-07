using System;
using System.Collections.Generic;

namespace API.DTOs
{

    public class EmployeeLedgerDtoObj
    {
        public List<EmployeeLedgerDto> employeeLedgerList { get; set; }

    }
    public class EmployeeLedgerDto

    {
        public int? EmpNumber { get; set; }
        public int? PFNumber { get; set; }

        public string? MemeberName { get; set; }
        public DateTime? Membersubspdate { get; set; }
        public string? AccountName { get; set; }
        public long? Account { get; set; }
        public DateTime? JVDate { get; set; }
        public string? Description { get; set; }
        public decimal? Dr { get; set; }
        public decimal? Cr { get; set; }
        public string? JV { get; set; }
    }
}
