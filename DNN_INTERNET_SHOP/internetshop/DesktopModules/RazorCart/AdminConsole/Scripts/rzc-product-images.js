var rzcDropzone = (function () {
    'use strict';
    Dropzone.autoDiscover = false;
    var options = {};
    var regExpList = {};
    var defaults = {
        dzWrapper: '',
        cropWrapper: '',
        namePrefix: 'image',
        imagesPath: '',
        thumbWidth: 140,
        thumbHeight: 140,
        cropThumbWidth: 185,
        cropThumbHeight: 185,
        maxImageWidth: 3200,
        maxImageHeight: 3200,
        productImages: [],
        actionUrl: '',
        acceptedFiles: 'png|jpg|jpe|jpeg|tif|tiff',
        maxFiles: 30,
        maxFileSize: 12,
        maxThumbFileSize: 6
    };
    var rzcDropzone = function (opts) {
        options = $.extend(defaults, opts);
        regExpList = {
            dzFileName: new RegExp('^' + options.namePrefix + '_(\\d+).(' + options.acceptedFiles + ')$', 'i')
        };
    };
    var stopProductImageCropping = function ($img) {
        $img.cropper('destroy');
    };
    var startProductImageCropping = function ($img, width, height) {
        $img.cropper({
            viewMode: 3,
            aspectRatio: 1,
            autoCropArea: 0,
            minCropBoxWidth: options.cropThumbWidth,
            minCropBoxHeight: options.cropThumbHeight,
            built: function () {
                var data = {
                    left: Math.max(0, (width - options.cropThumbWidth) / 2),
                    top: Math.max(0, (height - options.cropThumbHeight) / 2),
                    width: options.cropThumbWidth,
                    height: options.cropThumbHeight
                };
                $img.cropper('setCropBoxData', data);
            }
        });
    };
    var showProductImageCropPopup = function (imgObj, file) {
        var $cropWrapper = $(options.cropWrapper);
        var bodyContent = '';
        bodyContent += '<div style="max-width: ' + imgObj.width + 'px; max-height: ' + imgObj.height + 'px; margin: 0 auto;">';
        bodyContent += '<img style="max-width: 100%; visibility: hidden;" src="' + imgObj.src + '" />';
        bodyContent += '<input type="hidden" id="hdnCropThumbImageName" name="hdnCropThumbImageName" value="' + file.productImage.ThumbImage + '" />';
        bodyContent += '</div>';
        $cropWrapper.find('div.modal-body').html(bodyContent);
        var $img = $cropWrapper.find('img');
        $cropWrapper.on('shown.bs.modal', function () {
            startProductImageCropping($img, imgObj.width, imgObj.height);
            $cropWrapper.find('.dz-save-crop').on('click', function () {
                var imgCanvas = $img.cropper('getCroppedCanvas', { width: options.cropThumbWidth, height: options.cropThumbHeight });
                var imgBase64 = imgCanvas.toDataURL();
                $.ajax({
                    type: 'POST',
                    url: options.actionUrl.replace('MODE', 'CropProductThumbImage'),
                    data: {
                        hdnCropThumbImageName: file.productImage.ThumbImage,
                        hdnCroppedImageBase64: imgBase64
                    },
                    dataType: 'html',
                    success: function (data) {
                        var dzTarget = Dropzone.forElement(options.dzWrapper + ' .dropzone-left');
                        dzTarget.createThumbnailFromUrl(file, options.imagesPath + 'Thumbnails/' + file.productImage.ThumbImage + '?' + (new Date()).getTime());
                        $cropWrapper.modal('hide');
                    },
                    error: function (xhr, status, err) {
                        alert('Could not crop this image. Please try again.');
                    }
                });
            });
            $cropWrapper.find('.dz-cancel-crop').on('click', function () {
                stopProductImageCropping($img);
            });
        }).on('hidden.bs.modal', function () {
            stopProductImageCropping($img);
        }).modal('show');
    };
    var initProductImageCrop = function (file) {
        var imgObj = new Image();
        imgObj.onload = function () {
            showProductImageCropPopup(imgObj, file);
        };
        imgObj.onerror = function () {
            alert('Error Loading Image ' + file.productImage.LargeImage);
        };
        imgObj.src = options.imagesPath + 'Images/' + file.productImage.LargeImage + '?' + (new Date()).getTime();
    };
    var updateProductImage = function (file) {
        var productImageID = file.productImage ? file.productImage.ID : 0;
        var $previewElement = $(file.previewElement);
        var txtImageTitle = $previewElement.find(':input[id^=txtImageTitle_]')[0];
        var txtImageAlt = $previewElement.find(':input[id^=txtImageAlt_]')[0];
        $.ajax({
            type: 'POST',
            url: options.actionUrl.replace('MODE', 'UpdateProductImage'),
            data: {
                hdnUpdateProductImageID: productImageID,
                txtUpdateProductImageTitle: txtImageTitle.value,
                txtUpdateProductImageAlt: txtImageAlt.value
            },
            dataType: 'html',
            success: function (data) {
                file.dirtyFields = [];
                txtImageTitle.originalValue = txtImageTitle.value;
                txtImageAlt.originalValue = txtImageAlt.value;
                $previewElement.find('.dz-save')[0].setAttribute('disabled', 'disabled');
            },
            error: function (xhr, status, err) {
                alert('Could not update this image info. Please try again.');
            }
        });
    };
    var initProductImagesDropzone = function (myDropzone) {
        myDropzone.on('sending', function (file, xhr, formData) {
            var sortOrder = 0;
            var match = regExpList.dzFileName.exec(file.customFileName);
            if (match && match.length > 1) {
                sortOrder = parseInt(match[1]);
                sortOrder = !isNaN(sortOrder) && sortOrder > 0 ? sortOrder : 1;
            }
            formData.append('hdnSortOrder', sortOrder);
        });
        myDropzone.on('success', function (file, json) {
            if (json && json.uploadImages.length) {
                file.productImage = json.uploadImages[0];
            }
            myDropzone.createThumbnailFromUrl(file, options.imagesPath + 'Thumbnails/' + file.customFileName + '?' + (new Date()).getTime());
        });
        myDropzone.on('error', function (file, json) {
            myDropzone.removeFile(file);
            alert(json);
        });
        myDropzone.on("removedfile", function (file) {
            var productImageID = file.productImage ? file.productImage.ID : 0;
            $.ajax({
                type: 'POST',
                url: options.actionUrl.replace('MODE', 'dzDeleteProductImage'),
                data: {
                    hdnDeleteProductImageID: productImageID,
                    hdnDeleteThumbImageName: file.productImage ? file.productImage.ThumbImage : file.customFileName,
                    hdnDeleteLargeImageName: file.productImage ? file.productImage.LargeImage : file.customFileName,
                    hdnDeleteZoomImageName: file.productImage ? file.productImage.ZoomImage : file.customFileName
                },
                dataType: 'html'
            });
        });
        myDropzone.on('addedfile', function (file) {

            //#region Setup

            file.dirtyFields = [];
            var $previewElement = $(file.previewElement);

            //#endregion

            //#region Set index

            var nextIndex = 1;
            $(options.dzWrapper + ' input[id^=hdnThumbImageFileName_][id!=hdnThumbImageFileName_]').each(function (i, hidden) {
                var index = parseInt(hidden.id.substring(hidden.id.lastIndexOf('_') + 1));
                if (index >= nextIndex) {
                    nextIndex = index + 1;
                }
            });

            //#endregion

            //#region Set custom file name

            if (!file.customFileName) {
                var fileExt = file.name.substring(file.name.lastIndexOf('.'));
                var fileName = file.name.replace(fileExt, '');
                if (/tiff?/i.test(file.type)) {
                    fileExt = '.jpg';
                }
                fileName = options.namePrefix + '_' + nextIndex + fileExt;
                file.customFileName = fileName;
            }

            //#endregion

            //#region Bind input fields

            $previewElement.find(':input').each(function (i, input) {
                input.name = input.id = input.id + nextIndex;
                if (input.name.indexOf('hdnThumbImageFileName_') > -1) {
                    input.value = file.productImage ? file.productImage.ThumbImage : file.customFileName;
                } else if (input.name.indexOf('hdnLargeImageFileName_') > -1) {
                    input.value = file.productImage ? file.productImage.LargeImage : file.customFileName;
                } else if (input.name.indexOf('hdnZoomImageFileName_') > -1) {
                    input.value = file.productImage ? file.productImage.ZoomImage : file.customFileName;
                } else if (input.name.indexOf('txtImageTitle_') > -1) {
                    input.value = input.originalValue = file.productImage ? file.productImage.Title || '' : '';
                } else if (input.name.indexOf('txtImageAlt_') > -1) {
                    input.value = input.originalValue = file.productImage ? file.productImage.AltTag || '' : '';
                }
                if (typeof(input.originalValue) !== typeof(undefined)) {
                    $(input).on('input', function () {
                        var index = file.dirtyFields.indexOf(input.id);
                        if (input.value === input.originalValue) {
                            if (index > -1) file.dirtyFields.splice(index, 1);
                        } else if (index === -1) {
                            file.dirtyFields.push(input.id);
                        }
                        if (file.dirtyFields.length)
                            $previewElement.find('.dz-save')[0].removeAttribute('disabled');
                        else
                            $previewElement.find('.dz-save')[0].setAttribute('disabled', 'disabled');
                    });
                }
            });

            //#endregion

            //#region Bind action fields

            $previewElement.find('.dz-save').each(function (i, input) {
                $(input).on('click', function () {
                    if (!input.hasAttribute('disabled')) {
                        updateProductImage(file);
                    }
                });
            });
            $previewElement.find('.dz-crop').each(function (i, input) {
                $(input).on('click', function () {
                    initProductImageCrop(file);
                });
            });

            //#endregion
        });
    };
    var initProductImagesUpload = function () {
        var dzUploadMsg = '<div class="fa fa-lg fa-upload"></div>';
        if (!/Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent)) {
            dzUploadMsg += '<div><p>Drag & Drop Images Here or Click to Browse Images</p></div>';
        } else {
            dzUploadMsg += '<div><p>Click to Browse Images</p></div>';
        }
        var dzOptions = {
            url: options.actionUrl.replace('MODE', 'dzUploadProductImage'),
            uploadMultiple: false,
            addRemoveLinks: false,
            acceptedFiles: options.acceptedFiles.split('|').map(function (ext) { return 'image/' + ext; }).join(','),
            maxFiles: options.maxFiles,
            maxFilesize: options.maxFileSize,
            maxThumbnailFilesize: options.maxThumbFileSize,
            paramName: 'fuProductImageUpload',
            dictDefaultMessage: dzUploadMsg,
            thumbnailWidth: options.thumbWidth,
            thumbnailHeight: options.thumbHeight,
            previewsContainer: '.dz-sortable',
            previewTemplate: $('.dz-template').html(),
            renameFilename: function (file) {
                return file.customFileName;
            },
            accept: function (file, done) {
                var isTiff = /tiff?/i.test(file.type);
                if (isTiff && FileReader) {
                    var fr = new FileReader();
                    fr.onload = function (e) {
                        Tiff.initialize({
                            TOTAL_MEMORY: 100000000
                        });
                        var tiff = new Tiff({
                            buffer: e.target.result
                        });
                        var tiffCanvas = tiff.toCanvas();
                        if (tiffCanvas.width > options.maxImageWidth || tiffCanvas.height > options.maxImageHeight) {
                            done(file.name + ' with dimensions of (' + tiffCanvas.width + ' x ' + tiffCanvas.height + ') exceeds maximum image dimensions of (' + options.maxImageWidth + ' x ' + options.maxImageHeight + ')');
                        } else {
                            done();
                        }
                    };
                    fr.readAsArrayBuffer(file);
                } else {
                    var img = new Image();
                    img.onload = function () {
                        if (img.width > options.maxImageWidth || img.height > options.maxImageHeight) {
                            done(file.name + ' with dimensions of (' + img.width + ' x ' + img.height + ') exceeds maximum image dimensions of (' + options.maxImageWidth + ' x ' + options.maxImageHeight + ')');
                        } else {
                            done();
                        }
                    };
                    var _URL = window.URL || window.webkitURL;
                    img.src = _URL.createObjectURL(file);
                }
            }
        };
        var dzTarget = new Dropzone(options.dzWrapper + ' .dropzone-left', $.extend(dzOptions, {
            init: function () {
                initProductImagesDropzone(this);
            }
        }));
        $.each(options.productImages, function (key, image) {
            var mockFile = { name: image.ThumbImage, customFileName: image.ThumbImage, status: Dropzone.ADDED, accepted: true, productImage: image };
            dzTarget.emit("addedfile", mockFile);
            dzTarget.emit("processing", mockFile);
            dzTarget.emit("success", mockFile);
            dzTarget.emit("complete", mockFile);
            dzTarget.files.push(mockFile);
        });
        $('.dz-sortable').sortable({
            cancel: '.dz-sortable :input, .dz-sortable .dz-actions a',
            stop: function (event, ui) {
                var productImages = [];
                $(options.dzWrapper + ' :input[id^=hdnThumbImageFileName_]').each(function (i, input) {
                    var result = $.grep(dzTarget.files, function (e) { return e.customFileName === input.value; });
                    if (result && result.length) {
                        var file = result[0];
                        file.productImage.SortOrder = i;
                        productImages.push(file.productImage);
                    }
                });
                $.ajax({
                    type: 'POST',
                    url: options.actionUrl.replace('MODE', 'dzUpdateSortOrder'),
                    data: { 'ProductImages': JSON.stringify(productImages) },
                    dataType: 'html'
                });
            }
        });
    };
    rzcDropzone.prototype = {
        init: initProductImagesUpload,
        getImagesPath: function () { return options.imagesPath; },
        getProductImages: function () { return options.productImages; },
        getActionUrl: function () { return options.actionUrl; }
    };
    rzcDropzone.prototype.constructor = rzcDropzone;
    return rzcDropzone;
})();