namespace ERPSolution.Models
{
    using System;

    public class SaveAPRPaymentRequest
    {
        public DateTime? Date { get; set; }
        public string VoucherType { get; set; }
        public TblLedger[] vendor { get; set; }
    }
}