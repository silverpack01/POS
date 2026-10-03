using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERPSolution.Models
{
    public class Tbl_SubSaleInvoiceItem
    {
        public long Id { get; set; }
        public long? SaleID { get; set; }
        public string Item { get; set; }

        [Column(TypeName = "nvarchar(max)")]
        public string ImageData { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Qty { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? InchX { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? InchY { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalFeet { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Rate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Total { get; set; }

        [Column(TypeName = "date")]
        public DateTime? Date { get; set; }

        [NotMapped]
        public string SaleType { get; set; }
    }
}
