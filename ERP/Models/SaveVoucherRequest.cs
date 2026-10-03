namespace ERPSolution.Models
{
    using System;

    public class SaveVoucherRequest
    {
        public DateTime? udate { get; set; }
        public TblLedger[] order { get; set; }
    }
}