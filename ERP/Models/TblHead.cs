namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblHead
    {
        public int Id { get; set; }
        public Nullable<long> Head_Code { get; set; }
        public string Head_Name { get; set; }
        public Nullable<decimal> credit { get; set; }
        public Nullable<decimal> Debit { get; set; }
        public Nullable<decimal> Balance { get; set; }
    }
}
