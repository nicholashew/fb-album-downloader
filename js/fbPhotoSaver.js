function getFileNameFromPath(path) {
    var ary = path.split("/");
    return ary[ary.length - 1];
}

function clearFBColelctionContent() {
    $('#fb_pictures_collections_content_container').empty();
}

function appendFBColelctionContent(htmlMarkup) {
    $('#fb_pictures_collections_content_container').append(htmlMarkup);
}

function bulkDownload() {
    $('#imgInit a').each(function () {
        $(this).get(0).click();
    });
}

function toggleLoading() {
    var $loadingWrap = $('.loading-wrapper');
    if ($loadingWrap.css('display') === 'none') {
        $loadingWrap.css({ 'display': 'inline-block' });
    } else {
        $loadingWrap.hide();
    }
}

//type : 0 = success / 1 = error / 2 = warning
function setMessageText(message, type) {
    
    var msgBox = document.getElementById('msgBox'),
        lblMsg = msgBox.getElementsByTagName('span')[0];
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
    }
    msgBox.className = className;
    lblMsg.innerText = message;
}

$(document).ready(function () {

    var fbPhotoCollectionsHtmlMarkup,
		totalImg,
		ready = false,
        valid = false;

    $('#sample').click(function () {
        $('#contentSample').slideToggle();
    });

    $('#btnInitContent').click(function () {
        toggleLoading();        
        setMessageText('Loading', 0);
        fbPhotoCollectionsHtmlMarkup = $('#txt_fbPhotoCollectionsHtmlMarkup').val();
        if (fbPhotoCollectionsHtmlMarkup === '') {            
            setMessageText('Content must not be empty..', 1);            
            toggleLoading();
            return;
        }
        $('#txt_fbPhotoCollectionsHtmlMarkup').val('');
        clearFBColelctionContent();
        appendFBColelctionContent(fbPhotoCollectionsHtmlMarkup);
        ready = false;
        totalImg = $('.tagWrapper i').length;
        if (totalImg <= 0) {
            setMessageText('Error, did not found any valid fB photo collection contents...', 1);
            toggleLoading();
            return;
        }
        $('.tagWrapper i').each(function (index) {
            var imgUrl = $(this).css('background-image').replace('p206x206/', '').replace('url(', '').replace(')', ''),
				fileName = getFileNameFromPath(imgUrl);
            $('#imgInit').append('<a href="' + imgUrl + '" class="download" download="' + fileName + '">Download</a><br/>');
            if (index === totalImg - 1) {
                ready = true;
                valid = true;
                setMessageText('Ready for download', 0);
                toggleLoading();
            }
        });

    });

    $('#btnDownload').click(function () {        
        if (!valid) {
            setMessageText('Invalid content, unable to download.', 1);
            return;
        }
        if (!ready) {
            setMessageText('preparation for bulk download, please wait for awhile and try again...', 2);
            return;
        }
        var downloadMsg = '[ Manual Facebook Tagged Photot Start Downloading... ], please allow for attempting to download for multiple files on your browser, this action might need to click for few times until it finish download for large images.';
        setMessageText(downloadMsg, 0);

        bulkDownload();

    });
        
});

