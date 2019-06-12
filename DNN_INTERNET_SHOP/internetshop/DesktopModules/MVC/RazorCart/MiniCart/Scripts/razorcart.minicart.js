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
        .controller('minicartCtrl', minicartCtrl)
    ;
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Mini Cart Module Controller                                                                                                                                                                      //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function minicartCtrl($scope, $filter, $window, sharedProvider, dataProvider, globalFunctions, toastr) {
        var vm = this;
        $scope.$watch(function () {
            return sharedProvider.getCart();
        }, function (newValue) {
            vm.cartList = newValue.cartList;
            vm.cartTotals = newValue.cartTotals;
        }, true);
        $scope.$watch(function () {
            return sharedProvider.getWishlist();
        }, function (newValue) {
            vm.wishlist = newValue;
        }, true);
        vm.init = function (model) {
            vm.moduleId = model.ModuleID;
            vm.storeName = model.StoreName;
            vm.localResource = model.LocalResource;
            vm.viewState = model.ViewState;
            vm.orders = model.Orders;
            sharedProvider.updateCart(model.CartList, model.CartTotals);
            sharedProvider.updateWishlist(model.Wishlist);
            angular.element(document.getElementById('rzcContainer_' + vm.moduleId)).attr('ng-init', '');
        };
        vm.get = function () {
            var request = dataProvider.getShoppingCart(vm.moduleId);
            request.then(function (response) {
                sharedProvider.updateCart(response.data.CartList, response.data.CartTotals);
            });
        };
        vm.update = function () {
            var updateList = [];
            angular.forEach(vm.cartList, function (cartItem, i) {
                updateList.push({ CartID: cartItem.CartID, ProductID: cartItem.ProductID, Quantity: cartItem.Quantity });
            });
            var request = dataProvider.updateShoppingCart(vm.moduleId, updateList, vm.inputs);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    sharedProvider.updateCart(response.data.CartList, response.data.CartTotals);
                }
                else
                    console.log((vm.localResource['CartUpdateError.Text'] || 'Unable to update | ERR:') + ' ' + response.status);
            });
        };
        vm.delete = function (index) {
            var request = dataProvider.deleteShoppingCart(vm.moduleId, vm.cartList[index].CartID);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    vm.get();
                }
                else
                    console.log((vm.localResource['CartDeleteError.Text'] || 'Unable to delete | ERR:') + ' ' + response.status);
            });
        };
        vm.clear = function () {
            var request = dataProvider.clearShoppingCart(vm.moduleId);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    sharedProvider.updateCart(response.data.CartList, response.data.CartTotals);
                }
                else
                    console.log((vm.localResource['CartDeleteError.Text'] || 'Unable to delete | ERR:') + ' ' + response.status);
            });
        };
        vm.increase = function (index) {
            var product = vm.cartList[index];
            if (product && product.Quantity < 999999) {
                product.Quantity++;
                vm.update();
            }
        };
        vm.decrease = function (index) {
            var product = vm.cartList[index];
            if (product && product.Quantity > 1) {
                product.Quantity--;
                vm.update();
            }
        };
        vm.unsave = function (index) {
            var savedCart = vm.wishlist[index];
            if (savedCart) {
                var request = dataProvider.deleteWishlist(vm.moduleId, [savedCart.CartID]);
                request.then(function (response) {
                    if (globalFunctions.getResponseType(response.status) == 'Successful') {
                        var request = dataProvider.getWishlist(vm.moduleId);
                        request.then(function (response) {
                            if (globalFunctions.getResponseType(response.status) == 'Successful')
                                sharedProvider.updateWishlist(response.data.SavedCart);
                        });
                        toastr.success(vm.localResource['SavedCartDeleted.Text'] || 'Your wishlist saved cart was successfully deleted.', vm.storeName);
                    }
                    else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                        toastr.warning(response.data.Message, vm.storeName);
                    }
                    else {
                        console.log((vm.localResource['SavedCartDeleteError.Text'] || 'Unable to delete saved cart | ERR:') + ' ' + response.status);
                        toastr.error((vm.localResource['SavedCartDeleteError.Text'] || 'Unable to delete saved cart | ERR:') + ' ' + response.status, vm.storeName);
                    }
                });
            }
        };
        vm.showSaved = function (index) {
            angular.forEach(vm.wishlist, function (savedCart, i) {
                if (index == i)
                    savedCart.Visible = !savedCart.Visible;
                else
                    savedCart.Visible = false;
            });
        };
        vm.countCart = function () {
            var number = 0,
                total = 0;
            angular.forEach(vm.cartList, function (item, index) {
                number += item.Quantity;
                total += item.UnitCost * item.Quantity;
            });
            return { Number: number, Total: total };
        };
        vm.countWishlist = function () {
            var number = 0,
                total = 0;
            angular.forEach(vm.wishlist, function (savedCart, index) {
                angular.forEach(savedCart.CartItems, function (item, index) {
                    number += item.Quantity;
                    total += item.UnitCost * item.Quantity;
                });
            });
            return { Number: number, Total: total };
        };
    };
    // End of RazorCart IIFE
}());