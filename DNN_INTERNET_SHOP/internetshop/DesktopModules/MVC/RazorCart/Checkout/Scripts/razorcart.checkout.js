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
        .controller('checkoutCtrl', checkoutCtrl)
        // Dependencies
        .requires.push('ui.bootstrap')
    ;
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Checkout Module Controller                                                                                                                                                                       //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function checkoutCtrl($scope, $filter, $window, $location, $rootScope, $timeout, $q, sharedProvider, dataProvider, globalFunctions, toastr) {
        var vm = this;
        $rootScope.$on('$locationChangeSuccess', function (event, newLocation, oldLocation) {
            var defaultParams = [{ key: 'Display', value: 'cart' }];
            if (newLocation.toLowerCase() !== oldLocation.toLowerCase()) {
                var pathParams = sharedService.getPathParams($location.absUrl());
                Object.keys(pathParams.params).forEach(function (key, index) {
                    if (key.toLowerCase() === 'display') {
                        vm.displayMode = pathParams.params[key].toLowerCase();
                        return false;
                    }
                });
                switch (vm.displayMode) {
                    case 'cart':
                    default:
                        if (!vm.orderStatus || !vm.orderStatus.Success)
                            vm.viewState = 'ShoppingCart';
                        else
                            globalFunctions.updateUrlLocation(vm.moduleId, true, [{ key: 'Display', value: 'status' }]);
                        break;
                    case 'review':
                        if ($scope['rzcForm_' + vm.moduleId].$valid && (!vm.orderStatus || !vm.orderStatus.Success)) {
                            vm.viewState = 'ReviewOrder';
                            var payment = $filter('filter')(vm.billingPayments, { PayMethodID: parseInt(vm.billing.Payment) }, true);
                            if (payment.length) {
                                vm.checkoutButton = payment[0].CheckoutButton;
                                if (vm.checkoutButton) {
                                    $timeout(function () {
                                        eval(vm.checkoutButton.RenderScript);
                                    });
                                }
                            }
                        }
                        else
                            globalFunctions.updateUrlLocation(vm.moduleId, true, defaultParams);
                        break;
                    case 'status':
                        if (vm.orderStatus)
                            vm.viewState = 'OrderStatus';
                        else
                            globalFunctions.updateUrlLocation(vm.moduleId, true, defaultParams);
                        break;
                }
            }
            else {
                if (!(vm.viewState == 'Wishlist' || vm.viewState == 'Wallet' || (vm.viewState == 'OrderStatus' && vm.orderStatus)))
                    globalFunctions.updateUrlLocation(vm.moduleId, true, defaultParams);
            }
        });
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
            vm.donationProduct = model.DonationProduct;
            vm.donationVariantList = model.DonationVariantList;
            vm.donationIsSaleEnabled = model.DonationIsSaleEnabled;
            vm.donationManageInventory = model.DonationManageInventory;
            vm.viewState = model.ViewState;
            vm.billingPayments = model.BillingPayments;
            vm.walletItems = model.WalletItems;
            vm.expMonths = model.ExpMonths;
            vm.expYears = model.ExpYears;
            vm.countries = model.Countries;
            vm.shippingRegions = model.ShippingRegions;
            vm.billingRegions = model.BillingRegions;
            vm.shipping = model.Shipping;
            vm.billing = model.Billing;
            vm.orderStatus = model.PaymentStatus;
            vm.requireRecalculate = model.IsCalculateRequired;
            vm.shippingMethods = model.ShippingMethods;
            vm.phoneCarriers = model.PhoneCarriers;
            sharedProvider.updateCart(model.CartList, model.CartTotals);
            sharedProvider.updateWishlist(model.Wishlist);
            angular.element(document.getElementById('rzcContainer_' + vm.moduleId)).attr('ng-init', '');
        };
        vm.get = function () {
            var deferred = $q.defer();
            var request = dataProvider.getShoppingCart(vm.moduleId, vm.shipping);
            request.then(function (response) {
                $timeout(function () {
                    sharedProvider.updateCart(response.data.CartList, response.data.CartTotals);
                    vm.shippingMethods = response.data.ShippingMethods;
                    if (!vm.shippingMethods.length) {
                        vm.shipping.Method = null;
                    }
                    else {
                        if (!$filter('filter')(vm.shippingMethods, { Code: vm.shipping.Method }, true).length)
                            vm.shipping.Method = vm.shippingMethods[0].Code;
                    }
                    if (vm.billing.Payment) {
                        vm.billPaymentChange();
                    }
                });
                deferred.resolve();
            });
            return deferred.promise;
        };
        vm.update = function () {
            vm.updating = true;
            var updateList = [];
            angular.forEach(vm.cartList, function (cartItem, i) {
                updateList.push({ CartID: cartItem.CartID, ProductID: cartItem.ProductID, Quantity: cartItem.ClientQuantity });
            });
            var request = dataProvider.updateShoppingCart(vm.moduleId, updateList, vm.inputs);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    if (vm.shipping.Calculated) {
                        vm.calculate();
                    }
                    vm.get().then(function () {
                        vm.updating = false;
                        toastr.success(vm.localResource['CartUpdated.Text'] || 'The cart was updated successfully.', vm.storeName);
                    });
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    vm.updating = false;
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    vm.updating = false;
                    console.log((vm.localResource['CartUpdateError.Text'] || 'Unable to update cart | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['CartUpdateError.Text'] || 'Unable to update cart | ERR:') + ' ' + response.status, vm.storeName);
                }
            });
        };
        vm.delete = function (index) {
            vm.deleting = true;
            var request = dataProvider.deleteShoppingCart(vm.moduleId, vm.cartList[index].CartID);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    if (vm.shipping.Calculated) {
                        vm.calculate();
                    }
                    vm.get().then(function () {
                        vm.deleting = false;
                        toastr.success((vm.localResource['ProductDeleted.Text'] || 'Successfully deleted [PRODUCT] from the cart.').replace('[PRODUCT]', vm.cartList[index].ProductName), vm.storeName);
                    });
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    vm.deleting = false;
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    vm.deleting = false;
                    console.log((vm.localResource['ProductDeleteError.Text'] || 'Unable to delete product | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['ProductDeleteError.Text'] || 'Unable to delete product | ERR:') + ' ' + response.status, vm.storeName);
                }
            });
        };
        vm.clear = function () {
            vm.deleting = true;
            var request = dataProvider.clearShoppingCart(vm.moduleId);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    sharedProvider.updateCart(response.data.CartList, response.data.CartTotals);
                    if (vm.shippingMethods.length > 0) {
                        vm.shippingMethods = [];
                        vm.shipping.Method = null;
                    }
                    toastr.success(vm.localResource['CartCleared.Text'] || 'The cart was cleared successfully.', vm.storeName);
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    console.log((vm.localResource['CartClearError.Text'] || 'Unable to clear cart | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['CartClearError.Text'] || 'Unable to clear cart | ERR:') + ' ' + response.status, vm.storeName);
                }
                vm.deleting = false;
            });
        };
        vm.coupon = function () {
            vm.applying = true;
            var request = dataProvider.applyCouponCode(vm.moduleId, vm.cartTotals.Coupon);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) === 'Successful') {
                    vm.get().then(function () {
                        vm.applying = false;
                        if (response.data.Action === 'Clear')
                            toastr.info((vm.localResource['CouponCleared.Text'] || 'Coupon [COUPON] was cleared.').replace('[COUPON]', response.data.Coupon), vm.storeName);
                        else
                            toastr.success((vm.localResource['CouponApplied.Text'] || 'Coupon [COUPON] was applied.').replace('[COUPON]', response.data.Coupon), vm.storeName);
                    });
                }
                else if (globalFunctions.getResponseType(response.status) === 'ClientError') {
                    vm.applying = false;
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    console.log((vm.localResource['CouponApplyError.Text'] || 'Unable to apply coupon | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['CouponApplyError.Text'] || 'Unable to apply coupon | ERR:') + ' ' + response.data.Message, vm.storeName);
                    vm.applying = false;
                }
            });
        };
        vm.calculate = function () {
            vm.calculating = true;
            var request = dataProvider.calculateShipping(vm.moduleId, vm.shipping);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    vm.shippingMethods = response.data.ShippingMethods;
                    if (!$filter('filter')(vm.shippingMethods, { Code: vm.shipping.Method }, true).length) {
                        vm.shipping.Method = null;
                    }
                    else {
                        vm.shipMethodChange();
                    }
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    console.log((vm.localResource['CalcShippingError.Text'] || 'Unable to calculate shipping rate(s) | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['CalcShippingError.Text'] || 'Unable to calculate shipping rate(s) | ERR:') + ' ' + response.status, vm.storeName);
                }
                vm.calculating = false;
                vm.shipping.Calculated = true;
            });
        };
        vm.save = function () {
            vm.saving = true;
            var request = dataProvider.saveWishlist(vm.moduleId);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    toastr.success(vm.localResource['WishlistSaved.Text'] || 'Your shopping cart was successfully saved into your wishlist.', vm.storeName);
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    vm.saving = true;
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    console.log((vm.localResource['WishlistSaveError.Text'] || 'Unable to save shopping cart | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['WishlistSaveError.Text'] || 'Unable to save shopping cart | ERR:') + ' ' + response.status, vm.storeName);
                }
                vm.saving = false;
            });
        };
        vm.restore = function ($event) {
            $event.preventDefault();
            vm.restoring = true;
            var checkedItems = $filter('filter')(vm.wishlist, { Checked: true }, true);
            var request = dataProvider.restoreWishlist(vm.moduleId, checkedItems.map(function (cartItem) { return cartItem.CartID; }));
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    toastr.success(vm.localResource['WishlistRestored.Text'] || 'Your wishlist was successfully restored into your cart.', vm.storeName);
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    console.log((vm.localResource['WishlistRestoreError.Text'] || 'Unable to restore saved cart | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['WishlistRestoreError.Text'] || 'Unable to restore saved cart | ERR:') + ' ' + response.status, vm.storeName);
                }
                vm.restoring = false;
            });
        };
        vm.unsave = function ($event) {
            $event.preventDefault();
            vm.unsaving = true;
            var checkedItems = $filter('filter')(vm.wishlist, { Checked: true }, true);
            var request = dataProvider.deleteWishlist(vm.moduleId, checkedItems.map(function (cartItem) { return cartItem.CartID; }));
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    var request = dataProvider.getWishlist(vm.moduleId);
                    request.then(function (response) {
                        if (globalFunctions.getResponseType(response.status) == 'Successful')
                            sharedProvider.updateWishlist(response.data.SavedCart);
                    });
                    toastr.success(vm.localResource['WishlistDeleted.Text'] || 'Your wishlist saved cart was successfully deleted.', vm.storeName);
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    console.log((vm.localResource['WishlistDeleteError.Text'] || 'Unable to delete saved cart | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['WishlistDeleteError.Text'] || 'Unable to delete saved cart | ERR:') + ' ' + response.status, vm.storeName);
                }
                vm.unsaving = false;
            });
        };
        vm.showSaved = function (index) {
            angular.forEach(vm.wishlist, function (savedCart, i) {
                if (index == i)
                    savedCart.Visible = !savedCart.Visible;
                else
                    savedCart.Visible = false;
            });
        };
        vm.editSavedCart = function (index) {
            angular.forEach(vm.wishlist, function (savedCart, i) {
                if (index == i)
                    savedCart.EditMode = !savedCart.EditMode;
                else
                    savedCart.EditMode = false;
            });
        };
        vm.editSavedCartDescription = function (index) {
            var savedCart = vm.wishlist[index];
            if (savedCart) {
                var request = dataProvider.editWishlist(vm.moduleId, savedCart);
                request.then(function (response) {
                    if (globalFunctions.getResponseType(response.status) == 'Successful') {
                        toastr.success(vm.localResource['WishlistUpdated.Text'] || 'Your wishlist saved cart was successfully updated.', vm.storeName);
                    }
                    else {
                        console.log((vm.localResource['WishlistUpdateError.Text'] || 'Unable to update saved cart | ERR:') + ' ' + response.status);
                        toastr.error((vm.localResource['WishlistUpdateError.Text'] || 'Unable to update saved cart | ERR:') + ' ' + response.status, vm.storeName);
                    }
                });
                savedCart.EditMode = false;
            }
        };
        vm.review = function () {
            var shipment = $filter('filter')(vm.shippingMethods, { Code: vm.shipping.Method }, true);
            if (shipment.length)
                vm.shipping.MethodType = shipment[0].Text;
            var payment = $filter('filter')(vm.billingPayments, { PayMethodID: parseInt(vm.billing.Payment) }, true);
            if (payment.length) {
                if (vm.billing.Wallet) {
                    var wallet = $filter('filter')(vm.walletItems, { ID: parseInt(vm.billing.Wallet) }, true);
                    if (wallet.length) {
                        vm.billing.PaymentMethod = wallet[0].WalletName;
                        vm.billing.MaskAcctNo = wallet[0].MaskAcctNo;
                    }
                }
                else {
                    vm.billing.PaymentMethod = payment[0].Name;
                    if (vm.selectedPayment && payment[0].GatewayProcessMode == 'Direct') {
                        if (vm.selectedPayment.DisplayType == 'CreditCard')
                            vm.billing.MaskAcctNo = vm.billing.CardNumber.replace(/[^0-9]+/g, '').replace(/\d(?=\d{4})/g, "*");
                        else if (vm.selectedPayment.DisplayType == 'ECheck')
                            vm.billing.MaskAcctNo = vm.billing.AccountNumber.replace(/[^0-9]+/g, '').replace(/\d(?=\d{4})/g, "*");
                    }
                    else
                        vm.billing.MaskAcctNo = null;
                }
            }
            var params = [{ key: 'Display', value: 'review' }];
            globalFunctions.updateUrlLocation(vm.moduleId, true, params);
        };
        vm.saveWallet = function () {
            vm.submitting = true;
            var request = dataProvider.saveWallet(vm.moduleId, vm.billing);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    vm.walletItems = response.data.WalletItems;
                    toastr.success(vm.localResource['WalletCreated.Text'] || 'Your wallet item was successfully created.', vm.storeName);
                    vm.walletForm = false;
                }
                else {
                    console.log((vm.localResource['WalletCreateError.Text'] || 'Unable to create wallet item | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['WalletCreateError.Text'] || 'Unable to create wallet item | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
                vm.submitted = false;
                vm.submitting = false;
            });
        };
        vm.editWallet = function (index) {
            var item = vm.walletItems[index];
            var payments = $filter('filter')(vm.billingPayments, { Type: item.PayType }, true);
            if (payments) {
                vm.billing = {};
                vm.billing.Wallet = item.ID;
                vm.billing.Payment = payments[0].PayMethodID.toString();
                vm.billPaymentChange();
                switch (payments[0].Type) {
                    case 'CreditCard':
                        vm.billing.CardNumber = item.MaskAcctNo;
                        vm.billing.ExpMonth = item.ExpRoute ? item.ExpRoute.substring(0, 2) : null;
                        vm.billing.ExpYear = item.ExpRoute ? '20' + item.ExpRoute.substring(2, 4) : null;
                        break;
                    case 'ACHChecking':
                    case 'ACHSavings':
                        vm.billing.AccountNumber = item.MaskAcctNo;
                        vm.billing.RoutingNumber = item.ExpRoute;
                        break;
                }
                vm.billing.WalletName = item.WalletName;
                vm.billing.FullName = item.BillingName;
                vm.billing.Address1 = item.Address1;
                vm.billing.Address2 = item.Address2;
                vm.billing.City = item.City;
                vm.billing.PostalCode = item.Zip;
                vm.billing.CountryID = item.CountryID;
                vm.billCountryChange().then(function () {
                    vm.billing.RegionID = item.RegionID;
                });
                vm.walletForm = true;
            }
        };
        vm.deleteWallet = function (index) {
            if (confirm('Are you sure?')) {
                var request = dataProvider.deleteWallet(vm.moduleId, vm.walletItems[index].ID);
                request.then(function (response) {
                    if (globalFunctions.getResponseType(response.status) == 'Successful') {
                        vm.walletItems = response.data.WalletItems;
                        toastr.success(vm.localResource['WalletDeleted.Text'] || 'Your wallet item was successfully deleted.', vm.storeName);
                    }
                    else {
                        console.log((vm.localResource['WalletDeleteError.Text'] || 'Unable to delete wallet item | ERR:') + ' ' + response.status);
                        toastr.error((vm.localResource['WalletDeleteError.Text'] || 'Unable to delete wallet item | ERR:') + ' ' + response.status, vm.storeName);
                    }
                });
            }
        };
        vm.back = function () {
            var params = [{ key: 'Display', value: 'cart' }];
            globalFunctions.updateUrlLocation(vm.moduleId, true, params);
        };
        vm.submit = function () {
            vm.submitting = true;
            var payment = $filter('filter')(vm.billingPayments, { PayMethodID: parseInt(vm.billing.Payment) }, true);
            if (payment.length) {
                if (payment[0].OnSubmitClientScript) {
                    var promise = eval(payment[0].OnSubmitClientScript);
                    promise.then(function (result) {
                        if (vm.inputs)
                            vm.inputs['OnSubmitClientScript'] = result;
                        else
                            vm.inputs = { 'OnSubmitClientScript': result };
                        vm.placeOrder();
                    }).catch(function (error) {
                        console.log(error);
                        $timeout(function () {
                            vm.submitting = false;
                        });
                    });
                }
                else
                    vm.placeOrder();
            }
            else
                vm.placeOrder();
        };
        vm.placeOrder = function () {
            var request = dataProvider.submitOrder(vm.moduleId, vm.shipping, vm.billing, vm.inputs);
            request.then(function (response) {
                var params = [{ key: 'Display', value: 'status' }];
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    if (!response.data.Redirect) {
                        vm.orderStatus = response.data.PaymentStatus;
                        globalFunctions.updateUrlLocation(vm.moduleId, true, params);
                    }
                    else {
                        $window.location.href = response.data.PaymentUri;
                    }
                }
                else {
                    console.log('Unable to submit order | ERR: ' + response.status);
                    vm.orderStatus = { Notes: response.data.Message };
                    globalFunctions.updateUrlLocation(vm.moduleId, true, params);
                }
                vm.submitting = false;
            });
        };
        vm.download = function (index) {
            var request = dataProvider.download(vm.moduleId, vm.orderStatus.OrderID, vm.cartList[index].ProductID);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    $window.location.assign(response.data.DownloadUrl);
                }
                else {
                    console.log((vm.localResource['UnauthorizedFileDownload.Text'] || 'Unauthorized request to download [PRODUCT]').replace('', vm.cartList[index].ProductName) + ' ' + response.status);
                    toastr.error((vm.localResource['UnauthorizedFileDownload.Text'] || 'Unauthorized request to download [PRODUCT]').replace('', vm.cartList[index].ProductName) + '.', vm.storeName);
                }
            });
        };
        vm.cartHasBooking = function () {
            var hasBooking = false;
            angular.forEach(vm.cartList, function (cartItem, i) {
                if (cartItem.CartBooking.IsBooking)
                    hasBooking = true;
            });
            return hasBooking;
        };
        vm.shipCountryChange = function () {
            var deferred = $q.defer();
            var country = $filter('filter')(vm.countries, { EntryID: vm.shipping.CountryID }, true);
            if (country.length) {
                var request = dataProvider.getRegions(vm.moduleId, country[0].Value);
                request.then(function (response) {
                    vm.shipping.RegionID = null;
                    vm.shippingRegions = response.data;
                    deferred.resolve();
                });
            }
            if (vm.requireRecalculate)
                vm.get();
            return deferred.promise;
        };
        vm.billCountryChange = function () {
            var deferred = $q.defer();
            var country = $filter('filter')(vm.countries, { EntryID: vm.billing.CountryID }, true);
            if (country.length) {
                var request = dataProvider.getRegions(vm.moduleId, country[0].Value);
                request.then(function (response) {
                    vm.billing.RegionID = null;
                    vm.billingRegions = response.data;
                    deferred.resolve();
                });
            }
            return deferred.promise;
        };
        vm.shipMethodChange = function () {
            var shipment = $filter('filter')(vm.shippingMethods, { Code: vm.shipping.Method }, true);
            if (shipment.length) {
                vm.cartTotals.ShippingTotal = shipment[0].Price;
                if (vm.cartTotals.IsHandlingByShipping) {
                    vm.cartTotals.HandlingCharge = vm.cartTotals.ShippingTotal * vm.cartTotals.HandlingPercentage / 100;
                    vm.cartTotals.HandlingCharge = Number(Math.round(vm.cartTotals.HandlingCharge + 'e+' + vm.cartTotals.CurrencyDecimalDigits) + 'e-' + vm.cartTotals.CurrencyDecimalDigits);
                }
                vm.grandTotal();
            }
        };
        vm.validateShippingInfo = function () {
            if (vm.shipping) {
                if (vm.shipping.Address1 && vm.shipping.City && vm.shipping.PostalCode && vm.shipping.CountryID && vm.shipping.RegionID)
                    return true;
                else
                    return false;
            }
        };
        vm.defaultPayment = function () {
            if (!vm.billing.Payment && vm.billingPayments.length) {
                vm.billing.Payment = vm.billingPayments[0].PayMethodID.toString();
                vm.billPaymentChange();
            }
        };
        vm.billPaymentChange = function () {
            var payment = $filter('filter')(vm.billingPayments, { PayMethodID: parseInt(vm.billing.Payment) }, true);
            if (payment.length) {
                vm.selectedPayment = { ProcessMode: payment[0].GatewayProcessMode, PayType: payment[0].Type };
                switch (payment[0].Type) {
                    case 'CreditCard':
                        vm.selectedPayment.DisplayType = 'CreditCard';
                        break;
                    case 'ACHChecking':
                    case 'ACHSavings':
                        vm.selectedPayment.DisplayType = 'ECheck';
                        break;
                    case 'PO':
                        vm.selectedPayment.DisplayType = 'PurchaseOrder';
                        break;
                    default:
                        vm.selectedPayment.DisplayType = 'None';
                        break;
                }
                var surchargeAmount = payment[0].SurchargeAmount,
                    surchargePercentage = vm.cartTotals.SubTotal * payment[0].SurchargePercentage / 100;
                vm.cartTotals.Surcharge = surchargeAmount + surchargePercentage;
                vm.grandTotal();
            }
        };
        vm.shipAddressChange = function ($event) {
            vm.updating = true;
            if (vm.shippingMethods.length > 0) {
                vm.shipping.Calculated = null;
            }
            vm.get().then(function () {
                vm.updating = false;
            });
        };
        vm.grandTotal = function () {
            vm.cartTotals.GrandTotal = vm.cartTotals.SubTotal + vm.cartTotals.Discount + vm.cartTotals.MemberDiscount +
                vm.cartTotals.ShippingTotal + vm.cartTotals.HandlingCharge + vm.cartTotals.TaxTotal + vm.cartTotals.Surcharge;
            sharedProvider.updateCart(vm.cartList, vm.cartTotals);
        };
        vm.shipEmailChange = function () {
            $timeout(function () {
                var request = dataProvider.updateCartEmail(vm.moduleId, vm.shipping.Email);
                request.then(function (response) {
                    if (response.statusText != 'OK') {
                        console.log('Unable to update email address | ERR: ' + response.status);
                    }
                });
            }, 250);
        };
        vm.copyInfo = function () {
            vm.billing.FullName = (vm.shipping.FirstName != null ? vm.shipping.FirstName : '') + ' ' + (vm.shipping.LastName != null ? vm.shipping.LastName : '');
            vm.billing.FullName = vm.billing.FullName.trim();
            vm.billing.Address1 = vm.shipping.Address1;
            vm.billing.Address2 = vm.shipping.Address2;
            vm.billing.City = vm.shipping.City;
            vm.billing.PostalCode = vm.shipping.PostalCode;
            vm.billing.CountryID = vm.shipping.CountryID;
            vm.billingRegions = vm.shippingRegions;
            vm.billing.RegionID = vm.shipping.RegionID;
        };
        vm.print = function () {
            var styles = '.center{position:absolute;top:50%;left:50%;transform:translateX(-50%) translateY(-50%)}' +
                '.loader{border:16px solid #f3f3f3;border-radius:50%;border-top:14px solid #3498db;border-bottom:14px solid #3498db;width:60px;height:60px;animation:spin 2s linear infinite}' +
                '@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}';
            var popup = $window.open('', '_blank', 'fullscreen=yes');
            popup.document.open();
            popup.document.write('<html><head></head><style type="text/css">' + styles + '</style><body><div class="center loader"></div></body></html>');
            popup.document.close();
            var request = dataProvider.printtUserOrder(vm.moduleId, vm.orderStatus.OrderID);
            request.then(function (response) {
                popup.document.open();
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    popup.document.write('<html><head></head><body onload="window.print()">' + response.data + '</body></html>');
                }
                else {
                    popup.document.write('<html><head></head><body>Unable to print order | ERR: ' + response.data.Message + '</body></html>');

                    console.log((vm.localResource['PrintOrderError.Text'] || 'Unable to print order | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['PrintOrderError.Text'] || 'Unable to print order | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
                popup.document.close();
            });
        };
        vm.price = function (userEnteredAmount) {
            vm.donationRebinding = true;
            var quantity = 1, price = null, variants = {}, booking = {};
            if (vm.donationProductQuantity)
                quantity = vm.donationProductQuantity;
            if (!isNaN(vm.donationProductPrice))
                price = vm.donationProductPrice;
            if (vm.donationVariantsData)
                variants = vm.donationVariantsData;
            if (vm.donationBooking)
                booking = vm.donationBooking;
            var request = dataProvider.getProduct(vm.moduleId, vm.donationProduct.ProductID, quantity, price, variants, booking);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    vm.donationProduct.UnitCost = response.data.Product.UnitCost;
                    vm.donationProduct.SalePrice = response.data.Product.SalePrice;
                    vm.donationProduct.ModelNumber = response.data.Product.ModelNumber;
                    vm.donationProduct.QuantityOnHand = response.data.Product.QuantityOnHand;
                    if (!userEnteredAmount) {
                        if (vm.donationProduct.UserEnteredAmount)
                            vm.donationProductPrice = vm.donationIsSaleEnabled && vm.donationProduct.IsUnderSale ? vm.donationProduct.SalePrice : vm.donationProduct.UnitCost;
                        else
                            vm.donationProductPrice = null;
                    } else {
                        if (vm.donationProductPrice && !isNaN(vm.donationProductPrice)) {
                            if (vm.donationIsSaleEnabled && vm.donationProduct.IsUnderSale)
                                vm.donationProduct.SalePrice = vm.donationProductPrice;
                            else
                                vm.donationProduct.UnitCost = vm.donationProductPrice;
                        }
                    }
                }
                else {
                    console.log((vm.localResource['PriceError.Text'] || 'Unable to get price | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['PriceError.Text'] || 'Unable to get price | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
                vm.donationRebinding = false;
            });
        };
        vm.addToCart = function () {
            vm.donationRebinding = true;
            var quantity = 1, price = null, variants = {}, variantsFiles = {}, booking = {};
            if (vm.donationProductQuantity)
                quantity = vm.donationProductQuantity;
            if (!isNaN(vm.donationProductPrice))
                price = vm.donationProductPrice;
            if (vm.donationVariantsData)
                variants = vm.donationVariantsData;
            if (vm.donationVariantsFiles)
                variantsFiles = vm.donationVariantsFiles;
            if (vm.donationBooking)
                booking = vm.donationBooking;
            var request = dataProvider.addShoppingCart(vm.moduleId, vm.donationProduct.ProductID, null, quantity, price, variants, variantsFiles, booking, vm.inputs);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    angular.element(document.getElementById('rzcDonationModal_' + vm.moduleId)).modal('hide');
                    vm.get();
                    toastr.success((vm.localResource['AddedToCart.Text'] || 'Successfully added [PRODUCT] to cart.').replace('[PRODUCT]', vm.donationProduct.ModelName), vm.storeName);
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    console.log((vm.localResource['AddToCartError.Text'] || 'Unable to add to cart | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['AddToCartError.Text'] || 'Unable to add to cart | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
                vm.donationRebinding = false;
            });
        };
        vm.userEnteredAmountChange = function (name) {
            angular.forEach(angular.element('[name="' + name + '"]'), function (element) {
                element.oldValue = element.oldValue || element.defaultValue;
                if (!element.validity.valid) {
                    element.value = element.oldValue = element.value == element.defaultValue ? element.defaultValue : element.oldValue;
                } else if (element.oldValue != element.value)
                    element.oldValue = element.value;
                vm.productPrice = element.value ? Number(element.value) : null;
            });
            var updatePrice = false;
            angular.forEach(vm.donationVariantList, function (group) {
                var groupVisible = !group.Hide;
                angular.forEach(group.Conditionals, function (condition) {
                    switch (condition.VariantDisplayType) {
                        case 'DropdownList':
                        case 'Buttons':
                        case 'RadioButtons':
                        case 'Icon':
                            if (vm.donationVariantsData['group_' + condition.VariantGroupID] == condition.VariantID)
                                groupVisible = true;
                            break;
                        case 'CheckBox':
                            if (vm.donationVariantsData['variantChk_' + condition.VariantID])
                                groupVisible = true;
                            break;
                    }
                });
                if (groupVisible) {
                    angular.forEach(vm.donationVariantsData, function (ngValue, ngKey) {
                        if (ngKey.startsWith('group_')) {
                            updatePrice = true;
                            if (ngValue)
                                vm.donationVariantsData[ngKey] = null;
                        }
                        else if (ngKey.startsWith('variantChk_') && ngValue) {
                            updatePrice = true;
                            if (ngValue)
                                vm.donationVariantsData[ngKey] = false;
                        }
                    });
                }
            });
            if (updatePrice)
                vm.price(true);
        };
    };
    // End of RazorCart IIFE
}());