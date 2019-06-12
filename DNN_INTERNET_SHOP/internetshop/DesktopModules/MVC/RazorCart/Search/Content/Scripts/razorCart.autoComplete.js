$(function () {
    function split(val) {
        return val.split(/\s*,\s*/); // Split by comma and any white space around it
    }
    function extractLast(term) {
        return split(term).pop();
    }
    $.widget('custom.catcomplete', $.ui.autocomplete, {
        _create: function () {
            this._super();
            this.widget().menu('option', 'items', '> :not(.ui-autocomplete-category)');
        },
        _renderItem: function (ul, item) {

            var $li = $("<li>")
                .attr("data-pid", item.ProductID)
                .attr("data-value", item.Value)
                .attr("aria-label", item.Category + ': ' + item.Value)
                .html(item.Label);

            var $element = this.element;
            var term = this.term;

            $li.find('a').click(function (e) {
                e.stopPropagation();
                var terms = split($element.val());
                terms.pop();
                terms.push('');
                $element.val(terms.join(', '));
            });

            return $li.appendTo(ul);
        },
        _renderMenu: function (ul, items) {

            var that = this,
			  currCategory = '';
            $.each(items, function (index, item) {

                if (item.Category) {

                    var li;

                    if (currCategory !== '' && item.Category !== currCategory) {
                        ul.append('<li></li>');
                    }

                    currCategory = item.Category;

                    li = that._renderItemData(ul, item);
                }
            });
        }
    });

    var autoCompleteCache = {};
    var $txtSearch = $('input[type=text][name^=txtAutoCompleteSearch_]');

    var moduleId = parseInt($txtSearch.attr('data-mid'));
    var storeId = parseInt($txtSearch.attr('data-store-id'));
    var detailTabId = parseInt($txtSearch.attr('data-detail-tid'));

    var sf = $.ServicesFramework(moduleId);
    var searchUrl = sf.getServiceRoot('RazorCart');
    var searchHeaders = {
        'ModuleId': sf.getModuleId(),
        'TabId': sf.getTabId(),
        'RequestVerificationToken': sf.getAntiForgeryValue()
    }

    $txtSearch.on('keydown', function (event) {
        // Don't navigate away from the field on Tab when selecting an item
        if (event.keyCode === $.ui.keyCode.TAB && $txtSearch.catcomplete('instance').menu.active) {
            event.preventDefault();
        }
    });
    $txtSearch.catcomplete({
        delay: 400,
        create: function (event, ui) {
            $('.ui-autocomplete, .ui-helper-hidden-accessible').wrap('<div class="rzc-auto-complete" />');
        },
        source: function (request, response) {
            if (request.term in autoCompleteCache) {
                response(autoCompleteCache[request.term]);
                return;
            }
            $.ajax({
                url: searchUrl + 'Search/AutoComplete',
                headers: searchHeaders,
                type: 'GET',
                dataType: 'json',
                data: {
                    SearchText: extractLast(request.term)
                },
                success: function (data, status, xhr) {
                    autoCompleteCache[request.term] = data;
                    response(data);
                },
                error: function (xhr, status, error) {
                    response(null);
                }
            });
        },
        response: function (event, ui) {
            var terms = split(this.value);
            terms.pop();
            var i = ui.content.length;
            while (i--) {
                if ($.inArray(ui.content[i].Value, terms) !== -1) {
                    ui.content.splice(i, 1);
                }
            }
        },
        search: function (event, ui) {
            var minLength = 1;
            var term = extractLast(this.value);
            if (term.length < minLength) {
                return false;
            }
        },
        focus: function (event, ui) {
            // Prevent value inserted on focus
            return false;
        },
        select: function (event, ui) {
            var terms = split(this.value);
            // Remove the current input
            terms.pop();

            // Add the selected item
            if ($.inArray(ui.item.Value, terms) === -1) {
                terms.push(ui.item.Value);
            }

            // Add placeholder to get the comma-and-space at the end
            terms.push('');
            this.value = terms.join(', ');
            return false;
        }
    });
});