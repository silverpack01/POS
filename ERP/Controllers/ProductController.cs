using System;
using System.Collections.Generic;
using System.Linq;
using ERPSolution;
using ERPSolution.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace ERPSolution.Controllers
{
    public class ProductController : Controller
    {
        // GET: Product
        string MSMS = AppSettings.DbConnectionString;
        protected dotpos_dbEntities db = new dotpos_dbEntities();
        //###############################################################################################
        //###############################################################################################
        public JsonResult GetRack()
        {
            var racklist = db.TblRacks.ToList();
            return Json(racklist);
        }
        public ActionResult AddRack()
        {
            return View();
        }
        public JsonResult AddNewRack([FromBody] TblRack model)
        {
            var data = db.TblRacks.DefaultIfEmpty().Max(x => x.RCode);
            int rid = Convert.ToInt32(Convert.ToInt32(data) + 1);
            model.RCode = rid;
            db.TblRacks.Add(model);
            db.SaveChanges();
            return Json("");
        }
        public JsonResult UpdateRack([FromBody] TblRack model)
        {
            db.Entry(model).State = EntityState.Modified;
            db.SaveChanges();
            var rcodeCheck = db.TblProducts.Where(x => x.RId == model.RCode).Count();
            if (rcodeCheck > 0)
            {
                SqlConnection con = new SqlConnection(MSMS);
                con.Open();
                SqlCommand cmd = new SqlCommand("Update TblProduct Set RackName='" + model.RackName + "'  Where RId='" + model.RCode + "'", con);
                cmd.ExecuteNonQuery();
                con.Close();
            }
            return Json("");
        }
        public JsonResult RackList()
        {
            var data = db.TblRacks.ToList();
            return Json(data);
        }
        public JsonResult DeleteRack(int ID)
        {
            var data = db.TblRacks.FirstOrDefault(x => x.Id == ID);
            db.TblRacks.Remove(data);
            db.SaveChanges();
            return Json(null);
        }
        //###############################################################################################
        //###############################################################################################
        public ActionResult Unit()
        {
            return View();
        }
        public JsonResult AddNewUnit([FromBody] TblUnit model)
        {
            db.TblUnits.Add(model);
            db.SaveChanges();
            return Json("");
        }
        public JsonResult UnitList()
        {
            var data = db.TblUnits.ToList();
            return Json(data);
        }
        public JsonResult DeleteUnit(int ID)
        {
            var data = db.TblUnits.FirstOrDefault(x => x.Id == ID);
            db.TblUnits.Remove(data);
            db.SaveChanges();
            return Json(null);
        }
        //###############################################################################################
        //###############################################################################################
        public ActionResult Category()
        {
            return View();
        }
        [HttpPost]
        public JsonResult AddNewCate([FromBody] TblCategory model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.CategoryName))
            {
                return Json(new { success = false, message = "Category name is required." });
            }

            var lastCid = db.TblCategories
                .Select(x => (long?)x.CId)
                .Max() ?? 0;

            model.CategoryName = model.CategoryName.Trim();
            model.CId = lastCid + 1;
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
            var cidCheckProduct = db.TblProducts.Where(x => x.CId == model.CId).Count();
            var cidCheckSubCategory = db.TblSubCategories.Where(x => x.CId == model.CId).Count();
            if (cidCheckSubCategory > 0)
            {
                SqlConnection con = new SqlConnection(MSMS);
                con.Open();
                SqlCommand cmd = new SqlCommand("Update TblSubCategory Set CategoryName='" + model.CategoryName + "'  Where CId='" + model.CId + "'", con);
                cmd.ExecuteNonQuery();
                con.Close();
            }
            if (cidCheckProduct > 0)
            {
                SqlConnection con1 = new SqlConnection(MSMS);
                con1.Open();
                SqlCommand cmd1 = new SqlCommand("Update TblProduct Set CategoryName='" + model.CategoryName + "'  Where CId='" + model.CId + "'", con1);
                cmd1.ExecuteNonQuery();
                con1.Close();
            }
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
        //###############################################################################################
        //###############################################################################################
        public JsonResult GetCategory()
        {
            var categorylist = db.TblCategories.ToList();
            return Json(categorylist);
        }
        public JsonResult GetSubCategory()
        {
            var subcategorylist = db.TblSubCategories.ToList();
            return Json(subcategorylist);
        }
        public ActionResult SubCategory()
        {
            return View();
        }
        public JsonResult AddNewSubCate([FromBody] TblSubCategory model)
        {
            var data = db.TblSubCategories.DefaultIfEmpty().Max(x => x.SCId);
            int scid = Convert.ToInt32(Convert.ToInt32(data) + 1);
            model.SCId = scid;
            db.TblSubCategories.Add(model);
            db.SaveChanges();
            return Json("");
        }
        public JsonResult UpdateSubCate([FromBody] TblSubCategory model)
        {
            db.Entry(model).State = EntityState.Modified;
            db.SaveChanges();
            var scidCheckProduct = db.TblProducts.Where(x => x.SCId == model.SCId).Count();
            if (scidCheckProduct > 0)
            {
                SqlConnection con1 = new SqlConnection(MSMS);
                con1.Open();
                SqlCommand cmd1 = new SqlCommand("Update TblProduct Set CId='" + model.CId + "',CategoryName='" + model.CategoryName + "',SubCategoryName='" + model.SubCategoryName + "'  Where SCId='" + model.SCId + "'", con1);
                cmd1.ExecuteNonQuery();
                con1.Close();
            }
            return Json("");
        }
        public JsonResult SubCategoryList([FromBody] TblSubCategory model)
        {
            List<TblSubCategory> subcate;
            if (model.CId != null)
            {
                subcate = db.TblSubCategories.Where(x => x.CId == model.CId).ToList();
            }
            else
            {
                subcate = db.TblSubCategories.ToList();
            }
            return Json(subcate);
        }
        public JsonResult DeleteSubCate(int ID)
        {
            var data = db.TblSubCategories.FirstOrDefault(x => x.Id == ID);
            db.TblSubCategories.Remove(data);
            db.SaveChanges();
            return Json(null);
        }
        //###############################################################################################
        //###############################################################################################
        public JsonResult getBarcode()
        {
            var data = db.TblProducts.DefaultIfEmpty().Max(x => x.Barcode);
            int barco = Convert.ToInt32(Convert.ToInt32(data) + 1);
            return Json(barco);
        }
        public ActionResult AddProduct(TblProduct model)
        {
            if (model.Id > 0)
            {
                var data = db.TblProducts.Where(x => x.Id == model.Id).FirstOrDefault();
                model = data;
            }
            else
            {
                //model = null;
                model.BatchNo = Convert.ToString("B1");
                model.StockLimit = 1;
                model.Size = "None";
                model.Colour = "None";
                model.UnitPack = 1;
                model.Status= "None";
            }
            var units = db.TblUnits.ToList();
            ViewBag.units = new SelectList(units, "UnitName", "UnitName","kg");
            return View(model);
        }

        public ActionResult ProductAdjustment()
        {
            return View();
        }

        public JsonResult GetAdjustmentProduct()
        {
            var data = db.TblProducts.OrderBy(x => x.Item).ToList();
            return Json(data);
        }

        public JsonResult ProductAdjustmentList()
        {
            var data = db.TblProductAdjustments.OrderByDescending(x => x.Id).ToList();
            return Json(data);
        }

        public JsonResult AddProductAdjustment([FromBody] TblProductAdjustment model)
        {
            if (model == null || model.ProductId <= 0)
            {
                return Json(new { success = false, message = "Please Select Item" });
            }

            if (Convert.ToDecimal(model.StockIn) <= 0 && Convert.ToDecimal(model.StockOut) <= 0)
            {
                return Json(new { success = false, message = "Please Enter Stock In Or Stock Out" });
            }

            if (Convert.ToDecimal(model.StockIn) > 0 && Convert.ToDecimal(model.StockOut) > 0)
            {
                return Json(new { success = false, message = "Enter Stock In Or Stock Out" });
            }

            var product = db.TblProducts.FirstOrDefault(x => x.Id == model.ProductId);
            if (product == null)
            {
                return Json(new { success = false, message = "Item was not found." });
            }

            var adjustment = model.Id > 0
                ? db.TblProductAdjustments.FirstOrDefault(x => x.Id == model.Id)
                : null;

            if (model.Id > 0 && adjustment == null)
            {
                return Json(new { success = false, message = "Adjustment was not found." });
            }

            TblProduct oldProduct = null;
            if (adjustment != null)
            {
                oldProduct = db.TblProducts.FirstOrDefault(x =>
                    x.Barcode == adjustment.Barcode && x.BatchNo == adjustment.BatchNo);

                if (oldProduct == null)
                {
                    return Json(new { success = false, message = "Previous item was not found." });
                }

                oldProduct.StockInHand = Convert.ToDecimal(oldProduct.StockInHand)
                    - Convert.ToDecimal(adjustment.StockIn)
                    + Convert.ToDecimal(adjustment.StockOut);
            }

            model.Barcode = product.Barcode;
            model.BatchNo = product.BatchNo;
            model.Item = product.Item;
            model.Date = model.Date == default ? DateTime.Now.Date : model.Date.Date;

            var stockIn = Convert.ToDecimal(model.StockIn);
            var stockOut = Convert.ToDecimal(model.StockOut);
            product.StockInHand = Convert.ToDecimal(product.StockInHand) + stockIn - stockOut;

            if (adjustment == null)
            {
                db.TblProductAdjustments.Add(model);
            }
            else
            {
                adjustment.Barcode = model.Barcode;
                adjustment.BatchNo = model.BatchNo;
                adjustment.Item = model.Item;
                adjustment.StockIn = model.StockIn;
                adjustment.StockOut = model.StockOut;
                adjustment.Date = model.Date;
            }

            db.SaveChanges();
            if (oldProduct != null && oldProduct.Id != product.Id)
            {
                UpdateStock(oldProduct);
            }
            UpdateStock(product);

            return Json(new { success = true });
        }

        [HttpPost]
        public JsonResult DeleteProductAdjustment(long id)
        {
            var adjustment = db.TblProductAdjustments.FirstOrDefault(x => x.Id == id);
            if (adjustment == null)
            {
                return Json(new { success = false, message = "Adjustment was not found." });
            }

            var product = db.TblProducts.FirstOrDefault(x =>
                x.Barcode == adjustment.Barcode && x.BatchNo == adjustment.BatchNo);

            if (product == null)
            {
                return Json(new { success = false, message = "Item was not found." });
            }

            product.StockInHand = Convert.ToDecimal(product.StockInHand)
                - Convert.ToDecimal(adjustment.StockIn)
                + Convert.ToDecimal(adjustment.StockOut);

            db.TblProductAdjustments.Remove(adjustment);
            db.SaveChanges();
            UpdateStock(product);

            return Json(new { success = true });
        }

        public JsonResult AddNewProduct([FromBody] TblProduct model)
        {
            if (model == null)
            {
                return Json("");
            }

            bool productExists = model.Id > 0 && db.TblProducts.AsNoTracking().Any(x => x.Id == model.Id);

            if (productExists)
            {
                if (model.DisPer <= 0 && model.DisAmt <= 0)
                {
                    model.DisPer = Convert.ToDecimal(0);
                    model.DisAmt = Convert.ToDecimal(0);
                    model.SaleAmt = model.SaleRate;
                }
                db.Entry(model).State = EntityState.Modified;
                db.SaveChanges();
            }
            else
            {
                model.Id = 0;
                if (model.Barcode == null)
                {
                    var data = db.TblProducts.DefaultIfEmpty().Max(x => x.Barcode);
                    int barco = Convert.ToInt32(Convert.ToInt32(data) + 1);
                    model.Barcode = barco;
                }
                if (model.DisPer <= 0 && model.DisAmt <= 0)
                {
                    model.DisPer = Convert.ToDecimal(0);
                    model.DisAmt = Convert.ToDecimal(0);
                    model.SaleAmt = model.SaleRate;
                }
                db.TblProducts.Add(model);
                db.SaveChanges();
            }
            UpdateStock(model);
            return Json("");
        }
        private void UpdateStock(TblProduct model)
        {
            if (model?.Barcode == null) return;
            var productData = db.TblProducts.Where(x => x.Barcode == model.Barcode && x.BatchNo == model.BatchNo).FirstOrDefault();
            if (productData == null) return;
            var _product = db.TblProducts.Where(x => x.Barcode == model.Barcode && x.BatchNo == model.BatchNo).Sum(x => x.StockInHand);
            decimal _sumVar = Convert.ToDecimal(_product);
            productData.Stock = _sumVar;
            db.Entry(productData).State = EntityState.Modified;
            db.SaveChanges();
        }
        public JsonResult ProductList([FromBody] TblProduct model)
        {
            var items = db.TblProducts.OrderByDescending(x=>x.Id).ToList();
            return Json(items);
        }
        public JsonResult DeleteProduct(int ID)
        {
            var data = db.TblProducts.FirstOrDefault(x => x.Id == ID);
            db.TblProducts.Remove(data);
            db.SaveChanges();
            return Json(null);
        }
        //###############################################################################################
        //###############################################################################################
        public JsonResult GetProduct()
        {
            var data = db.TblProducts.ToList();
            return Json(data);
        }
        public JsonResult GetProductID([FromBody] TblProduct model)
        {
            var racklist = db.TblProducts.Where(x => x.Id == model.Id).FirstOrDefault();
            return Json(racklist);
        }
        //###############################################################################################
        //###############################################################################################
        public ActionResult ApplyDiscount()
        {
            return View();
        }
        //ApplyPercentage
        public JsonResult ApplyPercentage([FromBody] TblProduct model)
        {
            decimal finddisamt = Convert.ToDecimal(Convert.ToDecimal(model.SaleRate) * Convert.ToDecimal(model.DisPer) / 100);
            decimal finalrate = Convert.ToDecimal(Convert.ToDecimal(model.SaleRate) - Convert.ToDecimal(finddisamt));
            model.DisPer = Convert.ToDecimal(model.DisPer);
            model.DisAmt = Convert.ToDecimal(finddisamt);
            model.SaleAmt = Convert.ToDecimal(finalrate);
            SqlConnection con = new SqlConnection(MSMS);
            con.Open();
            SqlCommand cmd = new SqlCommand("Update TblProduct Set DisPer='" + model.DisPer + "',DisAmt='" + model.DisAmt + "',SaleAmt='" + model.SaleAmt + "' Where Id='" + model.Id + "'", con);
            cmd.ExecuteNonQuery();
            con.Close();
            return Json("");
        }
        public JsonResult ApplyAmount([FromBody] TblProduct model)
        {
            decimal saleRate = Convert.ToDecimal(model.SaleRate);
            decimal disAmt = Convert.ToDecimal(model.DisAmt);
            decimal disPer = (saleRate > 0) ? (disAmt / saleRate) * 100 : 0;
            decimal saleAmt = saleRate - disAmt;
            model.DisPer = disPer;
            model.SaleAmt = saleAmt;
            SqlConnection con = new SqlConnection(MSMS);
            con.Open();
            SqlCommand cmd = new SqlCommand("Update TblProduct Set DisPer='" + model.DisPer + "',DisAmt='" + model.DisAmt + "',SaleAmt='" + model.SaleAmt + "' Where Id='" + model.Id + "'", con);
            cmd.ExecuteNonQuery();
            con.Close();
            return Json("");
        }
        //###############################################################################################
        //###############################################################################################
        public ActionResult AllStock()
        {
            return View();
        }
        public ActionResult StockReport()
        {
            return View();
        }
    }
}
