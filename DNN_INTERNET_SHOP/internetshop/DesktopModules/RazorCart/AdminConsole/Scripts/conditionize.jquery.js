(function ($) {
    $.fn.conditionize = function (options) {
        var settings = $.extend({
            hideJS: true
        }, options);
        $.fn.eval = function (valueIs, valueShould, operator) {
            switch (operator) {
                case '==':
                case '===':
                    return valueIs === valueShould;
                case '!=':
                case '!==':
                    return valueIs !== valueShould;
                case '<=':
                    return valueIs <= valueShould;
                case '<':
                    return valueIs < valueShould;
                case '>=':
                    return valueIs >= valueShould;
                case '>':
                    return valueIs > valueShould;
                case '[]':
                    return $.inArray(valueIs, valueShould.split(',')) > -1;
                case '![]':
                    return $.inArray(valueIs, valueShould.split(',')) < 0;
            }
        };
        $.fn.showOrHide = function (listenTo, listenFor, operator, destroy, $section) {
            if ($(listenTo).is('select, input[type=text], input[type=number], input[type=hidden]') && $.fn.eval($(listenTo).val(), listenFor, operator)) {
                $section.show();
                $section.find(':input').prop('disabled', false);
            }
            else if ($(listenTo).is('input[type=radio]')) {
                if ($(listenTo + ':checked').filter(function (idx, elem) { return $.fn.eval(elem.value, listenFor, operator); }).length > 0) {
                    $section.show();
                    $section.find(':input').prop('disabled', false);
                }
                else {
                    $section.hide();
                    if (destroy) {
                        $section.find(':input').each(function () {
                            if ($(this).is('input[type=radio]')) {
                                if ($('input:radio[name="' + this.name + '"]').prop('required'))
                                    $('input:radio[name="' + this.name + '"]:first').trigger('click').trigger('change');
                                else
                                    $('input:radio[name="' + this.name + '"]').prop('checked', false).trigger('change');
                            }
                            else if ($(this).is('input[type=checkbox]'))
                                $(this).prop('checked', false).trigger('change');
                            else
                                $(this).val('').trigger('change');
                        });
                    }
                    $section.find(':input').prop('disabled', true);
                }
            }
            else if ($(listenTo).is('input[type=checkbox]')) {
                if (listenFor === 'true' && $(listenTo).is(':checked')) {
                    $section.show();
                    $section.find(':input').prop('disabled', false);
                }
                else if (listenFor === 'false' && !$(listenTo).is(':checked')) {
                    $section.show();
                    $section.find(':input').prop('disabled', false);
                }
                else if ($(listenTo + ":checked").filter(function (idx, elem) { return $.fn.eval(elem.value, listenFor, operator); }).length > 0) {
                    $section.show();
                    $section.find(':input').prop('disabled', false);
                }
                else {
                    $section.hide();
                    if (destroy) {
                        $section.find(':input').each(function () {
                            if ($(this).is('input[type=radio]')) {
                                if ($('input:radio[name="' + this.name + '"]').prop('required'))
                                    $('input:radio[name="' + this.name + '"]:first').trigger('click').trigger('change');
                                else
                                    $('input:radio[name="' + this.name + '"]').prop('checked', false).trigger('change');
                            }
                            else if ($(this).is('input[type=checkbox]'))
                                $(this).prop('checked', false).trigger('change');
                            else
                                $(this).val('').trigger('change');
                        });
                    }
                    $section.find(':input').prop('disabled', true);
                }
            }
            else {
                $section.hide();
                if (destroy) {
                    $section.find(':input').each(function () {
                        if ($(this).is('input[type=radio]')) {
                            if ($('input:radio[name="' + this.name + '"]').prop('required'))
                                $('input:radio[name="' + this.name + '"]:first').trigger('click').trigger('change');
                            else
                                $('input:radio[name="' + this.name + '"]').prop('checked', false).trigger('change');
                        }
                        else if ($(this).is('input[type=checkbox]'))
                            $(this).prop('checked', false).trigger('change');
                        else
                            $(this).val('').trigger('change');
                    });
                }
                $section.find(':input').prop('disabled', true);
            }
        };
        return this.each(function () {
            var listenTo = "[id=" + $(this).data('cond-option').replace(/(:|\.|\[|\]|,)/g, "\\$1") + "]";
            var listenFor = $(this).data('cond-value').toString();
            var operator = $(this).data('cond-operator') ? JSON.stringify($(this).data('cond-operator')).replace(/"/g, '') : '==';
            var destroy = $(this).data('cond-destroy') ? $(this).data('cond-destroy') : false;
            var $section = $(this);
            // If setting was chosen, hide everything first...
            if (settings.hideJS) {
                $(this).hide();
            }
            // Show based on current value on page load
            $.fn.showOrHide(listenTo, listenFor, operator, destroy, $section);
            // Set up event listener
            $(listenTo).on('change', function () {
                $.fn.showOrHide(listenTo, listenFor, operator, destroy, $section);
            });
        });
    };
}(jQuery));
