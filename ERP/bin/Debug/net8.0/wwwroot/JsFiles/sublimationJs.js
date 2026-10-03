var sublimationItems = [];

$(function () {
    var today = new Date().toISOString().slice(0, 10);
    $("#sublimation-invoice-date, #sublimation-delivery-date, #sublimation-from-date, #sublimation-to-date").val(today);
    $.getJSON("/SubSaleInvoice/getSaleId", function (id) {
        $("#sublimation-saleid").val(id);
        loadSublimationItems(id);
    });
    $("#sublimation-add-item").on("click", addSublimationItem);
    $("#sublimation-save").on("click", saveSublimationInvoice);
    $("#sublimation-search").on("click", loadSublimationInvoices);
    $("#sublimationModal").on("shown.bs.modal", loadSublimationInvoices);
    $("#sublimation-discount, #sublimation-qty, #sublimation-inchx, #sublimation-inchy, #sublimation-rate").on("input change", updateSublimationTotals);
});

function addSublimationItem() {
    var item = $.trim($("#sublimation-item").val());
    var qty = Number($("#sublimation-qty").val()) || 0;
    var height = Number($("#sublimation-inchx").val()) || 0;
    var width = Number($("#sublimation-inchy").val()) || 0;
    var rate = Number($("#sublimation-rate").val()) || 0;
    if (!item || qty <= 0 || height <= 0 || width <= 0 || rate < 0) {
        alert("Enter item, quantity, height, width and rate first.");
        return;
    }
    sublimationItems.push({ Id: 0, SaleID: Number($("#sublimation-saleid").val()) || 0, Item: item, Qty: qty, InchX: height, InchY: width, Rate: rate });
    renderSublimationItems();
    $("#sublimation-item, #sublimation-qty, #sublimation-inchx, #sublimation-inchy, #sublimation-rate").val("");
}

function loadSublimationItems(saleId) {
    $.ajax({ type: "POST", url: "/SubSaleInvoice/fetchSaleItem", contentType: "application/json; charset=utf-8", dataType: "json", data: JSON.stringify({ SaleID: Number(saleId), SaleType: "Sublimation" }), success: function (items) {
        sublimationItems = (items || []).map(function (x) { return { Id: x.Id, SaleID: x.SaleID, Item: x.Item, Qty: Number(x.Qty) || 0, InchX: Number(x.InchX) || 0, InchY: Number(x.InchY) || 0, Rate: Number(x.Rate) || 0 }; });
        renderSublimationItems();
    }});
}

function renderSublimationItems() {
    var html = "";
    sublimationItems.forEach(function (x, i) {
        var area = x.Qty * x.InchX * x.InchY / 144;
        var amount = area * x.Rate;
        x.TotalFeet = area; x.Total = amount;
        html += '<tr data-index="' + i + '"><td>' + subHtml(x.Item) + '</td><td class="sub-edit" contenteditable="true">' + x.Qty + '</td><td>' + x.InchX + '</td><td>' + x.InchY + '</td><td>' + area.toFixed(2) + '</td><td>' + x.Rate + '</td><td>' + amount.toFixed(2) + '</td><td></td></tr>';
    });
    $("#sublimation-item-body").html(html);
    updateSublimationTotals();
}

$(document).on("keyup", "#sublimation-item-body .sub-edit", function () {
    var i = Number($(this).closest("tr").data("index"));
    sublimationItems[i].Qty = Number($(this).text()) || 0;
    renderSublimationItems();
});

function updateSublimationTotals() {
    var area = 0, amount = 0;
    sublimationItems.forEach(function (x) { var a = x.Qty * x.InchX * x.InchY / 144; area += a; amount += a * x.Rate; });
    var q = Number($("#sublimation-qty").val()) || 0, h = Number($("#sublimation-inchx").val()) || 0, w = Number($("#sublimation-inchy").val()) || 0, r = Number($("#sublimation-rate").val()) || 0;
    if (q && h && w) { var draftArea = q * h * w / 144; area += draftArea; amount += draftArea * r; }
    var discount = Number($("#sublimation-discount").val()) || 0;
    $("#sublimation-total-feet").val(area.toFixed(2));
    $("#sublimation-total-amount").val(amount.toFixed(2));
    $("#sublimation-net-total").val(Math.max(amount - discount, 0).toFixed(2));
}

function saveSublimationInvoice() {
    if (!sublimationItems.length) { addSublimationItem(); if (!sublimationItems.length) return; }
    var order = sublimationItems.map(function (x) { return { Id: x.Id || 0, SaleID: x.SaleID, Item: x.Item, Qty: x.Qty, InchX: x.InchX, InchY: x.InchY, TotalFeet: x.TotalFeet, Rate: x.Rate, Total: x.Total, Date: $("#sublimation-invoice-date").val() }; });
    $.ajax({ type: "POST", url: "/SubSaleInvoice/SaleSaveInvoice", contentType: "application/json; charset=utf-8", dataType: "json", data: JSON.stringify({ Id: Number($("#sublimation-id").val()) || 0, SaleID: Number($("#sublimation-saleid").val()), CustomerName: $("#sublimation-customer").val(), TotalAmount: Number($("#sublimation-total-amount").val()) || 0, Discount: Number($("#sublimation-discount").val()) || 0, NetTotal: Number($("#sublimation-net-total").val()) || 0, Payment: Number($("#sublimation-payment").val()) || 0, PayMode: $("#sublimation-payment-mode").val(), Date: $("#sublimation-invoice-date").val(), DDate: $("#sublimation-delivery-date").val(), ITime: new Date().toLocaleTimeString(), SaleType: "Sublimation", Order: order }), success: function (r) { if (r && r.success) { $("#sublimation-id").val(r.invoiceId); $("#sublimation-saleid").val(r.saleId); alert("Sublimation invoice saved successfully."); } else alert((r && r.message) || "Save failed."); }, error: function () { alert("Sublimation invoice save failed."); } });
}

function loadSublimationInvoices() {
    $.ajax({ type: "POST", url: "/SubSaleInvoice/SaleList", contentType: "application/json; charset=utf-8", dataType: "json", data: JSON.stringify({ Date: $("#sublimation-from-date").val(), DDate: $("#sublimation-to-date").val(), SaleType: "Sublimation" }), success: function (items) {
        var html = "";
        (items || []).forEach(function (x) { html += '<tr><td>' + x.SaleID + '</td><td>' + subDate(x.Date) + '</td><td>' + subHtml(x.CustomerName) + '</td><td>' + x.TotalAmount + '</td><td>' + x.Discount + '</td><td>' + x.NetTotal + '</td><td><button type="button" class="btn btn-sm btn-warning" onclick="editSublimationInvoice(' + x.Id + ')"><i class="fa fa-pencil"></i></button></td></tr>'; });
        $("#sublimation-invoice-list").html(html);
    }});
}

function editSublimationInvoice(id) {
    $.ajax({ type: "POST", url: "/SubSaleInvoice/getEditInvoice", contentType: "application/json; charset=utf-8", dataType: "json", data: JSON.stringify({ Cid: id, SaleType: "Sublimation" }), success: function (x) {
        if (!x) return;
        $("#sublimation-id").val(x.Id); $("#sublimation-saleid").val(x.SaleID); $("#sublimation-customer").val(x.CustomerName || ""); $("#sublimation-invoice-date").val((x.Date || "").substring(0, 10)); $("#sublimation-delivery-date").val((x.DDate || "").substring(0, 10)); $("#sublimation-discount").val(x.Discount || 0); $("#sublimation-payment").val(x.Payment || 0); $("#sublimation-payment-mode").val(x.PayMode || "Debit"); loadSublimationItems(x.SaleID); $("#sublimationModal").modal("hide");
    }});
}

function subHtml(value) { return $("<div>").text(value || "").html(); }
function subDate(value) { var d = new Date(value); return isNaN(d) ? "" : String(d.getDate()).padStart(2, "0") + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + d.getFullYear(); }
