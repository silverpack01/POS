
var editingVoucherId = null;
var voucherScreen = window.voucherScreen || {
    name: "Receiving",
    cashType: "CRV",
    bankType: "BRV",
    amountField: "Debit"
};

// Page load par Kendo controls, account dropdowns aur record list initialize hoti hai.
$(document).ready(function () {
    $("#Date").kendoDatePicker({ value: new Date(), format: "yyyy-MM-dd", });

    // Cash / bank dropdown ke liye payment heads load karein.
    var cashBankDataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Voucher/getBank",
                dataType: "json"
            }
        }
    });

    $("#cashBankAccountCode").kendoMultiColumnComboBox({
        dataTextField: "AccName",
        dataValueField: "AccCode",
        height: 450,
        columns: [
            { field: "AccName", title: "Account" }
        ],
        filter: "contains",
        filterFields: ["AccCode", "AccName"],
        dataSource: cashBankDataSource,
        dataBound: function () {
            var combo = this;
            var data = combo.dataSource.view();

            for (var i = 0; i < data.length; i++) {
                if (data[i].AccName === "Cash") {
                    combo.select(i);
                    break;
                }
            }
        }
    });

    // Doosra account aur search filter dono isi account list ko use karte hain.
    var accountDataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Voucher/getAccounts",
                dataType: "json"
            }
        }
    });

    $("#accountCode").kendoMultiColumnComboBox({
        dataTextField: "AccName",
        dataValueField: "AccCode",
        height: 450,
        columns: [
            { field: "AccName", title: "Account" }
        ],
        filter: "contains",
        filterFields: ["AccCode", "AccName", "SubSubHeadName", "SubSubSubHeadName"],
        dataSource: accountDataSource
    });

    $("#recordAccountCode").kendoMultiColumnComboBox({
        dataTextField: "AccName",
        dataValueField: "AccCode",
        height: 450,
        columns: [
            { field: "AccName", title: "Account" }
        ],
        filter: "contains",
        filterFields: ["AccCode", "AccName", "SubSubHeadName", "SubSubSubHeadName"],
        clearButton: true,
        dataSource: accountDataSource
    });

    $("#fromDate, #toDate").kendoDatePicker({ format: "yyyy-MM-dd" });

    // Refresh filters clear karta hai; Search selected filters ke sath list load karta hai.
    $("#refreshButton").on("click", function () {
        $("#recordAccountCode").data("kendoMultiColumnComboBox").value("");
        $("#fromDate").data("kendoDatePicker").value(null);
        $("#toDate").data("kendoDatePicker").value(null);
        loadReceivingVouchers();
    });
    $("#searchRecordsButton").on("click", loadReceivingVouchers);
    $("#receivingVoucherForm").on("submit", saveReceivingVoucher);
    loadReceivingVouchers();
});

// ============================================================================
// SAVE / UPDATE: form ka aik voucher TblLedger record bana kar API ko bhejta hai.
// ============================================================================
function saveReceivingVoucher(event) {
    event.preventDefault();

    var cashBankCombo = $("#cashBankAccountCode").data("kendoMultiColumnComboBox");
    var accountCombo = $("#accountCode").data("kendoMultiColumnComboBox");
    var datePicker = $("#Date").data("kendoDatePicker");
    var cashBankAccount = cashBankCombo.dataItem();
    var account = accountCombo.dataItem();
    var date = datePicker.value();
    var amount = Number($("#amount").val());

    if (!cashBankAccount || !account || !date || !amount || amount <= 0) {
        showFormMessage("Date, both accounts, and a valid amount are required.", false);
        return;
    }

    var saveButton = $("#saveButton");
    saveButton.prop("disabled", true);

    // Cash ke liye CRV/CPV aur bank ke liye BRV/BPV select hota hai.
    var voucherType = String(cashBankAccount.AccName || "").trim().toLowerCase() === "cash"
        ? voucherScreen.cashType
        : voucherScreen.bankType;
    var voucherDate = kendo.toString(date, "yyyy-MM-dd");

    $.ajax({
        url: "/Voucher/SaveAPRPayment",
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
            Date: voucherDate,
            VoucherType: voucherType,
            vendor: [{
                Id: editingVoucherId || 0,
                Voucher_Id: 0,
                VoucherType: voucherType,
                HeadCode: cashBankAccount.HeadCode,
                HeadName: cashBankAccount.HeadName,
                SubHeadCode: cashBankAccount.SubHeadCode,
                SubHeadName: cashBankAccount.SubHeadName,
                SubSubHeadCode: cashBankAccount.SubSubHeadCode,
                SubSubHeadName: cashBankAccount.SubSubHeadName,
                SubSubSubHeadCode: cashBankAccount.SubSubSubHeadCode,
                SubSubSubHeadName: cashBankAccount.SubSubSubHeadName,
                Account_Code: cashBankAccount.AccCode,
                Account_Name: cashBankAccount.AccName,
                RefCode: account.AccCode,
                RefName: account.AccName,
                Narration: $("#narration").val(),
                // API hamesha amount Debit me receive karti hai. SaveAPRPayment CPV/BPV
                // ko Credit me, aur CRV/BRV ko Debit me save karti hai.
                Debit: amount,
                Credit: 0,
                Date: voucherDate
            }]
        }),
        success: function (result) {
            showFormMessage(result.message || voucherScreen.name + " voucher saved successfully.", true);
            resetReceivingVoucherForm();
            loadReceivingVouchers();
        },
        error: function (xhr) {
            var message = xhr.responseJSON && xhr.responseJSON.message
                ? xhr.responseJSON.message
                : voucherScreen.name + " voucher save nahi ho saka.";
            showFormMessage(message, false);
        },
        complete: function () {
            saveButton.prop("disabled", false);
        }
    });
}

// Form ko nayi entry ke liye reset karta hai.
function resetReceivingVoucherForm() {
    editingVoucherId = null;
    $("#amount, #narration").val("");
    $("#accountCode").data("kendoMultiColumnComboBox").value("");
    $("#Date").data("kendoDatePicker").value(new Date());
    $("#saveButton").text("Save");
}

// Existing selected record form me la kar Update mode activate karta hai.
function editReceivingVoucher(voucher) {
    editingVoucherId = voucher.Id;
    $("#cashBankAccountCode").data("kendoMultiColumnComboBox").value(voucher.Account_Code);
    $("#accountCode").data("kendoMultiColumnComboBox").value(voucher.RefCode);
    $("#Date").data("kendoDatePicker").value(kendo.parseDate(voucher.Date));
    $("#amount").val(voucher[voucherScreen.amountField]);
    $("#narration").val(voucher.Narration);
    $("#saveButton").text("Update");
    $("#amount").focus();
}

// Existing ledger record ko DeleteOld API se remove karta hai.
function deleteReceivingVoucher(id) {
    if (!confirm("Are you sure you want to delete this record?")) {
        return;
    }

    $.ajax({
        url: "/Voucher/DeleteOld",
        type: "POST",
        dataType: "json",
        data: { ID: id },
        success: function () {
            if (editingVoucherId === id) {
                resetReceivingVoucherForm();
            }
            showFormMessage(voucherScreen.name + " voucher deleted successfully.", true);
            loadReceivingVouchers();
        },
        error: function (xhr) {
            var message = xhr.responseJSON && xhr.responseJSON.message
                ? xhr.responseJSON.message
                : voucherScreen.name + " voucher delete nahi ho saka.";
            showFormMessage(message, false);
        }
    });
}

// PRINT / PDF: selected voucher ko modal, printer aur downloadable/shareable PDF me dikhata hai.
function printReceivingVoucher(voucher) {
    var date = kendo.toString(kendo.parseDate(voucher.Date), "yyyy-MM-dd");

    $("#printVoucherDate").text(date);
    $("#printVoucherId").text(voucher.Id);
    $("#printCashBank").text(voucher.Account_Name || "-");
    $("#printAccount").text(voucher.RefName || "-");
    $("#printAmount").text(Number(voucher[voucherScreen.amountField] || 0).toFixed(2));
    $("#printNarration").text(voucher.Narration || "-");

    bootstrap.Modal.getOrCreateInstance(document.getElementById("receivingPrintModal")).show();
}

function printReceivingVoucherReceipt() {
    var printContent = document.getElementById("receivingPrintArea").outerHTML;
    var printWindow = window.open("", "_blank", "width=420,height=700");

    if (!printWindow) {
        showFormMessage("Print window open nahi ho saka. Browser popup allow karein.", false);
        return;
    }

    printWindow.document.write(`
        <html>
        <head>
            <title>${voucherScreen.name} Voucher</title>
            <style>
                @page { size: 80mm auto; margin: 3mm; }
                * { box-sizing: border-box; }
                body { margin: 0; color: #1b2a4a; font-family: Arial, sans-serif; }
                .receiving-print-area, .voucher-print-area { width: 74mm; border: 0; }
                .receiving-print-company, .voucher-print-company { padding: 8px 4px; text-align: center; font-size: 10px; font-weight: 600; }
                .receiving-print-company-name, .voucher-print-company-name { font-size: 15px; font-weight: 800; }
                .receiving-print-title, .voucher-print-title { padding: 6px; background: #1b2a4a; color: #fff; text-align: center; font-size: 11px; font-weight: 800; }
                .receiving-print-info, .voucher-print-info { display: flex; justify-content: space-between; gap: 4px; padding: 7px 4px; border-bottom: 1px dashed #888; font-size: 9px; }
                .receiving-print-table, .voucher-print-table { width: 100%; border-collapse: collapse; font-size: 9px; }
                .receiving-print-table th, .voucher-print-table th { padding: 6px 3px; background: #edf2f7; text-align: left; }
                .receiving-print-table td, .voucher-print-table td { padding: 7px 3px; border-top: 1px solid #ddd; }
                .receiving-print-narration, .voucher-print-narration { padding: 8px 4px; border-top: 1px solid #ddd; font-size: 9px; }
                .text-end { text-align: right; }
            </style>
        </head>
        <body>${printContent}</body>
        </html>`);
    printWindow.document.close();
    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
    };
}

async function shareReceivingVoucherPdf() {
    if (!window.html2canvas || !window.jspdf) {
        showFormMessage("PDF library load nahi ho saki.", false);
        return;
    }

    var printArea = document.getElementById("receivingPrintArea");
    var canvas = await html2canvas(printArea, { scale: 2 });
    var image = canvas.toDataURL("image/png");
    var pdf = new window.jspdf.jsPDF({ orientation: "p", unit: "mm", format: [80, 150] });
    var pageWidth = pdf.internal.pageSize.getWidth();
    var imageHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(image, "PNG", 0, 0, pageWidth, imageHeight);

    var fileName = voucherScreen.name + "-Voucher-" + $("#printVoucherId").text() + ".pdf";
    var file = new File([pdf.output("blob")], fileName, { type: "application/pdf" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({ title: voucherScreen.name + " Voucher", files: [file] });
            return;
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }
        }
    }

    pdf.save(fileName);
}

// Success ya error alert form ke upar show karta hai.
function showFormMessage(message, isSuccess) {
    $("#formMessage")
        .removeClass("d-none alert-success alert-danger")
        .addClass(isSuccess ? "alert-success" : "alert-danger")
        .text(message);
}


// RECORD LIST: current screen ke voucher types, account aur date filters lagata hai.

function loadReceivingVouchers() {
    var accountCombo = $("#recordAccountCode").data("kendoMultiColumnComboBox");
    var fromDate = $("#fromDate").data("kendoDatePicker").value();
    var toDate = $("#toDate").data("kendoDatePicker").value();

    if (fromDate && toDate && fromDate > toDate) {
        showFormMessage("From Date To Date se baad nahi ho sakti.", false);
        return;
    }

    $.ajax({
        url: voucherScreen.name === "Payment"
            ? "/Voucher/GetPaymentCreditVouchers"
            : "/Voucher/getLedger",
        type: "GET",
        dataType: "json",
        success: function (ledgers) {
            var accountCode = accountCombo.value();
            var endDate = toDate ? new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate() + 1) : null;
            var vouchers = $.grep(ledgers || [], function (ledger) {
                // Receiving me sirf CRV/BRV; Payment me sirf CPV/BPV records show hote hain.
                if (ledger.VoucherType !== voucherScreen.cashType && ledger.VoucherType !== voucherScreen.bankType) {
                    return false;
                }

                var voucherDate = kendo.parseDate(ledger.Date);
                if (accountCode && String(ledger.Account_Code) !== String(accountCode) && String(ledger.RefCode) !== String(accountCode)) {
                    return false;
                }
                if (fromDate && (!voucherDate || voucherDate < fromDate)) {
                    return false;
                }
                return !endDate || (voucherDate && voucherDate < endDate);
            });

            var rows = $("#voucherRows");
            rows.empty();

            if (!vouchers || vouchers.length === 0) {
                $("<tr>").append(
                    $("<td>", { colspan: 6, class: "text-center text-muted py-4", text: "No " + voucherScreen.name.toLowerCase() + " voucher records found." })
                ).appendTo(rows);
                return;
            }

            $.each(vouchers, function (_, voucher) {
                var date = kendo.toString(kendo.parseDate(voucher.Date), "yyyy-MM-dd");
                var amount = Number(voucher[voucherScreen.amountField] || 0).toFixed(2);
                var row = $("<tr>");

                $("<td>", { text: date }).appendTo(row);
                $("<td>", { text: voucher.Account_Name }).appendTo(row);
                $("<td>", { text: voucher.RefName }).appendTo(row);
                $("<td>", { class: "text-end", text: amount }).appendTo(row);
                $("<td>", { text: voucher.Narration }).appendTo(row);
                var actions = $("<td>", { class: "text-end text-nowrap" });

                $("<button>", { type: "button", class: "btn btn-sm btn-primary me-1", title: "Print", html: '<i class="fa fa-print"></i>' })
                    .on("click", function () { printReceivingVoucher(voucher); })
                    .appendTo(actions);
                
                $("<button>", { type: "button", class: "btn btn-sm btn-warning me-1", text: "Edit" })
                    .on("click", function () { editReceivingVoucher(voucher); })
                    .appendTo(actions);

                $("<button>", { type: "button", class: "btn btn-sm btn-danger", text: "Delete" })
                    .on("click", function () { deleteReceivingVoucher(voucher.Id); })
                    .appendTo(actions);
                actions.appendTo(row);
                row.appendTo(rows);
            });
        },
        error: function () {
            $("#voucherRows").html('<tr><td colspan="6" class="text-center text-danger py-4">' + voucherScreen.name + ' voucher records load nahi ho sake.</td></tr>');
        }
    });
}
