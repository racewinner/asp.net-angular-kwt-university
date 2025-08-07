using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

#nullable disable

namespace API.Models
{
    [Table("MyDashboard")]
    public partial class MyDashboard
    {
        public int MyID { get; set; }

        public int MainSessionSeq { get; set; }

        public int TenentID { get; set; }

        public int locationID { get; set; }

        public int TransId { get; set; }

        public string MyEmployeeId { get; set; }

        public string MyEmpName { get; set; }

        public DateTime AsOfDate { get; set; }

        public string MainType { get; set; }

        public string SubType1 { get; set; }

        public int MyPeriodCode { get; set; }

        public int MySeq { get; set; }

        public string MyLabel1 { get; set; }

        public int MyValue1 { get; set; }

        public string MyLabel2 { get; set; }

        public string ClickMe { get; set; }
    }
}
