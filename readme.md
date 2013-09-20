# Introduction
Unofficial Facebook Photo Downloader is a simple but useful node.js app that provides a way to download photos from their Facebook account, all at one go.

## Dependencies 
The node.js module depends on the following libraries. Please include the following in your HTML header along with the jQuery library (if you don't have it already).

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

### Installation
* To run in your local browser, follow the steps below:
Download and install node.js from http://nodejs.org/download/ <br/>
After completing node.js installation, open your console or terminal and enter the following commands: 
<ul>
<li>cd c://example/your/folder/path/here </li>
<li>node server.js </li>
</ul>
<pre>
Static file server running at 
  => http://localhost:8888/ 
CTRL + C to shutdown 
</pre>

Now you can open this URL in your browser: http://localhost:8888/

#### Known Issues
Currently the download album will crash for sometimes while download for large files, this will be the next target to fix.

### simpleDownload.html + fbPhotoSaver.js  
Another simple manual downloading photos from facebok <br/>
Open facebook any album, scroll to load all photos, copy album container HTML markup. <br/>
Patse it on textarea and click generate contents follow by bulk download. <br/>

It supports batch download Facebook photos tagged by your friends. How cool is that!

### Related Resources
TBD

Have fun! XD
