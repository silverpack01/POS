using System;
using System.Collections.Generic;
using System.Linq;
using ERPSolution;
using ERPSolution.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPSolution.Controllers
{
    public class TblProfileController : Controller
    {
        string MSMS = AppSettings.DbConnectionString;
        protected dotpos_dbEntities db = new dotpos_dbEntities();
        // GET: TblProfile
        public static string Name()
        {
            using (var db = new dotpos_dbEntities())
            {
                return db.TblProfiles
                         .Select(x => x.Name)
                         .FirstOrDefault();
            }
        }
        public static string Address()
        {
            using (var db = new dotpos_dbEntities())
            {
                return db.TblProfiles
                         .Select(x => x.Address)
                         .FirstOrDefault();
            }
        }
        public static string Mobile()
        {
            using (var db = new dotpos_dbEntities())
            {
                return db.TblProfiles
                         .Select(x => x.MobileNo)
                         .FirstOrDefault();
            }
        }
        public static string Phone()
        {
            using (var db = new dotpos_dbEntities())
            {
                return db.TblProfiles
                         .Select(x => x.Phone)
                         .FirstOrDefault();
            }
        }
        public ActionResult Index()
        {
            return View(db.TblProfiles.ToList());
        }

        // GET: TblProfiles/Details/5
        public ActionResult Details(long? id)
        {
            if (id == null)
            {
                return BadRequest();
            }
            TblProfile tblProfile = db.TblProfiles.Find(id);
            if (tblProfile == null)
            {
                return NotFound();
            }
            return View(tblProfile);
        }

        // GET: TblProfiles/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: TblProfiles/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(TblProfile tblProfile)
        {
            if (ModelState.IsValid)
            {
                db.TblProfiles.Add(tblProfile);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(tblProfile);
        }

        // GET: TblProfiles/Edit/5
        public ActionResult Edit(long? id)
        {
            if (id == null)
            {
                return BadRequest();
            }
            TblProfile tblProfile = db.TblProfiles.Find(id);
            if (tblProfile == null)
            {
                return NotFound();
            }
            return View(tblProfile);
        }

        // POST: TblProfiles/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(TblProfile tblProfile)
        {
            if (ModelState.IsValid)
            {
                db.Entry(tblProfile).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(tblProfile);
        }

        // GET: TblProfiles/Delete/5
        public ActionResult Delete(long? id)
        {
            if (id == null)
            {
                return BadRequest();
            }
            TblProfile tblProfile = db.TblProfiles.Find(id);
            if (tblProfile == null)
            {
                return NotFound();
            }
            return View(tblProfile);
        }

        // POST: TblProfiles/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(long id)
        {
            TblProfile tblProfile = db.TblProfiles.Find(id);
            db.TblProfiles.Remove(tblProfile);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        public ActionResult Test()
        {
            return View();
        }
    }
}
