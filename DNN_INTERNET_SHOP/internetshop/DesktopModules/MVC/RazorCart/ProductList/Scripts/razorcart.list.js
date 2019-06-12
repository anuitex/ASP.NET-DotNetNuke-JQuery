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
        .controller('listCtrl', listCtrl)
    ;
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ProductList Module Controller                                                                                                                                                                    //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function listCtrl($scope, $filter, $rootScope, $window, $location, $timeout, sharedProvider, globalFunctions, dataProvider, toastr) {
        var vm = this;
        $rootScope.$on('$locationChangeSuccess', function (event, newLocation, oldLocation) {
            vm.actualLocation = $location.absUrl();
            var productListInfo = sharedProvider.getProductListInfo();
            if (productListInfo.isRebindProducts && newLocation.toLowerCase() !== oldLocation.toLowerCase()) {
                vm.currentPage = productListInfo.currentPage;
                vm.rebindProducts();
            }
            sharedProvider.updateProductListInfo('isRebindProducts', false);
        });
        $rootScope.$watch(function () { return $location.absUrl() }, function (newLocation, oldLocation) {
            if (vm.actualLocation && newLocation.toLowerCase() === vm.actualLocation.toLowerCase()) {
                //Handle Browser's Back/Forward buttons
                vm.currentPage = 1;
                sharedProvider.updateProductListInfo('currentPage', 1);
                vm.sortExpression = 'order-asc';
                vm.searchText = '';
                vm.minPrice = null;
                vm.maxPrice = null;
                vm.displayMode = vm.defaultDisplayMode || 'gridview';
                angular.forEach(sharedProvider.getPathParams($location.absUrl()).params, function (ngValue, ngKey) {
                    switch (ngKey.toLowerCase()) {
                        case 'page':
                            vm.currentPage = parseInt(ngValue);
                            sharedProvider.updateProductListInfo('currentPage', vm.currentPage);
                            break;
                        case 'sort':
                            vm.sortExpression = ngValue.toLowerCase();
                            break;
                        case 'search':
                            vm.searchText = ngValue;
                            break;
                        case 'minprice':
                            vm.minPrice = parseFloat(ngValue);
                            break;
                        case 'maxprice':
                            vm.maxPrice = parseFloat(ngValue);
                            break;
                        case 'display':
                            vm.displayMode = ngValue.toLowerCase();
                            break;
                    }
                });
                vm.rebindProducts();
            }
        });
        vm.init = function (model) {
            vm.currentPage = model.Pager.CurrentPage;
            vm.moduleId = model.ModuleID;
            vm.storeName = model.StoreName;
            vm.localResource = model.LocalResource;
            vm.products = model.Products;
            vm.checkoutPage = model.CheckoutPage;
            vm.productDetailsPage = model.ProductDetailsPage;
            vm.productComparePage = model.ProductComparePage;
            vm.isGiftCardsEnabled = model.IsGiftCardsEnabled;
            vm.isSaleEnabled = model.IsSaleEnabled;
            vm.manageInventory = model.ManageInventory;
            vm.enableAutoFiltering = model.EnableAutoFiltering;
            vm.autoFilteringTimeout = model.AutoFilteringTimeout;
            vm.sortExpression = model.SortExpression.toLowerCase();
            vm.searchText = model.SearchText;
            vm.minPrice = model.MinPrice > -1 ? model.MinPrice : null;
            vm.maxPrice = model.MaxPrice > -1 ? model.MaxPrice : null;
            vm.defaultDisplayMode = model.DisplayMode.toLowerCase();
            vm.displayMode = vm.defaultDisplayMode;
            vm.pageSize = model.Pager.PageSize;
            vm.displayedPages = model.Pager.DisplayedPages;
            vm.itemsCount = model.Pager.ItemsCount;
            vm.pageCount = model.Pager.PageCount;
            vm.halfDisplayed = model.Pager.HalfDisplayed;
            vm.startPage = model.Pager.StartPage;
            vm.endPage = model.Pager.EndPage;
            sharedProvider.updateProductListInfo('currentPage', model.Pager.CurrentPage);
            sharedProvider.updateProductListInfo('isRebindProducts', false);
            sharedProvider.updateProductListInfo('useFriendlyUrls', model.UseFriendlyUrls);
            sharedProvider.updateProductListInfo('absoluteBaseUrl', model.AbsoluteBaseUrl);
            sharedProvider.addCategoryUrlKey('Categories');
            sharedProvider.initPathParams($location.absUrl(), model.UrlParams);
            angular.element(document.getElementById('rzcContainer_' + vm.moduleId)).attr('ng-init', '');
        };
        vm.getRangeArray = function (min, max, step) {
            return globalFunctions.getRangeArray(min, max, step);
        };
        vm.rebindProducts = function () {
            vm.rebinding = true;
            var priceList = '';
            var categoryList = [];
            var catUrlKeys = sharedProvider.getCategoryUrlKeys();
            angular.forEach(sharedProvider.getPathParams($location.absUrl()).params, function (ngValue, ngKey) {
                var keyLower = ngKey.toLowerCase();
                if (keyLower === 'prices') {
                    priceList = ngValue;
                } else {
                    var index = catUrlKeys.map(function (key) {
                        return key.toLowerCase();
                    }).indexOf(keyLower);
                    if (index > -1) {
                        categoryList.push(ngValue);
                    }
                }
            });
            var minPrice = (vm.minPrice === null || typeof vm.minPrice === 'undefined') ? -1 : vm.minPrice;
            var maxPrice = (vm.maxPrice === null || typeof vm.maxPrice === 'undefined') ? -1 : vm.maxPrice;
            var request = dataProvider.listProducts(vm.moduleId, vm.currentPage, vm.pageSize, vm.sortExpression, vm.searchText, categoryList.join('|'), minPrice, maxPrice, priceList);
            request.then(function (response) {
                vm.products = response.data.Products;
                vm.itemsCount = 0;
                if (vm.products.length)
                    vm.itemsCount = vm.products[0].TotalRecords;
                vm.pageCount = Math.ceil(vm.itemsCount / vm.pageSize) ? Math.ceil(vm.itemsCount / vm.pageSize) : 1;
                vm.startPage = Math.ceil((vm.currentPage - 1) > vm.halfDisplayed ? Math.max(Math.min((vm.currentPage - 1) - vm.halfDisplayed, (vm.pageCount - vm.displayedPages)), 0) : 0);
                vm.endPage = Math.ceil((vm.currentPage - 1) > vm.halfDisplayed ? Math.min((vm.currentPage - 1) + vm.halfDisplayed, vm.pageCount) : Math.min(vm.displayedPages, vm.pageCount));
                vm.rebinding = false;
            });
        };
        vm.get = function () {
            var request = dataProvider.getShoppingCart(vm.moduleId, vm.shipping);
            request.then(function (response) {
                sharedProvider.updateCart(response.data.CartList, response.data.CartTotals);
                vm.adding = false;
            });
        };
        vm.addToCart = function ($index) {
            vm.adding = true;
            var product = vm.products[$index];
            if (product.HasVariants || product.Booking || (vm.isGiftCardsEnabled && product.GiftCard)) {
                window.location.href = product.ProductDetailUrl;
            }
            else {
                var quantity = 1, price = null;
                if (vm.productQuantity && product.ProductID in vm.productQuantity)
                    quantity = vm.productQuantity[product.ProductID];
                if (vm.productPrice && product.ProductID in vm.productPrice)
                    price = vm.productPrice[product.ProductID];
                var request = dataProvider.addShoppingCart(vm.moduleId, product.ProductID, null, quantity, price, new Object(), new Object());
                request.then(function (response) {
                    if (globalFunctions.getResponseType(response.status) == 'Successful') {
                        switch (response.data.Action) {
                            case 'UseMiniCart':
                                vm.get();
                                toastr.success((vm.localResource['AddedToCart.Text'] || 'Successfully added [PRODUCT] to cart.').replace('[PRODUCT]', product.ModelName), vm.storeName);
                                break;
                            case 'RedirectToCheckout':
                                $window.location.href = response.data.Url;
                                break;
                            case 'OpenCustomModal':
                                vm.get();
                                $timeout(function () {
                                    dnnModal.show(response.data.Modal, true, 600, 800, true, response.data.Url);
                                });
                                break;
                        }
                    }
                    else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                        vm.adding = false;
                        toastr.warning(response.data.Message, vm.storeName);
                    }
                    else {
                        vm.adding = false;
                        console.log((vm.localResource['AddToCartError.Text'] || 'Unable to add to cart | ERR:') + ' ' + response.status);
                        toastr.error((vm.localResource['AddToCartError.Text'] || 'Unable to add to cart | ERR:') + ' ' + response.data.Message, vm.storeName);
                    }
                });
            }
        };
        vm.addToWishlist = function (index) {
            vm.adding = true;
            var product = vm.products[index];
            if (product.HasVariants || product.Booking || (vm.isGiftCardsEnabled && product.GiftCard)) {
                window.location.href = product.ProductDetailUrl;
            }
            else {
                var quantity = 1, price = null;
                if (vm.productQuantity && product.ProductID in vm.productQuantity)
                    quantity = vm.productQuantity[product.ProductID];
                if (vm.productPrice && product.ProductID in vm.productPrice)
                    price = vm.productPrice[product.ProductID];
                var request = dataProvider.addWishlist(vm.moduleId, product.ProductID, quantity, price, new Object(), new Object());
                request.then(function (response) {
                    if (globalFunctions.getResponseType(response.status) == 'Successful') {
                        sharedProvider.updateWishlist(response.data.SavedCart);
                        toastr.success((vm.localResource['AddedToWishlist.Text'] || 'Successfully added [PRODUCT] to wishlist.').replace('[PRODUCT]', product.ModelName), vm.storeName);
                    }
                    else if (globalFunctions.getResponseType(response.status) == 'ClientError') {
                        toastr.warning(response.data.Message, vm.storeName);
                    }
                    else {
                        console.log((vm.localResource['AddToWishlistError.Text'] || 'Unable to add to wishlist | ERR:') + ' ' + response.status);
                        toastr.error((vm.localResource['AddToWishlistError.Text'] || 'Unable to add to wishlist | ERR:') + ' ' + response.data.Message, vm.storeName);
                    }
                    vm.adding = false;
                });
            }
        };
        vm.addToComparison = function (index) {
            vm.adding = true;
            var product = vm.products[index];
            if (product) {
                var request = dataProvider.addProductCompare(vm.moduleId, product.ProductID);
                request.then(function (response) {
                    if (globalFunctions.getResponseType(response.status) === 'Successful') {
                        toastr.success((vm.localResource['AddedToComparison.Text'] || 'Successfully added [PRODUCT] to comparison sheet.').replace('[PRODUCT]', product.ModelName), vm.storeName, {
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
                    vm.adding = false;
                });
            }
        };
        vm.applyFilters = function (event) {
            if (event != undefined || event != null) {
                event.preventDefault();
                event.stopPropagation();
            }
            sharedProvider.updateProductListInfo('isRebindProducts', true);
            var params = [
                {
                    key: 'Search',
                    value: vm.searchText.length ? vm.searchText : null
                },
                {
                    key: 'MinPrice',
                    value: vm.minPrice !== null && vm.minPrice > -1 ? vm.minPrice : null
                },
                {
                    key: 'MaxPrice',
                    value: vm.maxPrice !== null && vm.maxPrice > -1 ? vm.maxPrice : null
                }
            ];
            globalFunctions.updateUrlLocation(vm.moduleId, true, params);
        };
        vm.goToPage = function (event, page) {
            event.preventDefault();
            event.stopPropagation();
            if (page) {
                sharedProvider.updateProductListInfo('isRebindProducts', true);
                vm.currentPage = page;
                sharedProvider.updateProductListInfo('currentPage', vm.currentPage);
                var params = [
                    {
                        key: 'Page',
                        value: page
                    }
                ];
                globalFunctions.updateUrlLocation(vm.moduleId, false, params);
                $('html, body').animate({
                    scrollTop: angular.element(document.getElementById('rzcContainer_' + vm.moduleId)).offset().top
                }, 400);
            }
        };
        vm.sortExpressionChange = function (event, sortExpression) {
            if (event != undefined || event != null) {
                event.preventDefault();
            }
            vm.sortExpression = sortExpression;
            sharedProvider.updateProductListInfo('isRebindProducts', true);
            var params = [
                {
                    key: 'Sort',
                    value: vm.sortExpression.toLowerCase()
                }
            ];
            globalFunctions.updateUrlLocation(vm.moduleId, true, params);
        };
        vm.changeDisplay = function (event, mode) {
            event.preventDefault();
            event.stopPropagation();
            sharedProvider.updateProductListInfo('isRebindProducts', false);
            vm.displayMode = mode;
            var params = [
                {
                    key: 'Display',
                    value: vm.displayMode.toLowerCase()
                }
            ];
            globalFunctions.updateUrlLocation(vm.moduleId, false, params);
        };
    }
    // End of RazorCart IIFE
}());