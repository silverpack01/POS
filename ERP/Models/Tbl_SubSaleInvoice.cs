using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ERPSolution.Models
{
    public class Tbl_SubSaleInvoice
    {
        public long Id { get; set; }
        public long? SaleID { get; set; }
        public long? CCode { get; set; }
        public string CustomerName { get; set; }
        public string Contact { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal? TotalAmount { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal? Discount { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal? NetTotal { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal? Payment { get; set; }

        public string PayMode { get; set; }

        [Column(TypeName = "date")]
        public DateTime? Date { get; set; }

        [Column(TypeName = "date")]
        public DateTime? DDate { get; set; }

        public string ITime { get; set; }

        public string SaleType { get; set; }
        
        [NotMapped]
        public List<Tbl_SubSaleInvoiceItem> Order { get; set; }
            = new List<Tbl_SubSaleInvoiceItem>();

        [NotMapped]
        public decimal PreviousBalance { get; set; }

        [NotMapped]
        public decimal PreviousRate { get; set; }
    }
}
