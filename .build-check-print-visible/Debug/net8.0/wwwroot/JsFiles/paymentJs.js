$(document).ready(function () {
    $("#loaderOverlay").hide();
    $("body").css("pointer-events", "auto");
    disableFun();
    $("#date").kendoDatePicker({ value: new Date(), format: "yyyy-MM-dd", });
    $("#vdate").kendoDatePicker({ value: new Date(), format: "yyyy-MM-dd", });
    $("#efdate").kendoDatePicker({ format: "yyyy-MM-dd", });
    $("#eldate").kendoDatePicker({ format: "yyyy-MM-dd", });
    //################################################################################
    //################################################################################
    //let types = localStorage.getItem("ltype");
    //let dates = localStorage.getItem("ldate");
    //if (types && dates) {
    //    $("#type").val(types);
    //    var item1 = $('#date').data("kendoDatePicker");
    //    item1.value(dates);
    //    loadDatad();
    //}

    
    //################################################################################
    //################################################################################
    var dataSource1 = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Voucher/getBank",
                dataType: "json"
            }
        }
    });
    $("#bankname").kendoMultiColumnComboBox({
        dataTextField: "AccName",
        dataValueField: "AccCode",
        height: 450,
        columns: [
            { field: "AccName", title: "Account", width: 350 },
        ],
        filter: "contains",
        filterFields: ["AccCode", "AccName"],
        dataSource: dataSource1,
        dataBound: function () {
            var combo = this;
            var data = combo.dataSource.view();

            for (var i = 0; i < data.length; i++) {
                if (data[i].AccName === "Cash") {
                    combo.select(i);
                    $("#bankac").val(data[i].AccCode);
                    $("#bankname").val(data[i].AccName);
                    $("#HeadCode").val(data[i].HeadCode);
                    $("#HeadName").val(data[i].HeadName);
                    $("#SubHeadCode").val(data[i].SubHeadCode);
                    $("#SubHeadName").val(data[i].SubHeadName);
                    $("#SubSubHeadCode").val(data[i].SubSubHeadCode);
                    $("#SubSubHeadName").val(data[i].SubSubHeadName);
                    $("#SubSubSubHeadCode").val(data[i].SubSubSubHeadCode);
                    $("#SubSubSubHeadName").val(data[i].SubSubSubHeadName);
                    break;
                }
            }
        },
        change: function () {
            var selectedItem = this.dataItem(this.select());
            if (selectedItem) {
                //$("#AccCode").val(selectedItem.AccCode);
                //alert(selectedItem.Status);
                $("#bankac").val(selectedItem.AccCode);
                $("#bankname").val(selectedItem.AccName);
                $("#HeadCode").val(selectedItem.HeadCode);
                $("#HeadName").val(selectedItem.HeadName);
                $("#SubHeadCode").val(selectedItem.SubHeadCode);
                $("#SubHeadName").val(selectedItem.SubHeadName);
                $("#SubSubHeadCode").val(selectedItem.SubSubHeadCode);
                $("#SubSubHeadName").val(selectedItem.SubSubHeadName);
                $("#SubSubSubHeadCode").val(selectedItem.SubSubSubHeadCode);
                $("#SubSubSubHeadName").val(selectedItem.SubSubSubHeadName);

            }
        }
    });
    //##########################################################################
    //##########################################################################
    var dataSource = new kendo.data.DataSource({
        transport: {
            read: {
                url: "/Voucher/getAccounts",
                dataType: "json"
            }
        }
    });
    $("#acccode").kendoMultiColumnComboBox({
        dataTextField: "AccName",
        dataValueField: "AccCode",
        height: 450,
        columns: [
            { field: "AccName", title: "Account", width: 350 },
        ],
        filter: "contains",
        filterFields: ["AccCode", "AccName", "SubSubHeadName", "SubSubSubHeadName"],
        dataSource: dataSource,
        change: function () {
            var selectedItem = this.dataItem(this.select());
            if (selectedItem) {
                //$("#AccCode").val(selectedItem.AccCode);
                //alert(selectedItem.Status);
                $("#AccCode").val(selectedItem.AccCode);
                $("#AccName").val(selectedItem.AccName);
            }
        }
    });
});
function disableFun() {
    const elements = document.querySelectorAll(".disclass");

    // Disable each one
    elements.forEach(element => {
        element.disabled = true;
        //element.style.opacity = "0.2";
    });
    opFun();
};
function opFun() {
    const elements = document.querySelectorAll(".opclass");

    // Disable each one
    elements.forEach(element => {
        element.style.opacity = "0.2";
    });
};
function addshow() {
    $("#date").kendoDatePicker({ value: new Date(), format: "yyyy-MM-dd", });
    $('.tbodyl').html('');
    $('.body').html('');
    $("#bal").val('');
}
function enableFun() {
    //let types = localStorage.getItem("ltype");
    //let dates = localStorage.getItem("ldate");
    //if (types && dates) {

    //    localStorage.removeItem("ltype");
    //    localStorage.removeItem("ldate");
    //}
    //$("#type").val('');
    //$("#date").kendoDatePicker({ value: new Date(), format: "yyyy-MM-dd", });


    $('.tbodyl').html('');
    $('.body').html('');
    $(".disclass").prop("disabled", false).css("opacity", "1");
    ["#date", "#bankname", "#acccode"].forEach(function (selector) {
        var element = $(selector);
        var datePicker = element.data("kendoDatePicker");
        var comboBox = element.data("kendoMultiColumnComboBox");
        if (datePicker) datePicker.enable(true);
        if (comboBox) comboBox.enable(true);
    });
    $("#saveBtn").prop("disabled", false).css("opacity", "1");
    //location.reload();
};
function updateSums() {
    let total = 0;
    $('#itemtbl tbody tr').each(function () {
        let val1 = parseFloat($(this).find('td:eq(16)').text()) || 0;
        total += val1;
    });
    $('.totalCredit').text(total.toFixed(2));
}

function saveDataInTable() {

    let _amt = $("#Amt").val().trim() || 0;
    let _type = $("#type").val().trim();
    let _bname = $("#bankname").val().trim();
    let _bac = $("#bankac").val().trim();
    let _accountCode = $("#AccCode").val().trim();
    let _accountName = $("#AccName").val().trim();
    if (_type.length != 0) {
        if (_accountCode.length != 0 && _accountName.length != 0) {
            if (_bac.length != 0 && _bname.length != 0) {
                let rowHtml = `
                <tr class="custom-row-class">
                <td style="display:none">0</td>
                <td style="display:none">0</td>
                <td style="display:none">${$("#type").val()}</td>
                <td style="display:none">${$("#HeadCode").val()}</td>
                <td style="display:none">${$("#HeadName").val()}</td>
                <td style="display:none">${$("#SubHeadCode").val()}</td>
                <td style="display:none">${$("#SubHeadName").val()}</td>
                <td style="display:none">${$("#SubSubHeadCode").val()}</td>
                <td style="display:none">${$("#SubSubHeadName").val()}</td>
                <td style="display:none">${$("#SubSubSubHeadCode").val()}</td>
                <td style="display:none">${$("#SubSubSubHeadName").val()}</td>
                <td style="display:none">${$("#bankac").val()}</td>
                <td style="">${_bname}</td>
                <td style="display:none">${$("#AccCode").val()}</td>
                <td>${_accountName}</td>
                <td class="next" contenteditable="True">${$("#nar").val()}</td>
                <td class="next" contenteditable="True">${_amt}</td>
                <td style="display:none">${$("#date").val()}</td>
                <td>
                    <!-- Delete Button -->
                    <button type="button"
                            class="btn btn-sm btn-danger"
                            onclick="Remove(this)">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
                </tr>`;
                $("#itemtbl tbody.body").append(rowHtml);
                updateSums();
                $("#Amt").val('');
                $("#nar").val('');
                $("#bal").val('');
                var acccode = $('#acccode').data("kendoMultiColumnComboBox");
                acccode.value(null);
                acccode.focus();
            } else {
                alert("Please Select Payment head.");
            }
        } else {
            alert("Please Select Account");
        }
    } else {
        alert("Please Select Type");
    }
}

function Remove(button) {
    //Determine the reference of the Row using the Button.
    var row = $(button).closest("TR");
    var name = $("TD", row).eq(12).html();
    if (confirm("Do you want to delete: " + name)) {
        //Get the reference of the Table.
        var table = $("#itemtbl")[0];
        table.deleteRow(row[0].rowIndex);
        updateSums();
    }
};
$("#saveBtn").on("click", function (event) {
    event.preventDefault();
    var btn = $(this);
    if (btn.data("loading")) return; // already clicked
    btn.data("loading", true);
    $("#loaderOverlay").show();
    $("body").css("pointer-events", "none");
    var _date = $("#date").val();
    let _type = $("#type").val().trim();
    var orderArr = [];
    orderArr.length = 0;
    $.each($("#itemtbl tbody tr"), function () {
        orderArr.push({
            Id: $(this).find('td:eq(0)').html(),
            Voucher_Id: $(this).find('td:eq(1)').html(),
            VoucherType: $(this).find('td:eq(2)').html(),
            HeadCode: $(this).find('td:eq(3)').html(),
            HeadName: $(this).find('td:eq(4)').html(),
            SubHeadCode: $(this).find('td:eq(5)').html(),
            SubHeadName: $(this).find('td:eq(6)').html(),
            SubSubHeadCode: $(this).find('td:eq(7)').html(),
            SubSubHeadName: $(this).find('td:eq(8)').html(),
            SubSubSubHeadCode: $(this).find('td:eq(9)').html(),
            SubSubSubHeadName: $(this).find('td:eq(10)').html(),
            Account_Code: $(this).find('td:eq(11)').html(),
            Account_Name: $(this).find('td:eq(12)').html(),
            RefCode: $(this).find('td:eq(13)').html(),
            RefName: $(this).find('td:eq(14)').html(),
            Narration: $(this).find('td:eq(15)').html(),
            Debit: $(this).find('td:eq(16)').html(),
            Date: $(this).find('td:eq(17)').html()
        });
    });
    //alert(2);
    var data = JSON.stringify({
        Date: _date,
        VoucherType: _type,
        vendor: orderArr
    });

    if (orderArr.length != 0) {
        $.ajax({
            url: "/Voucher/SaveAPRPayment",
            data: data,
            type: "POST",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {
                btn.data("loading", false);
                $("#loaderOverlay").hide();
                $("body").css("pointer-events", "auto");
                $("#HeadCode").val('');
                $("#HeadName").val('');
                $("#SubHeadCode").val('');
                $("#SubHeadName").val('');
                $("#SubSubHeadCode").val('');
                $("#SubSubHeadName").val('');
                $("#SubSubSubHeadCode").val('');
                $("#SubSubSubHeadName").val('');
                $("#AccCode").val('');
                $("#AccName").val('');
                $("#Amt").val('');
                $("#nar").val('');
                $('.body').html('');
                var acccode = $('#acccode').data("kendoMultiColumnComboBox");
                acccode.value(null);
                acccode.focus();
                //localStorage.setItem("ltype", result.VoucherType);
                //localStorage.setItem("ldate", result.Date);
                location.reload();
            },
            error: function (errormessage) {
                btn.data("loading", false);
                $("#loaderOverlay").hide();
                $("body").css("pointer-events", "auto");
                alert(errormessage.responseText);
            }
        });
    } else {
        $("#loaderOverlay").hide();
        $("body").css("pointer-events", "auto");
        alert("Your Post Is Empty");
    }

});
function addleadingzero(number, size) {
    var s = "0000" + number;
    return s.substr(s.length - size);
}
function loadDatad() {
    let vty = $("#type").val().trim();
    let vda = $("#date").val().trim();
    //alert(vty);
    var empObj = {
        VoucherType: vty,
        Date: vda
    };
    $.ajax({
        url: "/Voucher/CVList",
        data: JSON.stringify(empObj),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            var html = '';

            $.each(result, function (key, item) {

                var dt = new Date(item.Date);
                var dtfinal = addleadingzero(dt.getFullYear(), 4) + '-' +
                    addleadingzero(dt.getMonth() + 1, 2) + '-' +
                    addleadingzero(dt.getDate(), 2);
                let Amt = item.Debit + item.Credit;
                html += '<tr>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.Id + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.Voucher_Id + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.VoucherType + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.HeadCode + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.HeadName + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.SubHeadCode + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.SubHeadName + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.SubSubHeadCode + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.SubSubHeadName + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.SubSubSubHeadCode + '</td>';
                html += '<td class="aa" style="font-weight:bold;display:none">' + item.SubSubSubHeadName + '</td>';
                html += '<td style="display:none">' + item.Account_Code + '</td>';
                html += '<td>' + item.Account_Name + '</td>';
                html += '<td style="display:none">' + item.RefCode + '</td>';
                html += '<td>' + item.RefName + '</td>';
                html += '<td  contenteditable="True">' + item.Narration + '</td>';
                html += '<td  contenteditable="True" class="dHamt">' + Amt + '</td>';   // ✅ only debit if > 0
                html += '<td style="display:none">' + dtfinal + '</td>';
                html += '<td><a href="#" class="btn btn-sm btn-danger" onclick="DeleleAllVoucher(' + item.Id + ')"><i class="fa fa-trash"></i></a></td>';
                html += '</tr>';
            });

            $('.tbodyl').html(html);
            updateSums();
        },
        error: function (errormessage) {
            alert(errormessage.responseText || "Voucher data load نہیں ہو سکا۔");
        }
    });
};
function DeleleAllVoucher(code) {
    var ans = confirm("Are you sure you want to delete this Record?");
    if (ans) {
        $("#loaderOverlay").show();
        $("body").css("pointer-events", "none");
        var empObj = {
            ID: code
        };
        $.ajax({
            url: "/Voucher/DeleteOld/",
            data: empObj,
            type: "POST",
            dataType: "json",
            success: function (result) {
                $("#loaderOverlay").hide();
                $("body").css("pointer-events", "auto");
                loadDatad();
            },
            error: function (errormessage) {
                alert(errormessage.responseText);
            }
        });
    }
};
$(document).on("input", ".dHamt", function () {
    updateSums();
});
function printVoucher() {
    var rows = $("#itemtbl tbody tr").clone();

    // hidden columns remove karo
    rows.find("td[style*='display:none']").remove();

    // last column (Edit/Delete buttons) remove karo
    rows.each(function () {
        $(this).find("td:last-child").remove();
    });

    // print table me insert karo
    $("#printtbl tbody").html(rows);
    $("#tdate").text($("#date").val());
    $("#tcate").text($("#type").val());
    $("#printModal").modal("show");
};
