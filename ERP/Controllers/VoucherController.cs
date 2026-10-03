using System;
using System.Collections.Generic;
using System.Linq;
using ERPSolution;
using ERPSolution.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPSolution.Controllers
{
    public class VoucherController : Controller
    {
        string MSMS = AppSettings.DbConnectionString;
        protected dotpos_dbEntities db = new dotpos_dbEntities();
        // GET: Voucher

        //###################################################################################
        //                 L E D G E R    CODE       S T A R T
        //####################################################################################
        public JsonResult GetSId()
        {
            var AccountRegister = db.TblLedgers.DefaultIfEmpty().Max(x => x.Voucher_Id);
            return Json(AccountRegister);
        }
        public JsonResult getAccounts()
        {
            var tblHeads = db.Tbl_RegisterAccounts.ToList();
            return Json(tblHeads);
        }

        public JsonResult getBank()
        {
            var tblHeads = db.Tbl_RegisterAccounts.Where(x=>x.SubSubHeadName == "Payment").ToList();
            return Json(tblHeads);
        }
        public JsonResult getLedger()
        {
            var tblHeads = db.TblLedgers.ToList();
            return Json(tblHeads);
        }

        [HttpGet]
        public JsonResult GetPaymentCreditVouchers()
        {
            var vouchers = db.TblLedgers
                .AsNoTracking()
                .Where(x => x.VoucherType == "CPV" || x.VoucherType == "BPV")
                .OrderByDescending(x => x.Date)
                .ThenByDescending(x => x.Id)
                .ToList();

            return Json(vouchers);
        }
        public ActionResult Voucher(string head, string type)
        {
            ViewBag.head = head;
            ViewBag.type = type;
            return View();
        }
        [HttpPost]
        public JsonResult SaveAPRPayment([FromBody] SaveAPRPaymentRequest request)
        {
            if (request?.vendor == null || request.vendor.Length == 0)
            {
                return Json(new { message = "No data received", VoucherType = (string)null, Date = (DateTime?)null });
            }
            DateTime? Date = request.Date;
            string VoucherType = request.VoucherType;
            foreach (var i in request.vendor)
            {
                if (i.Id>0)
                {
                    if (i.VoucherType=="CPV" || i.VoucherType == "BPV" || i.VoucherType=="CN")
                    {
                        i.Credit = i.Debit;
                        i.Debit = Convert.ToDecimal(0);
                        i.Date=Convert.ToDateTime(Date);
                        db.Entry(i).State = EntityState.Modified;
                    }
                    else
                    {
                        if (i.VoucherType == "CRV" || i.VoucherType == "BRV" || i.VoucherType == "DN")
                        {
                            i.Credit = Convert.ToDecimal(0);
                            i.Date = Convert.ToDateTime(Date);
                            db.Entry(i).State = EntityState.Modified;
                        }
                    }
                }
                else
                {
                    if (i.VoucherType == "CPV" || i.VoucherType == "BPV" || i.VoucherType == "CN")
                    {
                        i.Voucher_Id = 0;
                        i.Credit = i.Debit;
                        i.Debit = Convert.ToDecimal(0);
                        i.Date = Convert.ToDateTime(Date);
                        db.TblLedgers.Add(i);
                    }
                    else
                    {
                        if (i.VoucherType == "CRV" || i.VoucherType == "BRV" || i.VoucherType == "DN")
                        {
                            i.Voucher_Id = 0;
                            i.Credit = Convert.ToDecimal(0);
                            i.Date = Convert.ToDateTime(Date);
                            db.TblLedgers.Add(i);
                        }
                    }
                }
            }
            db.SaveChanges();
            return Json(new
            {
                message = "Posted Successfully",
                VoucherType = VoucherType,
                Date = Date
            });
        }
        public JsonResult SaveVoucher([FromBody] SaveVoucherRequest request)
        {
            if (request?.order != null)
            {
                foreach (var i in request.order)
                {
                    if (i.Id > 0)
                    {
                        i.RefCode = i.Account_Code;
                        i.RefName=i.Account_Name;
                        i.Date = request.udate;
                        db.Entry(i).State = EntityState.Modified;
                        db.SaveChanges();
                        //updateNewCustomerBook(i,udate);
                    }
                    else
                    {
                        i.RefCode = i.Account_Code;
                        i.RefName = i.Account_Name;
                        i.Date = request.udate;
                        //updateNewCustomerBook(i, udate);
                        db.TblLedgers.Add(i);
                        db.SaveChanges();
                        
                        //UpdateAccountRegister(i);
                    }
                }
            }
            return Json("Voucher Posted successfully!");
        }
        
        public JsonResult VList([FromBody] TblLedger model)
        {
            var tblHeads = db.TblLedgers.Where(x =>x.Date == model.Date && x.VoucherType == model.VoucherType).ToList();
            return Json(tblHeads);
        }
        public JsonResult CVList([FromBody] TblLedger model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.VoucherType) || !model.Date.HasValue)
            {
                return Json(new List<TblLedger>());
            }

            var startDate = model.Date.Value.Date;
            var endDate = startDate.AddDays(1);
            var tblHeads = db.TblLedgers
                .Where(x => x.VoucherType == model.VoucherType
                    && x.Date >= startDate
                    && x.Date < endDate)
                .ToList();
            return Json(tblHeads);
        }

        [HttpPost]
        public IActionResult DeleteOld([FromForm] DeleteLedgerRequest request)
        {
            if (request == null || request.ID <= 0)
            {
                return BadRequest(new { success = false, message = "A valid ledger ID is required." });
            }

            var data = db.TblLedgers.FirstOrDefault(x => x.Id == request.ID);
            if (data == null)
            {
                return NotFound(new { success = false, message = "Voucher record was not found." });
            }

            db.TblLedgers.Remove(data);
            db.SaveChanges();
            return Json(new { success = true });
        }
        public ActionResult DeleteVoucher(TblLedger model)
        {
            string msg = string.Empty;
            var data = db.TblLedgers.FirstOrDefault(x => x.Id == model.Id);
            if (data != null)
            {
                db.TblLedgers.Remove(data);
                db.SaveChanges();
                msg = model.Account_Name + " " + "Deleted Successfully";
            }
            else
            {
                msg = model.Account_Name + " " + "Some Error In This Record";
            }
            return RedirectToAction("VoucherList", "Voucher", new { msg = msg });
        }
        [HttpPost]
        public JsonResult UpdateVoucher(int Id, decimal Credit, decimal Debit)
        {
            var voucher = db.TblLedgers.FirstOrDefault(v => v.Id == Id);

            if (voucher != null)
            {
                voucher.Credit = Credit;
                voucher.Debit = Debit;
                db.SaveChanges();
            }

            return Json(new { success = true });
        }
        public ActionResult AccountReport(string msg)
        {
            ViewBag.msg = msg;
            return View(db.TblLedgers.ToList());

        }
        
        //#####################################################################################################
        //#####################################################################################################
        public ActionResult CR(string head, string type)
        {
            ViewBag.head = head;
            ViewBag.type = type;
            return View();
        }
        
        public ActionResult PaymentVoucher()
        {
            return View();
        }

        // RECEIVING VOUCHER SCREEN

        public ActionResult ReceivingVoucher()
        {
            return View();
        }

        public ActionResult PaymentCreditVoucher()
        {
            return View();
        }
        // END RECEIVING VOUCHER
    }
}
