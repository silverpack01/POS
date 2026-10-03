
namespace ERPSolution.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class TblProduct
    {
        public long Id { get; set; }
        public Nullable<long> ProcessId { get; set; }
        public string ProcessName { get; set; }
        public Nullable<long> CId { get; set; }
        public string CategoryName { get; set; }
        public Nullable<long> SCId { get; set; }
        public string SubCategoryName { get; set; }
        public Nullable<long> RId { get; set; }
        public string RackName { get; set; }
        public Nullable<long> Barcode { get; set; }
        public string BatchNo { get; set; }
        public string Item { get; set; }
        public string Unit { get; set; }
        public string Colour { get; set; }
        public string Size { get; set; }
        public Nullable<decimal> CostRate { get; set; }
        public Nullable<decimal> SaleRate { get; set; }
        public Nullable<decimal> DisPer { get; set; }
        public Nullable<decimal> DisAmt { get; set; }
        public Nullable<decimal> SaleAmt { get; set; }
        public Nullable<decimal> UnitPack { get; set; }
        public Nullable<decimal> StockInHand { get; set; }
        public Nullable<decimal> Stock { get; set; }
        public Nullable<int> StockLimit { get; set; }
        public string Status { get; set; }
        public string Image { get; set; }
    }
}
