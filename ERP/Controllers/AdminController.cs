using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ERPSolution;
using ERPSolution.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPSolution.Controllers
{
    public class AdminController : Controller
    {
        // GET: Admin
        protected dotpos_dbEntities db = new dotpos_dbEntities();
        public ActionResult Home()
        {
            
            return View();
        }
        public ActionResult Finance()
        {

            return View();
        }
        public ActionResult Login(string msg)
        {
            ViewBag.msg = msg; 
            return View();
        }
        [HttpPost]
        public async Task<ActionResult> Login(TblUser model)
        {
            string msg=string.Empty;
            if (!String.IsNullOrWhiteSpace(model.Name))
            {
                if (!String.IsNullOrWhiteSpace(model.Password))
                {
                    bool check = db.TblUsers.Any(x => x.Name == model.Name && x.Password == model.Password);
                    if (check)
                    {
                        var claims = new List<Claim> { new Claim(ClaimTypes.Name, model.Name) };
                        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity), new AuthenticationProperties { IsPersistent = true });
                        Response.Cookies.Append("dec", model.Name, new CookieOptions { Expires = DateTime.Now.AddDays(1) });
                        return RedirectToAction("Home", "Admin");
                    }
                    else
                    {
                        msg = "Invalid Username OR Password!";
                    }
                }
                else
                {
                    msg = "Please Enter Password Or Empty Space Not Supported";
                }
            }
            else
            {
                msg = "Please Enter Username Or Empty Space Not Supported";
            }
            return RedirectToAction("Login", "Admin", new {msg=msg });
        }
        public async Task<ActionResult> Logoutd()
        {
            Response.Headers["Cache-Control"] = "no-cache, no-store";
            Response.Headers["Pragma"] = "no-cache";
            Response.Cookies.Delete("dec");
            Response.Cookies.Append("dec", "", new CookieOptions { Expires = DateTime.Now.AddDays(-1) });
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Login", "Admin");

        }
        public ActionResult UserList(string msg)
        {
            ViewBag.msg = msg;
            return View(db.TblUsers.ToList());
        }
        public ActionResult AddUser(TblUser model, string msg)
        {
            if (model.Id > 0)
            {
                var data = db.TblUsers.Where(x => x.Id == model.Id).ToList().FirstOrDefault();
                model = data;
            }
            else
            {
                var count = db.TblUsers.Count();
                if (count > 0)
                {
                    var ucode = db.TblUsers.Max(x => x.Code);
                    int Incre_ucode = Convert.ToInt32(ucode);
                    ucode = Convert.ToInt32(Convert.ToInt32(Incre_ucode) + 1);
                    model.Code = Convert.ToInt32(ucode);
                }
                else
                {
                    model.Code = Convert.ToInt32(1);
                }
            }
            ViewBag.msg = msg;
            return View(model);
        }
        [HttpPost]
        public ActionResult AddUser(TblUser model)
        {
            string msg = string.Empty;
            if (model.Id > 0)
            {
                db.Entry(model).State = EntityState.Modified;
                db.SaveChanges();
                msg = model.Code + " - " + model.Name + " Updated Successfully!";
                ModelState.Clear();
                model = null;
            }
            else
            {
                db.TblUsers.Add(model);
                db.SaveChanges();
                msg = model.Code + " - " + model.Name + " Added Successfully!";
                ModelState.Clear();
                model = null;
            }
            return RedirectToAction("UserList", "Admin", new { msg = msg });
        }
        public ActionResult DeleteUser(TblUser model)
        {
            string msg = string.Empty;
            var data = db.TblUsers.FirstOrDefault(x => x.Id == model.Id);
            if (data != null)
            {
                var count = db.TblUsers.Count();
                if (count <= 1)
                {
                    msg = "Cannot delete the last user. At least one user is required for login!";
                }
                else
                {
                    db.TblUsers.Remove(data);
                    db.SaveChanges();
                    msg = model.Name + " " + "Deleted Successfully";
                }
            }
            else
            {
                msg = model.Name + " " + "Some Error In This Record";
            }
            return RedirectToAction("UserList", "Admin", new { msg = msg });
        }
        public ActionResult Logout()
        {
            return RedirectToAction("Login","Admin");
        }
        //#############################################################################
        //#############################################################################
        public ActionResult Category()
        {
            return View();
        }
        public JsonResult AddNewCate([FromBody] TblCategory model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.CategoryName))
            {
                return Json(new { success = false, message = "Category name is required." });
            }
            var data = db.TblCategories.DefaultIfEmpty().Max(x => x.CId);
            int cid = Convert.ToInt32(Convert.ToInt32(data) + 1);
            model.CId = cid;
            db.TblCategories.Add(model);
            db.SaveChanges();
            return Json(new { success = true });
        }
        public JsonResult UpdateCate([FromBody] TblCategory model)
        {
            var category = db.TblCategories.FirstOrDefault(x => x.Id == model.Id);
            if (category == null)
            {
                return Json(new { success = false, message = "Category was not found." });
            }

            category.CId = model.CId;
            category.CategoryName = model.CategoryName;
            db.SaveChanges();
            return Json(new { success = true });
        }
        public JsonResult CategoryList()
        {
            var data = db.TblCategories.ToList();
            return Json(data);
        }
        public JsonResult DeleteCate(int ID)
        {
            var data = db.TblCategories.FirstOrDefault(x => x.Id == ID);
            db.TblCategories.Remove(data);
            db.SaveChanges();
            return Json(null);
        }
    }
}
