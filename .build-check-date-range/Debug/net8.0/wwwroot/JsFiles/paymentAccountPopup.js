(function () {
    var accounts = [];
    var editingAccountId = 0;

    $(function () {
        $("#openAccountPopup").on("click", openAccountPopup);
        $("#refreshAccountPopup").on("click", loadPaymentAccounts);
        $("#accountPopupSearch").on("input", renderPaymentAccounts);
        $("#accountPopupForm").on("submit", savePaymentAccount);
        $("#accountPopup").on("shown.bs.modal", loadPaymentAccounts);

        $("#accountPopupDate").kendoDatePicker({ value: new Date(), format: "dd-MM-yyyy" });
        $("#accountPopupTitleField").kendoMultiColumnComboBox({
            dataTextField: "SubSubSubHeadName",
            dataValueField: "SubSubSubHeadName",
            filter: "contains",
            filterFields: ["SubSubSubHeadName"],
            columns: [{ field: "SubSubSubHeadName", title: "Account Title" }],
            dataSource: {
                transport: {
                    read: {
                        url: "/Accounts/getSubSubSubHead",
                        dataType: "json"
                    }
                }
            }
        });

        $(window).on("focus", function () {
            if ($("#accountPopup").hasClass("show")) {
                loadPaymentAccounts();
            }
        });
    });

    function openAccountPopup() {
        var modal = document.getElementById("accountPopup");
        if (window.bootstrap && window.bootstrap.Modal) {
            window.bootstrap.Modal.getOrCreateInstance(modal).show();
        } else {
            $("#accountPopup").modal("show");
        }
    }

    function loadPaymentAccounts() {
        $("#accountPopupRows").html('<tr><td colspan="4" class="text-center text-muted py-4">Loading accounts...</td></tr>');

        $.getJSON("/Voucher/getAccounts")
            .done(function (result) {
                accounts = (result || []).filter(function (account) {
                    return account.AccCode && account.AccName;
                });
                renderPaymentAccounts();
            })
            .fail(function () {
                $("#accountPopupRows").html('<tr><td colspan="4" class="text-center text-danger py-4">Accounts could not be loaded.</td></tr>');
            });
    }

    function savePaymentAccount(event) {
        event.preventDefault();

        var titleCombo = $("#accountPopupTitleField").data("kendoMultiColumnComboBox");
        var title = titleCombo ? titleCombo.dataItem() : null;
        var datePicker = $("#accountPopupDate").data("kendoDatePicker");
        var accountName = $.trim($("#accountPopupName").val());
        var date = datePicker && datePicker.value()
            ? kendo.toString(datePicker.value(), "dd-MM-yyyy")
            : "";

        if (!title || !accountName) {
            showAccountPopupMessage("Account title and account name are required.", false);
            return;
        }

        var saveButton = $("#saveAccountPopup");
        saveButton.prop("disabled", true);

        var accountCode = accounts.reduce(function (max, account) {
            return Math.max(max, Number(account.AccCode) || 0);
        }, 0) + 1;
        var newAccount = {
            Id: editingAccountId,
            AccCode: accountCode,
            AccName: accountName,
            Address: $.trim($("#accountPopupAddress").val()),
            SubSubSubHeadName: title.SubSubSubHeadName
        };
        var frame = document.getElementById("accountRegistrationFrame");
        if (!frame) {
            frame = $("<iframe>", { id: "accountRegistrationFrame", name: "accountRegistrationFrame", hidden: true }).appendTo("body")[0];
        }

        var form = $("<form>", {
            method: "post",
            action: "/Accounts/AccountReg",
            target: "accountRegistrationFrame",
            hidden: true
        });
        var fields = {
            Date: date,
            Id: editingAccountId,
            HeadCode: title.HeadCode,
            HeadName: title.HeadName,
            SubHeadCode: title.SubHeadCode,
            SubHeadName: title.SubHeadName,
            SubSubHeadCode: title.SubSubHeadCode,
            SubSubHeadName: title.SubSubHeadName,
            SubSubSubHeadCode: title.SubSubSubHeadCode,
            SubSubSubHeadName: title.SubSubSubHeadName,
            AccCode: accountCode,
            AccName: accountName,
            Mobile: $.trim($("#accountPopupMobile").val()),
            Address: $.trim($("#accountPopupAddress").val()),
            Status: 1
        };
        Object.keys(fields).forEach(function (key) {
            $("<input>", { type: "hidden", name: key, value: fields[key] == null ? "" : fields[key] }).appendTo(form);
        });
        $("body").append(form);
        $(frame).off("load.accountRegistration").one("load.accountRegistration", function () {
            showAccountPopupMessage(editingAccountId ? "Account updated successfully." : "Account registered successfully.", true);
            resetAccountPopupForm();
            loadPaymentAccounts();
            refreshVoucherAccountList(newAccount);
            form.remove();
            saveButton.prop("disabled", false);
        });
        form.trigger("submit");
    }

    function resetAccountPopupForm() {
        editingAccountId = 0;
        $("#accountPopupName, #accountPopupMobile, #accountPopupAddress").val("");
        var titleCombo = $("#accountPopupTitleField").data("kendoMultiColumnComboBox");
        if (titleCombo) titleCombo.value("");
        $("#saveAccountPopup").html('<i class="fa fa-save"></i> Save Account');
    }

    function showAccountPopupMessage(message, success) {
        var messageBox = $("#accountPopupMessage");
        var oldTimer = messageBox.data("hideTimer");
        if (oldTimer) clearTimeout(oldTimer);

        messageBox
            .removeClass("d-none alert-success alert-danger")
            .addClass(success ? "alert-success" : "alert-danger")
            .empty()
            .append($('<span>').text(message));

        $("<button>", {
            type: "button",
            class: "btn-close float-end",
            "aria-label": "Close"
        }).on("click", function () {
            messageBox.addClass("d-none");
        }).appendTo(messageBox);

        messageBox.data("hideTimer", setTimeout(function () {
            messageBox.addClass("d-none");
        }, 3000));
    }

    function refreshVoucherAccountList(account) {
        var combo = $("#accountCode").data("kendoMultiColumnComboBox");
        if (!combo) return;

        combo.dataSource.read().then(function () {
            combo.value(account.AccCode);
            combo.text(account.AccName);
        });
    }

    function renderPaymentAccounts() {
        var search = $.trim($("#accountPopupSearch").val() || "").toLowerCase();
        var filtered = accounts.filter(function (account) {
            var text = [account.AccCode, account.AccName, account.Address, account.SubSubSubHeadName].join(" ").toLowerCase();
            return !search || text.indexOf(search) >= 0;
        });

        var rows = $("#accountPopupRows").empty();
        if (!filtered.length) {
            rows.append('<tr><td colspan="4" class="text-center text-muted py-4">No registered accounts found.</td></tr>');
            return;
        }

        filtered.forEach(function (account) {
            var row = $("<tr>");
            $("<td>").html(
                "<i class=account-title>" + escapeAccountText(account.HeadName) + " / " +
                escapeAccountText(account.SubHeadName) + " / " +
                escapeAccountText(account.SubSubHeadName) + " / " +
                escapeAccountText(account.SubSubSubHeadName) + "</i><br>" +
                "<span>" + escapeAccountText(account.AccCode) + " / " +
                escapeAccountText(account.AccName) + "</span>"
            ).appendTo(row);
            $("<td>").text(account.Mobile || "").appendTo(row);
            $("<td>").text(account.Address || "").appendTo(row);

            var action = $("<td>", { class: "text-end" });
            $("<button>", {
                type: "button",
                class: "btn btn-sm btn-primary me-1",
                title: "Select account",
                html: '<i class="fa fa-check"></i>'
            }).on("click", function () {
                selectPaymentAccount(account);
            }).appendTo(action);
            $("<button>", {
                type: "button",
                class: "btn btn-sm btn-warning me-1",
                title: "Edit account",
                html: '<i class="fa fa-pencil"></i>'
            }).on("click", function () {
                editPaymentAccount(account);
            }).appendTo(action);
            $("<button>", {
                type: "button",
                class: "btn btn-sm btn-danger",
                title: "Delete account",
                html: '<i class="fa fa-trash"></i>'
            }).on("click", function () {
                deletePaymentAccount(account);
            }).appendTo(action);
            action.appendTo(row);
            row.appendTo(rows);
        });
    }

    function editPaymentAccount(account) {
        editingAccountId = account.Id;
        var titleCombo = $("#accountPopupTitleField").data("kendoMultiColumnComboBox");
        if (titleCombo) {
            titleCombo.value(account.SubSubSubHeadName || "");
        }
        $("#accountPopupName").val(account.AccName || "");
        $("#accountPopupMobile").val(account.Mobile || "");
        $("#accountPopupAddress").val(account.Address || "");
        $("#saveAccountPopup").html('<i class="fa fa-save"></i> Update Account');
        $("#accountPopupName").focus();
    }

    function deletePaymentAccount(account) {
        if (!window.confirm("Delete account " + account.AccName + "?")) return;

        var frame = document.getElementById("accountRegistrationFrame");
        if (!frame) {
            frame = $("<iframe>", { id: "accountRegistrationFrame", name: "accountRegistrationFrame", hidden: true }).appendTo("body")[0];
        }

        $(frame).off("load.accountDelete").one("load.accountDelete", function () {
            showAccountPopupMessage("Account deleted successfully.", true);
            loadPaymentAccounts();
            if (editingAccountId === account.Id) resetAccountPopupForm();
        });

        var deleteUrl = "/Accounts/AccountRegDelete?Id=" + encodeURIComponent(account.Id) + "&Acc_Holder=" + encodeURIComponent(account.AccName || "");
        frame.src = deleteUrl;
    }

    function escapeAccountText(value) {
        return $("<div>").text(value == null ? "" : value).html();
    }

    function selectPaymentAccount(account) {
        var combo = $("#accountCode").data("kendoMultiColumnComboBox");
        if (combo) {
            combo.value(account.AccCode);
            combo.text(account.AccName);
        } else {
            $("#accountCode").val(account.AccName);
        }

        var modal = document.getElementById("accountPopup");
        if (window.bootstrap && window.bootstrap.Modal) {
            window.bootstrap.Modal.getOrCreateInstance(modal).hide();
        } else {
            $("#accountPopup").modal("hide");
        }
    }
}());
