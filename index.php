<?php
session_start();
if (!isset ($_SESSION['access_token'])) header ("Location: login");
else {
	
}
$userphoto = $_SESSION['user_picture'];
$username = $_SESSION['user_name'];
?>
<!DOCTYPE html>
<html lang="en">
<!--

	888    d8P  d8b 888      888               888            
	888   d8P   Y8P 888      888               888            
	888  d8P        888      888               888            
	888d88K     888 88888b.  88888b.  888  888 888888 .d88b.  
	8888888b    888 888 "88b 888 "88b 888  888 888   d8P  Y8b 
	888  Y88b   888 888  888 888  888 888  888 888   88888888 
	888   Y88b  888 888 d88P 888 d88P Y88b 888 Y88b. Y8b.     
	888    Y88b 888 88888P"  88888P"   "Y88888  "Y888 "Y8888  
	                                       888                
	                                  Y8b d88P                
	                                   "Y88P"                 

	kibbyte - index.php
	Copyright (C) 2015 Theodore Kluge - All Rights Reserved
	http://tkluge.net

-->
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1">
    <title>Kibbyte</title>
	<link async href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link async href='https://fonts.googleapis.com/css?family=Roboto:300' rel='stylesheet' type='text/css'>
	<link async rel="stylesheet" href="//cdn.jsdelivr.net/font-hack/2.013/css/hack.min.css">
	<link async rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.1/css/materialize.min.css">
	<link async rel="stylesheet" href="css/codemirror.css">
	<link async rel="stylesheet" href="css/kibbyte.css">
	<link rel="icon" type="image/ico" href="favicon.ico">
		
	<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
    <style id="injected"></style>
  </head>
<body>
<header>
	<section class="nav z-depth-1">
	    <a id="btn-burger" data-toggle="file-bar" class="btn btn-burger btn-flat waves-effect waves-circle waves-light"><i class="material-icons">menu</i></a>
	    <div class="title noselect"><a>Kibbyte</a></div>
	    <ul class="right quickmenu">		    
		    <a href="#" data-activates="account-bar" class="button-account-bar show-on-large"><li class="btn btn-flat btn-header-menu btn-header-menu-img waves-effect waves-circle waves-light"><img src="<?php echo $userphoto ?>" /></li></a>
	    </ul>
	    <ul class="actions editor-ribbon noselect z-depth-1">
		    <li class="btn-flat" id="menu_file">File</li>
		    <li class="btn-flat" id="menu_edit">Edit</li>
		    <li class="btn-flat" id="menu_view">View</li>
		    <li class="btn-flat" id="menu_insert">Insert</li>
		    <li class="btn-flat" id="menu_tools">Tools</li>
		    <li class="btn-flat" id="menu_help">Help</li>
	    </ul>
	</section>
</header>
<main>
	<nav class="nav-side nav-left nav-filemanager">
		<!-- <form>
		    <div class="input-field">
		       	<input id="search" type="search" placeholder="Search" required>
		      	<label for="search"><i class="material-icons">search</i></label>
		       	<i class="material-icons">close</i>
		    </div>
		</form> -->
	    <ul class="noselect" id="file-list" folder-id="root">
		    <!-- <li class="btn-flat file-btn" file-index="" file-id="reh"><a href="#"><i class="material-icons"><img src="img/spinner.svg" height="16px" width="16px"></i><span id="file-name">bar</span></a></li> -->
	    </ul>
  	</nav>
  	<ul id="account-bar" class="side-nav nav-right z-depth-2">
		<li class="btn btn-flat btn-account-menu btn-account-menu-img waves-effect waves-circle waves-light"><img src="<?php echo $userphoto ?>" /></li>
	    <a href="#"><li class="btn btn-flat btn-account-menu waves-effect waves-circle waves-light"><i class="material-icons">info_outline</i></li></a>
		<a href="#"><li class="btn btn-flat btn-account-menu waves-effect waves-circle waves-light"><i class="material-icons">settings</i></li></a>
		<a href="oauth.php?logout" title="logout"><li class="btn btn-flat btn-account-menu waves-effect waves-circle waves-light"><i class="material-icons">power_settings_new</i></li></a>
	</ul>
	<section class="content-main">
		<section class="editor-tabs noselect">
			<section class="editor-tabs-container">
				<!-- <div class="tab tab-active">CodeMirror.js<div class="btn-flat btn-close right waves-effect waves-circle waves-light"><i class="material-icons editor-tab-status" saved="false">save</i></div></div>-->
			</section>
			<div class="tab tab-action right"><a data-toggle="live-preview" class="btn-flat btn-close right waves-effect waves-circle waves-light"><i class="material-icons editor-tab-status">visibility</i></a></div>
			<div class="tab tab-action right" onclick="listTabs()"><a class="btn-flat btn-close right waves-effect waves-circle waves-light"><i class="material-icons editor-tab-status">menu</i></a></div>
		</section>
		<section class="editors">
			<textarea class="editor" id="editor-1"></textarea>
		</section>
		<section class="live-preview">
			<div class="live-preview-scroller">
				<div class="live-preview-paper z-depth-2">
					<blockquote>The <i>quick</i> <b>brown</b> <u>fox</u> jumps over the lazy dog.The <i>quick</i> <b>brown</b> <u>fox</u> jumps over the lazy dog.The <i>quick</i> <b>brown</b> <u>fox</u> jumps over the lazy dog.The <i>quick</i> <b>brown</b> <u>fox</u> jumps over the lazy dog.The <i>quick</i> <b>brown</b> <u>fox</u> jumps over the lazy dog.The <i>quick</i> <b>brown</b> <u>fox</u> jumps over the lazy dog.</blockquote>
				</div>
			</div>
			<div class="live-preview-warning z-depth-2">
				Some error, maybe
			</div>
		</section>
	</section>
</main>
<footer>
	<section class="info">
		<div class="position-info">
			<span class="line-number">
				Line <span id="value">1</span>,
			</span>
			<span class="column-number">
				Column <span id="value">1</span>
			</span>
			<span class="random-info">
				<span id="value"></span>
			</span>
			<span class="net-state">
				<span id="icon"><i class="material-icons">brightness_1</i></span>
				<span id="value">Connected</span>
			</span>
		</div>
		<div class="editor-info right">
			<span class="tab-size">
				Tab Size: <span id="value">4</span>
			</span>
			<span class="editor-language">
				<span id="value">Plain Text</span>
			</span>
		</div>
	</section>
</footer>
<script type="text/template" id="template_tab">
<div class="tab" id="<%= tabId %>"><span class="filename"><%= tabName %></span><div class="btn-flat btn-close right waves-effect waves-circle waves-light"><i class="material-icons editor-tab-status">clear</i></div></div>
</script>
<script type="text/template" id="contextmenu">
<section class="clickmenu z-depth-2"><ul></ul></section>
</script>
<script type="text/template" id="menuitem">
<li class="waves-effect waves-light" id="<%= id %>" onclick="<%= fn %>"><i class="material-icons"><%= icon %></i><span><%= content %></span></li>
</script>
<script type="text/template" id="template_file">
<li class="btn-flat file-btn folder-closed <%= disabled %>" file-index="" file-id="<%= id %>" type="<%= ext %>" mime="<%= mime %>" icon="<%= icon %>"><a href="#"><i class="material-icons"><%= icon %></i><span id="file-name"><%= name %></span></a></li>
</script>
<script type="text/template" id="template_folder">
<li class="filemanager-sub-box" folder-id="<%= id %>"><ul class="filemanager-sub" level="<%= level %>" folder-id="<%= id %>"></ul></li>
</script>
</body>

	<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
	<script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
	<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/themes/base/jquery-ui.css"/>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.1/js/materialize.min.js"></script>
	<script src="js/jquery.nicescroll.js"></script>
    <script src="js/underscore.min.js"></script>
    <!--<script src="js/backbone.min.js"></script>-->
    <script src="js/codemirror.js"></script>
    <!--<script src="js/minimap.js"></script>-->
    <script src="js/offline.min.js"></script>
    <script src="js/kibbyte.js"></script>
    <link rel="stylesheet" href="css/cm-themes/kibbyte-mint.css">
    <script src="js/cm-keymap/sublime.js"></script>
    <!-- load these in with js when needed -->
    <script src="js/cm-addon/dialog/dialog.js"></script>
    <link href="js/cm-addon/dialog/dialog.css" rel="stylesheet" />
    <script src="js/cm-addon/search/searchcursor.js"></script>
    <script src="js/cm-addon/search/search.js"></script>
    <script src="js/cm-addon/edit/closebrackets.js"></script>
    <script src="js/cm-addon/comment/comment.js"></script>
    <script src="js/cm-addon/fold/foldcode.js"></script>
    <script src="js/cm-addon/fold/foldgutter.js"></script>
    <link href="js/cm-addon/fold/foldgutter.css" rel="stylesheet" />
    <script src="js/cm-addon/fold/brace-fold.js"></script>
    <script src="js/cm-addon/fold/xml-fold.js"></script>
    <script src="js/cm-addon/fold/markdown-fold.js"></script>
    <script src="js/cm-addon/fold/comment-fold.js"></script>
    <script src="js/cm-mode/meta.js"></script>
    <!--<script src="js/cm-addon/selection/active-line.js"></script>-->
    <!--<script src="js/cm-addon/hint/show-hint.js"></script>
    <script src="js/cm-addon/hint/anyword-hint.js"></script>
    <link href="js/cm-addon/hint/show-hint.css" rel="stylesheet" />-->
    <!--<script src="js/cm-addon/merge/merge.js"></script>
    <link href="js/cm-addon/merge/merge.css" rel="stylesheet" />-->
    <!--<script src="js/cm-mode/xml/xml.js"></script>
    <script src="js/cm-mode/css/css.js"></script>
    <script src="js/cm-mode/htmlmixed/htmlmixed.js"></script>
    <script src="js/cm-mode/clike/clike.js"></script>-->
    <!--<script src="js/cm-mode/javascript/javascript.js"></script>-->
    <script>
    var res;
    $(document).ready(function() {
    	init.fileBar();
    	init.tabs();
    	init.editor();
	    /*$("html").niceScroll({ 
	    	scrollspeed: 80,
	    	mousescrollstep: 60,
	    	cursorborder: '0px',
	    	cursorcolor: "#1DE9B6"
	    });*/
	    $('.button-account-bar').sideNav({
	      menuWidth: 64,
	      edge: 'right',
	      closeOnClick: true
	    });
	    //var miniMapControl = new MiniMap();
	    //test.tabs();
	    //test.editors();
    });
    </script>
	
	<script>
	  /*(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	  ga('create', 'UA-48081162-1', 'villa7.github.io');
	  ga('send', 'pageview');*/

	</script>

</html>