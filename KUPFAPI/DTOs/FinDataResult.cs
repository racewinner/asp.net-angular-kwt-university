namespace API.DTOs
{
    public class FinDataResult
    {
        public string FullSystemRemarks { get; set; } = string.Empty;
        public string WithdrawalRemarks { get; set; } = string.Empty;
        public string WithdrawalPercReceive { get; set; } = string.Empty;
        public string WithdrawalFromMonth { get; set; } = string.Empty;
        public string WithdrawalToMonth { get; set; } = string.Empty;
        public string FirstAidRemarks { get; set; } = string.Empty;
        public string FirstAidFromMonth { get; set; } = string.Empty;
        public string FirstAidToMonth { get; set; } = string.Empty;
        public string FirstAidAmtReceive { get; set; } = string.Empty;
        public string MyHowManyInstallment { get; set; } = string.Empty;
        public string WorkedInMonth { get; set; } = string.Empty;
        public string WorkedInYear { get; set; } = string.Empty;
        public int SubBeginPeriod { get; set; } = 0;
        public int TotTransFound { get; set; } = 0;
        public int SubsInstAmount { get; set; } = 0;
        public int SubsAmtReceived { get; set; } = 0;
        public int SubsAmtPending { get; set; } = 0;
        public int LoanAmtInstallment { get; set; } = 0;
        public int LoanAmtReceived { get; set; } = 0;
        public int LoanAmtPending { get; set; } = 0;

    }
}