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
        .controller('compareCtrl', compareCtrl)
    ;
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Products Compare Controller                                                                                                                                                                      //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function compareCtrl($scope, $filter, $window, $timeout, sharedProvider, dataProvider, globalFunctions, toastr) {
        var vm = this;
        vm.init = function (model) {
            vm.moduleId = model.ModuleID;
            vm.storeName = model.StoreName;
            vm.localResource = model.LocalResource;
            vm.products = model.Products;
            vm.checkoutPage = model.CheckoutPage;
            vm.productListPage = model.ProductListPage;
            vm.productDetailsPage = model.ProductDetailsPage;
            angular.element(document.getElementById('rzcContainer_' + vm.moduleId)).attr('ng-init', '');
        };
        $scope.$watch(function () {
            return vm.products;
        }, function (newValue) {
            if (newValue) {
                if (newValue.length)
                    vm.selected = newValue[0].ProductID;
                else
                    vm.selected = undefined;
            }
        }, true);
        vm.removeFromComparison = function (index) {
            vm.processing = true;
            var product = vm.products[index];
            if (product) {
                var request = dataProvider.deleteProductCompare(vm.moduleId, product.ProductID);
                request.then(function (response) {
                    if (globalFunctions.getResponseType(response.status) === 'Successful') {
                        vm.products.splice(index, 1);
                        toastr.success((vm.localResource['RemovedFromComparison.Text'] || 'Successfully removed [PRODUCT] from comparison sheet.').replace('[PRODUCT]', product.ModelName), vm.storeName);
                    }
                    else if (globalFunctions.getResponseType(response.status) === 'ClientError') {
                        toastr.warning(response.data.Message, vm.storeName);
                    }
                    else {
                        console.log((vm.localResource['RemovedFromComparisonError.Text'] || 'Unable to removed from comparison sheet | ERR:') + ' ' + response.status);
                        toastr.error((vm.localResource['RemovedFromComparisonError.Text'] || 'Unable to removed from comparison sheet | ERR:') + ' ' + response.data.Message, vm.storeName);
                    }
                    vm.processing = false;
                });
            }
        };
    }
    // End of RazorCart IIFE
}());