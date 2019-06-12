$(function () {
    $('#side-menu').metisMenu();
});

//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
(function ($) {
    $(window).bind('load resize', function () {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });
})(jQuery);

//Loads the correct sidebar on window load.
$(function () {
    var url = window.location.href;
    // Wael: MVC Support >> metisMenu set page to active when controller is not "Index"
    var routeMap = [
        { default: '/Payment/Index/', alternatives: ['/Payment/Add/', '/Payment/Edit/'] },
        {
            default: '/Shipping/Index/', alternatives:
              [
                  '/Shipping/Custom/', '/Shipping/Zone/', '/Shipping/Category/', '/Shipping/Weight/', '/Shipping/Quantity/', '/Shipping/Amount/', '/Shipping/Postal/', '/Shipping/Free/',
                  '/Shipping/AddCustom/', '/Shipping/AddZone/', '/Shipping/AddWeight/', '/Shipping/AddQuantity/', '/Shipping/AddAmount/', '/Shipping/AddPostal/', '/Shipping/AddFree/',
                  '/Shipping/EditCustom/', '/Shipping/EditZone/', '/Shipping/EditWeight/', '/Shipping/EditQuantity/', '/Shipping/EditAmount/', '/Shipping/EditPostal/', '/Shipping/EditFree/'
              ]
        },
        { default: '/Tax/Index/', alternatives: ['/Tax/Table/', '/Tax/Region/', '/Tax/ImportTable/', '/Tax/AddRegion/', '/Tax/EditRegion/'] },
        { default: '/Template/View/', alternatives: ['/Template/EditView/'] },
        { default: '/Template/Email/', alternatives: ['/Template/AddEmail/', '/Template/EditEmail/'] },
        { default: '/Template/Invoice/', alternatives: ['/Template/AddInvoice/', '/Template/EditInvoice/'] },
        { default: '/Tax/Index/', alternatives: ['/Tax/Table/', '/Tax/Region/', '/Tax/ImportTable/', '/Tax/AddRegion/', '/Tax/EditRegion/'] },
        { default: '/Extension/Index/', alternatives: ['/Extension/Edit/'] },
        { default: '/API/Index/', alternatives: ['/API/Add/'] },
        { default: '/Permission/Index/', alternatives: ['/Permission/Add/', '/Permission/Edit/'] },
        { default: '/Coupon/Index/', alternatives: ['/Coupon/Code/', '/Coupon/AddCode/', '/Coupon/EditCode/'] },
        { default: '/GiftCard/Index/', alternatives: ['/GiftCard/Code/', '/GiftCard/AddCode/', '/GiftCard/EditCode/'] },
        { default: '/Discount/Index/', alternatives: ['/Discount/Order/', '/Discount/AddOrder/', '/Discount/EditOrder/', '/Discount/Class/', '/Discount/AddClass/', '/Discount/EditClass/'] },
        { default: '/Campaign/Index/', alternatives: ['/Campaign/Add/', '/Campaign/Edit/'] },
        {
            default: '/Product/Index/', alternatives:
                [
                    '/Product/Add/', '/Product/Edit/', '/Product/Categories/', '/Product/Images/', '/Product/Variants/', '/Product/Inventory/', '/Product/Booking/', '/Product/SEO/', '/Product/Discounts/', '/Product/Related/', '/Product/Keywords/',
                    '/Product/AddVariantGroup/', '/Product/EditVariantGroup/', '/Product/AddVariant/', '/Product/EditVariant/', '/Product/AddQtyDiscount/', '/Product/EditQtyDiscount/', '/Product/AddRoleDiscount/', '/Product/EditRoleDiscount/',
                    '/Product/AddKeyword/', '/Product/EditKeyword/', '/Product/Roles/', '/Product/Localization/', '/Product/Fields/', '/Product/AddFields/', '/Product/EditFields/', '/Product/AddInventory/', '/Product/EditInventory/',
                    '/Product/Email/', '/Product/AddEmail/', '/Product/EditEmail/', '/Product/Bundle/'
                ]
        },
        { default: '/Product/Category/', alternatives: ['/Product/AddCategory/', '/Product/EditCategory/', '/Product/CatQtyDiscounts/', '/Product/AddCatQtyDiscount/', '/Product/EditCatQtyDiscount/'] },
        { default: '/Product/Manufacturer/', alternatives: ['/Product/AddManufacturer/', '/Product/EditManufacturer/'] },
        { default: '/Product/Field/', alternatives: ['/Product/AddField/', '/Product/EditField/'] },
        { default: '/Customer/Index/', alternatives: ['/Customer/Add/', '/Customer/Edit/'] },
        { default: '/Order/Index/', alternatives: ['/Order/Add/', '/Order/Edit/'] },
    ];
    for (var route in routeMap) {
        if (routeMap.hasOwnProperty(route)) {
            for (var method in routeMap[route].alternatives) {
                if (routeMap[route].alternatives.hasOwnProperty(method)) {
                    if (url.indexOf(routeMap[route].alternatives[method]) !== -1) {
                        url = url.split(routeMap[route].alternatives[method]).join(routeMap[route].default);
                    }
                }
            }
        }
    }
    var navElement = $('.sidebar-nav ul.nav a').filter(function () {
        return this.href == url.split('?')[0];
    }).addClass('active').parent();
    while (true) {
        if (navElement.is('li')) {
            navElement = navElement.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});

// Bootstrap Collapse Plugin
// Save State on PageLoad by Wael
var panels = $('.panel-group.save-state .panel-collapse.collapse');
$(panels).on('hidden.bs.collapse', function () {
    localStorage.removeItem('open_' + this.id);
});
$(panels).on('shown.bs.collapse', function (e) {
    localStorage.setItem('open_' + this.id, true);
    $(document).find('.panel-collapse.collapse.in:not(#' + this.id + ')').collapse('toggle');
});
$(document).ready(function () {
    var collapseIn = false;
    $(panels).each(function () {
        if (JSON.parse(localStorage.getItem('open_' + this.id)) === true) {
            $(this).collapse('toggle');
            collapseIn = true;
        }
    })
    .promise().done(function () {
        if ($(panels).filter('.in').length === 0 && !collapseIn) {
            $(panels).first().collapse('toggle');
        }
    });
});

// Wael: MVC Support >> Include a check box false value in the FormData object or remove @Html.CheckBox auto rendered hidden input
function checkBoxChange(sender) {
    var hidden = document.querySelectorAll('[type=hidden][name=' + sender.name + ']').item(0);
    if (hidden) {
        hidden.parentNode.removeChild(hidden);
    }
    if (!sender.checked) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = sender.name;
        input.value = sender.checked;
        sender.parentNode.insertBefore(input, sender.nextSibling);
    }
}
$(document).ready(function () {
    $('form').find('input[type="checkbox"]:checked').each(function () {
        checkBoxChange(this);
    });
});

// Wael: Support two-sides multiselect (HTML5 Select > Multiple)
function multiSelectAdd(sender) {
    var source = $(sender).parents('.form-group').find('select[data-source="true"]').get(0);
    var text = $(sender).parents('.form-group').find('select[data-text="' + source.name + '"]').get(0);
    var value = $(sender).parents('.form-group').find('select[data-value="' + source.name + '"]').get(0);
    $(source).children('option:selected').each(function () {
        console.log($(this).index());
        $(text).append($('<option></option>').val(this.text).html(this.text));
        $(value).append($('<option></option>').val(this.value).html(this.value));
        this.remove();
    });
}
function multiSelectDel(sender) {
    var source = $(sender).parents('.form-group').find('select[data-source="true"]').get(0);
    var text = $(sender).parents('.form-group').find('select[data-text="' + source.name + '"]').get(0);
    var value = $(sender).parents('.form-group').find('select[data-value="' + source.name + '"]').get(0);
    $(text).children('option:selected').each(function () {
        $(source).append($('<option></option>').val($(value).children('option').eq($(this).index()).val()).html(this.text));
        $(value).children('option').eq($(this).index()).remove();
        this.remove();
    });
}
function multiSelectAll(sender) {
    $(sender).parents('form').find('select[data-text], select[data-value]').each(function () {
        $(this).children('option').prop('selected', true);
    });
}

// Get a query string parameter value
function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", ["i"]),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// Whipping File Inputs Into Shape with Bootstrap 3
$(function () {
    $(document).on('change', ':file', function () {
        var input = $(this),
            numFiles = input.get(0).files ? input.get(0).files.length : 1,
            label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        input.trigger('fileselect', [numFiles, label]);
    });
    $(document).ready(function () {
        $(':file').on('fileselect', function (event, numFiles, label) {
            var input = $(this).parents('.input-group').find(':text'),
                log = numFiles > 1 ? numFiles + ' files selected' : label;
            if (input.length) {
                input.val(log);
            }
        });
    });
});

// Print page content
function openPrintPreview(elements) {
    var styles = '',
        scripts = '',
        container = '',
        popup = window.open('', 'popup_window', 'fullscreen=yes');
    $(elements).each(function (index, element) {
        container += element.outerHTML;
    });
    $(document).find('link[type="text/css"]').each(function (index, element) {
        styles += element.outerHTML;
    });
    styles += '<style type="text/css">body{margin:0px 14px;width:98%;}</style>';
    scripts = '<script>document.addEventListener("DOMContentLoaded",function(event){var opener=window.opener;if(opener){var inputs=document.querySelectorAll("input, select");var mainInputs=opener.document.querySelectorAll("input, select");'
        + 'for(var i=0;i<inputs.length;i++){for(var x=0;x<mainInputs.length;x++){if((inputs[i].id&&mainInputs[x].id&&(inputs[i].id==mainInputs[x].id))||(inputs[i].name&&mainInputs[x].name&&(inputs[i].name==mainInputs[x].name)))'
        + '{inputs[i].value=mainInputs[x].value;}}}}});</script>';
    popup.document.open();
    popup.document.write('<html><head>\n' + styles + '\n' + scripts + '</head><body onload="window.print()">' + container + '</body></html>');
    popup.document.close();
}

// Base64 Encode / Decode
String.prototype.toBase64 = function () {
    return btoa(encodeURIComponent(this).replace(/%([0-9A-F]{2})/g, function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}
String.prototype.fromBase64 = function () {
    return decodeURIComponent(atob(this).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}