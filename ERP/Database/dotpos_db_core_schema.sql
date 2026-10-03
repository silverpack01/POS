/* Schema for dotpos_db_core - generated from live dotpos_db (localdb) */
IF DB_ID(N'dotpos_db_core') IS NULL CREATE DATABASE [dotpos_db_core];
GO
USE [dotpos_db_core];
GO

IF OBJECT_ID(N'dbo.Tbl_RegisterAccounts',N'U') IS NULL BEGIN CREATE TABLE [dbo].[Tbl_RegisterAccounts] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [Date] nvarchar(MAX) NULL,
    [HeadCode] bigint NULL,
    [HeadName] nvarchar(MAX) NULL,
    [SubHeadCode] bigint NULL,
    [SubHeadName] nvarchar(MAX) NULL,
    [SubSubHeadCode] bigint NULL,
    [SubSubHeadName] nvarchar(MAX) NULL,
    [SubSubSubHeadCode] bigint NULL,
    [SubSubSubHeadName] nvarchar(MAX) NULL,
    [AccCode] bigint NULL,
    [AccName] nvarchar(MAX) NULL,
    [Mobile] nvarchar(MAX) NULL,
    [Address] nvarchar(MAX) NULL,
    [FixRate] decimal(18,2) NULL,
    [AccountLimit] decimal(18,2) NULL,
    [Status] bigint NULL,
    [Balance] decimal(18,2) NULL,
    CONSTRAINT [PK_Tbl_RegisterAccounts] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.Tbl_RegisterAccounts',N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Tbl_RegisterAccounts',N'Address') IS NULL
BEGIN
    ALTER TABLE [dbo].[Tbl_RegisterAccounts] ADD [Address] nvarchar(MAX) NULL;
END

IF OBJECT_ID(N'dbo.TblCategory',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblCategory] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [CId] bigint NULL,
    [CategoryName] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblCategory] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblHeads',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblHeads] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Head_Code] bigint NULL,
    [Head_Name] nvarchar(MAX) NULL,
    [credit] decimal(18,2) NULL,
    [Debit] decimal(18,2) NULL,
    [Balance] decimal(18,2) NULL,
    CONSTRAINT [PK_TblHeads] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblLedger',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblLedger] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [Voucher_Id] bigint NULL,
    [VoucherType] nvarchar(MAX) NULL,
    [HeadCode] bigint NULL,
    [HeadName] nvarchar(MAX) NULL,
    [SubHeadCode] bigint NULL,
    [SubHeadName] nvarchar(MAX) NULL,
    [SubSubHeadCode] bigint NULL,
    [SubSubHeadName] nvarchar(MAX) NULL,
    [SubSubSubHeadCode] bigint NULL,
    [SubSubSubHeadName] nvarchar(MAX) NULL,
    [Account_Code] bigint NULL,
    [Account_Name] nvarchar(MAX) NULL,
    [RefCode] bigint NULL,
    [RefName] nvarchar(MAX) NULL,
    [Narration] nvarchar(MAX) NULL,
    [Debit] decimal(18,2) NULL,
    [Credit] decimal(18,2) NULL,
    [Date] date NULL,
    [Status] bigint NULL,
    [InvStatus] bigint NULL,
    [SupplyStatus] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblLedger] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblLogin',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblLogin] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [User_Id] bigint NULL,
    [CNIC] nvarchar(MAX) NULL,
    [User_Name] nvarchar(MAX) NULL,
    [Password] bigint NULL,
    [Compnay_Name] nvarchar(MAX) NULL,
    [Address] nvarchar(MAX) NULL,
    [Date] date NULL,
    [Role] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblLogin] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblProduct',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblProduct] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [ProcessId] bigint NULL,
    [ProcessName] nvarchar(MAX) NULL,
    [CId] bigint NULL,
    [CategoryName] nvarchar(MAX) NULL,
    [SCId] bigint NULL,
    [SubCategoryName] nvarchar(MAX) NULL,
    [RId] bigint NULL,
    [RackName] nvarchar(MAX) NULL,
    [Barcode] bigint NULL,
    [BatchNo] nvarchar(MAX) NULL,
    [Item] nvarchar(MAX) NULL,
    [Unit] nvarchar(MAX) NULL,
    [Colour] nvarchar(MAX) NULL,
    [Size] nvarchar(MAX) NULL,
    [CostRate] decimal(18,3) NULL,
    [SaleRate] decimal(18,3) NULL,
    [DisPer] decimal(18,3) NULL,
    [DisAmt] decimal(18,3) NULL,
    [SaleAmt] decimal(18,3) NULL,
    [UnitPack] decimal(18,3) NULL,
    [StockInHand] decimal(18,3) NULL,
    [Stock] decimal(18,3) NULL,
    [StockLimit] int NULL,
    [Status] nvarchar(MAX) NULL,
    [Image] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblProduct] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblProfile',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblProfile] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(MAX) NULL,
    [Address] nvarchar(MAX) NULL,
    [MobileNo] nvarchar(MAX) NULL,
    [Phone] nvarchar(MAX) NULL,
    [Date] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblProfile] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblRack',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblRack] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [RCode] bigint NULL,
    [RackName] nvarchar(MAX) NULL,
    [Description] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblRack] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblSubCategory',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblSubCategory] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [CId] bigint NULL,
    [CategoryName] nvarchar(MAX) NULL,
    [SCId] bigint NULL,
    [SubCategoryName] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblSubCategory] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblSubHeads',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblSubHeads] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [HeadCode] int NULL,
    [HeadName] nvarchar(MAX) NULL,
    [sub_Head_Code] bigint NULL,
    [sub_Head_Name] nvarchar(MAX) NULL,
    [credit] decimal(18,2) NULL,
    [Debit] decimal(18,2) NULL,
    [Balance] decimal(18,2) NULL,
    CONSTRAINT [PK_TblSubHeads] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblSubSubHeads',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblSubSubHeads] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [HeadCode] int NULL,
    [HeadName] nvarchar(MAX) NULL,
    [subHeadCode] bigint NULL,
    [subHeadName] nvarchar(MAX) NULL,
    [sub_subHead_Code] int NULL,
    [sub_subHead_Name] nvarchar(MAX) NULL,
    [credit] decimal(18,2) NULL,
    [Debit] decimal(18,2) NULL,
    [Balance] decimal(18,2) NULL,
    CONSTRAINT [PK_TblSubSubHeads] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblSubSubSubHeads',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblSubSubSubHeads] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [HeadCode] int NULL,
    [HeadName] nvarchar(MAX) NULL,
    [SubHeadCode] bigint NULL,
    [SubHeadName] nvarchar(MAX) NULL,
    [SubSubHeadCode] int NULL,
    [SubSubHeadName] nvarchar(MAX) NULL,
    [SubSubSubHeadCode] int NULL,
    [SubSubSubHeadName] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblSubSubSubHeads] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblUnit',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblUnit] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [UnitName] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblUnit] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.TblUser',N'U') IS NULL BEGIN CREATE TABLE [dbo].[TblUser] (
    [Id] bigint IDENTITY(1,1) NOT NULL,
    [Code] bigint NULL,
    [Name] nvarchar(MAX) NULL,
    [Password] nvarchar(MAX) NULL,
    [Phone] nvarchar(MAX) NULL,
    [Email] nvarchar(MAX) NULL,
    [CNIC] nvarchar(MAX) NULL,
    [Address] nvarchar(MAX) NULL,
    [Date] nvarchar(MAX) NULL,
    [Status] int NULL,
    [ProcessId] bigint NULL,
    [ProcessName] nvarchar(MAX) NULL,
    CONSTRAINT [PK_TblUser] PRIMARY KEY ([Id])
); END

IF OBJECT_ID(N'dbo.Tbl_RegisterAccounts',N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Tbl_RegisterAccounts',N'Address') IS NULL
BEGIN
    ALTER TABLE [dbo].[Tbl_RegisterAccounts] ADD [Address] nvarchar(MAX) NULL;
END

IF OBJECT_ID(N'dbo.Tbl_SubSaleInvoiceItem',N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Tbl_SubSaleInvoiceItem',N'ImageData') IS NULL
BEGIN
    ALTER TABLE [dbo].[Tbl_SubSaleInvoiceItem] ADD [ImageData] nvarchar(MAX) NULL;
END

IF OBJECT_ID(N'dbo.Tbl_SubSaleInvoice',N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Tbl_SubSaleInvoice',N'SaleType') IS NULL
BEGIN
    ALTER TABLE [dbo].[Tbl_SubSaleInvoice] ADD [SaleType] nvarchar(50) NULL;
END


