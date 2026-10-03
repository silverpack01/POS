/* =============================================================================
   SALES TABLES  ->  Tbl_SubSaleInvoice  +  Tbl_SubSaleInvoiceItem
   For: the dot_pos database that ALREADY EXISTS on the new device.

   HOW TO RUN
     1. Open this file in SQL Server Management Studio.
     2. If your database is not named exactly "dot_pos", change it on the USE
        line below. That single line is the only thing you ever need to edit.
     3. Press F5.

   WHY THERE ARE NO "GO" SEPARATORS
     This file is deliberately ONE batch. If the USE line names a database that
     does not exist, SQL Server fails on that line and stops the whole file, so
     the tables can never end up inside master. With GO separators SSMS would
     carry on to the next batch after the failure. One batch prevents that.
     The check right below the USE line is a second belt: it refuses to run
     inside master / tempdb / model / msdb even if USE somehow succeeded.

   SAFE TO RUN TWICE - every step is guarded and nothing is ever dropped.
   ============================================================================= */

USE [dot_pos];

/* Refuse to build anything inside a system database. */
IF DB_NAME() IN (N'master', N'tempdb', N'model', N'msdb')
BEGIN
    /* RAISERROR substitution arguments must be a variable, not a function call. */
    DECLARE @current sysname = DB_NAME();
    RAISERROR(N'Refusing to run inside the system database "%s". Point the USE line at your sales database.', 16, 1, @current);
    RETURN;
END

PRINT N'Running against: ' + DB_NAME() + N'  on  ' + @@SERVERNAME;
PRINT N'';

/* -----------------------------------------------------------------------------
   STEP 1 - INVOICE HEADER   (14 columns)
   -------------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.Tbl_SubSaleInvoice', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Tbl_SubSaleInvoice] (
        [Id]            bigint IDENTITY(1,1) NOT NULL,
        [SaleID]        bigint NULL,
        [CCode]         bigint NULL,          -- customer account code (Tbl_RegisterAccounts.AccCode)
        [CustomerName]  nvarchar(MAX) NULL,
        [Contact]       nvarchar(MAX) NULL,
        [TotalAmount]   decimal(18,4) NULL,
        [Discount]      decimal(18,4) NULL,
        [NetTotal]      decimal(18,4) NULL,
        [Payment]       decimal(18,4) NULL,
        [PayMode]       nvarchar(MAX) NULL,   -- payment account NAME (not the code)
        [Date]          date NULL,            -- invoice date
        [DDate]         date NULL,            -- delivery date
        [ITime]         nvarchar(MAX) NULL,   -- invoice time text, e.g. 04:10:06 PM
        [SaleType]      nvarchar(50) NULL,    -- 'Standard' | 'Sublimation'
        CONSTRAINT [PK_Tbl_SubSaleInvoice] PRIMARY KEY ([Id])
    );
    PRINT N'Created  dbo.Tbl_SubSaleInvoice';
END
ELSE
    PRINT N'Skipped  dbo.Tbl_SubSaleInvoice (already exists)';

/* -----------------------------------------------------------------------------
   STEP 2 - INVOICE ITEM   (11 columns, no FK, matches the source database)
   -------------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.Tbl_SubSaleInvoiceItem', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Tbl_SubSaleInvoiceItem] (
        [Id]         bigint IDENTITY(1,1) NOT NULL,
        [SaleID]     bigint NULL,             -- links to Tbl_SubSaleInvoice.SaleID
        [Item]       nvarchar(MAX) NULL,      -- free text, NOT linked to TblProduct
        [Qty]        decimal(18,2) NULL,
        [InchX]      decimal(18,2) NULL,      -- height
        [InchY]      decimal(18,2) NULL,      -- width
        [TotalFeet]  decimal(18,2) NULL,      -- qty x inchx x inchy
        [Rate]       decimal(18,2) NULL,
        [Total]      decimal(18,2) NULL,
        [Date]       date NULL,
        [ImageData]  nvarchar(MAX) NULL,      -- item photo as a base64 data URI
        CONSTRAINT [PK_Tbl_SubSaleInvoiceItem] PRIMARY KEY ([Id])
    );
    PRINT N'Created  dbo.Tbl_SubSaleInvoiceItem';
END
ELSE
    PRINT N'Skipped  dbo.Tbl_SubSaleInvoiceItem (already exists)';

/* -----------------------------------------------------------------------------
   STEP 3 - SAFEGUARD COLUMNS
   Program.cs runs these same ALTERs at startup, so the app also works if an
   older or partial table already exists. No-op when the column is present.
   -------------------------------------------------------------------------- */
IF OBJECT_ID(N'dbo.Tbl_SubSaleInvoice', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Tbl_SubSaleInvoice', N'SaleType') IS NULL
BEGIN
    ALTER TABLE [dbo].[Tbl_SubSaleInvoice] ADD [SaleType] nvarchar(50) NULL;
    PRINT N'Added    Tbl_SubSaleInvoice.SaleType';
END

IF OBJECT_ID(N'dbo.Tbl_SubSaleInvoiceItem', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Tbl_SubSaleInvoiceItem', N'ImageData') IS NULL
BEGIN
    ALTER TABLE [dbo].[Tbl_SubSaleInvoiceItem] ADD [ImageData] nvarchar(MAX) NULL;
    PRINT N'Added    Tbl_SubSaleInvoiceItem.ImageData';
END

/* -----------------------------------------------------------------------------
   STEP 4 - BACKFILL SaleType
   Invoices saved before the SaleType column existed are Standard. Anything
   still carrying the old SUBLIMATION| prefix in ITime becomes Sublimation.
   -------------------------------------------------------------------------- */
UPDATE [dbo].[Tbl_SubSaleInvoice]
SET [SaleType] = N'Sublimation',
    [ITime] = SUBSTRING([ITime], LEN(N'SUBLIMATION|') + 1, 4000)
WHERE ([SaleType] IS NULL OR [SaleType] = N'')
  AND [ITime] LIKE N'SUBLIMATION|%';

UPDATE [dbo].[Tbl_SubSaleInvoice]
SET [SaleType] = N'Standard'
WHERE [SaleType] IS NULL OR [SaleType] = N'';

/* =============================================================================
   OPTIONAL - the block below is commented out. Uncomment only what you want.
   ============================================================================= */

/*
-- STEP 5 (OPTIONAL) - COPY THE DATA ACROSS
-- The source database currently holds 1 invoice and 1 item.
-- ImageData is left NULL on purpose: that one picture is 812,939 characters of
-- base64, roughly 608 KB inside a single cell. Paste the real value in if you
-- need the photo, but storing images as files is the better long term fix.

IF NOT EXISTS (SELECT 1 FROM [dbo].[Tbl_SubSaleInvoice])
BEGIN
    SET IDENTITY_INSERT [dbo].[Tbl_SubSaleInvoice] ON;
    INSERT INTO [dbo].[Tbl_SubSaleInvoice]
        ([Id],[SaleID],[CCode],[CustomerName],[Contact],[TotalAmount],[Discount],
         [NetTotal],[Payment],[PayMode],[Date],[DDate],[ITime],[SaleType])
    VALUES
        (23, 1, 1, N'ABC', NULL, 36531.0000, 31.0000, 36500.0000, 0.0000,
         N'Cash', '2026-09-26', '2026-09-26', N'04:10:06 PM', N'Standard');
    SET IDENTITY_INSERT [dbo].[Tbl_SubSaleInvoice] OFF;
END

IF NOT EXISTS (SELECT 1 FROM [dbo].[Tbl_SubSaleInvoiceItem])
BEGIN
    SET IDENTITY_INSERT [dbo].[Tbl_SubSaleInvoiceItem] ON;
    INSERT INTO [dbo].[Tbl_SubSaleInvoiceItem]
        ([Id],[SaleID],[Item],[Qty],[InchX],[InchY],[TotalFeet],[Rate],[Total],[Date],[ImageData])
    VALUES
        (30, 1, N'asddfgfh', 123.00, 3.00, 3.00, 1107.00, 33.00, 36531.00,
         '2026-09-26', NULL);
    SET IDENTITY_INSERT [dbo].[Tbl_SubSaleInvoiceItem] OFF;
END

-- Move the IDENTITY seed past the imported Ids (23 and 30), otherwise the very
-- next insert collides with them.
DBCC CHECKIDENT (N'dbo.Tbl_SubSaleInvoice', RESEED, 23) WITH NO_INFOMSGS;
DBCC CHECKIDENT (N'dbo.Tbl_SubSaleInvoiceItem', RESEED, 30) WITH NO_INFOMSGS;
*/

/*
-- STEP 6 (OPTIONAL) - UNIQUE GUARD ON SALEID
-- SaleID is generated in C# as MAX(SaleID) + 1, so two users saving at the same
-- moment can create the same invoice number. This index makes that impossible.
-- Enable it only after clearing any duplicate SaleID:
--     SELECT SaleID, COUNT(*) FROM dbo.Tbl_SubSaleInvoice
--     GROUP BY SaleID HAVING COUNT(*) > 1;

IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = N'UX_Tbl_SubSaleInvoice_SaleID'
                 AND object_id = OBJECT_ID(N'dbo.Tbl_SubSaleInvoice'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UX_Tbl_SubSaleInvoice_SaleID]
        ON [dbo].[Tbl_SubSaleInvoice] ([SaleID])
        WHERE [SaleID] IS NOT NULL;
    PRINT N'Created  UX_Tbl_SubSaleInvoice_SaleID';
END
*/

/* =============================================================================
   STEP 7 - RECOMMENDED INDEXES  (always safe, guarded, no data change)
   The source database has NO index on SaleID, yet every search, edit and delete
   in SubSaleInvoiceController filters on it - that is a full table scan each time.
   ============================================================================= */
IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = N'IX_Tbl_SubSaleInvoice_SaleID'
                 AND object_id = OBJECT_ID(N'dbo.Tbl_SubSaleInvoice'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Tbl_SubSaleInvoice_SaleID]
        ON [dbo].[Tbl_SubSaleInvoice] ([SaleID]);
    PRINT N'Created  IX_Tbl_SubSaleInvoice_SaleID';
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = N'IX_Tbl_SubSaleInvoice_SaleType_Date'
                 AND object_id = OBJECT_ID(N'dbo.Tbl_SubSaleInvoice'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Tbl_SubSaleInvoice_SaleType_Date]
        ON [dbo].[Tbl_SubSaleInvoice] ([SaleType], [Date] DESC);
    PRINT N'Created  IX_Tbl_SubSaleInvoice_SaleType_Date';
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = N'IX_Tbl_SubSaleInvoiceItem_SaleID'
                 AND object_id = OBJECT_ID(N'dbo.Tbl_SubSaleInvoiceItem'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_Tbl_SubSaleInvoiceItem_SaleID]
        ON [dbo].[Tbl_SubSaleInvoiceItem] ([SaleID]);
    PRINT N'Created  IX_Tbl_SubSaleInvoiceItem_SaleID';
END

PRINT N'';
PRINT N'Done. Verification follows.';

/* -----------------------------------------------------------------------------
   STEP 8 - VERIFY  (expect Tbl_SubSaleInvoice = 14 columns, Item = 11 columns)
   -------------------------------------------------------------------------- */
SELECT
    DB_NAME()                                           AS DatabaseName,
    t.name                                              AS TableName,
    COUNT(c.column_id)                                  AS ColumnCount,
    MAX(CASE WHEN c.is_identity = 1 THEN c.name END)    AS IdentityColumn,
    MAX(CASE WHEN pk.is_primary_key = 1 THEN pk.name END) AS PrimaryKey
FROM sys.tables t
JOIN sys.columns c ON c.object_id = t.object_id
LEFT JOIN sys.indexes pk ON pk.object_id = t.object_id AND pk.is_primary_key = 1
WHERE t.name IN (N'Tbl_SubSaleInvoice', N'Tbl_SubSaleInvoiceItem')
GROUP BY t.name
ORDER BY t.name;
