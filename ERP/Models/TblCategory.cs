
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblCategory
    {
        public long Id { get; set; }
        public Nullable<long> CId { get; set; }
        public string CategoryName { get; set; }
    }
}
