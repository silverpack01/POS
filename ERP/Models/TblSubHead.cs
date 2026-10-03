
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblSubHead
    {
        public int Id { get; set; }
        public Nullable<int> HeadCode { get; set; }
        public string HeadName { get; set; }
        public Nullable<long> sub_Head_Code { get; set; }
        public string sub_Head_Name { get; set; }
        public Nullable<decimal> credit { get; set; }
        public Nullable<decimal> Debit { get; set; }
        public Nullable<decimal> Balance { get; set; }
    }
}
