using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERPSolution.Models
{
    public partial class TblProductAdjustment
    {
        public long Id { get; set; }
        public Nullable<long> Barcode { get; set; }
        public string BatchNo { get; set; }
        public string Item { get; set; }
        public decimal StockIn { get; set; }
        public decimal StockOut { get; set; }
        public System.DateTime Date { get; set; }

        [NotMapped]
        public long ProductId { get; set; }
    }
}
