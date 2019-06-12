// DropDown Lists - Conditional Variants
function rcConVariantDDL(objectID, update) {
    var arrShow = $('#' + objectID).find(':selected').attr('data-con_var');
    if (arrShow) {
        var shObjects = arrShow.split("~");
        for (i = 0; i < shObjects.length; i++) {
            $('[id$="rcVariantGroup' + shObjects[i] + '"]').show();
            $('[id$="rcVariantGroup' + shObjects[i] + '"]').find(':input').prop('disabled', false);
        }
    }
    var arrHide = new Array;
    $('#' + objectID + ' option:not(:selected)').each(function () {
        arrHide.push($(this).attr('data-con_var'));
    })
    for (i = 0; i < arrHide.length; i++) {
        var hiObjects = arrHide[i].split("~");
        for (m = 0; m < hiObjects.length; m++) {
            $('[id$="rcVariantGroup' + hiObjects[m] + '"]').hide();
            $('[id$="rcVariantGroup' + hiObjects[m] + '"]').find(':input').prop('disabled', true);
        }
    }
    if (update)
        rcUpdatePrice();
}
// Radio Buttons - Conditional Variants
function rcConVariantRB(objectName, update) {
    var arrShow = $('input:radio:checked[name="' + objectName + '"]').attr('data-con_var');
    if (arrShow) {
        var shObjects = arrShow.split("~");
        for (i = 0; i < shObjects.length; i++) {
            $('[id$="rcVariantGroup' + shObjects[i] + '"]').show();
            $('[id$="rcVariantGroup' + shObjects[i] + '"]').find(':input').prop('disabled', false);
        }
    }
    var arrHide = new Array;
    $('input:radio:not(:checked)[name="' + objectName + '"]').each(function () {
        arrHide.push($(this).attr('data-con_var'));
    })
    for (i = 0; i < arrHide.length; i++) {
        var hiObjects = arrHide[i].split("~");
        for (m = 0; m < hiObjects.length; m++) {
            $('[id$="rcVariantGroup' + hiObjects[m] + '"]').hide();
            $('[id$="rcVariantGroup' + hiObjects[m] + '"]').find(':input').prop('disabled', true);
        }
    }
    if (update)
        rcUpdatePrice();
}
// Check Boxes - Conditional Variants
function rcConVariantCB(objectName, update) {
    var arrShow = new Array;
    $('input:checkbox:checked[name="' + objectName + '"]').each(function () {
        arrShow.push($(this).attr('data-con_var'));
    })
    for (i = 0; i < arrShow.length; i++) {
        var shObjects = arrShow[i].split("~");
        for (m = 0; m < shObjects.length; m++) {
            $('[id$="rcVariantGroup' + shObjects[m] + '"]').show();
            $('[id$="rcVariantGroup' + shObjects[m] + '"]').find(':input').prop('disabled', false);
        }
    }
    var arrHide = new Array;
    $('input:checkbox:not(:checked)[name="' + objectName + '"]').each(function () {
        arrHide.push($(this).attr('data-con_var'));
    })
    for (i = 0; i < arrHide.length; i++) {
        var hiObjects = arrHide[i].split("~");
        for (m = 0; m < hiObjects.length; m++) {
            $('[id$="rcVariantGroup' + hiObjects[m] + '"]').hide();
            $('[id$="rcVariantGroup' + hiObjects[m] + '"]').find(':input').prop('disabled', true);
        }
    }
    if (update)
        rcUpdatePrice();
}