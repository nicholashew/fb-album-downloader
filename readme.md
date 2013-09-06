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
Attach the kenshiin-root to your markup

	$(document).ready(function() {
		$('#kenshiin-root').kenshiinWu({
			appId: '98765432123' //fb app id
		});
	});

## The Markup
	<div id="kenshiin-root"></div>

### To Run it on local browser
Download and install Node.js from http://nodejs.org/download/
After Install, open command prompt <br/>
cd c://example/your/folder/path/here <br/>
node server.js <br/>
<pre>
Static file server running at <br/>
  => http://localhost:8888/ <br/>
CTRL + C to shutdown 
</pre>

now you can this run http://localhost:8888/ on your browsers


# simpleDownload.html + fbPhotoSaver.js  
Another simple manual downloading photos from facebok <br/>
Open facebook any album, scroll to load all photos, copy album container HTML markup. <br/>
Patse it on textarea and click generate contents follow by bulk download. <br/>


This created is just to bulk download photos tagged by freinds.
Have Fun XD
