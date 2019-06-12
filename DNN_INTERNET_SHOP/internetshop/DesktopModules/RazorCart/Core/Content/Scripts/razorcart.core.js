(function () {
    // Invoking JavaScript Strict Mode
    'use strict';
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Definition of the RazorCart Application                                                                                                                                                          //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    angular.module('ngProvider', []).factory('sharedProvider', sharedProvider);
    angular.module('RazorCart', ['ngProvider', 'ngMessages', 'toastr'])
        // Configuration
        .config(function ($locationProvider, $compileProvider, toastrConfig) {
            //Enable Html5 Mode, for html5 browsers only
            //requireBase (default: true): set to false as it requires base tag <base href='/'> in the head tag
            //rewriteLinks: prevent angular from controlling all links
            if (window.history && window.history.pushState) {
                $locationProvider.html5Mode({
                    enabled: true,
                    requireBase: false,
                    rewriteLinks: false
                });
            }
            //Provide Angular the safe Whitelist for href & src attributes, this prevents Angular from prefixing href/src with unsafe keyword.
            //Example: Angular will change 'javascript:void(0)' to 'unsafe:javascript:void(0)' unless you add javascript to the href whitelist.
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|javascript):/);//Added javascript only to Angular default safe href regex.
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|local|file|blob):|data:image\/)/);//Added local only to Angular default safe src regex.
            //Toastr customization
            angular.extend(toastrConfig, {
                allowHtml: false,
                autoDismiss: false,
                closeButton: true,
                closeHtml: '<button>&times;</button>',
                containerId: 'toast-container',
                extendedTimeOut: 1000,
                iconClasses: {
                    error: 'toast-error', info: 'toast-info', success: 'toast-success', warning: 'toast-warning'
                },
                maxOpened: 0,
                messageClass: 'toast-message',
                newestOnTop: true,
                progressBar: true,
                positionClass: 'toast-bottom-right',
                preventDuplicates: false,
                preventOpenDuplicates: false,
                tapToDismiss: false,
                target: 'body',
                timeOut: 5000,
                titleClass: 'toast-title',
                toastClass: 'toast'
            });
        })
        // Initialization
        .run(function ($rootScope, $location, $window, $rootElement, $timeout, globalFunctions) {
            $rootScope.$on('$locationChangeSuccess', function (event, newLocation, oldLocation) {
                //actualLocation used to determine if the user clicked Browser's Back/Forward buttons
                $rootScope.actualLocation = $location.absUrl();
                angular.forEach($window.rootScopes, function (scope) {
                    if (!scope.$$phase)
                        scope.$apply();
                });
                if ($window.analytics) {
                    $window.analytics('send', 'pageview', $location.$$url);
                }
            });
            $rootScope.$watch(function () { return $location.absUrl() }, function (newLocation, oldLocation) {
                if ($rootScope.actualLocation && newLocation.toLowerCase() === $rootScope.actualLocation.toLowerCase()) {
                    //Handle Browser's Back/Forward buttons - If needed
                }
            });
        })
        // Directives
        .directive('errSrc', function () {
            // Handles Broken Images 'err-src'
            return {
                link: function (scope, element, attrs) {
                    element.bind('error', function () {
                        var defaultImage = attrs.errSrc + 'RazorCart/Core/Content/Images/no-product-image-available-{size}.png'.replace('{size}', attrs.errSize);
                        if (attrs.src !== defaultImage) {
                            attrs.$set('src', defaultImage);
                        }
                    });
                }
            };
        })
        .directive('destroyY', function () {
            // Destroy ngModel value when DOM element destroyed
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function (scope, element, attrs, ngModel) {
                    scope.$on('$destroy', function () {
                        ngModel.$setViewValue(undefined);
                    });
                }
            };
        })
        .directive('a', function () {
            // Add 'target = _self' to all anchors
            return {
                restrict: 'E',
                link: function (scope, element, attrs) {
                    var anchor = element[0];
                    if (!anchor.target)
                        anchor.target = '_self';
                }
            };
        })
        .directive('validFile', ['$parse',
            // Enable the file-upload validation & uploads
            function ($parse) {
                return {
                    restrict: 'A',
                    require: 'ngModel',
                    link: function (scope, element, attrs, ngModel) {
                        var validFileAttr = attrs.validFile || attrs.ngModel.replace('variantsData', 'variantsFiles');
                        element.bind('change', function () {
                            scope.$apply(function () {
                                if (element[0].files.length) {
                                    var value = $.map(element[0].files, function (file) {
                                        return file.name;
                                    }).join(', ');
                                    $parse(attrs.ngModel).assign(scope, value);
                                    $parse(validFileAttr).assign(scope, element[0].files);
                                }
                                else {
                                    $parse(attrs.ngModel).assign(scope, '');
                                    $parse(validFileAttr).assign(scope, undefined);
                                }
                            });
                        });
                    }
                };
            }
        ])
        .directive('focusInvalid', function () {
            // Focus on the first invalid element of the invalid form
            return {
                restrict: 'A',
                link: function (scope, element, event) {
                    element.on('click', function () {
                        if (element.controller()) {
                            var form = scope['rzcForm_' + element.controller().moduleId];
                            if (form.$invalid) {
                                angular.element('[ng-form="' + form.$name + '"]').find('.ng-invalid:visible:first').focus();
                            }
                        }
                    });
                }
            };
        }).directive('scrollTo', function () {
            // Focus on the element when initialized on page
            return {
                restrict: 'A',
                link: function (scope, element, event) {
                    element[0].scrollIntoView(true);
                    window.scrollBy(0, -100);
                }
            };
        })
        // Filters
        .filter('unSafeHtml', function ($sce) {
            return $sce.trustAsHtml;
        })
        .filter('percentage', ['$filter', function ($filter){
            return function (input, decimals) {
                return $filter('number')(input * 100, decimals) + '%';
            };
        }])
        .filter('fileSize', function () {
            return function (bytes, precision) {
                if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
                if (typeof precision === 'undefined') precision = 1;
                var units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
                    number = Math.floor(Math.log(bytes) / Math.log(1024));
                return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
            };
        })
        // Service Providers
        //.factory('sharedProvider', sharedProvider)
        .service('globalFunctions', globalFunctions)
        .service('dataProvider', dataProvider)
    ;
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Shared Provider Service: Provides module controllers with shared memory access                                                                                                                   //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    sharedProvider.$inject = ['$location', '$rootScope', '$window'];
    function sharedProvider($location, $rootScope, $window) {
        var shoppingCart = { cartList: [], cartTotals: {} }, wishlist = [];
        var urlParams = [], categoryUrlKeys = [];
        var productListInfo = {
            currentPage: 1,
            isRebindProducts: false
        };
        $window.rootScopes = $window.rootScopes || [];
        $window.rootScopes.push($rootScope);
        if ($window.sharedService) {
            return $window.sharedService;
        }
        var apply = function () {
            angular.forEach($window.rootScopes, function (scope) {
                if (!scope.$$phase)
                    scope.$apply();
            });
        };
        $window.sharedService = {
            updateCart: function (cartList, cartTotals) {
                shoppingCart.cartList = cartList;
                shoppingCart.cartTotals = cartTotals;
                apply();
            },
            getCart: function () {
                return shoppingCart;
            },
            updateWishlist: function (newValue) {
                wishlist = newValue;
                apply();
            },
            getWishlist: function () {
                return wishlist;
            },
            initPathParams: function (path, params) {
                var index = urlParams.map(function (pathParams) {
                    return pathParams.path.toLowerCase();
                }).indexOf(path.toLowerCase());
                if (index > -1) {
                    urlParams[index] = { path: path, params: params }; // Clone it
                } else {
                    urlParams.push({ path: path, params: params });
                }
            },
            getPathParams: function (path) {
                var index = urlParams.map(function (pathParams) {
                    return pathParams.path.toLowerCase();
                }).indexOf(path.toLowerCase());
                var pathParams;
                if (index > -1) {
                    pathParams = JSON.parse(JSON.stringify(urlParams[index])); // Clone it
                } else {
                    pathParams = { path: path, params: {} };
                }
                return pathParams;
            },
            getProductListInfo: function () {
                return productListInfo;
            },
            updateProductListInfo: function (key, value) {
                productListInfo[key] = value;
            },
            addCategoryUrlKey: function (catUrlKey) {
                var index = categoryUrlKeys.map(function (key) {
                    return key.toLowerCase();
                }).indexOf(catUrlKey.toLowerCase());
                if (index > -1) {
                    categoryUrlKeys[index] = catUrlKey;
                } else {
                    categoryUrlKeys.push(catUrlKey);
                }
            },
            getCategoryUrlKeys: function () {
                return categoryUrlKeys;
            }
        };
        return $window.sharedService;
    };
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Global Functions Service: Provides app controllers with general functions                                                                                                                        //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    globalFunctions.$inject = ['$location', '$rootScope', 'dataProvider'];
    function globalFunctions($location, $rootScope, dataProvider) {
        var getResponseType = function (code) {
            Number.isInteger = Number.isInteger || function (value) {
                return isFinite(value);
            };
            if (Number.isInteger(code)) {
                if ((code / 100) >= 1 && (code / 100) < 2)
                    return 'Informational';
                else if ((code / 100) >= 2 && (code / 100) < 3)
                    return 'Successful';
                else if ((code / 100) >= 3 && (code / 100) < 4)
                    return 'Redirection';
                else if ((code / 100) >= 4 && (code / 100) < 5)
                    return 'ClientError';
                else if ((code / 100) >= 5 && (code / 100) < 6)
                    return 'ServerError';
                else
                    return 'UnknownCode';
            }
            else
                return 'BadCode';
        };
        var getRangeArray = function (min, max, step) {
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) {
                input.push(i);
            }
            return input;
        };
        var updateUrlLocation = function (moduleId, goToFirstPage, params) {
            var productListInfo = sharedService.getProductListInfo();
            var pathParams = sharedService.getPathParams($location.absUrl());
            var paramKeys = Object.keys(pathParams.params);
            if (goToFirstPage) {
                sharedService.updateProductListInfo('currentPage', 1);
                var index = paramKeys.map(function (key) {
                    return key.toLowerCase();
                }).indexOf('page');
                if (index > -1) {
                    pathParams.params[paramKeys[index]] = 1;
                }
            }
            angular.forEach(params, function (param, i) {
                var index = paramKeys.map(function (key) {
                    return key.toLowerCase();
                }).indexOf(param.key.toLowerCase());
                if (index > -1) {
                    var key = paramKeys[index];
                    if (param.value !== null) {
                        pathParams.params[key] = param.value;
                    } else {
                        delete pathParams.params[key];
                    }
                } else if (param.value !== null) {
                    pathParams.params[param.key] = param.value;
                }
            });
            var queryString = Object.keys(pathParams.params).map(function (param) {
                return param + '=' + pathParams.params[param];
            }).join('&');
            var request = dataProvider.getTabUrl(moduleId, -1, encodeURIComponent(queryString));
            request.then(function (response) {
                if (getResponseType(response.status) == 'Successful') {
                    pathParams.path = response.data.FullUrl;
                    sharedService.initPathParams(pathParams.path, pathParams.params);
                    if (window.history && window.history.pushState) {
                        var domain = location.protocol + "//" + location.host;
                        $location.url(response.data.FullUrl.replace(new RegExp(response.data.Domain, 'i'), ''));
                    } else {
                        window.location.href = response.data.FullUrl;
                    }
                }
            });
        };
        var getUrlParameter = function (name, url) {
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", ["i"]),
                results = regex.exec(url);
            if (!results)
                return null;
            if (!results[2])
                return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        };
        return {
            getResponseType: getResponseType,
            getRangeArray: getRangeArray,
            updateUrlLocation: updateUrlLocation,
            getUrlParameter: getUrlParameter
        };
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Data Provider Service: Provides app controllers with API data functions                                                                                                                          //
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    dataProvider.$inject = ['$http'];
    function dataProvider($http) {
        var listProducts = function (moduleId, currentPage, pageSize, sortExpression, searchText, categoryList, minPrice, maxPrice, priceList) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Product/List', {
                params: { 'CurrentPage': currentPage, 'PageSize': pageSize, 'SortExpression': sortExpression, 'SearchText': searchText, 'CategoryList': categoryList, 'MinPrice': minPrice, 'MaxPrice': maxPrice, 'PriceList': priceList },
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var addProductReview = function (moduleId, productID, rate, comments, nickName) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Product/AddReview', { ProductID: productID, Rate: rate, Comments: comments, NickName: nickName }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var listProductReviews = function (moduleId, productID) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Product/Reviews', {
                params: { 'ProductID': productID },
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var listCategoryDirectChilds = function (moduleId, categoryID, showProdCount) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Category/ListCategoryDirectChilds', {
                params: { 'CategoryID': categoryID, 'ShowProdCount': showProdCount },
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var getRegions = function (moduleId, countryCode) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'General/Regions', {
                params: { 'CountryCode': countryCode },
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var getProduct = function (moduleId, productID, quantity, price, variants, booking) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Product/Get', { ProductID: productID, Quantity: quantity, Price: price, Variants: variants, Booking: booking }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var getProductBooking = function (moduleId, productID, start, end) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Product/Booking', { ProductID: productID, Start: start, End: end }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var addShoppingCart = function (moduleId, productID, productSKU, quantity, price, variants, variantsFiles, booking, inputs) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Cart/Add', { ProductID: productID, ProductSKU: productSKU, Quantity: quantity, Price: price, Variants: variants, Booking: booking, Inputs: inputs }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                uploadVariantsFiles(moduleId, 'Carts', response.data.AddedList, variantsFiles);
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var getShoppingCart = function (moduleId, shippingData) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Cart/Get', {
                params: shippingData,
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var updateShoppingCart = function (moduleId, updateList, inputs) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.put(servicesFramework.getServiceRoot('RazorCart') + 'Cart/Update', { UpdateList: updateList, Inputs: inputs }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var updateCartEmail = function (moduleId, email) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.put(servicesFramework.getServiceRoot('RazorCart') + 'Cart/Email', { Email: email }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var deleteShoppingCart = function (moduleId, cartID) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.delete(servicesFramework.getServiceRoot('RazorCart') + 'Cart/Delete', {
                data: [{ CartID: cartID }],
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var clearShoppingCart = function (moduleId) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.delete(servicesFramework.getServiceRoot('RazorCart') + 'Cart/Clear', {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var applyCouponCode = function (moduleId, couponCode) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Cart/Coupon', { CouponCode: couponCode }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var calculateShipping = function (moduleId, shippingData) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Cart/Shipping', {
                params: shippingData,
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var addWishlist = function (moduleId, productID, quantity, price, variants, variantsFiles, booking) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Wishlist/Add', { ProductID: productID, Quantity: quantity, Price: price, Variants: variants, Booking: booking }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                uploadVariantsFiles(moduleId, 'Wishlists', response.data.AddedList, variantsFiles);
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var saveWishlist = function (moduleId) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Wishlist/Save', {}, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var getWishlist = function (moduleId) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Wishlist/Get', {
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var restoreWishlist = function (moduleId, cartIDs) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Wishlist/Restore', cartIDs, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var deleteWishlist = function (moduleId, cartIDs) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.delete(servicesFramework.getServiceRoot('RazorCart') + 'Wishlist/Remove', {
                data: cartIDs,
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var editWishlist = function (moduleId, savedCart) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Wishlist/Edit', { SavedCart: savedCart }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var saveWallet = function (moduleId, billingData) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Wallet/Save', { BillingData: billingData }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var getWallet = function (moduleId) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Wallet/Get', {
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var deleteWallet = function (moduleId, itemID) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.delete(servicesFramework.getServiceRoot('RazorCart') + 'Wallet/Remove', {
                data: [{ ItemID: itemID }],
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var submitOrder = function (moduleId, shippingData, billingData, inputs) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Cart/Submit', { ShippingData: shippingData, BillingData: billingData, Inputs: inputs }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var download = function (moduleId, orderID, productID) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Product/Download', {
                params: { 'OrderID': orderID, 'ProductID': productID },
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var listProductGrid = function (moduleId, currentPage, pageSize, category, fields) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Product/Fields', { Category: category, Fields: fields }, {
                params: { 'CurrentPage': currentPage, 'PageSize': pageSize },
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var getUserOrder = function (moduleId, orderID) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Order/Get', {
                params: { 'OrderID': orderID },
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var payOrder = function (moduleId, orderID, billingData) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Order/Pay', { OrderID: orderID, BillingData: billingData }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var cancelOrderSubscription = function (moduleId, orderID, subscriptionID) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Order/Unsubscribe', { OrderID: orderID, SubscriptionID: subscriptionID }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var printtUserOrder = function (moduleId, orderID) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Order/Print', {
                params: { 'OrderID': orderID },
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var getCustomer = function (moduleId) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Customer/Get', {
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var saveCustomer = function (moduleId, shippingData, billingData) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Customer/Save', { ShippingData: shippingData, BillingData: billingData }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var uploadFiles = function (moduleId, dirNames, files) {
            var formData = new FormData();
            formData.append('DirectoryNames', dirNames);
            angular.forEach(files, function (file) { formData.append(file.name, file); });
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'File/Upload', formData, {
                headers: { 'Content-Type': undefined, 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var uploadVariantsFiles = function (moduleId, dirName, ids, variantsFiles) {
            //move to global Functions
            if (variantsFiles) {
                var dirNames = ids.reduce(function (newIds, id) {
                    return newIds.concat(id ? [dirName + '/' + id] : []);
                }, []).join(',');
                var files = Object.keys(variantsFiles || new Object()).reduce(function (varFiles, key) {
                    angular.forEach(variantsFiles[key], function (file) {
                        varFiles.push(file);
                    });
                    return varFiles;
                }, []);
                if (dirNames && files.length)
                    uploadFiles(moduleId, dirNames, files);
            }
        };
        var getTabUrl = function (moduleId, tabId, queryString) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.get(servicesFramework.getServiceRoot('RazorCart') + 'Url/Get', {
                params: { 'TabID': tabId, 'QueryString': queryString },
                headers: { 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var addProductCompare = function (moduleId, productID) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.post(servicesFramework.getServiceRoot('RazorCart') + 'Product/Compare', { ProductID: productID }, {
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        var deleteProductCompare = function (moduleId, productID) {
            var servicesFramework = $.ServicesFramework(moduleId);
            return $http.delete(servicesFramework.getServiceRoot('RazorCart') + 'Product/Compare', {
                data: { ProductID: productID },
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'ModuleId': servicesFramework.getModuleId(), 'TabId': servicesFramework.getTabId(), 'RequestVerificationToken': servicesFramework.getAntiForgeryValue() }
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                console.log(JSON.stringify(error));
                return error;
            });
        };
        return {
            listProducts: listProducts,
            addProductReview: addProductReview,
            listProductReviews: listProductReviews,
            listCategoryDirectChilds: listCategoryDirectChilds,
            getRegions: getRegions,
            getProduct: getProduct,
            getProductBooking: getProductBooking,
            addShoppingCart: addShoppingCart,
            getShoppingCart: getShoppingCart,
            updateShoppingCart: updateShoppingCart,
            updateCartEmail: updateCartEmail,
            deleteShoppingCart: deleteShoppingCart,
            clearShoppingCart: clearShoppingCart,
            applyCouponCode: applyCouponCode,
            calculateShipping: calculateShipping,
            addWishlist: addWishlist,
            saveWishlist: saveWishlist,
            getWishlist: getWishlist,
            restoreWishlist: restoreWishlist,
            deleteWishlist: deleteWishlist,
            editWishlist: editWishlist,
            saveWallet: saveWallet,
            getWallet: getWallet,
            deleteWallet: deleteWallet,
            submitOrder: submitOrder,
            download: download,
            listProductGrid: listProductGrid,
            getUserOrder: getUserOrder,
            payOrder: payOrder,
            cancelOrderSubscription: cancelOrderSubscription,
            printtUserOrder: printtUserOrder,
            getCustomer: getCustomer,
            saveCustomer: saveCustomer,
            uploadFiles: uploadFiles,
            uploadVariantsFiles: uploadVariantsFiles,
            getTabUrl: getTabUrl,
            addProductCompare: addProductCompare,
            deleteProductCompare: deleteProductCompare
        };
    }
    // End of RazorCart IIFE
}());