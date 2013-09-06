# fb_album_downloader
A simple download fb photo plugin.

## Includes 
Include the following in your head along with the jQuery Library (if you don't have it already).

`<link href="js/jquery-ui-1.10.3/themes/base/jquery.ui.all.css" rel="stylesheet" />`
`<link href="js/jquery.fancyBox/jquery.fancybox.css" rel="stylesheet" />`
`<link href="css/blademaster.kenshiin.wu.css" rel="stylesheet" />`

`<script src="js/jquery.framework/jquery-1.9.1.min.js" type="text/javascript"></script>`
`<script src="js/jquery-ui-1.10.3/ui/minified/jquery-ui.min.js" type="text/javascript"></script>`
`<script src="js/jquery.fancyBox/jquery.fancybox.js" type="text/javascript"></script>`
`<script src="js/Stuk-jszip-1b5ef3c/jszip.js"></script>`
`<script src="js/jquery.custom.fb.api.blademaster.kenshiin.wu.js" type="text/javascript"></script>`

## The Call
	$('#kenshiin-root').kenshiinWu({
<<<<<<< HEAD:readme.md
		appId: '9999999999' //Your FB APP ID
		//you can create a new app from 'https://developers.facebook.com/apps' 	
=======
		appId: '9999999999' //Your FB APP ID, you can create a new app from 'https://developers.facebook.com/apps' 	
>>>>>>> 0fc1ee24b83db7ef325e6a07856bf6dc37efa3dc:README
	});

## The Markup
	<div id="kenshiin-root"></div>

### To Run it on local browser
Download and install Node.js from 'http://nodejs.org/download/'
After Install, open command prompt
--> cd c://example/your/folder/path/here
--> node server.js
= = = = = = = = = = = = = = = = = = 
Static file server running at
  => http://localhost:8888/
CTRL + C to shutdown
= = = = = = = = = = = = = = = = = = 
now you can this run http://localhost:8888/ on your browsers


- - - - - - - - - - - - - - - - - - - - - - -
-  # simpleDownload.html + fbPhotoSaver.js  -
- - - - - - - - - - - - - - - - - - - - - - -
Another simple manual downloading photos from facebok
Open facebook any album, scroll to load all photos, copy album container HTML markup.
Patse it on textarea and click generate contents follow by bulk download.


This created is just to bulk download photos tagged by freinds.
Have Fun XD
