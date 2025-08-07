﻿using System;
using System.Collections.Generic;

#nullable disable

namespace API.Models
{
    public partial class TransactionDt
    {
        public int TenentId { get; set; }
        public int? LocationId { get; set; }
        public long Mytransid { get; set; }
        public int Myid { get; set; }
        public int? EmployeeId { get; set; }
        public int? InstallmentNumber { get; set; }
        public int? AttachId { get; set; }
        public long? PeriodCode { get; set; }
        public decimal? InstallmentAmount { get; set; }
        public decimal? ReceivedAmount { get; set; }
        public decimal? PendingAmount { get; set; }
        public decimal? DiscountAmount { get; set; }
        public string? DiscountReference { get; set; }
        public string? UniversityBatchNo { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string? EffectedAccount { get; set; }
        public string? OtherReference { get; set; }
        public int? Activityid { get; set; }
        public long? CrupId { get; set; }
        public string? Glpost { get; set; }
        public string? Glpost1 { get; set; }
        public string? Glpostref1 { get; set; }
        public string? Glpostref { get; set; }
        public bool? Active { get; set; }
        public string? Switch1 { get; set; }
        public int? DelFlag { get; set; }
        public string? Userid { get; set; }
        public DateTime? Entrydate { get; set; }
        public string JVNumber { get; set; }
    }
}
