function appendToQueryString(param, val) {
    var queryString = window.location.search.replace('?', '');
    var parameterListRaw = queryString == '' ? [] : queryString.split('&');
    var parameterList = {};
    var found = false;
    for (var i = 0; i < parameterListRaw.length; i++) {
        var parameter = parameterListRaw[i].split('=');
        if (parameter[0].toLowerCase() === param.toLowerCase()) {
            parameterList[parameter[0]] = val;
            found = true;
        }
        else
            parameterList[parameter[0]] = parameter[1];
    }
    if (!found)
        parameterList[param] = val;
    var newQueryString = '?';
    for (var item in parameterList) {
        if (parameterList.hasOwnProperty(item)) {
            newQueryString += item + '=' + parameterList[item] + '&';
        }
    }
    newQueryString = newQueryString.replace(/&$/, '');
    return location.origin + location.pathname + newQueryString;
}
$(document).ready(function () {
    $('.rzc-search-results').each(function () {
        var $wrapper = $(this);
        var tmid = parseInt($wrapper.attr('data-tmid'));
        $wrapper.find('.rzc-records-dropdown').each(function () {
            var $ddl = $(this);
            $ddl.on('change', function () {
                window.location.replace(appendToQueryString('Records', $ddl.val()));
            });
        });
        $wrapper.find('.pagination a[data-page]').each(function () {
            var $a = $(this);
            $a.on('click', function (e) {
                e.preventDefault();
                window.location.replace(appendToQueryString('Page', $a.attr('data-page')));
            });
        });
        $wrapper.find('.rzc-delete-tag').each(function () {
            var $a = $(this);
            var $frm = $a.closest('form');
            $a.on('click', function (e) {
                e.preventDefault();
                var type = $a.attr('data-tag-type');
                var value = $a.attr('data-tag-val');
                if (type && value) {
                    bootbox.confirm({
                        title: 'Delete Tag',
                        message: 'Are you sure you want to remove tag "' + value + '" from your search results?',
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
                                $('<input>').attr({
                                    type: 'hidden',
                                    name: 'submitSearchResults_' + tmid,
                                    value: 'DeleteTag'
                                }).appendTo($frm);
                                $('<input>').attr({
                                    type: 'hidden',
                                    name: 'hdnTagType_' + tmid,
                                    value: type
                                }).appendTo($frm);
                                $('<input>').attr({
                                    type: 'hidden',
                                    name: 'hdnTagValue_' + tmid,
                                    value: value
                                }).appendTo($frm);
                                $frm.submit();
                            }
                        }
                    });
                }
            });
        });
    });
});