(function ($) {

    var PLUGIN_NS = 'kenshiinWu',

        iMissU = function (target, options) {
            this.$T = $(target);
            this.albumsData = [];
            this.photosData = [];
            this.options = $.extend(
                 true,
                 {
                     appId: null,
                     channelUrl: null,
                     facebookScriptUrl: 'http://connect.facebook.net/en_US/all.js',
                     showEmptyAlbum: true,
                     displayAlbumCover: true,
                     debug: false
                 },
                 options
             );
            this.timer = null;
            this.status = {
                logging: false
            };
            this.tpl = {
                wrap: '<div id="kenshiin-wrapper"></div>',
                container: '<div class="kenshiin-container"></div>',
                albumWrap: '<div class="kenshiin-albums-wrapper" ></div>',
                imageWrap: '<div class="kenshiin-images-wrapper" ></div>',
                imageSelection: '<div class="kenshiin-image-selection" ></div>',
                fbConnectBtn: '<a id="fbConnectBtn" href="#" >Click to connect to Facebook</a>',
                overLay: '<div class="overlay-wrapper"></div>',
                loading: '<div class="loading"></div>',
                msgBox: '<div class="msgBox"><span></span></div>'
            };
            this.overlay = null;
            this.albumsDataZip = {
                base64zip: null,
                imgList: [],
                imgDataResultList: [],
                counter: 0,
                getComplete: false,
                ready: false
            };
            this._init(target);

            return this;
        };

    iMissU.prototype = {

        _init: function (target) {

            //this.self = this;

            if (!this.options.appId) {
                if (this.options.debug) {
                    console.log('AppId is null');
                }
                return;
            }

            if ($('#fb-root').length === 0) {
                $('body').prepend('<div id="fb-root"></div>');
            }

            if (typeof FB === 'undefined') {
                $.getScript(this.options.facebookScriptUrl);
            }

            $(target[0]).append(this.tpl.wrap).prepend(this.tpl.container).append(this.tpl.fbConnectBtn);

            var self = this;
            $('#fbConnectBtn').click(function (e) {
                e.preventDefault();
                self._login();
            });

        },

        _login: function () {
            var self = this;
            this._loadingShow();

            if (!self.status.logging) {
                FB.init({
                    appId: this.options.appId, // fb App Id
                    //channelUrl: this.options.channelUrl, //WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
                    status: true, // check login status
                    cookie: true, // enable cookies to allow the server to access the session
                    xfbml: true // parse XFBML
                });

                FB.login(function (response) {
                    if (response.status === 'connected') {
                        self.status.logging = true;
                        if (!self.options.debug) {
                            $('#fbConnectBtn').hide();
                        }
                        self._msgShow('preparing albums data...', 0);
                        self.getAlbums();
                    } else {
                        //console.log('response', response);
                        self._loadingClose();
                        self._msgShow('un authorize', 1);
                    }
                }, { scope: 'user_photos' });

            } else {
                //reload
                self._msgShow('refresh albums data...', 0);
                $('.kenshiin-images-wrapper').remove();
                self.getAlbums();
            }

        },

        //type : 0 = success / 1 = error / 2 = warning / 3: normal blank
        _msgShow: function (message, type) {
            var msgBox = $(this.tpl.msgBox),
                className = '';

            switch (type) {
                case 0:
                    className = 'success';
                    break;
                case 1:
                    className = 'error';
                    break;
                case 2:
                    className = 'warning';
                    break;
                case 3:
                    className = '';
                    break;
            }

            msgBox[0].className = className;
            msgBox.children('span')[0].innerText = message;

            this.$T.before(msgBox);
            $(msgBox).fadeOut(5000, function () { $(this).remove(); });

        },

        _dialogMsg: function (message, title, embedDOM) {
            var popUp = document.getElementById('kenshiin-popUp');
            var popUpMsg = document.getElementById('kenshiin-popUp-message');
            if (!popUp) {
                popUp = document.createElement('div');
                popUp.id = 'kenshiin-popUp';
                popUpMsg = document.createElement('div');
                popUpMsg.id = 'kenshiin-popUp-message';
                popUp.appendChild(popUpMsg);
                document.body.appendChild(popUp);                
            }
            popUpMsg.innerText = message;
            if (embedDOM) {
                popUp.appendChild(embedDOM);
            }
            $("#kenshiin-popUp").dialog({
                modal: true,
                title: title,                
                width: '400px',
                minHeight: '150px',
                minWidth: '400px',
                maxWidth: '250px',
                maxHeight: '400px',
                buttons: {
                    Close: function () {
                        $(this).dialog("close");
                    }
                }
            });
        },

        _loadingShow: function () {
            if (!this.overlay) {
                this.overlay = $(this.tpl.overLay);                
            }
            this.overlay.append(this.tpl.loading);
            $('body').append(this.overlay);
            this.overlay.show();
        },

        _loadingClose: function () {
            if (this.overlay) {
                this.overlay.empty();
                this.overlay.hide();
            }
        },

        getArrayObjectByKey: function (array, key, value) {
            for (var i = 0; i < array.length; i++) {
                if (array[i][key] === value) {
                    return { data: array[i], index: i };
                }
            }
            return null;
        },

        getFileName: function (path) {
            return path.match(/[-_\w]+[.][\w]+$/i)[0];
        },

        //closure function ( Globar var : this.albumDataBase64.complete, this.albumDataBase64.imgDataResultList )
        getBase64Image: function (imgUrl, imgName, callback) {

            var self = this,
                tempCanvas = document.getElementById('tempCanvas'),
                blankCanvas = document.getElementById('blankCanvas');

            if (!tempCanvas) {
                tempCanvas = document.createElement('canvas');
                tempCanvas.id = 'tempCanvas';
                tempCanvas.style.display = 'none';
                document.body.appendChild(tempCanvas);
            }

            if (!blankCanvas) {
                blankCanvas = document.createElement('canvas');
                blankCanvas.id = 'blankCanvas';
                blankCanvas.style.display = 'none';
                document.body.appendChild(blankCanvas);
            }

            var ctx = tempCanvas.getContext('2d'),
                img = new Image,
                imgData = null;

            img.onload = function () {
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                blankCanvas.width = img.width;
                blankCanvas.height = img.height;
                ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

                var startTime = new Date().getTime();
                var myTimer = setInterval(function () {
                    if (tempCanvas.toDataURL("image/jpeg") === blankCanvas.toDataURL("image/jpeg")) {
                        //console.log('its blank, loading...');
                        var curTime = new Date().getTime();
                        if ((curTime - startTime) >= (1000 * 300)) {
                            console.log('time out 5min, ignore this image ' + imgName);
                            clearInterval(myTimer);
                            self.albumsDataZip.complete = true;
                        }
                    } else {
                        clearInterval(myTimer);
                        imgData = {
                            filename: imgName, //imgUrl.match(/[-_\w]+[.][\w]+$/i)[0],
                            data: tempCanvas.toDataURL("image/jpeg")
                        }
                        self.albumsDataZip.imgDataResultList.push(imgData);
                        self.albumsDataZip.getComplete = true;
                    }
                }, 60);

            };

            img.onerror = function () {
                console.log('file not found');
                self.albumsDataZip.complete = true;
            };

            img.crossOrigin = 'anonymous'; //to prevent exception during export large dataUrl from canvas on Node.js server
            img.src = imgUrl;

        },

        getAlbumsDataImgDataList: function () {

            var self = this,
                imgUrl = this.albumsDataZip.imgList[this.albumsDataZip.counter].url, 
                imgName = this.albumsDataZip.imgList[this.albumsDataZip.counter].filename;

            this.albumsDataZip.getComplete = false;
            this.getBase64Image(imgUrl, imgName, null);

            //using timer to detect is get complete
            var taskTimer = setInterval(function () {
                if (self.albumsDataZip.getComplete) {
                    clearInterval(taskTimer);
                    self.albumsDataZip.counter++;
                    if (self.albumsDataZip.counter < self.albumsDataZip.imgList.length) {
                        //self loop                       
                        self.getAlbumsDataImgDataList();
                    } else {
                        self.albumsDataZip.ready = true;
                        console.log('albumsDataZip is Ready to download');
                    }
                }
            }, 60);
        },

        generateAlbumsDataList: function () {
            //reset albumsDataZip
            this.albumsDataZip.imgDataResultList = [];
            this.albumsDataZip.counter = 0;
            this.albumsDataZip.getComplete = false;
            this.albumsDataZip.ready = false;

            if (this.albumsDataZip.imgList.length > 0) {
                this.getAlbumsDataImgDataList();
            }

        },

        generateAlbumZip: function (zipName) {
            var zip = new JSZip(),
                data_uri = document.getElementById('data_uri'),
                blobLink = document.getElementById('blob');

            for (var i = 0, l = this.albumsDataZip.imgDataResultList.length; i < l; i++) {
                var objImgData = this.albumsDataZip.imgDataResultList[i],
                    imgName = objImgData.filename,
                    imgData = objImgData.data.substr(objImgData.data.indexOf(',') + 1);

                zip.folder(zipName).file(imgName, imgData, { base64: true });
            }
            this.albumsDataZip.base64zip = zip.generate();            

            // data URI            
            if (!data_uri) {
                data_uri = document.createElement('a');
                data_uri.id = 'data_uri';
                data_uri.innerText = 'mirror 1';
            }
            data_uri.href = "data:application/zip;base64," + this.albumsDataZip.base64zip;

            // Blob            
            if (!blobLink) {
                blobLink = document.createElement('a');
                blobLink.id = 'blobLink';
                blobLink.innerText = 'mirror 2';
            }
            try {
                blobLink.download = zipName + '.zip';
                blobLink.href = window.URL.createObjectURL(zip.generate({ type: "blob" }));
            } catch (e) {
                blobLink.innerHTML += " (not supported on this browser)";
            }
           
            //dialog popup
            var uri_blob_DOM = document.createElement('div');
            uri_blob_DOM.className = 'kenshiin-popUp-download-mirror';
            uri_blob_DOM.innerHTML = '<p>If it does not start, click below link to download.</p>'
            uri_blob_DOM.appendChild(data_uri);
            uri_blob_DOM.appendChild(blobLink);
            this._dialogMsg('Your download will begin shortly', 'Zipping Complete', uri_blob_DOM);

            //auto download zip
            window.location.href = "data:application/zip;base64," + this.albumsDataZip.base64zip;            

        },

        downloadURL: function downloadURL(url) {
            var hiddenIFrameID = 'hiddenDownloader',
                iframe = document.getElementById(hiddenIFrameID);
            if (iframe === null) {
                iframe = document.createElement('iframe');
                iframe.id = hiddenIFrameID;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            iframe.src = url;
        },

        _downloadImage: function (url, filename) {

            var downloadLink = $('<a/>', {
                'href': url,
                'download': filename,
                src: url,
            }).appendTo('body');

            downloadLink[0].click();

            downloadLink.remove();
        },

        _downloadAlbum: function (aid) {

            var _self = this;

            function downloading() {
                var albumData = _self.getArrayObjectByKey(_self.photosData, 'aid', aid);
                if (albumData.data) {
                    for (var i = 0, l = albumData.data.photoData.length; i < l; i++) {
                        if (albumData.data.photoData[i].selected) {
                            var url = albumData.data.photoData[i].src_big,
                                filename = 'album.__' + aid + '__.photo.__' + _self.getFileName(url);
                            _self._downloadImage(url, filename);
                        }
                    }
                }
            }

            if ($('#kenshiin-albumStage-' + aid).data('albumLoaded') === undefined) {
                var isSelectAll = true; 
                self = this,
                startTime = new Date().getTime();

                this.getAlbumPhotos(aid, isSelectAll);

                this._runTimer(function () {
                    var dataLoaded = $('#kenshiin-albumStage-' + aid).data('albumLoaded'),
                        delta = new Date().getTime();
                    if (dataLoaded || (delta - startTime) > (60000)) { //max 1minute
                        self._destroyTimer();
                        if (dataLoaded) {
                            self._setAlbumDataSelectAll(aid, isSelectAll);
                            setTimeout(downloading, 1500);
                        };
                    }
                });
            } else {
                downloading();
            }

        },

        _downloadAllAlbum: function () {
            //get checked select all album
            console.log(this.albumsData);
            console.log(this.photosData);
            for (var i = 0, l = dataList.length; i < l; i++) {

            }
            //get photosData
            //compare 
            //set timer
            //loadAlbum if uncheck
            //end timer while all load
            //callback generating all photo
            //generate as a zip
            //download
        },

        _downloadSelectedAlbum: function () {

            var self = this,
                dataList = this.photosData;
            
            this.albumsDataZip.imgList = [];

            for (var i = 0, l = dataList.length; i < l; i++) {
                var data = dataList[i].photoData;
                for (var j = 0, jL = data.length; j < jL; j++) {
                    if (data[j].selected) {
                        var url = data[j].src_big,
                            filename = 'album.__' + data[j].aid + '__.photo.__' + this.getFileName(url);
                        this.albumsDataZip.imgList.push({ 'url': url, 'filename': filename });
                    }
                }
            }

            if (this.albumsDataZip.imgList.length === 0) {
                this._msgShow('Please select your photo or album to download.', 2);
                return;
            }

            this._loadingShow();
            this._msgShow('Your files are being zipped. When complete, your download will begin automatically.', 3);
            this.generateAlbumsDataList();

            //detect  this.albumsDataZip.ready === true
            //self.generateZip(albumsDataZip.imgDataResultList, 'kenshiin_fb_photos_export_' + new Date().getTime());
            this._runTimer(function () {
                if (self.albumsDataZip.ready) {
                    self._destroyTimer();
                    self._loadingClose();
                    self.generateAlbumZip('fb_photos_export_' + new Date().getTime());
                }
            });
        },

        _destroyTimer: function () {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },

        _runTimer: function (callback) {
            this.timer = setInterval(function () {
                callback();
            }, 60);
        },

        _recoverAlbumsCover: function (aid_arrayList) {

            var counter = 0,
                list = aid_arrayList,
                recoverAction = function () { //not using for loop to avoid delay response

                    var aid = list[counter];

                    FB.api({
                        method: 'fql.multiquery',
                        queries: {
                            //query by Last Modified Photo in the Album and Limit to return only one data row
                            query1: 'select aid, pid, src_small, src_small_height, src_small_width, src_big, src_big_height, src_big_width from photo where aid=' + aid + ' ORDER BY modified desc LIMIT 1'
                        }
                    },
                   function (response) {
                       if ($(response[0].fql_result_set).length > 0) {
                           $(response[0].fql_result_set).each(function (index, value) {
                               $('#kenshiin-albumListItem-coverImage-' + aid).attr({
                                   src: value.src_big,
                                   height: (value.src_big_width > value.src_big_height) ? 200 : 266
                               });
                           });

                       } else {
                           $('#kenshiin-albumListItem-coverImage-' + aid).attr({
                               src: 'images/NoPhotoAvail.jpg'
                           });
                       }

                       counter++;

                       //loop
                       if (counter < list.length) {
                           recoverAction();
                       }

                   });//end FB.api
                };

            //start recover
            if (aid_arrayList.length > 0) {
                recoverAction();
            }

        },

        _setAlbumStageSelectAll: function (aid, isSelectAll) {
            var albumStage = $('#kenshiin-albumStage-' + aid);
            if (albumStage.data('albumLoaded') === true) {
                if (isSelectAll) {
                    albumStage.find('.kenshiin-albumStage-photoListSelect').addClass('checked');
                    albumStage.find('.kenshiin-albumStage-photoList').addClass('checked');
                } else {
                    albumStage.find('.kenshiin-albumStage-photoListSelect').removeClass('checked');
                    albumStage.find('.kenshiin-albumStage-photoList').removeClass('checked');
                }
            }
        },

        _setAlbumListSelectAll: function (aid, isSelectAll, totalSelect, updateStage) {
            var coverImg = $('#kenshiin-albumListItem-coverImage-' + aid);
            if (isSelectAll) {
                coverImg.siblings('.kenshiin-albumListItem-coverSelect').addClass('checked');
                coverImg.closest('.kenshiin-albumListItem').addClass('checked');
                coverImg.parent().next().children().find('.kenshiin-photoTextSelectedPhotos').text(totalSelect + ' selected');
            } else {
                coverImg.siblings('.kenshiin-albumListItem-coverSelect').removeClass('checked');
                coverImg.closest('.kenshiin-albumListItem').removeClass('checked');
                coverImg.parent().next().children().find('.kenshiin-photoTextSelectedPhotos').text(totalSelect + ' selected');
            }

            if (updateStage === false) return;

            this._setAlbumStageSelectAll(aid, isSelectAll);
        },

        //updateStage = boolean, set as false to avoid clearing selections upon stage close click
        _updateTotalSelected: function (aid, updateStage) {
            var isSelectAll = true,
                total = 0,
                totalSelect = 0;

            for (var i = 0, l = this.photosData.length; i < l; i++) {
                if (this.photosData[i].aid === aid) {
                    total = this.photosData[i].photoData.length;
                    for (var j = 0; j < total; j++) {
                        if (this.photosData[i].photoData[j].selected === true) {
                            totalSelect += 1;
                        }
                    }
                }
            }

            if (total === 0 || total > totalSelect) { isSelectAll = false; }
            this._setAlbumListSelectAll(aid, isSelectAll, totalSelect, updateStage);

        },

        _updatePhotoDataSelected: function (aid, index, isSelected) {
            for (var i = 0, l = this.photosData.length; i < l; i++) {
                if (this.photosData[i].aid === aid) {
                    this.photosData[i].photoData[index].selected = isSelected;
                }
            }
        },

        _setAlbumDataSelectAll: function (aid, isSelectAll) {
            if (this.photosData.length > 0) {
                var albumData = this.getArrayObjectByKey(this.photosData, 'aid', aid);
                if (albumData) {
                    for (var i = 0, l = albumData.data.photoData.length; i < l; i++) {
                        albumData.data.photoData[i].selected = isSelectAll;
                    }
                    this._updateTotalSelected(aid, true);
                }
            }
        },

        _updateAlbumDataSelectAll: function (aid, isSelectAll) {

            if ($('#kenshiin-albumStage-' + aid).data('albumLoaded') === undefined) {
                this.getAlbumPhotos(aid, isSelectAll);
                var self = this,
                    startTime = new Date().getTime()

                this._runTimer(function () {
                    var dataLoaded = $('#kenshiin-albumStage-' + aid).data('albumLoaded'),
                        delta = new Date().getTime();
                    if (dataLoaded || (delta - startTime) > (60000)) { //max 1minute
                        self._destroyTimer();
                        if (dataLoaded) self._setAlbumDataSelectAll(aid, isSelectAll);
                    }

                });

            } else {
                this._setAlbumDataSelectAll(aid, isSelectAll);
            }

        },

        _getAlbumCoverFromData: function (albumId, coverObjectData) {

            for (var i = 0, len = coverObjectData.length; i < len; i++) {
                if (coverObjectData[i].aid === albumId) {
                    return coverObjectData[i];
                }
            }

            return null;

        },

        _onAlbumPhotoGot: function (data) {

            var self = this,

                albumStageWrap = $('<div/>', {
                    'class': 'kenshiin-albumStage-wrapper'
                }),

                skinStage = $('<div/>', {
                    'class': 'kenshiin-albumStage-skinStage'
                }).appendTo(albumStageWrap),

                outerStage = $('<div/>', {
                    'class': 'kenshiin-albumStage-outerStage'
                }).appendTo(skinStage),

                innerStage = $('<div/>', {
                    'class': 'kenshiin-albumStage-innerStage'
                }).appendTo(outerStage),

               photoContainer = $('<ul/>', {
                   'class': 'kenshiin-albumStage-photoContainer'
               }).appendTo(innerStage),

               btnCloseStage = $('<a/>', {
                   'id': 'kenshiin-albumStage-btnClose-' + data[0].aid,
                   'class': 'kenshiin-albumStage-btnClose',
                   click: function () {
                       var aid = $(this).attr('id').replace('kenshiin-albumStage-btnClose-', '');
                       self._updateTotalSelected(aid, false);
                       $('#kenshiin-albumStage-' + aid).fadeOut(1000);
                   }
               }).appendTo(skinStage);

            for (var i = 0; i < data.length; i++) {
                var photosData = data[i];
                //i == index
                if (photosData) {

                    var photoList = $('<li/>', {
                        'class': photosData.selected === true ? 'kenshiin-albumStage-photoList checked' : 'kenshiin-albumStage-photoList'
                    }),

                        photoListWrap = $('<div/>', {
                            'class': 'kenshiin-albumStage-photoListWrap'
                        }).appendTo(photoList),

                        photoListCoverWrap = $('<div/>', {
                            'class': 'kenshiin-albumStage-photoListCoverWrap',
                            'data-photo-stringify': JSON.stringify({ index: i, aid: photosData.aid }),
                            click: function (e) {
                                e.preventDefault();
                                $(this).children('.kenshiin-albumStage-photoListSelect').toggleClass('checked');
                                $(this).closest('.kenshiin-albumStage-photoList').toggleClass('checked');
                                var objCurrent = JSON.parse($(this).attr('data-photo-stringify'));
                                var selected = $(this).closest('.kenshiin-albumStage-photoList').hasClass('checked');
                                self._updatePhotoDataSelected(objCurrent.aid, objCurrent.index, selected);
                            }
                        }).appendTo(photoListWrap),

                        photoListSelect = $('<div/>', {
                            'class': photosData.selected === true ? 'kenshiin-albumStage-photoListSelect checked' : 'kenshiin-albumStage-photoListSelect'
                        }).appendTo(photoListCoverWrap),

                        photoImage = $('<img/>', {
                            'id': 'kenshiin-albumStage-photo-' + photosData.aid,
                            'class': 'kenshiin-albumStage-photo',
                            'style': 'left:-2px; top:0px;',
                            attr: {
                                src: photosData.src_small,
                                height: (photosData.width > photosData.height) ? 132 : 176,
                                alt: photosData.caption
                            }
                        }).appendTo(photoListCoverWrap),
                        
                        photoDetails = $('<div/>', {
                            'class': 'clearfix kenshiin-photoDetails',
                            'style': 'width:132px;'
                        }).appendTo(photoListWrap),

                        photoText = $('<div/>', {
                            'class': 'kenshiin-photoText',
                            'style': 'height:36px;'
                        }).appendTo(photoDetails),

                        fancyView = $('<a/>', {
                            'id': 'kenshiin-albumStage-photo-' + photosData.aid,
                            'class': 'kenshiin-photoTextTitle kenshiin-albumStage-photo-fancyViewIcon kenshiin-albumStage-photo-fancy-' + photosData.aid,
                            'href': photosData.src_big,
                            'title': photosData.caption,
                            'data-fancybox-group': 'gallery',
                        }).appendTo(photoText),

                        downloadClick = $('<a/>', {
                            'class': 'kenshiin-photoTextTitle kenshiin-albumStage-photo-downloadClickIcon',
                            'href': photosData.src_big,
                            'download': 'album.__' + photosData.aid + '__.photo.__' + self.getFileName(photosData.src_big),
                            src: photosData.src_big,
                        }).appendTo(photoText);

                    photoList.appendTo(photoContainer);
                }
            }

            $('#kenshiin-albumStage-' + data[0].aid).append(albumStageWrap).data('albumLoaded', true);

            //using fancybox plugin as photo viewer
            $('.kenshiin-albumStage-photo-fancy-' + photosData.aid).fancybox();
        },

        getAlbumPhotos: function (aid, selectAll) {

            var self = this;

            self._loadingShow();

            FB.api({
                method: 'fql.multiquery',
                queries: {
                    query1: 'SELECT aid, pid, caption, src_small, src_small_height, src_small_width, src_big, src_big_height, src_big_width FROM photo WHERE aid = ' + aid
                }
            },
               function (response) {
                   var parsed = new Array();

                   $(response[0].fql_result_set).each(function (index, value) {
                       var result = {
                           aid: value.aid,
                           pid: value.pid,
                           caption: value.caption,
                           src_small: value.src_small,
                           src_small_height: value.src_small_height,
                           src_small_width: value.src_small_width,
                           src_big: value.src_big,
                           src_big_height: value.src_big_height,
                           src_big_width: value.src_big_width,
                           selected: selectAll
                       };
                       parsed.push(result);

                   });

                   self.photosData.push({ 'aid': aid, 'photoData': parsed });
                   self._onAlbumPhotoGot(parsed);
                   self._loadingClose();
               });
        },

        _onAlbumsGot: function (data) {

            var self = this,
                NoCoverImageList = [],
                albumWrap = $(this.tpl.imageWrap),

                albumsActionWrap = $('<div/>', {
                    'class': 'clearfix kenshiin-albums-actions'
                }).appendTo(albumWrap),

                downloadSelectedAlbum = $('<a/>', {
                    'class': 'kenshiin-albums-actions-bulk-download',
                    text: 'Download Selected Albums',
                    click: function (e) {
                        e.preventDefault();
                        self._downloadSelectedAlbum();
                    }
                }).appendTo(albumsActionWrap),

                downloadAllAlbum = $('<a/>', {
                    'class': 'kenshiin-albums-actions-bulk-download',
                    text: 'Download All Albums',
                    click: function (e) {
                        e.preventDefault();
                        self._downloadAllAlbum();
                    }
                }).appendTo(albumsActionWrap),

                albumList = $('<ul/>', {
                    'class': 'kenshiin-albumList'
                }).appendTo(albumWrap);


            for (var i = 0; i < data.length; i++) {
                var albumData = data[i];
                if (albumData.count) {

                    if (albumData.cover === '') {
                        NoCoverImageList.push(albumData.aid);
                    }

                    var album = $('<li/>', {
                        'id': 'kenshiin-album-' + i,
                        'class': 'kenshiin-albumListItem'
                    }),

                        albumListItemWrap = $('<div/>', {
                            'class': 'kenshiin-albumListItem-Wrapper'
                        }).appendTo(album),

                        albumStage = $('<div/>', {
                            'id': 'kenshiin-albumStage-' + albumData.aid,
                            'class': 'kenshiin-albumStage overlay-wrapper',
                            'data-title': albumData.title
                        }).appendTo(album),

                        coverWrap = $('<div/>', {
                            'class': 'kenshiin-albumListItem-coverWrapper',
                            click: (albumData.count > 0) ?
                                function (e) {
                                    e.preventDefault();
                                    var d = $(this);
                                    $(this).children('.kenshiin-albumListItem-coverSelect').toggleClass('checked');
                                    $(this).closest('.kenshiin-albumListItem').toggleClass('checked');

                                    //check, update
                                    var coverImage = $(this).children('.kenshiin-albumListItem-coverImage'),
                                        aid = coverImage.attr('id').replace('kenshiin-albumListItem-coverImage-', ''),
                                        isSelectAll = $(this).closest('.kenshiin-albumListItem').hasClass('checked');

                                    self._updateAlbumDataSelectAll(aid, isSelectAll);
                                }
                                :
                                function () { }
                        }).appendTo(albumListItemWrap),

                        coverSelect = $('<div/>', {
                            'class': 'kenshiin-albumListItem-coverSelect'
                        }).appendTo(coverWrap),

                        coverImage = $('<img/>', {
                            'id': 'kenshiin-albumListItem-coverImage-' + albumData.aid,
                            'class': 'kenshiin-albumListItem-coverImage',
                            'style': 'left:-2px; top:0px;',
                            attr: {
                                src: albumData.cover,
                                height: (albumData.width > albumData.height) ? 200 : 266,
                                alt: albumData.title
                            }
                        }).appendTo(coverWrap),

                        photoDetails = $('<div/>', {
                            'class': 'clearfix kenshiin-photoDetails'
                        }).appendTo(albumListItemWrap),

                        photoText = $('<div/>', {
                            'class': 'kenshiin-photoText'
                        }).appendTo(photoDetails),

                        albumTitle = $('<a/>', {
                            'class': 'kenshiin-photoTextTitle',
                            'href': albumData.link,
                            'target': '_blank',
                            'title': 'visit on facebook page',
                            text: albumData.title
                        }).appendTo(photoText),

                        albumSubTitle = $('<div/>', {
                            'class': 'kenshiin-photoTextSubTitle',
                            text: albumData.count + ' photos'
                        }).appendTo(photoText),

                        selectedPhotos = $('<div/>', {
                            'class': 'kenshiin-photoTextSelectedPhotos'
                        }).appendTo(photoText),

                        albumAction = $('<div/>', {
                            'class': 'kenshiin-albumAction'
                        }).appendTo(albumSubTitle),

                        selectPhotos = $('<a/>', {
                            'id': 'kenshiin-albumActionSelectPhotos-' + albumData.aid,
                            'class': 'kenshiin-albumActionSelectPhotos',
                            text: 'select',
                            click: (albumData.count > 0) ?
                                function (e) {
                                    e.preventDefault();
                                    var aid = $(this).attr('id').replace('kenshiin-albumActionSelectPhotos-', ''),
                                        isSelectAll = $(this).closest('.kenshiin-albumListItem').hasClass('checked');

                                    if ($('#kenshiin-albumStage-' + aid).data('albumLoaded') === undefined) {
                                        //console.log('selectAll', selectAll);
                                        self.getAlbumPhotos(aid, isSelectAll);
                                    } //else {
                                    //    self._updateAlbumDataSelectAll(aid, isSelectAll);
                                    //}

                                    $('#kenshiin-albumStage-' + aid).fadeIn(1000);
                                }
                                :
                                function () { }
                        }).appendTo(albumAction),

                        downloadAlbum = $('<a/>', {
                            'id': 'kenshiin-albumActionDownload-' + albumData.aid,
                            'class': 'kenshiin-albumActionDownloadAlbum',
                            text: 'download',
                            click: (albumData.count > 0) ?
                                function (e) {
                                    e.preventDefault();
                                    alert('download');
                                    var aid = $(this).attr('id').replace('kenshiin-albumActionDownload-', '');
                                    self._downloadAlbum(aid);
                                }
                                :
                                function () { }
                        }).appendTo(albumAction);

                    album.appendTo(albumList);

                }
            }

            $('.kenshiin-container').append(albumWrap);

            if (NoCoverImageList.length > 0) {
                this._recoverAlbumsCover(NoCoverImageList);
            }

        },

        getAlbums: function () {
            var self = this;

            FB.api({
                method: 'fql.multiquery',
                queries: {
                    query1: 'select aid, name, link, photo_count, cover_object_id from album where owner = me()',
                    query2: 'SELECT aid, pid, src_small, src_small_height, src_small_width, src_big, src_big_height, src_big_width FROM photo WHERE object_id  IN (SELECT cover_object_id FROM #query1)'
                }
            },
                function (response) {
                    var parsed = new Array();

                    $(response[0].fql_result_set).each(function (index, value) {

                        var objCover = self._getAlbumCoverFromData(value.aid, response[1].fql_result_set),
                            coverSrc = objCover === null ? '' : objCover.src_big,
                            coverWidth = objCover === null ? 196 : objCover.src_big_width,
                            coverheight = objCover === null ? 196 : objCover.src_big_width,
                            result = {
                                aid: value.aid,
                                title: value.name,
                                cover: coverSrc,
                                width: coverWidth,
                                height: coverheight,
                                count: value.photo_count,
                                link: value.link
                            };

                        parsed.push(result);

                    });

                    self.albumsData = parsed;
                    self._onAlbumsGot(parsed);
                    self._loadingClose();
                });
        },

        DLOG: function () {
            if (!this.DEBUG) return;
            for (var i in arguments) {
                console.log(PLUGIN_NS + ': ', arguments[i]);
            }
        },

        DWARN: function () {
            this.DEBUG && console.warn(arguments);
        }

    }

    $.fn[PLUGIN_NS] = function (methodOrOptions) {
        if (!$(this).length) {
            return $(this);
        }
        var instance = $(this).data(PLUGIN_NS);

        // CASE: action method (public method on PLUGIN class)        
        if (instance
                && methodOrOptions.indexOf('_') != 0
                && instance[methodOrOptions]
                && typeof (instance[methodOrOptions]) == 'function') {

            return instance[methodOrOptions](Array.prototype.slice.call(arguments, 1));


            // CASE: argument is options object or empty = initialise            
        } else if (typeof methodOrOptions === 'object' || !methodOrOptions) {

            instance = new iMissU($(this), methodOrOptions);    // ok to overwrite if this is a re-init
            $(this).data(PLUGIN_NS, instance);
            return $(this);

            // CASE: method called before init
        } else if (!instance) {
            $.error('iMissU must be initialised before using method: ' + methodOrOptions);

            // CASE: invalid method
        } else if (methodOrOptions.indexOf('_') == 0) {
            $.error('Method ' + methodOrOptions + ' is private!');
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist.');
        }
    };



})(jQuery);
