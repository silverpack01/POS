
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblSubSubHead
    {
        public long Id { get; set; }
        public Nullable<int> HeadCode { get; set; }
        public string HeadName { get; set; }
        public Nullable<long> subHeadCode { get; set; }
        public string subHeadName { get; set; }
        public Nullable<int> sub_subHead_Code { get; set; }
        public string sub_subHead_Name { get; set; }
        public Nullable<decimal> credit { get; set; }
        public Nullable<decimal> Debit { get; set; }
        public Nullable<decimal> Balance { get; set; }
    }
}
