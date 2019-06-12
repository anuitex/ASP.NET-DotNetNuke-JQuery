$(function () {

    $('.saved-search-select').on('click', function (e) {

        var $btnSelect = $(this);

        var sName = $btnSelect.attr('data-s-name');
        var sValue = $btnSelect.attr('data-s-value');
        var id = $btnSelect.attr('data-id');

        if (sName && sValue && id) {

            $frm = $btnSelect.closest('form');

            $('<input>').attr({
                type: 'hidden',
                name: sName,
                value: sValue
            }).appendTo($frm);

            $('<input>').attr({
                type: 'hidden',
                name: 'hdnSavedSearchID',
                value: id
            }).appendTo($frm);

            $frm.submit();
        }
    });

    $('.saved-search-actions').on('click', function (e) {

        var $btnDelete = $(this);

        var sName = $btnDelete.attr('data-s-name');
        var sValue = $btnDelete.attr('data-s-value');
        var name = $btnDelete.attr('data-name');
        var id = $btnDelete.attr('data-id');

        if (sName && sValue && name && id) {

            bootbox.confirm({
                title: 'Delete Saved Search',
                message: 'Are you sure you want to remove saved search "' + name + '"?',
                buttons: {
                    cancel: {
                        label: '<i class="fa fa-times"></i> No'
                    },
                    confirm: {
                        label: '<i class="fa fa-check"></i> Yes'
                    }
                },
                callback: function (result) {

                    if (result) {

                        $frm = $btnDelete.closest('form');

                        $('<input>').attr({
                            type: 'hidden',
                            name: sName,
                            value: sValue
                        }).appendTo($frm);

                        $('<input>').attr({
                            type: 'hidden',
                            name: 'hdnSavedSearchID',
                            value: id
                        }).appendTo($frm);

                        $frm.submit();
                    }
                }
            });
        }
    });
});