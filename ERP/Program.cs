using System;
using ERPSolution;
using ERPSolution.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

AppSettings.DbConnectionString = builder.Configuration.GetConnectionString("MyConnection");

builder.Services.AddControllersWithViews()
    .AddRazorRuntimeCompilation()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = null;
        o.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        o.JsonSerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString;
        o.JsonSerializerOptions.Converters.Add(new ERPSolution.Json.FlexibleNullableNumberConverterFactory());
    });

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Admin/Login";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(1440);
    });

var app = builder.Build();

app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Admin}/{action=Login}/{id?}");

// The project does not use EF migrations. Keep existing databases compatible
// with the invoice item image field when the application starts.
using (var db = new dotpos_dbEntities())
{
    db.Database.ExecuteSqlRaw(@"
IF OBJECT_ID(N'dbo.Tbl_SubSaleInvoiceItem', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Tbl_SubSaleInvoiceItem', N'ImageData') IS NULL
BEGIN
    ALTER TABLE [dbo].[Tbl_SubSaleInvoiceItem] ADD [ImageData] nvarchar(max) NULL;
END");

    db.Database.ExecuteSqlRaw(@"
IF OBJECT_ID(N'dbo.Tbl_SubSaleInvoice', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Tbl_SubSaleInvoice', N'SaleType') IS NULL
BEGIN
    ALTER TABLE [dbo].[Tbl_SubSaleInvoice] ADD [SaleType] nvarchar(50) NULL;
END
");

    db.Database.ExecuteSqlRaw(@"
IF OBJECT_ID(N'dbo.Tbl_RegisterAccounts', N'U') IS NOT NULL
   AND COL_LENGTH(N'dbo.Tbl_RegisterAccounts', N'Address') IS NULL
BEGIN
    ALTER TABLE [dbo].[Tbl_RegisterAccounts] ADD [Address] nvarchar(max) NULL;
END");

    // Run this in a separate batch because SQL Server compiles a batch before
    // the ALTER TABLE above makes the new column visible to later statements.
    db.Database.ExecuteSqlRaw(@"
IF OBJECT_ID(N'dbo.Tbl_SubSaleInvoice', N'U') IS NOT NULL
BEGIN
    UPDATE [dbo].[Tbl_SubSaleInvoice]
    SET [SaleType] = N'Sublimation',
        [ITime] = SUBSTRING([ITime], LEN(N'SUBLIMATION|') + 1, 4000)
    WHERE ([SaleType] IS NULL OR [SaleType] = N'')
      AND [ITime] LIKE N'SUBLIMATION|%';

    UPDATE [dbo].[Tbl_SubSaleInvoice]
    SET [SaleType] = N'Standard'
    WHERE [SaleType] IS NULL OR [SaleType] = N'';
END");
}

app.Run();
