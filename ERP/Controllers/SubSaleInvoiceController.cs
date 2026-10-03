using System;
using System.Linq;
using ERPSolution.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPSolution.Controllers
{
    public class SubSaleInvoiceController : Controller
    {
        private const string SublimationSaleType = "Sublimation";
        private const string StandardSaleType = "Standard";

        private readonly dotpos_dbEntities db = new dotpos_dbEntities();

        public IActionResult Index() => View("~/Views/sales/Index.cshtml");
        public IActionResult SSIndex() => View("~/Views/sales/Index.cshtml");
        public IActionResult Sublimation() => View("~/Views/sales/Sublimation.cshtml");

        [HttpGet]
        public JsonResult getSaleId()
        {
            var lastSaleId = db.Tbl_SubSaleInvoice
                .AsNoTracking()
                .OrderByDescending(x => x.SaleID)
                .Select(x => x.SaleID)
                .FirstOrDefault() ?? 0;
            return Json(lastSaleId + 1);
        }

        // Accounts are already maintained in Tbl_RegisterAccounts, so no separate customer table is needed.
        [HttpGet]
        public JsonResult GetAccounts(string saleType)
        {
            var customerAccounts = db.Tbl_RegisterAccounts
                .AsNoTracking()
                .Where(x => x.AccCode != null
                    && x.AccName != null && x.AccName != ""
                    && x.HeadName == "Assets"
                    && x.SubHeadName == "Current Asset"
                    && x.SubSubHeadName == "Customer"
                    && x.SubSubSubHeadName == "Customer")
                .OrderBy(x => x.AccName)
                .Select(x => new
                {
                    CCode = x.AccCode,
                    CustomerName = x.AccName,
                    Mobile = x.Mobile
                })
                .ToList();

            var customerCodes = customerAccounts
                .Select(x => x.CCode.Value)
                .ToList();

            var invoices = FilterBySaleType(
                db.Tbl_SubSaleInvoice
                    .AsNoTracking()
                    .Where(x => x.CCode != null && customerCodes.Contains(x.CCode.Value)),
                saleType);

            var customerInvoices = invoices.ToList();
            var invoiceBalances = customerInvoices
                .GroupBy(x => x.CCode.Value)
                .Select(x => new
                {
                    CCode = x.Key,
                    Balance = x.Sum(i => (i.NetTotal ?? 0) - (i.Payment ?? 0))
                })
                .ToDictionary(x => x.CCode, x => x.Balance);

            var accounts = customerAccounts
                .OrderBy(x => x.CustomerName)
                .Select(x => new
                {
                    x.CCode,
                    x.CustomerName,
                    x.Mobile,
                    Balance = invoiceBalances.TryGetValue(x.CCode.Value, out var balance) ? balance : 0
                })
                .ToList();

            return Json(accounts);
        }

        [HttpGet]
        public JsonResult GetPreviousRate(long ccode, string saleType)
        {
            var latestSaleId = FilterBySaleType(
                    db.Tbl_SubSaleInvoice.Where(x => x.CCode == ccode),
                    saleType)
                .OrderByDescending(x => x.Date)
                .ThenByDescending(x => x.Id)
                .Select(x => x.SaleID)
                .FirstOrDefault();

            var previousRate = latestSaleId.HasValue
                ? db.Tbl_SubSaleInvoiceItem
                    .Where(x => x.SaleID == latestSaleId.Value)
                    .OrderByDescending(x => x.Id)
                    .Select(x => x.Rate ?? 0)
                    .FirstOrDefault()
                : 0;

            return Json(new { PreviousRate = previousRate });
        }

        [HttpGet]
        public JsonResult GetPaymentAccounts()
        {
            var accounts = db.Tbl_RegisterAccounts
                .Where(x => x.AccCode != null
                    && x.AccName != null && x.AccName != ""
                    && x.HeadName == "Assets"
                    && x.SubHeadName == "Current Asset"
                    && x.SubSubHeadName == "Payment")
                .OrderBy(x => x.AccName)
                .Select(x => new
                {
                    CCode = x.AccCode,
                    AccountName = x.AccName,
                    AccountType = x.SubSubSubHeadName
                })
                .ToList();
            return Json(accounts);
        }

        [HttpPost]
        public JsonResult fetchSaleItem([FromBody] Tbl_SubSaleInvoiceItem model)
        {
            if (model?.SaleID == null)
            {
                return Json(Array.Empty<Tbl_SubSaleInvoiceItem>());
            }

            var invoice = db.Tbl_SubSaleInvoice.FirstOrDefault(x => x.SaleID == model.SaleID);
            if (invoice == null || IsSublimation(invoice) != IsSublimationType(model.SaleType))
            {
                return Json(Array.Empty<Tbl_SubSaleInvoiceItem>());
            }

            return Json(db.Tbl_SubSaleInvoiceItem
                .Where(x => x.SaleID == model.SaleID)
                .OrderBy(x => x.Id)
                .ToList());
        }

        [HttpPost]
        public JsonResult getEditInvoice([FromBody] InvoiceIdRequest request)
        {
            if (request?.Cid == null) return Json(null);
            var invoice = db.Tbl_SubSaleInvoice.FirstOrDefault(x => x.Id == request.Cid);
            if (invoice == null || IsSublimation(invoice) != IsSublimationType(request.SaleType))
            {
                return Json(null);
            }

            var previousInvoices = db.Tbl_SubSaleInvoice
                .Where(x => x.CCode == invoice.CCode && x.Id != invoice.Id);
            previousInvoices = FilterBySaleType(previousInvoices, IsSublimation(invoice));

            var previousInvoiceBalance = invoice.CCode == null
                ? 0
                : previousInvoices.Sum(x => (x.NetTotal ?? 0) - (x.Payment ?? 0));
            var previousSaleId = previousInvoices
                .OrderByDescending(x => x.Date)
                .ThenByDescending(x => x.Id)
                .Select(x => x.SaleID)
                .FirstOrDefault();
            var previousRate = previousSaleId.HasValue
                ? db.Tbl_SubSaleInvoiceItem
                    .Where(x => x.SaleID == previousSaleId.Value)
                    .OrderByDescending(x => x.Id)
                    .Select(x => x.Rate ?? 0)
                    .FirstOrDefault()
                : 0;

            invoice.PreviousBalance = previousInvoiceBalance;
            invoice.PreviousRate = previousRate;

            return Json(invoice);
        }

        [HttpPost]
        public IActionResult Delete(long id)
        {
            var item = db.Tbl_SubSaleInvoiceItem.FirstOrDefault(x => x.Id == id);
            if (item == null)
            {
                return NotFound(new { success = false, message = "Invoice item was not found." });
            }

            db.Tbl_SubSaleInvoiceItem.Remove(item);
            db.SaveChanges();
            return Json(new { success = true });
        }

        [HttpPost]
        public IActionResult SaleSaveInvoice([FromBody] Tbl_SubSaleInvoice request)
        {
            if (request == null)
            {
                var bindingErrors = ModelState.Values
                    .SelectMany(x => x.Errors)
                    .Select(x => string.IsNullOrWhiteSpace(x.ErrorMessage) ? x.Exception?.Message : x.ErrorMessage)
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .ToList();
                return BadRequest(new
                {
                    success = false,
                    message = bindingErrors.Count == 0
                        ? "Invoice data was not received."
                        : string.Join(" ", bindingErrors)
                });
            }

            var customerName = request.CustomerName?.Trim();
            var account = db.Tbl_RegisterAccounts.FirstOrDefault(x =>
                ((request.CCode != null && request.CCode > 0 && x.AccCode == request.CCode)
                    || (!string.IsNullOrEmpty(customerName) && x.AccName == customerName))
                && x.HeadName == "Assets"
                && x.SubHeadName == "Current Asset"
                && x.SubSubHeadName == "Customer"
                && x.SubSubSubHeadName == "Customer");
            if (account == null)
            {
                return BadRequest(new { success = false, message = "The selected account was not found." });
            }

            var items = request.Order?
                .Where(x => !string.IsNullOrWhiteSpace(x.Item))
                .ToList() ?? new();
            if (items.Count == 0)
            {
                return BadRequest(new { success = false, message = "Add at least one invoice item." });
            }

            var isSublimation = IsSublimationType(request.SaleType);
            var invoice = request.Id > 0
                ? db.Tbl_SubSaleInvoice.FirstOrDefault(x => x.Id == request.Id)
                : null;
            if (invoice != null && IsSublimation(invoice) != isSublimation)
            {
                return BadRequest(new { success = false, message = "This invoice belongs to another sale type." });
            }
            if (invoice == null)
            {
                invoice = new Tbl_SubSaleInvoice
                {
                    SaleID = (db.Tbl_SubSaleInvoice.Max(x => (long?)x.SaleID) ?? 0) + 1
                };
                db.Tbl_SubSaleInvoice.Add(invoice);
            }

            var invoiceDate = request.Date?.Date ?? DateTime.Today;
            var totalAmount = items.Sum(x => Math.Max(x.Total ?? 0, 0));
            var discount = Math.Max(request.Discount ?? 0, 0);

            invoice.CCode = account.AccCode;
            invoice.CustomerName = account.AccName;
            invoice.Contact = account.Mobile;
            invoice.TotalAmount = totalAmount;
            invoice.Discount = discount;
            invoice.NetTotal = Math.Max(totalAmount - discount, 0);
            invoice.Payment = Math.Max(request.Payment ?? 0, 0);
            invoice.PayMode = string.IsNullOrWhiteSpace(request.PayMode) ? "Debit" : request.PayMode;
            invoice.Date = invoiceDate;
            invoice.DDate = request.DDate?.Date ?? invoiceDate;
            invoice.ITime = request.ITime;
            invoice.SaleType = isSublimation ? SublimationSaleType : StandardSaleType;

            foreach (var requestItem in items)
            {
                var item = requestItem.Id > 0
                    ? db.Tbl_SubSaleInvoiceItem.FirstOrDefault(x => x.Id == requestItem.Id && x.SaleID == invoice.SaleID)
                    : null;
                if (item == null)
                {
                    item = new Tbl_SubSaleInvoiceItem { SaleID = invoice.SaleID };
                    db.Tbl_SubSaleInvoiceItem.Add(item);
                }

                item.Item = requestItem.Item.Trim();
                item.ImageData = string.IsNullOrWhiteSpace(requestItem.ImageData)
                    ? item.ImageData
                    : requestItem.ImageData;
                item.Qty = requestItem.Qty ?? 0;
                item.InchX = requestItem.InchX ?? 0;
                item.InchY = requestItem.InchY ?? 0;
                item.TotalFeet = requestItem.TotalFeet ?? 0;
                item.Rate = requestItem.Rate ?? 0;
                item.Total = requestItem.Total ?? 0;
                item.Date = invoiceDate;
            }

            db.SaveChanges();
            var persistedInvoice = db.Tbl_SubSaleInvoice
                .AsNoTracking()
                .FirstOrDefault(x => x.Id == invoice.Id);
            return Json(new
            {
                success = persistedInvoice != null,
                invoiceId = invoice.Id,
                saleId = invoice.SaleID,
                persisted = persistedInvoice != null,
                message = persistedInvoice != null
                    ? "Invoice saved successfully."
                    : "Invoice was not found after saving."
            });
        }

        [HttpPost]
        public IActionResult DeletePreviousInvoice([FromBody] Tbl_SubSaleInvoice model)
        {
            if (model?.SaleID == null)
            {
                return BadRequest(new { success = false, message = "Invoice number is required." });
            }

            var isSublimation = IsSublimationType(model.SaleType);
            var invoices = db.Tbl_SubSaleInvoice.Where(x => x.SaleID == model.SaleID);
            var invoice = FilterBySaleType(invoices, isSublimation).FirstOrDefault();
            if (invoice == null)
            {
                return NotFound(new { success = false, message = "Invoice was not found." });
            }

            using var transaction = db.Database.BeginTransaction();
            db.Tbl_SubSaleInvoiceItem.RemoveRange(db.Tbl_SubSaleInvoiceItem.Where(x => x.SaleID == invoice.SaleID));
            db.Tbl_SubSaleInvoice.Remove(invoice);
            db.SaveChanges();
            transaction.Commit();
            return Json(new { success = true });
        }

        [HttpPost]
        public JsonResult SaleList([FromBody] Tbl_SubSaleInvoice model)
        {
            var invoices = FilterBySaleType(
                db.Tbl_SubSaleInvoice.AsNoTracking(),
                model?.SaleType);
            if (model?.Date != null)
            {
                invoices = invoices.Where(x => x.Date >= model.Date.Value.Date);
            }
            if (model?.DDate != null)
            {
                invoices = invoices.Where(x => x.Date <= model.DDate.Value.Date);
            }

            return Json(invoices
                .OrderByDescending(x => x.Date)
                .ThenByDescending(x => x.Id)
                .Take(50)
                .ToList());
        }

        [HttpGet]
        public IActionResult List(string dt1, string dt2)
        {
            var invoices = db.Tbl_SubSaleInvoice
                .AsQueryable();
            if (DateTime.TryParse(dt1, out var fromDate))
            {
                invoices = invoices.Where(x => x.Date >= fromDate.Date);
            }
            if (DateTime.TryParse(dt2, out var toDate))
            {
                invoices = invoices.Where(x => x.Date <= toDate.Date);
            }

            return View("~/Views/sales/List.cshtml", invoices
                .OrderByDescending(x => x.Date)
                .ThenByDescending(x => x.Id)
                .Take(50)
                .ToList());
        }

        private static bool IsSublimation(Tbl_SubSaleInvoice invoice)
        {
            return IsSublimationType(invoice?.SaleType);
        }

        private static bool IsSublimationType(string saleType)
        {
            return string.Equals(saleType, SublimationSaleType, StringComparison.OrdinalIgnoreCase);
        }

        private static IQueryable<Tbl_SubSaleInvoice> FilterBySaleType(
            IQueryable<Tbl_SubSaleInvoice> invoices,
            string saleType)
        {
            return FilterBySaleType(invoices, IsSublimationType(saleType));
        }

        private static IQueryable<Tbl_SubSaleInvoice> FilterBySaleType(
            IQueryable<Tbl_SubSaleInvoice> invoices,
            bool isSublimation)
        {
            return isSublimation
                ? invoices.Where(x => x.SaleType == SublimationSaleType)
                : invoices.Where(x => x.SaleType == null || x.SaleType != SublimationSaleType);
        }
    }

    public class InvoiceIdRequest
    {
        public long? Cid { get; set; }
        public string SaleType { get; set; }
    }
}
