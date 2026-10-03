
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblRack
    {
        public long Id { get; set; }
        public Nullable<long> RCode { get; set; }
        public string RackName { get; set; }
        public string Description { get; set; }
    }
}
