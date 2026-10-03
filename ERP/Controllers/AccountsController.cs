using System;
using System.Collections.Generic;
using System.Linq;
using ERPSolution;
using ERPSolution.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPSolution.Controllers
{
    public class AccountsController : Controller
    {
        // GET: Accounts
        string MSMS = AppSettings.DbConnectionString;
        protected dotpos_dbEntities db = new dotpos_dbEntities();
        //####################################################################################
        //                H E A D     CODE       S T A R T
        //######################################################################################
        public ActionResult Head(string msg)
        {
            ViewBag.msg = msg;
            var count=db.TblHeads.Count();
            if (count>0)
            {
                var _HeadCode = db.TblHeads.Max(x => x.Head_Code);
                int Incre_HeadCode = Convert.ToInt32(_HeadCode);
                Incre_HeadCode = Convert.ToInt32(Convert.ToInt32(_HeadCode) + 1);
                ViewBag.hcode = Convert.ToInt32(Incre_HeadCode);
            }
            else
            {
                ViewBag.hcode = Convert.ToInt32(1);
            }
            
            return View(db.TblHeads.ToList());
        }
        public ActionResult SaveHead(TblHead model)
        {
            string msg= string.Empty;
            if (!String.IsNullOrEmpty(model.Head_Name))
            {
                bool checkHeadName = db.TblHeads.Any(x => x.Head_Name == model.Head_Name);
                if (checkHeadName)
                {
                    msg = "This Head Name Is Already Esit";
                }
                else
                {
                    db.TblHeads.Add(model);
                    db.SaveChanges();
                    msg =model.Head_Name +" " +"Save Successfuly";
                }
            }
            else
            {
                msg = "Please Enter Head Name";
            }
            return RedirectToAction("Head", "Accounts", new {msg=msg });
        }
        public ActionResult HeadDelete(TblHead model)
        {
            string msg = string.Empty;
            var data = db.TblHeads.FirstOrDefault(x => x.Id == model.Id);
            if (data != null)
            {
                db.TblHeads.Remove(data);
                db.SaveChanges();
                msg = model.Head_Name + " " + "Deleted Successfully";
            }
            else
            {
                msg = model.Head_Name + " " + "Some Error In This Record";
            }
           
            return RedirectToAction("Head", "Accounts", new { msg = msg });
        }
         //###################################################################################
        //                  H E A D           C O D E       C O M P L E T E
       //                  S U B-H E A  D     C O D E       S T A R T
      //######################################################################################
        public JsonResult getHead()
        {
            var tblHeads = db.TblHeads.ToList();
            return Json(tblHeads);
        }
        public ActionResult SubHead(TblSubHead model,string msg)
        {
            if (model.Id>0)
            {
                var data = db.TblSubHeads.Where(x => x.Id == model.Id).FirstOrDefault();
                model = data;
            }
            else
            {
                var count = db.TblSubHeads.Count();
                if (count > 0)
                {
                    var _SubHeadCode = db.TblSubHeads.Max(x => x.sub_Head_Code);
                    int Incre_SubHeadCode = Convert.ToInt32(_SubHeadCode);
                    Incre_SubHeadCode = Convert.ToInt32(Convert.ToInt32(_SubHeadCode) + 1);
                    model.sub_Head_Code = Convert.ToInt32(Incre_SubHeadCode);
                }
                else
                {
                    model.sub_Head_Code = Convert.ToInt32(1);
                }
            }
            ViewBag.msg=msg;
            return View(model);
        }
        [HttpPost]
        public ActionResult SubHead(TblSubHead model)
        {
            string msg=string.Empty;
            bool checkSubHeadName = db.TblSubHeads.Any(x => x.sub_Head_Name == model.sub_Head_Name);
            if (checkSubHeadName)
            {
                msg = "This Sub Head Name Is Already Esit";
            }
            else
            {
                if (model.Id > 0)
                {
                    db.Entry(model).State = EntityState.Modified;
                    db.SaveChanges();
                    msg = model.sub_Head_Code + " - " + model.sub_Head_Name + " Updated Successfully!";
                    ModelState.Clear();
                    model = null;
                }
                else
                {
                    db.TblSubHeads.Add(model);
                    db.SaveChanges();
                    msg = model.sub_Head_Code + " - " + model.sub_Head_Name + " Added Successfully!";
                    ModelState.Clear();
                    model = null;
                }
            }
            return RedirectToAction("SubHead", "Accounts", new {msg=msg });
        }
        public ActionResult SubHeadList(string msg)
        {
            ViewBag.msg=msg;
            return View(db.TblSubHeads.ToList());
        }
        public ActionResult SubHeadDelete(TblSubHead model)
        {
            string msg= string.Empty;
            var data = db.TblSubHeads.FirstOrDefault(x => x.Id == model.Id);
            if (data != null)
            {
                db.TblSubHeads.Remove(data);
                db.SaveChanges();
                msg = model.sub_Head_Name + " " + "Deleted Successfully";
            }
            else
            {
                msg = model.sub_Head_Name + " " + "Some Error In This Record";
            }
            return RedirectToAction("SubHeadList", "Accounts", new {msg=msg });
        }
          //###################################################################################
         //                S U B         H E A D     C O D E       C O M P L E T E
        //                 S U B  S U B  H E A D     C O D E       S T A R T
       //######################################################################################
        public JsonResult getSubHead()
        {
            var tblHeads = db.TblSubHeads.ToList();
            return Json(tblHeads);
        }
        public ActionResult SubSubHead(TblSubSubHead model, string msg)
        {
            if(model.Id>0)
            {
                var data=db.TblSubSubHeads.Where(x=>x.Id==model.Id).FirstOrDefault();
                model = data;
            }else
            {
                var count = db.TblSubSubHeads.Count();
                if (count > 0)
                {
                    var _SubSubHeadCode = db.TblSubSubHeads.Max(x => x.sub_subHead_Code);
                    int Incre_SubsubHeadCode = Convert.ToInt32(_SubSubHeadCode);
                    Incre_SubsubHeadCode = Convert.ToInt32(Convert.ToInt32(_SubSubHeadCode) + 1);
                    model.sub_subHead_Code = Convert.ToInt32(Incre_SubsubHeadCode);
                }
                else
                {
                    model.sub_subHead_Code = Convert.ToInt32(1);
                }
            }

            ViewBag.msg = msg;
            return View(model);
        }
        [HttpPost]
        public ActionResult SubSubHead(TblSubSubHead model)
        {
            string msg = string.Empty;
            bool checkSubHeadName = db.TblSubSubHeads.Any(x => x.sub_subHead_Name == model.sub_subHead_Name);
            if (checkSubHeadName)
            {
                msg = "This Sub Sub Head Name Is Already Esit";
            }
            else
            {
                if (model.Id > 0)
                {
                    db.Entry(model).State = EntityState.Modified;
                    db.SaveChanges();
                    msg = model.sub_subHead_Code + " - " + model.sub_subHead_Name + " Updated Successfully!";
                    ModelState.Clear();
                    model = null;
                }
                else
                {
                    db.TblSubSubHeads.Add(model);
                    db.SaveChanges();
                    msg = model.sub_subHead_Code + " - " + model.sub_subHead_Name + " Added Successfully!";
                    ModelState.Clear();
                    model = null;
                }
            }
            return RedirectToAction("SubSubHead", "Accounts", new { msg = msg });
        }
        public ActionResult SubSubHeadList(string msg)
        {
            ViewBag.msg = msg;
            return View(db.TblSubSubHeads.ToList());
        }
        public ActionResult SubSubHeadDelete(TblSubSubHead model)
        {
            string msg = string.Empty;
            var data = db.TblSubSubHeads.FirstOrDefault(x => x.Id == model.Id);
            if (data != null)
            {
                db.TblSubSubHeads.Remove(data);
                db.SaveChanges();
                msg = model.sub_subHead_Name + " " + "Deleted Successfully";
            }
            else
            {
                msg = model.sub_subHead_Name + " " + "Some Error In This Record";
            }
            return RedirectToAction("SubSubHeadList", "Accounts", new { msg = msg });
        }
        //###################################################################################
        //                S U B         H E A D     C O D E       C O M P L E T E
        //                 S U B  S U B  H E A D     C O D E       S T A R T
        //######################################################################################
        public ActionResult SubSubSubHead(TblSubSubSubHead model, string msg)
        {
            if (model.Id > 0)
            {
                var data = db.TblSubSubSubHeads.Where(x => x.Id == model.Id).FirstOrDefault();
                model = data;
            }
            else
            {
                var count = db.TblSubSubSubHeads.Count();
                if (count > 0)
                {
                    var _SubSubHeadCode = db.TblSubSubSubHeads.Max(x => x.SubSubSubHeadCode);
                    int Incre_SubsubHeadCode = Convert.ToInt32(_SubSubHeadCode);
                    Incre_SubsubHeadCode = Convert.ToInt32(Convert.ToInt32(_SubSubHeadCode) + 1);
                    model.SubSubSubHeadCode = Convert.ToInt32(Incre_SubsubHeadCode);
                }
                else
                {
                    model.SubSubSubHeadCode = Convert.ToInt32(1);
                }
            }

            ViewBag.msg = msg;
            return View(model);
        }
        [HttpPost]
        public ActionResult SubSubSubHead(TblSubSubSubHead model)
        {
            string msg = string.Empty;
            bool checkSubHeadName = db.TblSubSubSubHeads.Any(x => x.SubSubSubHeadName == model.SubSubSubHeadName);
            if (!String.IsNullOrEmpty(model.SubHeadName) && !String.IsNullOrEmpty(model.SubSubHeadName))
            {
                if (model.Id > 0)
                {
                    db.Entry(model).State = EntityState.Modified;
                    db.SaveChanges();
                    msg = model.SubSubSubHeadCode + " - " + model.SubSubSubHeadName + " Updated Successfully!";
                    ModelState.Clear();
                    model = null;
                }
                else
                {
                    db.TblSubSubSubHeads.Add(model);
                    db.SaveChanges();
                    msg = model.SubSubSubHeadCode + " - " + model.SubSubSubHeadName + " Added Successfully!";
                    ModelState.Clear();
                    model = null;
                }
            }
            else
            {
                msg = "Please Select Account Head";
            }
            return RedirectToAction("SubSubSubHead", "Accounts", new { msg = msg });
        }
        public ActionResult SubSubSubHeadList(string msg)
        {
            ViewBag.msg = msg;
            return View(db.TblSubSubSubHeads.ToList());
        }
        public ActionResult SubSubSubHeadDelete(TblSubSubSubHead model)
        {
            string msg = string.Empty;
            var data = db.TblSubSubSubHeads.FirstOrDefault(x => x.Id == model.Id);
            if (data != null)
            {
                db.TblSubSubSubHeads.Remove(data);
                db.SaveChanges();
                msg = model.SubSubSubHeadName + " " + "Deleted Successfully";
            }
            else
            {
                msg = model.SubSubSubHeadName + " " + "Some Error In This Record";
            }
            return RedirectToAction("SubSubSubHeadList", "Accounts", new { msg = msg });
        }
        //####################################################################################
        //                 S U B  S U B  H E A D     C O D E           C O M P L E T E
        //                  A C C O U N T     R E G I S T R A T I O N   S T A R T
        //######################################################################################
        public JsonResult getSubSubHead()
        {
            var tblHeads = db.TblSubSubHeads.OrderBy(x=>x.HeadCode).ToList();
            return Json(tblHeads);
        }
        public JsonResult getSubSubSubHead()
        {
            var tblHeads = db.TblSubSubSubHeads.OrderBy(x => x.HeadCode).ToList();
            return Json(tblHeads);
        }
        public ActionResult ChartOfAccounts()
        {
            var model = new ChartOfAccountsViewModel
            {
                Heads = db.TblHeads.OrderBy(x => x.Head_Code).ToList(),
                SubHeads = db.TblSubHeads.OrderBy(x => x.sub_Head_Code).ToList(),
                SubSubHeads = db.TblSubSubHeads.OrderBy(x => x.sub_subHead_Code).ToList(),
                SubSubSubHeads = db.TblSubSubSubHeads.OrderBy(x => x.SubSubSubHeadCode).ToList(),
                Accounts = db.Tbl_RegisterAccounts.OrderBy(x => x.AccCode).ToList()
            };

            return View(model);
        }
        public ActionResult AccountReg(Tbl_RegisterAccounts model,string msg)
        {
           if (model.Id>0)
            {
                var data = db.Tbl_RegisterAccounts.Where(x => x.Id == model.Id).FirstOrDefault();
                model = data;
            }
            else
            {
                var count=db.Tbl_RegisterAccounts.Count();
                if(count>0)
                {
                    var AccountRegister=db.Tbl_RegisterAccounts.Max(x=>x.AccCode);
                    var increAccount=Convert.ToInt32(AccountRegister);
                    increAccount = Convert.ToInt32(Convert.ToInt32(AccountRegister) + 1);
                    model.AccCode = Convert.ToInt32(increAccount);
                }
                else
                {
                    model.AccCode = Convert.ToInt32(1);
                }
            }
            ViewBag.msg = msg;
            return View(model);
        }
        [HttpPost]
        public ActionResult AccountReg(Tbl_RegisterAccounts model)
        {
            int status = Convert.ToInt32(model.Status);
            string msg = string.Empty;
            if (!String.IsNullOrEmpty(model.HeadName) && !String.IsNullOrEmpty(model.SubHeadName))
            {
                if (model.Id > 0)
                {
                    var checkAccountName = db.Tbl_RegisterAccounts.Where(x => x.AccName == model.AccName).Count();
                    if (checkAccountName > 1)
                    {
                        msg = "This Account Name Is Already Esit";
                    }
                    else
                    {
                        db.Entry(model).State = EntityState.Modified;
                        db.SaveChanges();
                        msg = model.AccCode + " - " + model.AccName + " Updated Successfully!";
                        ModelState.Clear();
                        model = null;
                    }
                }
                else
                {
                    bool checkAccountName = db.Tbl_RegisterAccounts.Any(x => x.AccName == model.AccName);
                    if (checkAccountName)
                    {
                        msg = "This Account Name Is Already Esit";
                    }
                    else
                    {
                        db.Tbl_RegisterAccounts.Add(model);
                        db.SaveChanges();
                        msg = model.AccCode + " - " + model.AccName + " Added Successfully!";
                        ModelState.Clear();
                        model = null;
                    }
                }
            }
            else
            {
                msg = "Please Select Account Title";
            }
            return RedirectToAction("AccountReg", "Accounts", new { msg = msg,Status=status });
        }
        public ActionResult AccountRegList(string msg,int? Status)
        {
            ViewBag.msg = msg;
            string s1 = "Cash in Hand";
            string s2 = "Capital";
            List<Tbl_RegisterAccounts> item;
            if (Status!=null)
            {
                item = db.Tbl_RegisterAccounts.Where(x=>x.Status==Status).ToList();
            }
            else
            {
                item = db.Tbl_RegisterAccounts.Where(x=>x.AccName != s1 && x.AccName != s2).ToList();
            }
            return View(item);
        }
        public ActionResult AccountRegDelete(Tbl_RegisterAccounts model)
        {
            string msg = string.Empty;
            var data = db.Tbl_RegisterAccounts.FirstOrDefault(x => x.Id == model.Id);
            if (data != null)
            {
                db.Tbl_RegisterAccounts.Remove(data);
                db.SaveChanges();
                msg = model.AccName + " " + "Deleted Successfully";
            }
            else
            {
                msg = model.AccName + " " + "Some Error In This Record";
            }
            return RedirectToAction("AccountRegList", "Accounts", new { msg = msg, Status = model.Status });
        }
        
    }
}
