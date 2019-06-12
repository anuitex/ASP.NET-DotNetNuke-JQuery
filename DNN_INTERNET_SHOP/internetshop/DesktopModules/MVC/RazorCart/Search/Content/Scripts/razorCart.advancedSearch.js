$(function () {
    $('select[data-showSubCat="true"]').on('change', function () {
        var $ddl = $(this);
        $ddl.closest('form').submit();
    });

    var toggleRequired = function ($chk, $txt) {
        if ($chk.prop('checked')) {
            $txt.attr('required', 'required');
        } else {
            $txt.removeAttr('required');
        }
    };

    $('input.chk-save-search').each(function () {
        var $chk = $(this);
        var $txt = $chk.closest('.form-group').find('input.txt-save-search');
        $chk.on('change', function () {
            toggleRequired($chk, $txt);
        });
        toggleRequired($chk, $txt);
    });

    var initDropDownText = function ($ddl) {
        var id = $ddl.attr('id');

        var $frm = $ddl.closest('form');
        $frm.find('#' + id + '_Text').remove();

        var value = $ddl.val().trim();
        if (value && value !== '0') {
            $('<input>').attr({
                type: 'hidden',
                id: id + '_Text',
                name: id + '_Text',
                value: $('label[for="' + id + '"]').text().trim() + ': ' + ($ddl.is('select') ? $ddl.find('option:selected').text().trim() : value)
            }).appendTo($frm);
        }
    };

    $('select.ac-dropdown').each(function () {

        var $ddl = $(this);

        $ddl.on('change', function () {
            initDropDownText($ddl);
        });

        initDropDownText($ddl);
    });
});