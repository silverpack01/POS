$(document).ready(function () {
    if ($("#sublimation-page").length) return;
    currentItemImageData = currentItemImageData || "";
    fetchSaleId();
    //loadData2();
    $("#date").kendoDatePicker({ value: new Date(), format: "yyyy-MM-dd", });
    $("#sdate").kendoDatePicker({ value: new Date(), format: "yyyy-MM-dd", });
    $("#fdate").kendoDatePicker({ value: new Date(), format: "yyyy-MM-dd", });
    $("#ldate").kendoDatePicker({ value: new Date(), format: "yyyy-MM-dd", });
    function fetchSaleId() {
        $.ajax({
            type: "GET",
            url: "/SubSaleInvoice/getSaleId",
            data: "{}",
            success: function (data) {
                $("#saleid").val(data);
                loadData();
            }
        });
    };
    var dataSource1 = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/SubSaleInvoice/GetAccounts",
                data: { saleType: "Standard" },
                dataType: "json"
            }
        }
    });
    $("#custid").kendoComboBox({
        dataTextField: "CustomerName",
        dataValueField: "CCode",
        filter: "contains",
        dataSource: dataSource1,
        change: function (e) {
            var account = resolveAccount(e.sender);
            if (!account) {
                $("#ccode, #cname, #comp, #contact").val("");
                $("#pbal").val("0.00");
                $("#previous-rate").val("0.00");
                sum();
                return;
            }
            $("#ccode").val(account.CCode || "");
            $("#cname").val(account.CustomerName || "");
            $("#comp").val("");
            $("#contact").val("");
            $("#tcname").text(account.CustomerName || "");
            setCustomerBalance(account);
            loadPreviousRate(account.CCode, "Standard", "#previous-rate");
        }
    });

    initPaymentAccountCombo("#pmode");

    $("#discount, #payment").on("input change", sum);
    $("#itemImage").on("change", function () {
        var file = this.files && this.files[0];
        var preview = $("#itemImagePreview");
        if (!file) {
            preview.attr("src", "").hide();
            return;
        }

        if (!file.type || !file.type.startsWith("image/")) {
            this.value = "";
            preview.attr("src", "").hide();
            alert("Please select an image file.");
            return;
        }

        var reader = new FileReader();
        reader.onload = function (event) {
            currentItemImageData = event.target.result;
            preview.attr("src", event.target.result).show();
        };
        reader.readAsDataURL(file);
    });
});

var currentItemImageData = "";

function resolveAccount(combo) {
    if (!combo) return null;
    var account = combo.dataItem();
    if (account) return account;
    var text = $.trim(combo.text() || "").toLowerCase();
    if (!text) return null;
    var accounts = combo.dataSource.data();
    for (var i = 0; i < accounts.length; i++) {
        if ($.trim(accounts[i].CustomerName || "").toLowerCase() === text) {
            return accounts[i];
        }
    }
    return null;
}

function initPaymentAccountCombo(selector) {
    var input = $(selector);
    if (!input.length || !window.kendo) return null;

    var combo = input.data("kendoComboBox");
    if (combo) return combo;

    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/SubSaleInvoice/GetPaymentAccounts",
                dataType: "json"
            }
        }
    });

    input.kendoComboBox({
        dataTextField: "AccountName",
        dataValueField: "AccountName",
        filter: "contains",
        suggest: true,
        dataSource: dataSource
    });

    combo = input.data("kendoComboBox");
    dataSource.fetch().then(function () {
        if (combo.value()) return;
        var accounts = dataSource.view();
        var cash = accounts.find(function (account) {
            return String(account.AccountName || "").toLowerCase() === "cash";
        });
        if (cash) combo.value(cash.AccountName);
        else if (accounts.length) combo.value(accounts[0].AccountName);
    });

    return combo;
}

function setPaymentAccountValue(selector, value) {
    var combo = $(selector).data("kendoComboBox");
    if (!combo) {
        $(selector).val(value || "");
        return;
    }

    var setValue = function () {
        combo.value(value || "");
        if (!combo.value() && value) combo.text(value);
    };
    if (combo.dataSource.view().length === 0) combo.dataSource.fetch().then(setValue);
    else setValue();
}
//###########################################################################
//###########################################################################
var _item = document.getElementById("Item");
if (_item) {
    _item.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            $("#qty").focus();
        }
    });
}
//###########################################################################
var _qty = document.getElementById("qty");
if (_qty) {
    _qty.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            $("#inchx").focus();
        }
    });
}
//###########################################################################
var _inchx = document.getElementById("inchx");
if (_inchx) {
    _inchx.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            $("#inchy").focus();
        }
    });
}
//###########################################################################
var _inchy = document.getElementById("inchy");
if (_inchy) {
    _inchy.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            $("#rate").focus();
        }
    });
}
//###########################################################################
var _rate = document.getElementById("rate");
if (_rate) {
    _rate.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.keyCode === 13) {
            event.preventDefault();
            saveInvoice();
        }
    });
}

$("#save-invoice-from-rate").on("click", function (event) {
    event.preventDefault();
    saveInvoice();
});
function addProduct() {
    let id = 0;
    let item = $("#Item").val().trim();
    let qty = $("#qty").val().trim();
    let inchx = $("#inchx").val().trim();
    let inchy = $("#inchy").val().trim();
    let rate = $("#rate").val().trim();
    var saleid = $("#saleid").val();
    //###################################################################################################
    // DTF / Printing formula: Qty x (Height x Width) x Rate.
    let feets = parseFloat(qty) * parseFloat(inchx) * parseFloat(inchy);
    let total = Number((feets * parseFloat(rate)).toFixed(2));
    //###################################################################################################
    var tBody = $("#itemtbl > tbody")[0];
    //Add Row.
    var row = tBody.insertRow(-1);
    row.classList.add('custom-row-class');
    //row.css("border-top","2px solid #000000");
    //Add Name cell. style="border-top:2px solid #000000"
    // ##########################################################
    var cell = $(row.insertCell(-1));
    cell.html(id);
    cell.css("color", "black");
    cell.css("font-weight", "bold");
    cell.css("display", "none");
    cell.attr('align', "center");
    // ##########################################################
    var cell = $(row.insertCell(-1));
    cell.html(saleid);
    cell.css("color", "black");
    cell.css("font-weight", "bold");
    cell.css("display", "none");
    cell.attr('align', "center");
    // ###########################################################
    var cell = $(row.insertCell(-1));
    cell.html(item);
    cell.css("color", "black");
    cell.css("font-weight", "bold");
    //cell.css("display", "none");
    cell.attr('align', "center");
    // ###########################################################
    var cell = $(row.insertCell(-1));
    cell.html(qty);
    cell.css("color", "black");
    cell.css("font-weight", "bold");
    //cell.css("display", "none");
    cell.attr('align', "center");
    // ###########################################################
    var cell = $(row.insertCell(-1));
    cell.html(inchx);
    cell.css("color", "black");
    cell.css("font-weight", "bold");
    //cell.css("display", "none");
    cell.attr('align', "center");
    // ###########################################################
    var cell = $(row.insertCell(-1));
    cell.html(inchy);
    cell.css("color", "black");
    cell.css("font-weight", "bold");
    //cell.css("display", "none");
    cell.attr('align', "center");
    // ###########################################################
    var cell = $(row.insertCell(-1));
    cell.html(feets.toFixed(2));
    cell.css("color", "black");
    cell.css("font-weight", "bold");
    //cell.css("display", "none");
    cell.attr('align', "center");
    // ###########################################################
    var cell = $(row.insertCell(-1));
    cell.html(rate);
    cell.css("color", "black");
    cell.css("font-weight", "bold");
    //cell.css("display", "none");
    cell.attr('align', "center");
    // ###########################################################
    var cell = $(row.insertCell(-1));
    cell.html(total.toFixed(2));
    cell.css("color", "black");
    cell.css("font-weight", "bold");
    //cell.css("display", "none");
    cell.attr('align', "center");
    // ###########################################################
    cell = $(row.insertCell(-1));
    cell.attr('align', "center");
    cell.html(currentItemImageData
        ? '<img class="table-item-image" src="' + currentItemImageData + '" alt="Item image" />'
        : '<span class="no-item-image">—</span>');
    // ###########################################################
    cell = $(row.insertCell(-1));
    cell.addClass('divhi');
    var btnRemove = $("<input />");
    btnRemove.attr("type", "submit");
    btnRemove.attr("class", "btn btn-sm btn-danger ");
    btnRemove.attr("onclick", "Remove(this);");
    btnRemove.val("Del");
    cell.append(btnRemove);
    //###########################################################
    $("#Item").val('');
    $("#qty").val('');
    $("#inchx").val('');
    $("#inchy").val('');
    $("#rate").val('');
    $("#itemImage").val('');
    $("#itemImagePreview").attr("src", "").hide();
    currentItemImageData = "";
    $("#Item").focus();
    sum();
};
function Remove(button) {
    //Determine the reference of the Row using the Button.
    var row = $(button).closest("TR");
    var name = $("TD", row).eq(2).html();
    if (confirm("Do you want to delete: " + name)) {
        //Get the reference of the Table.
        var table = $("#itemtbl")[0];
        table.deleteRow(row[0].rowIndex);
        sum();
    }
};
//##########################################################################
$("#itemtbl").on('input keyup', '.next, .nextt', function () {
    var currentRow = $(this).closest("tr");
    var qty = parseFloat(currentRow.find("td:eq(3)").text()) || 0;
    var height = parseFloat(currentRow.find("td:eq(4)").text()) || 0;
    var width = parseFloat(currentRow.find("td:eq(5)").text()) || 0;
    var rate = parseFloat(currentRow.find("td:eq(7)").text()) || 0;
    var area = qty * height * width;
    var amount = area * rate;

    currentRow.find("td:eq(6)").html(area.toFixed(2));
    currentRow.find("td:eq(8)").html(amount.toFixed(2));
    sum();
});
//##########################################################################
function loadData() {
    var id = 1;
    var saleid = $("#saleid").val();
    var empObj = {
        Id: id,
        SaleID: saleid,
    };
    $.ajax({
        url: "/SubSaleInvoice/fetchSaleItem",
        data: JSON.stringify(empObj),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            var html = '';
            $.each(result, function (key, item) {
                html += '<tr style="border-top:2px solid #000000">';
                html += '<td class="aa" align="center" style="display:none;font-weight:bold;color:#000000">' + item.Id + '</td>';
                html += '<td class="aa" align="center" style="display:none;font-weight:bold;color:#000000">' + item.SaleID + '</td>';
                html += '<td class="aa" align="center" style="font-weight:bold;color:#000000">' + item.Item + '</td>';
                html += '<td class="aa next" align="center" contenteditable="True" style="font-weight:bold;color:#000000">' + item.Qty + '</td>';
                html += '<td class="aa" align="center" style="font-weight:bold;color:#000000">' + item.InchX + '</td>';
                html += '<td class="aa" align="center" style="font-weight:bold;color:#000000">' + item.InchY + '</td>';
                html += '<td class="aa nextt" align="center" contenteditable="True" style="font-weight:bold;color:#000000">' + item.TotalFeet + '</td>';
                html += '<td class="aa" align="center" style="font-weight:bold;color:#000000">' + item.Rate + '</td>';
                html += '<td class="aa" align="center" style="font-weight:bold;color:#000000">' + item.Total + '</td>';
                html += '<td class="aa" align="center">' + (item.ImageData
                    ? '<img class="table-item-image" src="' + item.ImageData + '" alt="Item image" />'
                    : '<span class="no-item-image">—</span>') + '</td>';
                html += '<td class="divhi"><a href="#" class="btn btn-sm btn-danger" onclick="Delele(' + item.Id + '); return false;"><i class="fa fa-trash-o"></i></a></td>';
                html += '</tr>';
            });
            $('.itembody2').html(html);
            sum();
        },
        error: function (errormessage) {
            alert(errormessage.responseText);
        }
    });
};
function Delele(ID) {
    var ans = confirm("Are you sure you want to delete this Record?");
    if (ans) {
        $.ajax({
            url: "/SubSaleInvoice/Delete/" + ID,
            type: "POST",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            success: function (result) {
                loadData();
                sum();
            },
            error: function (errormessage) {
                alert(errormessage.responseText);
            }
        });
    }
};

function saveInvoice() {
    var draftItem = $("#Item").val().trim();
    var draftQty = $("#qty").val().trim();
    var draftInchX = $("#inchx").val().trim();
    var draftInchY = $("#inchy").val().trim();
    var draftRate = $("#rate").val().trim();
    var hasDraft = draftItem || draftQty || draftInchX || draftInchY || draftRate;
    if (hasDraft) {
        if (!draftItem || !draftQty || !draftInchX || !draftInchY || !draftRate) {
            alert("Please complete the item fields before saving.");
            return;
        }
        addProduct();
    }
    sum();
    var uid = Number($("#uid").val()) || 0;
    var saleid = Number($("#saleid").val()) || 0;
    var combo = $('#custid').data("kendoComboBox");
    var selectedAccount = resolveAccount(combo);
    var ccode = Number($("#ccode").val()) || Number(selectedAccount && selectedAccount.CCode) || Number(combo && combo.value()) || 0;
    var cname = $("#cname").val() || (selectedAccount && selectedAccount.CustomerName) || (combo ? combo.text() : "");
    var cont = $("#contact").val();
    var date = getDatePickerValue("#date") || $("#date").val();
    var sdate = getDatePickerValue("#sdate") || $("#sdate").val();
    var totalamount = Number($("#totalamt").val()) || 0;
    var discc = Number($("#discount").val()) || 0;
    var nettotal = Number($("#nettotal").val()) || 0;
    var payment = Number($("#payment").val()) || 0;
    var pmode = $("#pmode").val();
    var itime = $("#time").val();
    var orderArr = [];
    orderArr.length = 0;

    $.each($("#itemtbl tbody tr"), function () {
        var imageData = $(this).find("td:eq(9) img").attr("src") || "";
        orderArr.push({
            Id: Number($(this).find('td:eq(0)').text()) || 0,
            SaleID: Number($(this).find('td:eq(1)').text()) || saleid,
            Item: $(this).find('td:eq(2)').text().trim(),
            Qty: Number($(this).find('td:eq(3)').text()) || 0,
            InchX: Number($(this).find('td:eq(4)').text()) || 0,
            InchY: Number($(this).find('td:eq(5)').text()) || 0,
            TotalFeet: Number($(this).find('td:eq(6)').text()) || 0,
            Rate: Number($(this).find('td:eq(7)').text()) || 0,
            Total: Number($(this).find('td:eq(8)').text()) || 0,
            ImageData: imageData,
            Date: date
        });
    });
    if (!ccode && !cname.trim()) {
        alert("Please select an account.");
        return;
    }
    if (!orderArr.some(function (line) { return line.Item.length > 0; })) {
        alert("Please add at least one invoice item.");
        return;
    }
    var data = JSON.stringify({
        Id: uid,
        SaleID: saleid,
        CCode: ccode || null,
        CustomerName: cname,
        Contact: cont,
        TotalAmount: totalamount,
        Discount: discc,
        NetTotal: nettotal,
        Payment: payment,
        Date: date,
        DDate: sdate,
        ITime: itime,
        PayMode: pmode,
        order: orderArr
    });
    $.ajax({
        url: "/SubSaleInvoice/SaleSaveInvoice",
        data: data,
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (!result || result.success !== true || result.persisted !== true) {
                alert((result && result.message) || "Invoice was not saved in the database.");
                return;
            }
             $("#uid").val(result.invoiceId || uid);
             $("#saleid").val(result.saleId || saleid);
             alert("Invoice saved successfully. Invoice #" + (result.saleId || saleid));
             location.reload();
         },
        error: function (errormessage) {
            alert(errormessage.responseJSON && errormessage.responseJSON.message
                ? errormessage.responseJSON.message
                : (errormessage.responseText || "Invoice save failed."));
        }
    });
};

function formatSaleDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    var day = String(date.getDate()).padStart(2, "0");
    var month = String(date.getMonth() + 1).padStart(2, "0");
    return day + "-" + month + "-" + date.getFullYear();
}
function setCustomerBalance(account) {
    $("#pbal").val(Number(account && account.Balance || 0).toFixed(2));
    $("#previous-rate").val(Number(account && account.PreviousRate || 0).toFixed(2));
    sum();
};

function loadPreviousRate(customerCode, saleType, targetSelector) {
    customerCode = Number(customerCode) || 0;
    if (!customerCode) {
        $(targetSelector).val("0.00");
        return;
    }

    $.getJSON("/SubSaleInvoice/GetPreviousRate", {
        ccode: customerCode,
        saleType: saleType
    }).done(function (result) {
        $(targetSelector).val(Number(result && result.PreviousRate || 0).toFixed(2));
    }).fail(function () {
        $(targetSelector).val("0.00");
    });
}

function refreshStandardCustomerSummary() {
    var combo = $("#custid").data("kendoComboBox");
    if (!combo) return;

    var customerCode = combo.value();
    combo.dataSource.read().then(function () {
        setCustomerBalanceForCode(customerCode);
        loadPreviousRate(customerCode, "Standard", "#previous-rate");
    });
}

function refreshSublimationCustomerSummary() {
    var combo = $("#sublimation-customer").data("kendoComboBox");
    if (!combo) return;

    var customerCode = combo.value();
    combo.dataSource.read().then(function () {
        setSublimationCustomerBalance(combo.dataItem());
        loadPreviousRate(customerCode, "Sublimation", "#sublimation-previous-rate");
    });
}

function setCustomerBalanceForCode(code, balanceOverride, rateOverride) {
    var combo = $("#custid").data("kendoComboBox");
    if (!combo) {
        setCustomerBalance({ Balance: balanceOverride, PreviousRate: rateOverride });
        return;
    }

    var applyBalance = function () {
        var account = combo.dataItem();
        if (!account) {
            var accounts = combo.dataSource.data();
            for (var i = 0; i < accounts.length; i++) {
                if (String(accounts[i].CCode) === String(code)) {
                    account = accounts[i];
                    break;
                }
            }
        }

        setCustomerBalance(balanceOverride === undefined
            ? account
            : { Balance: balanceOverride, PreviousRate: rateOverride });
    };

    if (combo.dataSource.view().length === 0) {
        combo.dataSource.fetch().then(applyBalance);
    } else {
        applyBalance();
    }
};
function CancelInvoice() {
    var cid = $("#saleid").val();
    var ccode = $("#ccode").val();
    var cname = $("#cname").val();
    var empObj = {
        SaleID: cid,
        CCode: ccode,
        CustomerName: cname,
        SaleType: "Standard"
    };
    $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/DeletePreviousInvoice",
        data: JSON.stringify(empObj),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result) {
            location.reload();
        }
    });
};
var saleListRequest = null;

function getDatePickerValue(selector) {
    var picker = $(selector).data("kendoDatePicker");
    var date = picker ? picker.value() : null;
    return date ? kendo.toString(date, "yyyy-MM-dd") : null;
}

function SearchloadData() {
    var fdate = getDatePickerValue("#fdate");
    var ldate = getDatePickerValue("#ldate");
    var empObj = {
        Date: fdate,
        DDate: ldate,
        SaleType: "Standard"
    };

    // Prevent overlapping searches from rendering stale/duplicate results.
    if (saleListRequest) {
        saleListRequest.abort();
    }
    $(".spobody").empty();

    saleListRequest = $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/SaleList",
        data: JSON.stringify(empObj),
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            //console.log(result);
            var html = '';
            var invoiceIds = new Set();
            $.each(result, function (key, item) {
                if (invoiceIds.has(item.SaleID)) return;
                invoiceIds.add(item.SaleID);
                html += '<tr>';
                html += '<td class="aa">' + item.SaleID + '</td>';
                html += '<td class="aa">' + formatSaleDate(item.Date) + '</td>';
                html += '<td class="aa">' + item.CustomerName + '</td>';
                html += '<td class="aa">' + item.TotalAmount + '</td>';
                html += '<td class="aa">' + item.Discount + '</td>';
                html += '<td class="aa">' + item.NetTotal + '</td>';
                html += '<td class="aa">' + item.Payment + '</td>';
                html += '<td class="aa">' + (item.PayMode || 'Debit') + '</td>';
                html += '<td class=""><a href="#" class="btn btn-sm btn-warning" onclick="updateSaleId(' + item.Id + '); return false;"><i class="fa fa-pencil"></i></a> ';
                html += '<a href="#" class="btn btn-sm btn-danger" onclick="deleteSavedInvoice(' + item.SaleID + '); return false;"><i class="fa fa-trash"></i></a></td>';
                html += '</tr>';
            });
            $('.spobody').html(html);
        },
        error: function (errormessage) {
            if (errormessage.statusText === "abort") return;
            alert(errormessage.responseText);
        },
        complete: function () {
            saleListRequest = null;
        }
    });
};
function deleteSavedInvoice(saleId) {
    if (!confirm("Delete invoice #" + saleId + "?")) return;
    $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/DeletePreviousInvoice",
        data: JSON.stringify({ SaleID: saleId }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
            SearchloadData();
            refreshStandardCustomerSummary();
        },
        error: function (xhr) {
            alert(xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : "Invoice delete failed.");
        }
    });
}
function updateSaleId(ID) {
    //alert(ID);
    $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/getEditInvoice",
        data: JSON.stringify({ Cid: Number(ID), SaleType: "Standard" }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result) {
            $("#uid").val(result.Id);
            $("#saleid").val(result.SaleID);
            $("#ccode").val(result.CCode);
            $("#cname").val(result.CustomerName);
            $("#tcname").text(result.CustomerName || "");
            $("#contact").val(result.Contact);
            $("#totalamt").val(result.TotalAmount);
            $("#discount").val(result.Discount);
            $("#nettotal").val(result.NetTotal);
            $("#payment").val(result.Payment);
            setPaymentAccountValue("#pmode", result.PayMode);
            $("#time").val(result.ITime);
            var item = $('#custid').data("kendoComboBox");
            item.value(result.CCode);
            $("#ccode").val(result.CCode);
            $("#cname").val(result.CustomerName || "");
            $("#contact").val(result.Contact || "");
            var item1 = $('#date').data("kendoDatePicker");
            item1.value(result.Date);
            var item2 = $('#sdate').data("kendoDatePicker");
            item2.value(result.DDate);
            setCustomerBalanceForCode(result.CCode, result.PreviousBalance, result.PreviousRate);
            $('#myModal').modal('hide');
            $('.modal-backdrop').hide();
            loadData();
        }
    });
};
function Refresh() {
    location.reload();
};
var _discount = document.getElementById("discount");
var _rpay = document.getElementById("payment");
function textValues() {
    $("#tcname").text($("#cname").val());
    $("#tname").text($("#custn").val());
    $("#tgpass").text($("#gpass").val());
    $("#tvehno").text($("#vehno").val());
    //$("#tname").text($("#custn").val());
    $("#trby").text($("#rby").val());
    $("#tprby").text($("#prby").val());
    $("#tcont").text($("#contact").val());
    $("#tidate").text($("#date").val());
    $("#tddate").text($("#sdate").val());
    $("#tamt").text($("#totalamt").val());
    $("#tdis").text($("#discount").val());
    //$("#tcharges").text($("#charges").val());
    $("#tgtotal").text($("#nettotal").val());
    $("#tpbal").text($("#pbal").val());
    $("#ttrec").text($("#trec").val());
    $("#tsinv").text($("#saleid").val());
    $("#ttime").text($("#time").val());
    $("#tpmode").text($("#pmode").val());
    $("#tcpay").text($("#cpay").val());
    $("#tcret").text($("#cret").val());
    $("#tdtime").text($("#dtime").val());
    //$(".divhi").hide();tpmode
    //$(".tfhide").show();
};
function printdiv(printpage) {
    return printSalesReceipt("standard");
};

function printSublimationInvoice() {
    return printSalesReceipt("sublimation");
}

function receiptText(value) {
    return $("<div>").text(value == null ? "" : String(value)).html();
}

function receiptNumber(value) {
    var number = Number(value);
    return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

function receiptDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return String(date.getDate()).padStart(2, "0") + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + date.getFullYear();
}

function receiptProfile() {
    var profile = $("#receipt-profile");
    return {
        name: profile.data("name") || "Sales Receipt",
        address: profile.data("address") || "",
        mobile: profile.data("mobile") || "",
        phone: profile.data("phone") || ""
    };
}

function printSalesReceipt(type) {
    var isSublimation = type === "sublimation";
    var profile = receiptProfile();
    var rows = [];
    var invoiceId = isSublimation ? $("#sublimation-saleid").val() : $("#saleid").val();
    var customer = isSublimation ? $("#sublimation-customer").val() : $("#cname").val() || $("#custid").val();
    var invoiceDate = isSublimation ? $("#sublimation-invoice-date").val() : $("#date").val();
    var total = isSublimation ? $("#sublimation-total-amount").val() : $("#totalamt").val();
    var discount = isSublimation ? $("#sublimation-discount").val() : $("#discount").val();
    var netTotal = isSublimation ? $("#sublimation-net-total").val() : $("#nettotal").val();
    var payment = isSublimation ? $("#sublimation-payment").val() : $("#payment").val();
    var paymentMode = isSublimation ? $("#sublimation-payment-mode").val() : $("#pmode").val();
    var selector = isSublimation ? "#sublimation-item-body tr" : "#itemtbl tbody tr";

    $(selector).each(function () {
        var cells = $(this).find("td");
        if (isSublimation) {
            rows.push({ item: cells.eq(0).text(), qty: cells.eq(1).text(), size: cells.eq(2).text() + " x " + cells.eq(3).text(), rate: cells.eq(5).text(), amount: cells.eq(6).text() });
        } else {
            rows.push({ item: cells.eq(2).text(), qty: cells.eq(3).text(), size: cells.eq(4).text() + " x " + cells.eq(5).text(), rate: cells.eq(7).text(), amount: cells.eq(8).text() });
        }
    });

    if (!rows.length) {
        alert("Add at least one item before printing.");
        return false;
    }

    var itemHtml = rows.map(function (row) {
        return "<tr><td class=receipt-item>" + receiptText(row.item) + "</td><td>" + receiptText(row.qty) + "</td><td>" + receiptText(row.size) + "</td><td>" + receiptNumber(row.rate) + "</td><td class=receipt-money>" + receiptNumber(row.amount) + "</td></tr>";
    }).join("");
    var contact = [profile.mobile, profile.phone].filter(Boolean).join(" | ");
    var receipt = $("<div id=thermal-receipt class=thermal-receipt></div>");
    receipt.html(
        "<div class=receipt-business>" + receiptText(profile.name) + "</div>" +
        (profile.address ? "<div class=receipt-muted>" + receiptText(profile.address) + "</div>" : "") +
        (contact ? "<div class=receipt-muted>" + receiptText(contact) + "</div>" : "") +
        "<div class=receipt-rule></div>" +
        "<div class=receipt-title>" + (isSublimation ? "SUBLIMATION RECEIPT" : "SALES RECEIPT") + "</div>" +
        "<div class=receipt-meta><span>Invoice: <b>" + receiptText(invoiceId || "-") + "</b></span><span>" + receiptText(receiptDate(invoiceDate)) + "</span></div>" +
        "<div class=receipt-customer>Customer: <b>" + receiptText(customer || "Walk-in Customer") + "</b></div>" +
        "<table class=receipt-table><thead><tr><th>Item</th><th>Qty</th><th>Size</th><th>Rate</th><th class=receipt-money>Amount</th></tr></thead><tbody>" + itemHtml + "</tbody></table>" +
        "<div class=receipt-rule></div>" +
        "<div class=receipt-total-row><span>Total</span><b>" + receiptNumber(total) + "</b></div>" +
        "<div class=receipt-total-row><span>Discount</span><b>" + receiptNumber(discount) + "</b></div>" +
        "<div class=receipt-total-row receipt-grand-total><span>NET TOTAL</span><b>" + receiptNumber(netTotal) + "</b></div>" +
        "<div class=receipt-total-row><span>Paid</span><b>" + receiptNumber(payment) + "</b></div>" +
        "<div class=receipt-total-row><span>Balance</span><b>" + receiptNumber(Math.max(Number(netTotal) - Number(payment), 0)) + "</b></div>" +
        (paymentMode ? "<div class=receipt-payment>Payment: " + receiptText(paymentMode) + "</div>" : "") +
        "<div class=receipt-rule></div><div class=receipt-thanks>Thank you for your business!</div>"
    );
    $("#thermal-receipt").remove();
    $("body").append(receipt).addClass("thermal-print-active");
    window.print();
    window.setTimeout(function () {
        $("body").removeClass("thermal-print-active");
        receipt.remove();
    }, 500);
    return false;
}
var _cpay = document.getElementById("cpay");
if (_cpay) {
    _cpay.addEventListener("keyup", function (event) {
        paidbalance();
    });
}
function paidbalance() {
    let grossValue = $("#grosstotal").val();
    let paidValue = $("#cpay").val().trim();
    //alert(grossValue);
    let balValue = parseFloat(parseFloat(paidValue) - parseFloat(grossValue));
    $("#cret").val(balValue.toFixed(2))
};

var _charges = document.getElementById("charges");
if (_charges) {
    _charges.addEventListener("keydown", function (event) {
        if (event.keyCode === 13) {
            sum();
        }
    });
}
function sum() {
    updateDraftTotals();
};
function updateDraftTotals() {
    var totalFeet = 0;
    var totalAmount = 0;
    $("#itemtbl > TBODY > tr").each(function () {
        var feet = parseFloat($(this).find('td:eq(6)').text());
        var amount = parseFloat($(this).find('td:eq(8)').text());
        if (Number.isFinite(feet)) totalFeet += feet;
        if (Number.isFinite(amount)) totalAmount += amount;
    });

    var qty = parseFloat($("#qty").val());
    var inchX = parseFloat($("#inchx").val());
    var inchY = parseFloat($("#inchy").val());
    var rate = parseFloat($("#rate").val());
    if (Number.isFinite(qty) && Number.isFinite(inchX) && Number.isFinite(inchY) && Number.isFinite(rate)) {
        // DTF / Printing formula: Qty x (Height x Width) x Rate.
        var draftFeet = qty * inchX * inchY;
        totalFeet += draftFeet;
        totalAmount += Number((draftFeet * rate).toFixed(2));
    }

    $("#totalfeets").val(totalFeet.toFixed(2));
    $("#totalamt").val(totalAmount.toFixed(2));
    discountFun();
}
$(document).on("input change", "#Item, #qty, #inchx, #inchy, #rate", updateDraftTotals);
function discountFun() {
    let discount = Math.max(parseFloat($("#discount").val()) || 0, 0);
    let total = parseFloat($("#totalamt").val()) || 0;
    $("#nettotal").val(Math.max(total - discount, 0).toFixed(2));
};
var sublimationItems = [];
var sublimationImageData = "";

$(function () {
    if (!$("#sublimation-page").length) return;
    var today = new Date().toISOString().slice(0, 10);
    initSublimationKendo();
    $("#sublimation-invoice-date, #sublimation-delivery-date, #sublimation-from-date, #sublimation-to-date").val(today);
    $.getJSON("/SubSaleInvoice/getSaleId", function (id) {
        $("#sublimation-saleid").val(id);
        loadSublimationItems(id);
    });
    $("#sublimation-item").on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            $("#sublimation-qty").focus();
        }
    });
    $("#sublimation-qty").on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            $("#sublimation-inchx").focus();
        }
    });
    $("#sublimation-inchx").on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            $("#sublimation-inchy").focus();
        }
    });
    $("#sublimation-inchy").on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            $("#sublimation-rate").focus();
        }
    });
    $("#sublimation-rate").on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addSublimationItem();
        }
    });
    $("#sublimation-save").on("click", saveSublimationInvoice);
    $("#sublimation-delete").on("click", function () {
        var saleId = Number($("#sublimation-saleid").val()) || 0;
        if (saleId) {
            deleteSublimationInvoice(saleId);
        } else {
            alert("There is no saved invoice to delete.");
        }
    });
    $("#sublimation-search").on("click", loadSublimationInvoices);
    $("#sublimationModal").on("shown.bs.modal", loadSublimationInvoices);
    $("#sublimation-image").on("change", function () {
        var file = this.files && this.files[0];
        if (!file || !file.type.startsWith("image/")) {
            this.value = "";
            sublimationImageData = "";
            $("#sublimation-image-preview").attr("src", "").hide();
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            sublimationImageData = e.target.result;
            $("#sublimation-image-preview")
                .attr("src", sublimationImageData)
                .show();
        };
        reader.readAsDataURL(file);
    });
    updateSublimationTotals();
});

function initSublimationKendo() {
    if (!window.kendo) return;
    var accounts = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/SubSaleInvoice/GetAccounts",
                data: { saleType: "Sublimation" },
                dataType: "json"
            }
        }
    });

    if (!$("#sublimation-customer").data("kendoComboBox")) {
        $("#sublimation-customer").kendoComboBox({
            dataTextField: "CustomerName",
            dataValueField: "CCode",
            filter: "contains",
            dataSource: accounts,
            change: function (e) {
                var account = e.sender.dataItem();
                setSublimationCustomerBalance(account);
                loadPreviousRate(account && account.CCode, "Sublimation", "#sublimation-previous-rate");
            }
        });
    }

    initPaymentAccountCombo("#sublimation-payment-mode");

    $("#sublimation-invoice-date, #sublimation-delivery-date, #sublimation-from-date, #sublimation-to-date").each(function () {
        if (!$(this).data("kendoDatePicker")) {
            $(this).kendoDatePicker({
                value: new Date(),
                format: "yyyy-MM-dd"
            });
        }
    });
}

function setSublimationCustomerBalance(account) {
    $("#sublimation-previous-balance")
        .val(Number(account && account.Balance || 0).toFixed(2));
    $("#sublimation-previous-rate")
        .val(Number(account && account.PreviousRate || 0).toFixed(2));
}

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
    sublimationItems.push({
        Id: 0,
        SaleID: Number($("#sublimation-saleid").val()) || 0,
        Item: item,
        Qty: qty,
        InchX: height,
        InchY: width,
        Rate: rate,
        ImageData: sublimationImageData
    });
    renderSublimationItems();
    $("#sublimation-item, #sublimation-qty, #sublimation-inchx, #sublimation-inchy, #sublimation-rate").val("");
    $("#sublimation-image").val("");
    $("#sublimation-image-preview").attr("src", "").hide();
    sublimationImageData = "";
}

function loadSublimationItems(saleId) {
    $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/fetchSaleItem",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            SaleID: Number(saleId),
            SaleType: "Sublimation"
        }),
        success: function (items) {
            sublimationItems = (items || []).map(function (x) {
                return {
                    Id: x.Id,
                    SaleID: x.SaleID,
                    Item: x.Item,
                    Qty: Number(x.Qty) || 0,
                    InchX: Number(x.InchX) || 0,
                    InchY: Number(x.InchY) || 0,
                    Rate: Number(x.Rate) || 0,
                    ImageData: x.ImageData || ""
                };
            });
            renderSublimationItems();
        }
    });
}

function renderSublimationItems() {
    var html = "";
    sublimationItems.forEach(function (x, i) {
        var area = x.Qty * x.InchX * x.InchY / 144;
        var amount = area * x.Rate;
        x.TotalFeet = area; x.Total = amount;
        html += '<tr data-index="' + i + '">';
        html += '<td>' + subHtml(x.Item) + '</td>';
        html += '<td class="sub-edit" contenteditable="true">' + x.Qty + '</td>';
        html += '<td>' + x.InchX + '</td>';
        html += '<td>' + x.InchY + '</td>';
        html += '<td>' + area.toFixed(2) + '</td>';
        html += '<td>' + x.Rate + '</td>';
        html += '<td>' + amount.toFixed(2) + '</td>';
        html += '<td>' + (x.ImageData
            ? '<img class="table-item-image" src="' + x.ImageData + '" alt="Item image" />'
            : '<span class="no-item-image">—</span>') + '</td>';
        html += '<td><button type="button" class="btn btn-sm btn-danger" onclick="deleteSublimationItem(' + i + '); return false;"><i class="fa fa-trash"></i></button></td></tr>';
    });
    $("#sublimation-item-body").html(html);
    updateSublimationTotals();
}

$(document).on("input", "#sublimation-item-body .sub-edit", function () {
    var i = Number($(this).closest("tr").data("index"));
    if (!sublimationItems[i]) return;
    sublimationItems[i].Qty = Number($(this).text()) || 0;
    updateSublimationTotals();
});

function deleteSublimationItem(index) {
    var item = sublimationItems[index];
    if (!item) return;

    if (!window.confirm("Delete this invoice item?")) return;

    if (!item.Id) {
        sublimationItems.splice(index, 1);
        renderSublimationItems();
        return;
    }

    $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/Delete/" + item.Id,
        dataType: "json",
        success: function (result) {
            if (!result || result.success !== true) {
                alert((result && result.message) || "Invoice item could not be deleted.");
                return;
            }

            sublimationItems.splice(index, 1);
            renderSublimationItems();
        },
        error: function (xhr) {
            var message = xhr.responseJSON && xhr.responseJSON.message;
            alert(message || "Invoice item could not be deleted.");
        }
    });
}

function updateSublimationTotals() {
    var area = 0;
    var amount = 0;

    sublimationItems.forEach(function (x) {
        var itemArea = x.Qty * x.InchX * x.InchY / 144;
        area += itemArea;
        amount += itemArea * x.Rate;
    });

    var q = Number($("#sublimation-qty").val()) || 0;
    var h = Number($("#sublimation-inchx").val()) || 0;
    var w = Number($("#sublimation-inchy").val()) || 0;
    var r = Number($("#sublimation-rate").val()) || 0;

    if (q && h && w) {
        var draftArea = q * h * w / 144;
        area += draftArea;
        amount += draftArea * r;
    }

    var discount = Number($("#sublimation-discount").val()) || 0;
    $("#sublimation-total-feet").val(area.toFixed(2));
    $("#sublimation-total-amount").val(amount.toFixed(2));
    $("#sublimation-net-total").val(Math.max(amount - discount, 0).toFixed(2));
}

$(document).on(
    "input change",
    "#sublimation-qty, #sublimation-inchx, #sublimation-inchy, #sublimation-rate, #sublimation-discount",
    updateSublimationTotals
);

function saveSublimationInvoice() {
    updateSublimationTotals();
    if (!sublimationItems.length) {
        addSublimationItem();
        if (!sublimationItems.length) return;
    }

    var order = sublimationItems.map(function (x) {
        return {
            Id: x.Id || 0,
            SaleID: x.SaleID,
            Item: x.Item,
            Qty: x.Qty,
            InchX: x.InchX,
            InchY: x.InchY,
            TotalFeet: x.TotalFeet,
            Rate: x.Rate,
            Total: x.Total,
            ImageData: x.ImageData || "",
            Date: $("#sublimation-invoice-date").val()
        };
    });

    var customerCombo = $("#sublimation-customer").data("kendoComboBox");
    var customerCode = customerCombo ? Number(customerCombo.value()) || 0 : 0;
    var customerName = customerCombo
        ? $.trim(customerCombo.text())
        : $.trim($("#sublimation-customer").val());

    var payload = {
        Id: Number($("#sublimation-id").val()) || 0,
        SaleID: Number($("#sublimation-saleid").val()),
        CCode: customerCode || null,
        CustomerName: customerName,
        TotalAmount: Number($("#sublimation-total-amount").val()) || 0,
        Discount: Number($("#sublimation-discount").val()) || 0,
        NetTotal: Number($("#sublimation-net-total").val()) || 0,
        Payment: Number($("#sublimation-payment").val()) || 0,
        PayMode: $("#sublimation-payment-mode").val(),
        Date: $("#sublimation-invoice-date").val(),
        DDate: $("#sublimation-delivery-date").val(),
        ITime: new Date().toLocaleTimeString(),
        SaleType: "Sublimation",
        Order: order
    };

    $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/SaleSaveInvoice",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(payload),
        success: function (result) {
            if (result && result.success) {
                $("#sublimation-id").val(result.invoiceId);
                $("#sublimation-saleid").val(result.saleId);
                alert("Sublimation invoice saved successfully.");
                location.reload();
            } else {
                alert((result && result.message) || "Save failed.");
            }
        },
        error: function () {
            alert("Sublimation invoice save failed.");
        }
    });
}

function loadSublimationInvoices() {
    $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/SaleList",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            Date: $("#sublimation-from-date").val(),
            DDate: $("#sublimation-to-date").val(),
            SaleType: "Sublimation"
        }),
        success: function (items) {
        var html = "";
        (items || []).forEach(function (x) {
            html += '<tr>';
            html += '<td>' + x.SaleID + '</td>';
            html += '<td>' + formatSaleDate(x.Date) + '</td>';
            html += '<td>' + subHtml(x.CustomerName) + '</td>';
            html += '<td>' + x.TotalAmount + '</td>';
            html += '<td>' + x.Discount + '</td>';
            html += '<td>' + x.NetTotal + '</td>';
            html += '<td class="text-nowrap">';
            html += '<button type="button" class="btn btn-sm btn-warning me-1" onclick="editSublimationInvoice(' + x.Id + ')"><i class="fa fa-pencil"></i></button>';
            html += '<button type="button" class="btn btn-sm btn-danger" onclick="deleteSublimationInvoice(' + x.SaleID + ')"><i class="fa fa-trash"></i></button>';
            html += '</td>';
            html += '</tr>';
        });
        $("#sublimation-invoice-list").html(html);
        }
    });
}

function deleteSublimationInvoice(saleId) {
    saleId = Number(saleId) || 0;
    if (!saleId) {
        alert("Invoice number is required.");
        return;
    }

    if (!window.confirm("Delete this sublimation invoice?")) return;

    $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/DeletePreviousInvoice",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({ SaleID: saleId, SaleType: "Sublimation" }),
        success: function (result) {
            if (!result || !result.success) {
                alert((result && result.message) || "Invoice could not be deleted.");
                return;
            }

            if (Number($("#sublimation-saleid").val()) === saleId) {
                $("#sublimation-id, #sublimation-saleid").val("");
                sublimationItems = [];
                renderSublimationItems();
            }

            loadSublimationInvoices();
            refreshSublimationCustomerSummary();
            alert("Sublimation invoice deleted successfully.");
        },
        error: function (xhr) {
            var message = xhr.responseJSON && xhr.responseJSON.message;
            alert(message || "Invoice could not be deleted.");
        }
    });
}

function editSublimationInvoice(id) {
    $.ajax({
        type: "POST",
        url: "/SubSaleInvoice/getEditInvoice",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({ Cid: id, SaleType: "Sublimation" }),
        success: function (x) {
        if (!x) return;
        $("#sublimation-id").val(x.Id);
        $("#sublimation-saleid").val(x.SaleID);
        var customerCombo = $("#sublimation-customer").data("kendoComboBox");
        var setCustomer = function () {
            if (!customerCombo) return;
            customerCombo.value(x.CCode || "");
            if (!customerCombo.value() && x.CustomerName) {
                customerCombo.text(x.CustomerName);
            }
            $("#sublimation-previous-balance")
                .val(Number(x.PreviousBalance || 0).toFixed(2));
            $("#sublimation-previous-rate")
                .val(Number(x.PreviousRate || 0).toFixed(2));
        };
        if (customerCombo && customerCombo.dataSource.view().length === 0) {
            customerCombo.dataSource.fetch().then(setCustomer);
        } else {
            setCustomer();
        }

        var invoiceDatePicker = $("#sublimation-invoice-date").data("kendoDatePicker");
        var deliveryDatePicker = $("#sublimation-delivery-date").data("kendoDatePicker");
        if (invoiceDatePicker) invoiceDatePicker.value(x.Date ? new Date(x.Date) : null);
        if (deliveryDatePicker) deliveryDatePicker.value(x.DDate ? new Date(x.DDate) : null);
        $("#sublimation-discount").val(x.Discount || 0);
        $("#sublimation-payment").val(x.Payment || 0);
        setPaymentAccountValue("#sublimation-payment-mode", x.PayMode || "");
        updateSublimationTotals();
        loadSublimationItems(x.SaleID);
        closeSublimationModal();
        }
    });
}

function closeSublimationModal() {
    var modalElement = document.getElementById("sublimationModal");
    if (modalElement && window.bootstrap && window.bootstrap.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
    }

    // Clear any stale Bootstrap backdrop left by an older duplicate instance.
    window.setTimeout(function () {
        $(".modal-backdrop").remove();
        $("body").removeClass("modal-open").css({ overflow: "", paddingRight: "" });
    }, 350);
}

function subHtml(value) {
    return $("<div>").text(value || "").html();
}
