(function () {
    // Invoking JavaScript Strict Mode
    'use strict';
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Definition of the RazorCart Application                                                                                                                                                          //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    angular
        // Modules
        .module('RazorCart')
        // Configuration
        .config(function ($locationProvider, $compileProvider, toastrConfig) {
            //disabled html5Mode to prevent angular from encoding slash in product SEO URL
            $locationProvider.html5Mode(false);
        })
        // Controllers
        .controller('detailsCtrl', detailsCtrl)
        // Dependencies
        .requires.push('ui.bootstrap', 'ngStarRating', 'ngPickaDate')
    ;
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Product Details Module Controller                                                                                                                                                                //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function detailsCtrl($scope, $filter, $window, $timeout, sharedProvider, dataProvider, globalFunctions, toastr) {
        var vm = this;
        vm.init = function (model) {
            vm.moduleId = model.ModuleID;
            vm.storeName = model.StoreName;
            vm.localResource = model.LocalResource;
            vm.product = model.Product;
            vm.variantList = model.VariantList;
            vm.isGiftCardsEnabled = model.IsGiftCardsEnabled;
            vm.isSaleEnabled = model.IsSaleEnabled;
            vm.manageInventory = model.ManageInventory;
            vm.showReviews = model.ShowReviews;
            vm.productImages = model.ProductImages;
            vm.productReviews = model.ProductReviews;
            vm.sliderImages = model.SliderImages;
            vm.checkoutPage = model.CheckoutPage;
            vm.productListPage = model.ProductListPage;
            vm.productComparePage = model.ProductComparePage;
            vm.booking = model.Booking;
            vm.event = model.Event;
            vm.newRate = {};
            angular.element(document.getElementById('rzcContainer_' + vm.moduleId)).attr('ng-init', '');
        };
        vm.shoppingCart = function () {
            var request = dataProvider.getShoppingCart(vm.moduleId, vm.shipping);
            request.then(function (response) {
                sharedProvider.updateCart(response.data.CartList, response.data.CartTotals);
                vm.rebinding = false;
            });
        };
        vm.changeImage = function (name) {
            if (name) {
                var dImages = '';
                angular.forEach(angular.element('[name="' + name + '"]'), function (element) {
                    switch (element.tagName) {
                        case 'INPUT':
                            if (element.checked)
                                dImages = element.getAttribute('data-images') || dImages;
                            break;
                        case 'SELECT':
                            var option = element.selectedOptions[element.selectedOptions.length - 1];
                            if (option)
                                dImages = option.getAttribute('data-images') || dImages;
                            break;
                    }
                });
                var imageIds = [];
                angular.forEach(dImages.split(','), function (sid) {
                    var id = parseInt(sid);
                    if (!isNaN(id) && imageIds.indexOf(id) === -1) {
                        imageIds.push(id);
                    }
                });
                if (imageIds.length) {
                    angular.element('img[u="thumb"][data-id="imageId_' + imageIds[0] + '"]').click();
                }
            }
        };
        vm.price = function (name, userEnteredAmount) {
            vm.changeImage(name);
            vm.rebinding = true;
            var quantity = 1, price = null, variants = {}, booking = {};
            if (vm.productQuantity)
                quantity = vm.productQuantity;
            if (!isNaN(vm.productPrice))
                price = vm.productPrice;
            if (vm.variantsData)
                variants = vm.variantsData;
            if (vm.booking)
                booking = vm.booking;
            var request = dataProvider.getProduct(vm.moduleId, vm.product.ProductID, quantity, price, variants, booking);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    vm.product.OriginalUnitCost = response.data.Product.OriginalUnitCost;
                    vm.product.UnitCost = response.data.Product.UnitCost;
                    vm.product.OriginalSalePrice = response.data.Product.OriginalSalePrice;
                    vm.product.SalePrice = response.data.Product.SalePrice;
                    vm.product.ModelNumber = response.data.Product.ModelNumber;
                    vm.product.QuantityOnHand = response.data.Product.QuantityOnHand;
                    if (!userEnteredAmount) {
                        if (vm.product.UserEnteredAmount)
                            vm.productPrice = vm.isSaleEnabled && vm.product.IsUnderSale ? (vm.product.BundleSalePrice || vm.product.SalePrice) : (vm.product.BundleUnitCost || vm.product.UnitCost);
                        else
                            vm.productPrice = null;
                    } else {
                        if (vm.productPrice && !isNaN(vm.productPrice)) {
                            if (vm.isSaleEnabled && vm.product.IsUnderSale) {
                                if (vm.product.BundleSalePrice)
                                    vm.product.BundleSalePrice = vm.productPrice;
                                else
                                    vm.product.SalePrice = vm.productPrice;
                            }
                            else {
                                if (vm.product.BundleUnitCost)
                                    vm.product.BundleUnitCost = vm.productPrice;
                                else
                                    vm.product.UnitCost = vm.productPrice;
                            }
                        }
                    }
                }
                else {
                    console.log((vm.localResource['PriceError.Text'] || 'Unable to get price | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['PriceError.Text'] || 'Unable to get price | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
                vm.rebinding = false;
            });
        };
        vm.addToCart = function () {
            vm.rebinding = true;
            var quantity = 1, price = null, variants = {}, variantsFiles = {}, booking = {};
            if (vm.productQuantity)
                quantity = vm.productQuantity;
            if (!isNaN(vm.productPrice))
                price = vm.productPrice;
            if (vm.variantsData)
                variants = vm.variantsData;
            if (vm.variantsFiles)
                variantsFiles = vm.variantsFiles;
            if (vm.booking)
                booking = vm.booking;
            var request = dataProvider.addShoppingCart(vm.moduleId, vm.product.ProductID, null, quantity, price, variants, variantsFiles, booking, vm.inputs);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    switch (response.data.Action) {
                        case 'UseMiniCart':
                            vm.shoppingCart();
                            toastr.success((vm.localResource['AddedToCart.Text'] || 'Successfully added [PRODUCT] to cart.').replace('[PRODUCT]', vm.product.ModelName), vm.storeName);
                            break;
                        case 'RedirectToCheckout':
                            $window.location.href = response.data.Url;
                            break;
                        case 'OpenCustomModal':
                            vm.shoppingCart();
                            $timeout(function () {
                                dnnModal.show(response.data.Modal, true, 600, 800, true, response.data.Url);
                            });
                            break;
                    }
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    vm.rebinding = false;
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    vm.rebinding = false;
                    console.log((vm.localResource['AddedToCartError.Text'] || 'Unable to add to cart | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['AddedToCartError.Text'] || 'Unable to add to cart | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
            });
        };
        vm.addToWishlist = function () {
            vm.rebinding = true;
            var quantity = 1, price = null, variants = {}, variantsFiles = {}, booking = {};
            if (vm.productQuantity)
                quantity = vm.productQuantity;
            if (!isNaN(vm.productPrice))
                price = vm.productPrice;
            if (vm.variantsData)
                variants = vm.variantsData;
            if (vm.variantsFiles)
                variantsFiles = vm.variantsFiles;
            if (vm.booking)
                booking = vm.booking;
            var request = dataProvider.addWishlist(vm.moduleId, vm.product.ProductID, quantity, price, variants, variantsFiles, booking);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    sharedProvider.updateWishlist(response.data.SavedCart);
                    toastr.success((vm.localResource['AddedToWishlist.Text'] || 'Successfully added [PRODUCT] to wishlist.').replace('[PRODUCT]', vm.product.ModelName), vm.storeName);
                }
                else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    console.log((vm.localResource['AddedToWishlistError.Text'] || 'Unable to add to wishlist | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['AddedToWishlistError.Text'] || 'Unable to add to wishlist | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
                vm.rebinding = false;
            });
        };
        vm.addToComparison = function () {
            vm.rebinding = true;
            var request = dataProvider.addProductCompare(vm.moduleId, vm.product.ProductID);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) === 'Successful') {
                    toastr.success((vm.localResource['AddedToComparison.Text'] || 'Successfully added [PRODUCT] to comparison sheet.').replace('[PRODUCT]', vm.product.ModelName), vm.storeName, {
                        onTap: function () { window.location.href = vm.productComparePage; }
                    });
                }
                else if (globalFunctions.getResponseType(response.status) === 'ClientError') {
                    toastr.warning(response.data.Message, vm.storeName);
                }
                else {
                    console.log((vm.localResource['AddedToComparisonError.Text'] || 'Unable to add to comparison sheet | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['AddedToComparisonError.Text'] || 'Unable to add to comparison sheet | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
                vm.rebinding = false;
            });
        };
        vm.zoom = function (panID, zoomImage) {
            angular.element(document).ready(function () {
                angular.element(document.getElementById('zoompan_' + panID)).zoom({ url: zoomImage });
            });
        };
        vm.listProductReviews = function () {
            var request = dataProvider.listProductReviews(vm.moduleId, vm.product.ProductID);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    vm.productReviews = response.data.ProductReviews;
                }
                else {
                    console.log((vm.localResource['GetReviewsError.Text'] || 'Unable to get product reviews | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['GetReviewsError.Text'] || 'Unable to get product reviews | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
            });
        };
        vm.submitReview = function () {
            var request = dataProvider.addProductReview(vm.moduleId, vm.product.ProductID, vm.newRate.Rate, vm.newRate.Comments, vm.newRate.NickName);
            request.then(function (response) {
                if (globalFunctions.getResponseType(response.status) == 'Successful') {
                    vm.listProductReviews();
                    toastr.success((vm.localResource['SubmitedReview.Text'] || 'Successfully submitted a review for [PRODUCT].').replace('[PRODUCT]', vm.product.ModelName), vm.storeName);
                    vm.writeReview = !vm.writeReview;
                }
                else {
                    console.log((vm.localResource['SubmitReviewsError.Text'] || 'Unable to submit product review | ERR:') + ' ' + response.status);
                    toastr.error((vm.localResource['SubmitReviewsError.Text'] || 'Unable to submit product review | ERR:') + ' ' + response.data.Message, vm.storeName);
                }
            });
        };
        vm.bookingChange = function () {
            $timeout(function () {
                var request = dataProvider.getProductBooking(vm.moduleId, vm.product.ProductID, vm.booking.start, vm.booking.end);
                request.then(function (response) {
                    if (globalFunctions.getResponseType(response.status) == 'Successful') {
                        vm.booking.start.dateOptions = response.data.Booking.start.dateOptions;
                        vm.booking.start.timeOptions = response.data.Booking.start.timeOptions;
                        vm.booking.end.dateOptions = response.data.Booking.end.dateOptions;
                        vm.booking.end.timeOptions = response.data.Booking.end.timeOptions;
                    }
                    else {
                        console.log((vm.localResource['GetBookingData.Text'] || 'Unable to get product booking data | ERR:') + ' ' + response.status);
                        toastr.error((vm.localResource['GetBookingData.Text'] || 'Unable to get product booking data | ERR:') + ' ' + response.data.Message, vm.storeName);
                    }
                });
            }, 50);
        };
        vm.navigateShareUrl = function ($event) {
            $event.preventDefault();
            var url = $event.currentTarget.getAttribute('href');
            var winWidth = Math.min(600, screen.width - 15);
            var winHeight = Math.min(550, screen.height - 15);
            var winTop = (screen.height / 2) - (winHeight / 2);
            var winLeft = (screen.width / 2) - (winWidth / 2);
            window.open(url, 'Share-Product', 'width=' + winWidth + ',height=' + winHeight + ',top=' + winTop + ',left=' + winLeft + ',menubar=no,toolbar=no,status=no,resizable=yes,scrollbars=yes');
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
            angular.forEach(vm.variantList, function (group) {
                var groupVisible = !group.Hide;
                angular.forEach(group.Conditionals, function (condition) {
                    switch (condition.VariantDisplayType) {
                        case 'DropdownList':
                        case 'Buttons':
                        case 'RadioButtons':
                        case 'Icon':
                            if (vm.variantsData['group_' + condition.VariantGroupID] == condition.VariantID)
                                groupVisible = true;
                            break;
                        case 'CheckBox':
                            if (vm.variantsData['variantChk_' + condition.VariantID])
                                groupVisible = true;
                            break;
                    }
                });
                if (groupVisible) {
                    angular.forEach(vm.variantsData, function (ngValue, ngKey) {
                        if (ngKey.startsWith('group_')) {
                            updatePrice = true;
                            if (ngValue)
                                vm.variantsData[ngKey] = null;
                        }
                        else if (ngKey.startsWith('variantChk_') && ngValue) {
                            updatePrice = true;
                            if (ngValue)
                                vm.variantsData[ngKey] = false;
                        }
                    });
                }
            });
            if (updatePrice)
                vm.price(null, true);
        };
    }
    // End of RazorCart IIFE
}());