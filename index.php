<?php
session_start();
if (!isset ($_SESSION['access_token'])) header ("Location: login");
$userphoto = $_SESSION['user_picture'];
$username = $_SESSION['user_name'];
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="initial-scale=1, width=device-width, maximum-scale=1, minimum-scale=1">
    <title>Kibbyte</title>
	<link href="http://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
	<link href='https://fonts.googleapis.com/css?family=Roboto:300' rel='stylesheet' type='text/css'>
	<link rel="stylesheet" href="//cdn.jsdelivr.net/font-hack/2.013/css/hack.min.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.1/css/materialize.min.css">
	<link rel="stylesheet" href="css/codemirror.css">
	<link rel="stylesheet" href="css/kibbyte.css">
		
	<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
<body>
<header>
	<section class="nav z-depth-1">
	    <a id="btn-burger" class="btn btn-burger btn-flat waves-effect waves-circle waves-light"><i class="material-icons">menu</i></a>
	    <div class="title"><a>Kibbyte</a></div>
	    <ul class="actions">
		    <li class="btn-flat waves-effect waves-light">File</li>
		    <li class="btn-flat waves-effect waves-light">Edit</li>
		    <li class="btn-flat waves-effect waves-light">Insert</li>
		    <li class="btn-flat waves-effect waves-light">Format</li>
		    <li class="btn-flat waves-effect waves-light">Tools</li>
		    <li class="btn-flat waves-effect waves-light">Help</li>
	    </ul>
	    <ul class="right quickmenu">		    
		    <a href="#" data-activates="account-bar" class="button-account-bar show-on-large"><li class="btn btn-flat btn-header-menu btn-header-menu-img waves-effect waves-circle waves-light"><img src="<?php echo $userphoto ?>" /></li></a>
	    </ul>
	</section>
</header>
<main>
	<nav class="nav-side nav-left nav-filemanager">
		<form>
	        <div class="input-field">
	          	<input id="search" type="search" placeholder="Search" required>
	          	<label for="search"><i class="material-icons">search</i></label>
	          	<i class="material-icons">close</i>
	        </div>
	    </form>
	    <ul>
		    <li class="btn-flat waves-effect waves-light"><a href="#"><i class="material-icons">folder</i> First Sidebar Link</a></li>
		    <li class="btn-flat waves-effect waves-light"><a href="#"><i class="material-icons">folder</i> Second Sidebar Link</a></li>
	    </ul>
  	</nav>
  	<ul id="account-bar" class="side-nav nav-right">
		<li class="btn btn-flat btn-account-menu btn-account-menu-img waves-effect waves-circle waves-light"><img src="<?php echo $userphoto ?>" /></li>
	    <a href="#"><li class="btn btn-flat btn-account-menu waves-effect waves-circle waves-light"><i class="material-icons">info_outline</i></li></a>
		<a href="#"><li class="btn btn-flat btn-account-menu waves-effect waves-circle waves-light"><i class="material-icons">settings</i></li></a>
		<a href="oauth.php?revoke" title="logout"><li class="btn btn-flat btn-account-menu waves-effect waves-circle waves-light"><i class="material-icons">power_settings_new</i></li></a>
	</ul>
	<section class="content-main">
		<textarea class="editor" id="editor-1"></textarea>
	</section>
</main>
<footer class="z-depth-2">
	<div class="info">
		<div class="position-info">
			<span class="line-number">
				Line <span id="value">72</span>
			</span>,
			<span class="column-number">
				Column <span id="value">33</span>
			</span>
			<span class="random-info">
				<span id="value"></span>
			</span>
		</div>
		<div class="editor-info right">
			<span class="tab-size">
				Tab Size: <span id="value">4</span>
			</span>
			<span class="editor-language">
				<span id="value">Javascript</span>
			</span>
		</div>
	</div>
</footer>
</body>
</script>

<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.1/js/materialize.min.js"></script>
	<script src="js/jquery.nicescroll.js"></script>
    <script src="js/underscore.min.js"></script>
    <script src="js/backbone.min.js"></script>
    <script src="js/codemirror.js"></script>
    <link rel="stylesheet" href="css/cm-themes/cm-kibbyte.css">
    <script type="text/javascript" src="js/codemirror.js"></script>
    <script src="js/cm-keymap/sublime.js"></script>
    <script type="text/javascript" src="js/cm-addon/dialog/dialog.js"></script>
    <link href="js/cm-addon/dialog/dialog.css" rel="stylesheet" />
    <script type="text/javascript" src="js/cm-addon/search/searchcursor.js"></script>
    <script type="text/javascript" src="js/cm-addon/search/search.js"></script>
    <script type="text/javascript" src="js/cm-addon/edit/closebrackets.js"></script>
    <script type="text/javascript" src="js/cm-addon/comment/comment.js"></script>
    <script type="text/javascript" src="js/cm-addon/fold/foldcode.js"></script>
    <script type="text/javascript" src="js/cm-addon/fold/foldgutter.js"></script>
    <script src="js/cm-addon/fold/brace-fold.js"></script>
    <script src="js/cm-addon/fold/xml-fold.js"></script>
    <script src="js/cm-addon/fold/markdown-fold.js"></script>
    <script src="js/cm-addon/fold/comment-fold.js"></script>
    <link href="js/cm-addon/fold/foldgutter.css" rel="stylesheet" />
    <!--<script src="js/cm-mode/xml/xml.js"></script>
    <script src="js/cm-mode/css/css.js"></script>
    <script src="js/cm-mode/htmlmixed/htmlmixed.js"></script>
    <script src="js/cm-mode/clike/clike.js"></script>-->
    <script src="js/cm-mode/javascript/javascript.js"></script>
    <script>
    var editor;
    var res;
    $(document).ready(function() {
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
	    editor = CodeMirror.fromTextArea($('#editor-1')[0], {
			lineNumbers: true,
			lineWrapping: false,
			theme: 'kibbyte',
			indentWithTabs: true,
			readOnly: false,
			keyMap: 'sublime',
		    foldGutter: true,
		    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		    extraKeys: {
    			"Ctrl-S": function(instance) {/* codemir.savecontent(instance.getValue());*/ }
    		}
		});
		editor.on('focus', function() {
			//codemirrorActive = true;
		});
		editor.on('blur', function() {
			//codemirrorActive = false;
			//codemir.savecontent();
		});
		editor.on('change', function() {
			/*if (codemir.saved) {
				codemir.saved = false;
				$('.cm-save-status i').attr('class', 'fa fa-save');
			}*/
		});
		/*if (mode != null && mode != '') {
			//d.info("Loading mode: " + mode);
			$.getScript('js/cm-mode/'+mode+'/'+mode+'.js', function() {
				if (mime != null && mime != '') {
					//d.info("Setting mode to " + mime + '<br>js/cm-mode/'+mode+'/'+mode+'.js');
					editor.setOption("mode", mime);
				} else {
					//d.info("Setting mode to " + mode + '<br>js/cm-mode/'+mode+'/'+mode+'.js');
					editor.setOption("mode", mode);
				}
		   		//d.info("Initialized CodeMirror");
			});
		}*/
		editor.setOption("mode", "javascript");
		console.log("a");
		$.get("js/codemirror.js", function (data) {
            editor.setValue(data);
        }).fail(function(data) {
		    editor.setValue(data);
		  });
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