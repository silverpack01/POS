
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblSubCategory
    {
        public long Id { get; set; }
        public Nullable<long> CId { get; set; }
        public string CategoryName { get; set; }
        public Nullable<long> SCId { get; set; }
        public string SubCategoryName { get; set; }
    }
}
