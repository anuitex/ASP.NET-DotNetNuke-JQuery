//This function handles collapsible panels (expand/collapse all panels, bind/save collapse panels state to temp cookie)
(function () {
    var getCookie = function (name) {
        name = name.replace(/[=;]/g, '');
        var start = document.cookie.indexOf(name + '=');
        if (start === -1) { return null };
        var len = start + name.length + 1;
        var end = document.cookie.indexOf(';', len);
        if (end === -1) { end = document.cookie.length };
        return unescape(document.cookie.substring(len, end));
    };
    var setCookie = function (name, value, expdays, path, domain, secure) {
        name = name.replace(/[=;]/g, '');
        var today = new Date();
        if (expdays) { expdays = expdays * 24 * 60 * 60 * 1000; }
        var expdate = new Date(today.getTime() + expdays);
        document.cookie = name + '=' + escape(value) +
            ((expdays) ? ';expires=' + expdate.toUTCString() : '') +
            ((path) ? ';path=' + path : '') +
            ((domain) ? ';domain=' + domain : '') +
            ((secure) ? ';secure' : '');
    }
    var cookiecollapses = JSON.parse(getCookie('rzcCookieCollapses')) || [];
    $('.panel-collapse').each(function (index) {
        var $collapse = $(this);
        var cookiecollapse = cookiecollapses.filter(function (obj) { return obj.key == 'item_' + index; });
        if (cookiecollapse[0]) {
            switch (cookiecollapse[0].state) {
                case 'expand':
                    $collapse.addClass('in');
                    break;
                case 'collapse':
                    $collapse.removeClass('in');
                    break;
            }
        }
        $collapse.on('shown.bs.collapse', function () {
            if (cookiecollapse[0]) {
                cookiecollapse[0].state = 'expand';
            } else {
                cookiecollapses.push({ key: 'item_' + index, state: 'expand' });
            }
            setCookie('rzcCookieCollapses', JSON.stringify(cookiecollapses));
        }).on('hidden.bs.collapse', function () {
            if (cookiecollapse[0]) {
                cookiecollapse[0].state = 'collapse';
            } else {
                cookiecollapses.push({ key: 'item_' + index, state: 'collapse' });
            }
            setCookie('rzcCookieCollapses', JSON.stringify(cookiecollapses));
        });
    });
    $('[data-toggle="collapse-all"][data-target]').each(function () {
        var action;
        var $toggle = $(this);
        var $targetItems = $($toggle.attr('data-target'));
        var expandLength = $targetItems.filter(function () { return $(this).hasClass('in'); }).length;
        var toggleCollapseFn = function (init) {
            init = init || action;
            switch (init) {
                case 'init':
                    if (expandLength < $targetItems.length) { action = 'expand'; } else { action = 'collapse'; }
                    $toggle.attr('data-action', action);
                    $toggle.text((action === 'collapse' ? 'Collapse' : 'Expand') + ' All');
                    break;
                case 'collapse':
                    action = 'expand';
                    $toggle.attr('data-action', action);
                    $toggle.text('Expand All');
                    $targetItems.collapse('hide');
                    break;
                case 'expand':
                    action = 'collapse';
                    $toggle.attr('data-action', action);
                    $toggle.text('Collapse All');
                    $targetItems.collapse('show');
            }
        }
        $toggle.on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleCollapseFn();
        });
        $targetItems.each(function () {
            var $collapse = $(this);
            $collapse.on('shown.bs.collapse', function (e) {
                expandLength++;
                toggleCollapseFn('init');
            }).on('hidden.bs.collapse', function (e) {
                expandLength--;
                toggleCollapseFn('init');
            });
        });
        toggleCollapseFn('init');
    });
}());