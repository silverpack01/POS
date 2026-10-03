
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblLedger
    {
        public long Id { get; set; }
        public Nullable<long> Voucher_Id { get; set; }
        public string VoucherType { get; set; }
        public Nullable<long> HeadCode { get; set; }
        public string HeadName { get; set; }
        public Nullable<long> SubHeadCode { get; set; }
        public string SubHeadName { get; set; }
        public Nullable<long> SubSubHeadCode { get; set; }
        public string SubSubHeadName { get; set; }
        public Nullable<long> SubSubSubHeadCode { get; set; }
        public string SubSubSubHeadName { get; set; }
        public Nullable<long> Account_Code { get; set; }
        public string Account_Name { get; set; }
        public Nullable<long> RefCode { get; set; }
        public string RefName { get; set; }
        public string Narration { get; set; }
        public Nullable<decimal> Debit { get; set; }
        public Nullable<decimal> Credit { get; set; }
        public Nullable<System.DateTime> Date { get; set; }
        public Nullable<long> Status { get; set; }
        public Nullable<long> InvStatus { get; set; }
        public string SupplyStatus { get; set; }
    }
}
