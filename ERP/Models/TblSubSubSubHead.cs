
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblSubSubSubHead
    {
        public long Id { get; set; }
        public Nullable<int> HeadCode { get; set; }
        public string HeadName { get; set; }
        public Nullable<long> SubHeadCode { get; set; }
        public string SubHeadName { get; set; }
        public Nullable<int> SubSubHeadCode { get; set; }
        public string SubSubHeadName { get; set; }
        public Nullable<int> SubSubSubHeadCode { get; set; }
        public string SubSubSubHeadName { get; set; }
    }
}
