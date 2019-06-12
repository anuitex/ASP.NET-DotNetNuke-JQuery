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
        .controller('entryCtrl', entryCtrl)
    ;
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Quick Order Module Controller                                                                                                                                                                    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function entryCtrl($scope, $filter, $window, $timeout, sharedProvider, dataProvider, globalFunctions, toastr) {
        var vm = this;
        vm.init = function (model) {
            vm.moduleId = model.ModuleID;
            vm.storeName = model.StoreName;
            vm.entryFormSize = model.EntryFormSize;
            angular.element(document.getElementById('rzcContainer_' + vm.moduleId)).attr('ng-init', '');
        };
        vm.get = function () {
            var request = dataProvider.getShoppingCart(vm.moduleId);
            request.then(function (response) {
                sharedProvider.updateCart(response.data.CartList, response.data.CartTotals);
            });
        };
        vm.getRange = function (size) {
            if (isNaN(size))
                return new Array(0);
            else
                return new Array(parseInt(size));
        };
        vm.getEntryForm = function (size) {
            vm.entryForm = [];
            if (!isNaN(size)) {
                for (var i = 0; i < parseInt(size) ; i++) {
                    vm.entryForm.push(i);
                }
            }
        };
        vm.addEntry = function () {
            var newItem = (vm.entryForm[vm.entryForm.length - 1] > -1)
                ? vm.entryForm[vm.entryForm.length - 1]
                : -1;
            vm.entryForm.push(newItem + 1);
        };
        vm.deleteEntry = function (index) {
            vm.entryForm.splice(index, 1);
            if (vm.products && vm.products.hasOwnProperty(index))
                delete vm.products[index];
            if (vm.quantities && vm.quantities.hasOwnProperty(index))
                delete vm.quantities[index];
        };
        vm.resetForm = function () {
            if (vm.products)
                angular.copy({}, vm.products);
            if (vm.quantities)
                angular.copy({}, vm.quantities);
        };
        vm.addToCart = function () {
            if (vm.products) {
                angular.forEach(vm.entryForm, function (index) {
                    if (vm.products.hasOwnProperty(index) && vm.products[index]) {
                        var productSKU = vm.products[index], quantity = 1, price = null;
                        if (vm.quantities && vm.quantities.hasOwnProperty(index))
                            quantity = vm.quantities[index];
                        if (vm.prices && vm.prices.hasOwnProperty(index))
                            price = vm.prices[index];
                        var request = dataProvider.addShoppingCart(vm.moduleId, null, productSKU, quantity, price, new Object(), new Object());
                        request.then(function (response) {
                            if (globalFunctions.getResponseType(response.status) == 'Successful') {
                                switch (response.data.Action) {
                                    case 'UseMiniCart':
                                        vm.get();
                                        toastr.success('Successfully added ' + productSKU + ' to cart.', vm.storeName);
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
                    }
                });
            }
        };
    };
    // End of RazorCart IIFE
}());