(function () {
    // Invoking JavaScript Strict Mode
    'use strict';
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Definition of the RazorCart Application                                                                                                                                                          //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    angular
        // Modules
        .module('RazorCart')
        // Controllers
        .controller('gridCtrl', gridCtrl)
    ;
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Quick Order Module Controller                                                                                                                                                                    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function gridCtrl($scope, $filter, $rootScope, $window, $location, $timeout, sharedProvider, dataProvider, globalFunctions, toastr) {
        var vm = this;
        $rootScope.$on('$locationChangeSuccess', function (event, newLocation, oldLocation) {
            if ($rootScope.isRebindProducts && !new RegExp(newLocation, 'i').test(oldLocation)) {
                vm.rebindProducts(false);
            }
            $rootScope.isRebindProducts = false;
        });
        $rootScope.$watch(function () { return $location.absUrl() }, function (newLocation, oldLocation) {
            if (new RegExp(newLocation, 'i').test($rootScope.actualLocation)) {
                //Handle Browser's Back/Forward buttons
                $rootScope.currentPage = 1;
                angular.forEach($rootScope.urlParams, function (ngValue, ngKey) {
                    switch (ngKey.toLowerCase()) {
                        case 'page':
                            $rootScope.currentPage = parseInt(ngValue);
                            break;
                    }
                });
            }
        });
        vm.init = function (model) {
            vm.fields = [];
            $rootScope.urlParams = model.UrlParams;
            $rootScope.isRebindProducts = false;
            $rootScope.currentPage = model.Pager.CurrentPage;
            vm.moduleId = model.ModuleID;
            vm.storeName = model.StoreName;
            vm.templateFields = model.TemplateFields
            vm.productList = model.ProductList;
            vm.category = model.Category;
            vm.pageSize = model.Pager.PageSize;
            vm.displayedPages = model.Pager.DisplayedPages;
            vm.itemsCount = model.Pager.ItemsCount;
            vm.pageCount = model.Pager.PageCount;
            vm.halfDisplayed = model.Pager.HalfDisplayed;
            vm.startPage = model.Pager.StartPage;
            vm.endPage = model.Pager.EndPage;
            angular.element(document.getElementById('rzcContainer_' + vm.moduleId)).attr('ng-init', '');
        };
        vm.get = function () {
            var request = dataProvider.getShoppingCart(vm.moduleId);
            request.then(function (response) {
                sharedProvider.updateCart(response.data.CartList, response.data.CartTotals);
            });
        };
        vm.rebindProducts = function (filter) {
            vm.rebinding = true;
            if (filter) {
                vm.fields = [];
                angular.forEach(vm.templateFields, function (field) {
                    var values = [];
                    angular.forEach(field.Values, function (value) {
                        if (value.IsChecked)
                            values.push(value.Key);
                    });
                    if (values.length)
                        vm.fields.push({ Label: field.Label, Type: field.Type, Values: values });
                });
                $rootScope.currentPage = 1;
            }
            var request = dataProvider.listProductGrid(vm.moduleId, $rootScope.currentPage, vm.pageSize, vm.category, vm.fields);
            request.then(function (response) {
                vm.productList = response.data.Products;
                vm.itemsCount = 0;
                if (vm.productList.length)
                    vm.itemsCount = vm.productList[0].TotalRecords;
                vm.pageCount = Math.ceil(vm.itemsCount / vm.pageSize) ? Math.ceil(vm.itemsCount / vm.pageSize) : 1;
                vm.startPage = Math.ceil(($rootScope.currentPage - 1) > vm.halfDisplayed ? Math.max(Math.min(($rootScope.currentPage - 1) - vm.halfDisplayed, (vm.pageCount - vm.displayedPages)), 0) : 0);
                vm.endPage = Math.ceil(($rootScope.currentPage - 1) > vm.halfDisplayed ? Math.min(($rootScope.currentPage - 1) + vm.halfDisplayed, vm.pageCount) : Math.min(vm.displayedPages, vm.pageCount));
                vm.rebinding = false;
            });
        };
        vm.addToCart = function (index) {
            if (index > -1) {
                var product = vm.productList[index];
                if (product) {
                    var quantity = 1, price = null;
                    if (product.ClientQuantity)
                        quantity = product.ClientQuantity;
                    if (!isNaN(product.Price))
                        price = product.Price;
                    var request = dataProvider.addShoppingCart(vm.moduleId, product.ProductID, null, quantity, price);
                    request.then(function (response) {
                        if (globalFunctions.getResponseType(response.status) == 'Successful') {
                            switch (response.data.Action) {
                                case 'UseMiniCart':
                                    vm.get();
                                    toastr.success('Successfully added ' + product.ModelName + ' to cart.', vm.storeName);
                                    break;
                                case 'RedirectToCheckout':
                                    $window.location.href = response.data.Url;
                                    break;
                                case 'OpenCustomModal':
                                    $timeout(function () {
                                        dnnModal.show(response.data.Modal, true, 600, 800, true, response.data.Url);
                                    });
                                    break;
                            }
                        }
                        else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                            toastr.warning(response.data.Message, vm.storeName);
                        }
                        else {
                            console.log('Unable to add | ERR: ' + response.status);
                            toastr.error(response.data.Message, vm.storeName);
                        }
                    });
                }
            }
            else {
                var requestList = $filter('filter')(vm.productList, function (product) { return parseInt(product.ClientQuantity); }, true);
                angular.forEach(requestList, function (product, index) {
                    var quantity = 1, price = null;
                    if (product.ClientQuantity)
                        quantity = product.ClientQuantity;
                    if (!isNaN(product.Price))
                        price = product.Price;
                    var request = dataProvider.addShoppingCart(vm.moduleId, product.ProductID, null, quantity, price);
                    request.then(function (response) {
                        if (globalFunctions.getResponseType(response.status) == 'Successful') {
                            switch (response.data.Action) {
                                case 'UseMiniCart':
                                    vm.get();
                                    toastr.success('Successfully added ' + product.ModelName + ' to cart.', vm.storeName);
                                    break;
                                case 'RedirectToCheckout':
                                    $timeout(function () {
                                        $window.location.href = response.data.Url;
                                    }, 250);
                                    break;
                                case 'OpenCustomModal':
                                    $timeout(function () {
                                        dnnModal.show(response.data.Modal, true, 600, 800, true, response.data.Url);
                                    });
                                    break;
                            }
                        }
                        else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                            toastr.warning(response.data.Message, vm.storeName);
                        }
                        else {
                            console.log('Unable to add | ERR: ' + response.status);
                            toastr.error(response.data.Message, vm.storeName);
                        }
                    });
                });
            }
        };
        vm.getRangeArray = function (min, max, step) {
            return globalFunctions.getRangeArray(min, max, step);
        };
        vm.goToPage = function ($event, page) {
            $event.preventDefault();
            $event.stopPropagation();
            if (page) {
                $rootScope.isRebindProducts = true;
                $rootScope.currentPage = page;
                var params = [
                    {
                        key: 'Page',
                        value: $rootScope.currentPage
                    }
                ];
                globalFunctions.updateUrlLocation(vm.moduleId, false, params);
            }
        };
        vm.toggleField = function ($event, field) {
            $event.preventDefault();
            $event.stopPropagation();
            field.IsSelected = !field.IsSelected;
        };
    };
    // End of RazorCart IIFE
}());