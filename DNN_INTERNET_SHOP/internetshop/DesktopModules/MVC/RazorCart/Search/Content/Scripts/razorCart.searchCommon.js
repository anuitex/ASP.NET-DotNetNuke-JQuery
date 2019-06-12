$(function () {

    $('form').each(function () {

        var $frm = $(this);

        $frm.find('input[type=submit], button[type=submit]').each(function () {
            var $submit = $(this);
            var validationGrp = $submit.attr('validation-group');
            if (!validationGrp) { validationGrp = '' };

            $submit.on('click', function () {

                var items = [];
                var countInvalid = 0;

                $frm.find(':input:enabled[validation-group="' + validationGrp + '"]').each(function () {
                    var $item = $(this);
                    $item.on("invalid", function (e) {
                        countInvalid++;
                    });
                    items.push($item);
                });
                $frm.find(':input:enabled[validation-group!="' + validationGrp + '"]').each(function () {
                    var $item = $(this);
                    $item.on("invalid", function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                    items.push($item);
                });

                setTimeout(function () {
                    $.each(items, function (i, $item) {
                        $item.off('invalid');
                    });
                    items = [];
                    if (!countInvalid) {

                        var name = $submit.attr('name');
                        var value = $submit.val();

                        if (name && value) {
                            $('<input>').attr({
                                type: 'hidden',
                                name: name,
                                value: value
                            }).appendTo($frm);
                        }
                        $frm.submit();
                    }
                    countInvalid = 0;
                }, 0);
            });
        });
    });
});