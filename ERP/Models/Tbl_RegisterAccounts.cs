
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Tbl_RegisterAccounts
    {
        public long Id { get; set; }
        public string Date { get; set; }
        public Nullable<long> HeadCode { get; set; }
        public string HeadName { get; set; }
        public Nullable<long> SubHeadCode { get; set; }
        public string SubHeadName { get; set; }
        public Nullable<long> SubSubHeadCode { get; set; }
        public string SubSubHeadName { get; set; }
        public Nullable<long> SubSubSubHeadCode { get; set; }
        public string SubSubSubHeadName { get; set; }
        public Nullable<long> AccCode { get; set; }
        public string AccName { get; set; }
        public string Mobile { get; set; }
        public string Address { get; set; }
        public Nullable<decimal> FixRate { get; set; }
        public Nullable<decimal> AccountLimit { get; set; }
        public Nullable<long> Status { get; set; }
        public Nullable<decimal> Balance { get; set; }
    }
}
