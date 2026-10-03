using System;
using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace ERPSolution.Models
{
    public partial class dotpos_dbEntities : DbContext
    {
        public dotpos_dbEntities()
            : base(GetOptions())
        {
        }

        public dotpos_dbEntities(DbContextOptions<dotpos_dbEntities> options)
            : base(options)
        {
        }

        private static DbContextOptions<dotpos_dbEntities> GetOptions()
        {
            var optionsBuilder = new DbContextOptionsBuilder<dotpos_dbEntities>();
            optionsBuilder.UseSqlServer(AppSettings.DbConnectionString);
            return optionsBuilder.Options;
        }

        public virtual DbSet<Tbl_RegisterAccounts> Tbl_RegisterAccounts { get; set; }
        public virtual DbSet<TblCategory> TblCategories { get; set; }
        public virtual DbSet<TblHead> TblHeads { get; set; }
        public virtual DbSet<TblLedger> TblLedgers { get; set; }
        public virtual DbSet<TblLogin> TblLogins { get; set; }
        public virtual DbSet<TblProduct> TblProducts { get; set; }
        public virtual DbSet<TblProductAdjustment> TblProductAdjustments { get; set; }
        public virtual DbSet<TblProfile> TblProfiles { get; set; }
        public virtual DbSet<TblRack> TblRacks { get; set; }
        public virtual DbSet<TblSubCategory> TblSubCategories { get; set; }
        public virtual DbSet<TblSubHead> TblSubHeads { get; set; }
        public virtual DbSet<TblSubSubHead> TblSubSubHeads { get; set; }
        public virtual DbSet<TblSubSubSubHead> TblSubSubSubHeads { get; set; }
        public virtual DbSet<Tbl_SubSaleInvoice> Tbl_SubSaleInvoice { get; set; }
        public virtual DbSet<Tbl_SubSaleInvoiceItem> Tbl_SubSaleInvoiceItem { get; set; }
        public virtual DbSet<TblUnit> TblUnits { get; set; }
        public virtual DbSet<TblUser> TblUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Tbl_RegisterAccounts>().ToTable("Tbl_RegisterAccounts");
            modelBuilder.Entity<TblCategory>().ToTable("TblCategory");
            modelBuilder.Entity<TblHead>().ToTable("TblHeads");
            modelBuilder.Entity<TblLedger>().ToTable("TblLedger");
            modelBuilder.Entity<TblLogin>().ToTable("TblLogin");
            modelBuilder.Entity<TblProduct>().ToTable("TblProduct");
            modelBuilder.Entity<TblProductAdjustment>().ToTable("TblProductAdjustment");
            modelBuilder.Entity<TblProfile>().ToTable("TblProfile");
            modelBuilder.Entity<TblRack>().ToTable("TblRack");
            modelBuilder.Entity<TblSubCategory>().ToTable("TblSubCategory");
            modelBuilder.Entity<TblSubHead>().ToTable("TblSubHeads");
            modelBuilder.Entity<TblSubSubHead>().ToTable("TblSubSubHeads");
            modelBuilder.Entity<TblSubSubSubHead>().ToTable("TblSubSubSubHeads");
            modelBuilder.Entity<Tbl_SubSaleInvoice>().ToTable("Tbl_SubSaleInvoice");
            modelBuilder.Entity<Tbl_SubSaleInvoiceItem>().ToTable("Tbl_SubSaleInvoiceItem");
            modelBuilder.Entity<TblUnit>().ToTable("TblUnit");
            modelBuilder.Entity<TblUser>().ToTable("TblUser");
        }
    }
}
