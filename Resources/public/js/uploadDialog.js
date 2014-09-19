/**
 *  Автор: ryshkin@gmail.com
 *  Класс Диалог - загрузка изображения.
 *  @param {String} type - тип диалога. ['avatar' || 'photo']
 */

var uploadFileID_Counter = 0;

var uploadDialog = function (type) {
    var jcrop_api = null;
    var srcImage = null;
    var imageWidth = 0;
    var imageHeight = 0;
    var fileName = '';
    var waitMsg = new waitDialog();

    uploadFileID_Counter++;
    penat.Control.MsgDialog.call(this, {
        css: {
            width: '920px',
            height: '510px'
        },
        closeOnBackgroundClick: true
    });

    jQuery(this.dom).css({
        border: '#aedaeb solid 6px',
        'border-radius': '5px 5px 5px 5px',
        '-moz-border-radius': '5px'
    });
    var self = this;

    var imgArea = new penat.Control('div', {
        attr:{
            'class': 'transp'
        },
        css: {
            width: '700px',
            height: '500px',
            border: '#BCBABA solid 1px',
            float: 'left',
            display: 'inline-block',
            overflow: 'hidden'
        }
    });
    this.add(imgArea);
    var letNavArea = new penat.Control('div', {css: {width: '200px', marginLeft: '10px', height: '504px', display: 'inline-block', float: 'left'}});
    var letNavAreaTop = new penat.Control('div', {
        content: '<span class="dialogLabel">' + ((type == 'avatar')?'Upload Avatar':'Upload Photo') + '</span><br/><br/>',
        css: {height: ((type == 'photo')?'204px':'474px')}
    });
    letNavArea.add(letNavAreaTop);

    if (type == 'photo') {
        this.infoBox = new penat.Control.InfoBox({
            html: 'Hello world!',
            type: 'left',
            css: {
                zIndex: 99999
            }
        });
        var letNavAreaTags = new penat.Control('div', {
            content: '<span class="dialogLabel">Photo tags:&nbsp;&nbsp;</span>',
            css: {height: '140px'}
        });
        letNavArea.add(letNavAreaTags);
        var infoTags = new penat.Control('img',{attr: {
            src: picsureme.rootURL + 'images/info.png'
        }});
        letNavAreaTags.add(infoTags);
        jQuery(infoTags.dom).mouseenter(function () {
            self.infoBox.show({
                html: '<span style="color: green; padding-left: 5px;">"Add tags to help us suggest better matches for you.  Use commas to separate tags (eg beach, friends, florida)."  These will not be seen by anyone else.<span>',
                x: jQuery(infoTags.dom).outerWidth() + jQuery(infoTags.dom).offset().left,
                y: jQuery(infoTags.dom).offset().top - 10
            });

        });
        jQuery(infoTags.dom).mouseleave(function () {
            self.infoBox.hide();
        });

        var inputTags = new penat.Control('textarea', {
            attr:{
                'class': 'input'
            },
            css: {
                width: '195px',
                minWidth: '195px',
                maxWidth: '195px',

                height: '90px',
                minHeight: '90px',
                maxHeight: '90px',

                padding: '5px'
            }
        });
        letNavAreaTags.add(inputTags);

        var letNavAreaCaption = new penat.Control('div', {
            content: '<span class="dialogLabel">Caption:&nbsp;&nbsp;</span>',
            css: {height: '140px'}
        });
        letNavArea.add(letNavAreaCaption);
        var infoCaption = new penat.Control('img',{attr: {
            src: picsureme.rootURL + 'images/info.png'
        }});
        letNavAreaCaption.add(infoCaption);
        jQuery(infoCaption.dom).mouseenter(function () {
            self.infoBox.show({
                html: '<span style="color: green; padding-left: 5px;">"Add a description to your photos for others to see"<span>',
                x: jQuery(infoCaption.dom).outerWidth() + jQuery(infoCaption.dom).offset().left,
                y: jQuery(infoCaption.dom).offset().top - 10
            });

        });
        jQuery(infoCaption.dom).mouseleave(function () {
            self.infoBox.hide();
        });

        var inputCaption = new penat.Control('textarea', {
            attr:{
                'class': 'input'
            },
            css: {
                width: '195px',
                minWidth: '195px',
                maxWidth: '195px',

                height: '90px',
                minHeight: '90px',
                maxHeight: '90px',

                padding: '5px'
            }
        });
        letNavAreaCaption.add(inputCaption);



    }

    var letNavAreaBottom = new penat.Control('div', {css: {textAlign: 'right', height: '46px'}});
    letNavArea.add(letNavAreaBottom);
    this.add(letNavArea);

    var buttonSave = new penat.Control('a', {html: 'Save', attr: {'class': 'dialogButton'},
        events: {
            onclick: function () {
                infoBoxUploadRemote.hide();
                if ((fileName !== '') && (jcrop_api !== null) && (jcrop_api.tellSelect().h > 0) && (jcrop_api.tellSelect().w > 0)) {
                    if (type == 'photo') {
                        this.infoBox.hide();
                        if (jQuery(inputCaption.dom).val() == '') {
                            this.infoBox.show({
                                html: '<span style="color: red; padding-left: 5px;">Please write a short comment for your photo.<span>',
                                x: jQuery(inputCaption.dom).outerWidth() + jQuery(inputCaption.dom).offset().left,
                                y: jQuery(inputCaption.dom).offset().top - 10
                            });
                            return;
                        }
                        /*if (jQuery(inputCaption.dom).val().length < 10) {
                         this.infoBox.show({
                         html: '<span style="color: red; padding-left: 5px;">Please write at least 10 characters.<span>',
                         x: jQuery(inputCaption.dom).outerWidth() + jQuery(inputCaption.dom).offset().left,
                         y: jQuery(inputCaption.dom).offset().top - 10
                         });
                         return;
                         }
                         if (jQuery(inputCaption.dom).val().length > 255) {
                         this.infoBox.show({
                         html: '<span style="color: red; padding-left: 5px;">Please write shorter comment. Comment must be shorter than 255 character.<span>',
                         x: jQuery(inputCaption.dom).outerWidth() + jQuery(inputCaption.dom).offset().left,
                         y: jQuery(inputCaption.dom).offset().top - 10
                         });
                         return;
                         }*/

                    }
                    var selectRegion = jcrop_api.tellSelect();
                    //console.log(selectRegion);
                    waitMsg.show();
                    jQuery.post(
                        picsureme.rootPath + 'ajax/processImage/',
                        {
                            type: type,
                            fileName: fileName,
                            imageWidth:  imageWidth,
                            imageHeight: imageHeight,
                            x: selectRegion.x,
                            y: selectRegion.y,
                            width: selectRegion.w,
                            height: selectRegion.h,
                            caption: ((type == 'photo')?jQuery(inputCaption.dom).val():''),
                            tags: ((type == 'photo')?jQuery(inputTags.dom).val():'')
                        },
                        function (result) {
                            result = jQuery.parseJSON(result);
                            //console.log(result);
                            if (result.result == true) {
                                if (type == 'avatar') {
                                    jQuery('.userAvatar').attr({
                                        src: picsureme.rootURL + 'accounts/avatar/user/' + fileName
                                    });
                                }
                                if (type == 'photo') {
                                    jQuery(inputCaption.dom).val('');
                                    jQuery(inputTags.dom).val('');

                                    var scale = 975/628;
                                    var img = new penat.Control('img', {
                                        attr: {
                                            src:  picsureme.rootURL + 'accounts/profile/user/' + result.photo.photo,
                                            photo: result.photo,
                                            preview: null,
                                            alt: result.photo.caption,
                                            title: result.photo.caption,
                                            'class': 'viewPhoto'
                                        },
                                        css: {
                                            cursor: 'pointer',
                                            width: result.photo.options.w_view/scale + 'px',
                                            height: result.photo.options.h_view/scale + 'px',
                                            position: 'absolute',
                                            left: result.photo.options.x_view/scale + 'px',
                                            top: result.photo.options.y_view/scale + 'px'
                                        },
                                        events: {
                                            onclick: function () {
                                                if  (penat.editor == null) {
                                                    penat.editor = new photoEditor(this, scale);
                                                    jQuery('#profileCanvas')[0].control.add(penat.editor);
                                                }
                                            }
                                        }
                                    });
                                    if (photos.length == 0) {
                                        jQuery('#profileCanvas')[0].control.clear();
                                    }
                                    photos.push(result.photo);
                                    jQuery('#profileCanvas')[0].control.add(img);
                                    jQuery('#profileCanvas').trigger('click');
                                    jQuery('#profileCanvas').trigger('click');

                                    jQuery(img.dom).mouseover(function () {
                                        jQuery(this).css({
                                            'border': '1px solid #F1D430',
                                            'box-shadow': '2px 3px 5px rgba(241, 212, 48, 0.6)'
                                        });
                                    });
                                    jQuery(img.dom).mouseout(function () {
                                        jQuery(this).css({
                                            'border': '1px solid #dddadc',
                                            'box-shadow': '2px 3px 5px rgba(0, 0, 0, 0.44)'
                                        });
                                    });

                                    img.dom.onclick();
                                }

                            }
                            fileName = '';
                            //console.info(result);
                            waitMsg.hide();
                            jQuery('.penatControlInfoBox').hide();
                        }
                    );

                    imgArea.clear();
                    this.hide();


                }

            }.bind(this)
        }
    });
    letNavAreaBottom.add(buttonSave);

    var infoBoxUploadRemote = new penat.Control.InfoBox({
        html: 'Hello world!',
        type: 'right',
        css: {
            zIndex: 99999
        }
    });

    /*
    var buttonCancel = new penat.Control('a', {html: 'Cancel', attr: {'class': 'dialogButton'},
        css: {marginLeft: '5px'},
        events: {
            onclick: function () {
                infoBoxUploadRemote.hide();
                if (fileName !== '') {
                    jQuery.post(
                        picsureme.rootPath + 'ajax/removeServerImage/',
                        {
                            type: type,
                            fileName: fileName
                        },
                        function (result) {
                            result = jQuery.parseJSON(result);
                            //console.log(result);
                        }
                    );
                }
                if (type == 'photo') {
                    jQuery(inputCaption.dom).val('');
                    this.infoBox.hide();
                }
                fileName = '';
                imgArea.clear();
                this.hide();
            }.bind(this)
        }
    });
    letNavAreaBottom.add(buttonCancel);
    //*/


    var buttonUploadFile = new penat.Control('a', {
        html: 'Select local photo',
        attr: {'class': 'dialogButton'},
        css:{
            paddingLeft: '0px',
            paddingRight: '0px',
            display: 'block',
            height: '30px',
            width: '200px'/*,
             marginTop: '-50px'*/
        },
        events: {
            onclick: function () {
                /* console.log('select photo');
                 console.log(uploadFiles.dom.click);
                 jQuery(uploadFiles.dom).click();*/
            }
        }
    });
    letNavAreaTop.add(buttonUploadFile);


    var uploadFiles = new penat.Control('input', {
        css: {
            /*display: 'none',*/
            fontSize: '35px',
            //lineHeight: '35px',
            width: '200px',
            //height: '35px',
            overflow: 'hidden',
            opacity: '0',
            filter: 'alpha(opacity: 0)',
            cursor: 'pointer',
            marginTop: '-50px',
            position: 'absolute'
        },
        attr: {
            //multiple: true,
            type: "file",
            name: "files[]",
            accept: "image/*,image/jpeg,image/png,image/gif"
        }
    });
    letNavAreaTop.add(uploadFiles);

    jQuery(uploadFiles.dom).fileupload({
        url: picsureme.rootURL + 'js/fileUploader/server/php/index.php',
        maxFileSize: 5000000,
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        formData: {
            type: type
        },
        replaceFileInput: false,
        add: function (e, data) {
            //console.info('Add Upload');
            //console.log(data);
            if (data.files.length > 0) {
                var patern = /(\.|\/)(gif|jpe?g|png)$/i;
                if (patern.test(data.files[0].name)) {
                    data.submit();
                } else {
                    infoBoxUploadRemote.show({
                        html: '<span style="color: red; padding-left: 5px;">You can only upload photos: *.gif, *.jpg, *,png<span>',
                        x: jQuery(buttonUploadFile.dom).offset().left - 250 - 30,
                        y: jQuery(buttonUploadFile.dom).offset().top - 5
                    });
                }
            }
        },
        // Start Upload
        submit: function (e, data) {
            //console.info('Start Upload');
            imgArea.clear();
            infoBoxUploadRemote.hide();
            jQuery(imgArea.dom).removeClass('transp');
            jQuery(imgArea.dom).addClass('loadingState');
        },
        // Successful Upload
        done: function (e, data) {
            //console.info('Successful Upload');
            //console.log(data.result);
            if (fileName !== '') {
                jQuery.post(
                    picsureme.rootPath + 'ajax/removeServerImage/',
                    {
                        type: type,
                        fileName: fileName
                    },
                    function (result) {
                        result = jQuery.parseJSON(result);
                        //console.log(result);
                    }
                );
            }
            fileName = '';
            imgArea.clear();

            if ((typeof(data.result) !== 'undefined') && (typeof(data.result.files) !== 'undefined') && (data.result.files.length > 0)) {

                fileName = data.result.files[0].name;

                srcImage = new penat.Control('img', {
                    attr :{
                        border: 0,
                        alt: '',
                        src: picsureme.rootURL +'accounts/' + ((type == 'avatar')?'avatar':'profile') + '/src/' + fileName
                    },
                    events: {
                        onload: function () {
                            jQuery(imgArea.dom).removeClass('loadingState');
                            jQuery(imgArea.dom).addClass('transp');
                            imageWidth = jQuery(this).width();
                            imageHeight = jQuery(this).height();
                            //console.info('w: ' + imageWidth + ' h: ' + imageHeight);
                            if ((imageWidth > 700) && (imageHeight > 500)) {
                                if (imageWidth > imageHeight) {
                                    jQuery(this).width(700);
                                } else {
                                    jQuery(this).height(500);
                                }
                            } else {
                                if (imageWidth > 700) {
                                    jQuery(this).width(700);
                                }
                                if (imageHeight > 500) {
                                    jQuery(this).height(500);
                                }
                            }
                            imageWidth = jQuery(this).width();
                            imageHeight = jQuery(this).height();
                            //console.info('w: ' + imageWidth + ' h: ' + imageHeight);
                            jQuery(this).Jcrop({
                                aspectRatio: ((type == 'avatar')?1:0),
                                minSize: [100, 100],
                                //setSelect:   [ 0, 0, 100, 100]
                                setSelect:   [ 0, 0, imageWidth, imageHeight]
                            }, function () {
                                jcrop_api = this;
                                this.animateTo([(imageWidth - 100) / 2, (imageHeight - 100) / 2, ((imageWidth - 100) / 2) + 100, ((imageHeight - 100) / 2) + 100]);
                            });

                        }
                    }
                });
                imgArea.add(srcImage);
            }
        },
        // Fail Upload
        fail: function (e, data) {
            /* console.warn('Fail Upload');
             console.log(data);*/
            imgArea.clear();
            infoBoxUploadRemote.hide();
            infoBoxUploadRemote.show({
                html: '<span style="color: red; padding-left: 5px;">Error loading file. Try later or try another file.<span>',
                x: jQuery(buttonUploadFile.dom).offset().left - 250 - 30,
                y: jQuery(buttonUploadFile.dom).offset().top - 5
            });
            jQuery(imgArea.dom).addClass('transp');
        },
        // Progress Upload
        progress: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            //console.log('Done - ' + progress + '%');
        }

    });

    jQuery(uploadFiles.dom).mouseenter(function () {
        jQuery(buttonUploadFile.dom).css('backgroundColor', '#2E89F7');
    });
    jQuery(uploadFiles.dom).mouseleave(function () {
        jQuery(buttonUploadFile.dom).css('backgroundColor', '#246EC9');
    });



    function isImageUrl(url) {
        var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (pattern.test(url)) {
            //return true;
            return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
        }
        return false;
    }

    letNavAreaTop.add(new penat.Control('br'));
    var buttonUploadFromURL = new penat.Control('a', {html: 'Upload from URL', attr: {'class': 'dialogButton'}, css:{
        // marginTop: '50px',
        marginTop: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
        display: 'block',
        height: '30px',
        width: '200px'
    }, events: {
        onclick: function () {
            infoBoxUploadRemote.hide();
            var remoteURL = prompt('Enter the URL of an image from the web:', '');
            if ((remoteURL !== null) && (remoteURL !== '')) {
                if (isImageUrl(remoteURL)) {
                    if (fileName !== '') {
                        jQuery.post(
                            picsureme.rootPath + 'ajax/removeServerImage/',
                            {
                                type: type,
                                fileName: fileName
                            },
                            function (result) {
                                result = jQuery.parseJSON(result);

                            }
                        );
                    }
                    imgArea.clear();
                    infoBoxUploadRemote.hide();
                    jQuery(imgArea.dom).removeClass('transp');
                    jQuery(imgArea.dom).addClass('loadingState');
                    jQuery.post(
                        picsureme.rootPath + 'ajax/uploadRemotePhoto/',
                        {
                            remoteURL: remoteURL,
                            type: type
                        }, function (result) {
                            result = jQuery.parseJSON(result);
                            jQuery(imgArea.dom).removeClass('loadingState');
                            jQuery(imgArea.dom).addClass('transp');
                            if (result.result == true) {
                                fileName = result.fileName;
                                srcImage = new penat.Control('img', {
                                    attr :{
                                        border: 0,
                                        alt: '',
                                        src: picsureme.rootURL +'accounts/' + ((type == 'avatar')?'avatar':'profile') + '/src/' + fileName
                                    },
                                    events: {
                                        onload: function () {
                                            jQuery(imgArea.dom).removeClass('loadingState');
                                            jQuery(imgArea.dom).addClass('transp');
                                            imageWidth = jQuery(this).width();
                                            imageHeight = jQuery(this).height();
                                            //console.info('w: ' + imageWidth + ' h: ' + imageHeight);
                                            if ((imageWidth > 700) && (imageHeight > 500)) {
                                                if (imageWidth > imageHeight) {
                                                    jQuery(this).width(700);
                                                } else {
                                                    jQuery(this).height(500);
                                                }
                                            } else {
                                                if (imageWidth > 700) {
                                                    jQuery(this).width(700);
                                                }
                                                if (imageHeight > 500) {
                                                    jQuery(this).height(500);
                                                }
                                            }
                                            imageWidth = jQuery(this).width();
                                            imageHeight = jQuery(this).height();
                                            //console.info('w: ' + imageWidth + ' h: ' + imageHeight);
                                            jQuery(this).Jcrop({
                                                aspectRatio: ((type == 'avatar')?1:0),
                                                minSize: [100, 100],
                                                //setSelect:   [ 0, 0, 100, 100]
                                                setSelect:   [ 0, 0, imageWidth, imageHeight]
                                            }, function () {
                                                jcrop_api = this;
                                                this.animateTo([(imageWidth - 100) / 2, (imageHeight - 100) / 2, ((imageWidth - 100) / 2) + 100, ((imageHeight - 100) / 2) + 100]);
                                            });

                                        }
                                    }
                                });
                                imgArea.add(srcImage);
                            } else {
                                infoBoxUploadRemote.show({
                                    html: '<span style="color: red; padding-left: 5px;">No access to the remote photo. Try later or try another URL.<span>',
                                    x: jQuery(buttonUploadFromURL.dom).offset().left - 250 - 30,
                                    y: jQuery(buttonUploadFromURL.dom).offset().top - 5
                                });
                            }
                            //console.log(result);
                        });
                } else {
                    infoBoxUploadRemote.show({
                        html: '<span style="color: red; padding-left: 5px;">Invalid URL format to remote image. Please check the entered URL.<span>',
                        x: jQuery(buttonUploadFromURL.dom).offset().left - 250 - 30,
                        y: jQuery(buttonUploadFromURL.dom).offset().top - 5
                    });
                }
            }
        }
    } });
    letNavAreaTop.add(buttonUploadFromURL);



    var closeDialog = new penat.Control('div', {
        css: {
            position        : 'absolute',
            top             : '16px',
            left            : (jQuery(this.dom).width() - 13) + 'px',
            height          : '16px',
            width           : '13px',
            backgroundImage : 'url("' + picsureme.rootURL + 'images/new/closeDialog.png")',
            cursor          : 'pointer'
        },
        events: {
            onclick: function () {
                infoBoxUploadRemote.hide();
                if (fileName !== '') {
                    jQuery.post(
                        picsureme.rootPath + 'ajax/removeServerImage/',
                        {
                            type: type,
                            fileName: fileName
                        },
                        function (result) {
                            result = jQuery.parseJSON(result);
                            //console.log(result);
                        }
                    );
                }
                if (type == 'photo') {
                    jQuery(inputCaption.dom).val('');
                    jQuery(inputTags.dom).val('');
                    this.infoBox.hide();
                }
                fileName = '';
                imgArea.clear();
                this.hide();
            }.bind(this)
        }
    });
    this.add(closeDialog);

}
