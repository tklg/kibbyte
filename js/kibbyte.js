/*

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

	kibbyte - kibbyte.js
	Copyright (C) 2015 Theodore Kluge - All Rights Reserved
	http://tkluge.net

*/

var fileBarIsOpen = true,
	livePreviewIsOpen = false;
var winWidth = $(document).width();
var res;
var netState = true;
var editor;
var active_tab = -1;
var editors_list = [];
var editor_amt = 0;
var tabs_list = [];
var tab_amt = 0;
var btnStatus = {
	m1: false,
	m2: false,
	m3: false,
	shift: false,
	ctrl: false,
	scrollingTabs: false
}
var menu;
var menuRibbonIsActive = false;
var tabSize = 4;
var useTabs = true;

marked.setOptions({
	gfm: true,
	breaks: true
});

$('a[data-toggle]').on('click', function() {
	if ($(this).attr('data-toggle') == 'file-bar') {
		fileBar.toggle();
	}
	if ($(this).attr('data-toggle') == 'live-preview') {
		preview.toggle();
	}
});
Offline.on('confirmed-down', function () {
    netState = false;
    $('.net-state #icon').addClass('offline');
    $('.net-state #value').text('Offline');
});
Offline.on('confirmed-up', function () {
    netState = true;
    $('.net-state #icon').removeClass('offline');
    $('.net-state #value').text('Connected');
});
$(window).resize(function() {
	clearTimeout(res);
	res = setTimeout(function() {
	    winWidth = $(window).width();
	    //editors.updateSize();
	}, 100);
});
var init = {
	fileBar: function() {
		$(".nav-filemanager").resizable({
			minWidth: 40,
			maxWidth: winWidth - 69,
			handles: "e",
			resize: function(event, ui) {
				fileBar.updateEditorWidthToMatch(ui.size.width)
			},
			start: function(event, ui) {
				fileBar.removeTransition();
			},
			stop: function(event, ui) {
				fileBar.restoreTransition();
			}
		});
		files.init();
	},
	tabs: function() {
		$('.editor-tabs-container').sortable({
			axis: "x",
			distance: 5,
			start: function(event, ui) {
				tabs.removeTransition(ui.item);
			},
			stop: function(event, ui) {
				tabs.restoreTransition(ui.item);
				//editors.reassignIds();
			}
		});
	},
	editor: function() {
		editors.init();
		$(".editors").resizable({
			minWidth: 40,
			maxWidth: winWidth - 240,
			handles: "e",
			resize: function(event, ui) {
				editors.updatePreviewWidthToMatch(ui.size.width)
			},
			start: function(event, ui) {
				editors.removeTransition();
			},
			stop: function(event, ui) {
				editors.restoreTransition();
			}
		});
	}
}
var fileBar = {
	width: 240,
	toggle: function() {
		if (fileBarIsOpen) {
			fileBar.close();
		} else {
			fileBar.open();
		}
		fileBarIsOpen = !fileBarIsOpen;
	},
	open: function() {
		$('.nav-filemanager').css({
			'left': 0
		});
		$('.content-main').css({
			'left': this.width + 'px',
			'width': 'calc(100% - '+this.width+'px)'
		});
		$('.editors').css({
			'left': 0,
			'width': (livePreviewIsOpen ? editors.width : winWidth - this.width)
		});
	},
	close: function() {
		$('.nav-filemanager').css({
			'left': '-'+this.width+'px'
		});
		$('.content-main').css({
			'left': 0,
			'width': winWidth
		});
		$('.editors').css({
			'left': 0,
			'width': (livePreviewIsOpen ? editors.width : winWidth)
		});
	},
	updateEditorWidthToMatch: function(width) {
		$('.content-main').css({
			'left': width,
			'width': 'calc(100% - ' + width + 'px)'
		});
		if (!livePreviewIsOpen) {
			$('.editors').css({
				'width': winWidth - width + "px"
			});
		} else {
			editors.updatePreviewWidthToMatch(editors.width);
			$('.editors').css({
				'width': winWidth - preview.width - width + "px"
			});
		}
		this.width = width;
	},
	removeTransition: function() {
		$('.nav-filemanager, .content-main').css({
			'-webkit-transition': 'none',
         	'transition': 'none'
		});
	},
	restoreTransition: function() {
		$('.nav-filemanager, .content-main').css({
			'-webkit-transition': 'all .2s ease-in-out',
          	'transition': 'all .2s ease-in-out'
		});
	}
}
//each Tab will have an Editor
//the CM editor will never be replaced and there will only ever be 1
//the content of the editor will just be switched out, unless that is laggy
function Tab(filename, id, fileId) {
	this.tabId = id;
	this.fileId = fileId;
	this.fileName = filename;
	this.saved = true;
	this.active = false;
	this.template = _.template($("#template_tab").html());
	this.setValue = function(value) {
		$('.editor-tabs-container #'+this.tabId+' .filename').text(value);
	}
	this.getValue = function() {
		this.value = $('.editor-tabs-container #'+this.tabId+' .filename').text();
		return this.value;
	}
	this.setActive = function() {
		for (i = 0; i < tabs_list.length; i++) {
			tabs_list[i].setInactive();
		}
		this.active = true;
		$('#'+this.tabId+'.tab').addClass('tab-active');
		active_tab = this.tabId;
		if (editors_list[this.tabId] != null) {
			editors_list[this.tabId].setActive();
		}
		$('.file-btn').removeClass('file-active');
		$('.file-btn[file-index='+this.tabId+']').addClass('file-active');
	}
	this.setInactive = function() {
		this.active = false;
		$('#'+this.tabId+'.tab').removeClass('tab-active');
		$('.file-btn[file-index='+this.tabId+']').removeClass('file-active');
	}
	this.create = function() {
		var fI = this.tabId;
		var fN = this.fileName;
		var tabInfo = {
			tabId: fI,
			tabName: fN
		};
		$('.editor-tabs-container').append(this.template(tabInfo));
		this.setValue(this.fileName);
		this.setActive();
	}
	this.destroy = function() {
		tabs_list = _.without(tabs_list, this);
		//tabs_list[this.tabId] = null;
		editors_list[this.tabId].destroy();
		$('.editor-tabs-container #'+this.tabId).remove();
		$('.file-btn[file-index='+this.tabId+']').removeClass('file-active loaded')
												 .attr('file-index', '');
        editors.reassignIds();
		//tabs_list[tabs_list.length - 1].setActive();
		delete this.tabId; //delete all
	}
	this.save = function() {
		editors_list[this.tabId].save();
		return this;
	}
	this.create();
}
var tabs = {
	removeTransition: function(jqobject) {
		jqobject.css({
			'-webkit-transition': 'none',
         	'transition': 'none'
		});
	},
	restoreTransition: function(jqobject) {
		jqobject.css({
			'-webkit-transition': 'all .2s ease-in-out',
          	'transition': 'all .2s ease-in-out'
		});
	}
}
function Editor(id, fileId) {
	this.editorId = id;
	this.fileId = fileId;
	this.fileName = tabs_list[id].getValue();
	this.value = '';
	this.scrollPos = {};
	this.language = '';
	this.languageName = '';
	this.setValue = function(value) {
		this.value = value;
		return this;
	}
	this.setLanguage = function(lang) {
		this.language = lang['mode'];
		this.languageName = lang['name'];
	}
	this.getValue = function() {
		return this.value;
	}
	this.setActive = function() {
		//clear editor and replace content with this.value
		editor.setValue(this.value);
		editor.scrollTo(this.scrollPos.left, this.scrollPos.top);
		editor.setOption("mode", this.language);
		console.log('set language to ' + this.language);
		if (this.languageName == 'Unknown') {
			var dot = this.fileName.lastIndexOf(".");
    		var ext = dot > -1 && this.fileName.substring(dot + 1, this.fileName.length);
    		$('.editor-language #value').html('.'+ext);
		} else {
			$('.editor-language #value').html(this.languageName);
		}
	}
	this.create = function() {
		tab_amt++;
		editor.scrollTo(0,0);
	}
	this.destroy = function() {
		editors_list = _.without(editors_list, this);
		//editors_list[this.editorId] = null;
		delete this.value; //delete everything else too

		//editors.reassignIds();
	}
	this.record = function() {
		this.setValue(editor.getValue());
		this.scrollPos = editor.getScrollInfo();
	}
	this.save = function() {
		$('#'+active_tab+'.tab .editor-tab-status').html('<img src="img/spinner.svg" height="16px" width="16px">');
		$.post('query.php',
		{
			set_file_contents: this.fileId,
			content: this.value
		},
		function(result) {
			console.log(result);
			tabs_list[active_tab].saved = true;
    		$('#'+active_tab+'.tab .editor-tab-status').text('clear');
		});
	}
	this.create();
	this.setActive();
}

var editors = {
	width: "50%",
	maxWidth: winWidth - 240,
	maxMaxWidth: winWidth,
	langsLoaded: [],
	/*updateSize: function() {
		this.maxWidth = winWidth - 240;
		if (!livePreviewIsOpen) $('.editors').css({'width': this.maxWidth});
	},*/
	showPreview: function() {
		$('a[data-toggle="live-preview"]').addClass('active');
		$('.live-preview').css({
			'left': this.width
		});
		$('.editors').css({
			'width': this.width
		});
	},
	hidePreview: function() {
		$('a[data-toggle="live-preview"]').removeClass('active');
		$('.live-preview').css({
			'left': "100%"
		});
		$('.editors').css({
			'width': (fileBarIsOpen ? this.maxWidth : this.maxMaxWidth)
		});
	},
	updatePreviewWidthToMatch: function(width) {
		$('.live-preview').css({
			'left': width,
			'width': 'calc(100% - ' + width + 'px)'
		});
		this.width = width;
		if (!fileBarIsOpen)
			preview.width = winWidth - width;
		else 
			preview.width = winWidth - fileBar.width - width;
	},
	removeTransition: function() {
		$('.editors, .live-preview').css({
			'-webkit-transition': 'none',
         	'transition': 'none'
		});
	},
	restoreTransition: function() {
		$('.editors, .live-preview').css({
			'-webkit-transition': 'all .2s ease-in-out',
          	'transition': 'all .2s ease-in-out'
		});
	},
	recordCurrentValue: function () {
		if (active_tab > -1) editors_list[active_tab].record();
	},
	close: function(id) {
		if (!tabs_list[id].saved) {
			console.warn("CONFIRM FILE NOT SAVED");
			alert("REPLACE ME");
			return false;
		} else {
			//$('li[file-id='+fileId+']').removeClass('loaded');
			tabs_list[id].destroy();
			return true;
		}
	},
	init: function() {
		 editor = CodeMirror.fromTextArea($('#editor-1')[0], {
			lineNumbers: true,
			lineWrapping: false,
			theme: 'kibbyte-mint',
			indentUnit: 4,
			indentWithTabs: useTabs,
			tabSize: tabSize,
			readOnly: false,
			keyMap: 'sublime',
		    foldGutter: true,
		    styleLineActive: true,
		    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		    extraKeys: {
    			"Ctrl-S": function(instance) {
    				editors.recordCurrentValue();
    				editors_list[active_tab].save();
    			}
    		}
		});
		CodeMirror.keyMap.sublime.Backspace = null;
		editor.on('focus', function() {
			//codemirrorActive = true;
		});
		editor.on('blur', function() {
			//codemirrorActive = false;
			//codemir.savecontent();
		});
		editor.on('change', function(instance, object) {
			//miniMapControl.mirrorContent();
			//instance.showHint({hint: CodeMirror.hint.anyword});
			if (editors_list[active_tab] != null) {
				if (editors_list[active_tab].language == 'markdown') {
					preview.update('markdown');
				}
				/*if (editors_list[active_tab].language == 'html') {
					preview.update('html');
				}*/
			}
		});
		editor.on('keydown', function(instance, e) {
			//editor.showHint(instance);
			switch (e.which) {
				case 16: //shift
				case 17: //ctrl
				case 18: //alt
				case 27: //esc
				case 20: //caps
				case 112:case 113:case 114:case 115:case 116:case 117:case 118:case 119:case 120:case 121:case 122:case 123: //f1 - f12
				case 37:case 38:case 39: case 40: //arrow keys
					//only do the thing below if the key is not one that does nothing
					break;
				default:
					tabs_list[active_tab].saved = false;
					$('#'+active_tab+'.tab .editor-tab-status').text('save');
					break;
			}
		});
		editor.on('cursorActivity', function(instance) {
			var object = instance.getCursor();
			$('.info .line-number #value').text(object.line + 1);
			$('.info .column-number #value').text(object.ch + 1);
		});

		$('.editor-language #value').html('Plain Text');
		$('.tab-size #value').html(tabSize);
	},
	setLanguage: function(language) {
		//maybe detect language from filename

		if (!_.contains(this.langsLoaded, language)) {
			if (language == 'htmlmixed') { //because html has so many dependencies
				$.getScript('js/cm-mode/xml/xml.js', function() {
					editors.langsLoaded.push('xml');
					$.getScript('js/cm-mode/css/css.js', function() {
						editors.langsLoaded.push('css');
						$.getScript('js/cm-mode/javascript/javascript.js', function() {
							editors.langsLoaded.push('javascript');
							$.getScript('js/cm-mode/' + language + '/' + language + '.js', function() {
								editors.langsLoaded.push(language);
								editor.setOption("mode", language);
								console.log('set language to ' + language);
							});
						});
					});
				});
			} else {
				console.log('js/cm-mode/' + language + '/' + language + '.js');
				$.getScript('js/cm-mode/' + language + '/' + language + '.js', function() {
					editors.langsLoaded.push(language);
					editor.setOption("mode", language);
					console.log('set language to ' + language);
				});
			}
		} else {
			editor.setOption("mode", language);
			console.log('set language to ' + language);
		}
		if (language.includes('markdown')/* || language.includes('html')*/) {
			preview.update(language.toLowerCase());
			if (!livePreviewIsOpen) {
				$('a[data-toggle="live-preview"]').click();
			}
		} else {
			if (livePreviewIsOpen) {
				$('a[data-toggle="live-preview"]').click();
			}
		}
	},
	setValue: function(data, mime) {
		editor.setValue(data);
		this.recordCurrentValue();
		editors_list[active_tab].setLanguage(CodeMirror.findModeByMIME(mime));
		this.setLanguage(editors_list[active_tab].language);
		if (editors_list[active_tab].languageName == 'Unknown') {
			var dot = editors_list[active_tab].fileName.lastIndexOf(".");
    		var ext = dot > -1 && editors_list[active_tab].fileName.substring(dot + 1, editors_list[active_tab].fileName.length);
    		$('.editor-language #value').html('.'+ext);
		} else {
			$('.editor-language #value').html(editors_list[active_tab].languageName);
		}
	},
	reassignIds: function() {

		if (tabs_list.length > 0) {
			for (i = 0; i < editors_list.length; i++) {
				$('#' + tabs_list[i].tabId + '.tab').attr('id', i);
				$('.file-btn[file-index='+tabs_list[i].tabId+']').attr('file-index', i);
				tabs_list[i].tabId = i;
				editors_list[i].editorId = i;
			}
		} else {

		}

		active_tab = (tabs_list.length > 0) ? tabs_list.length - 1 : -1;
		tab_amt = tabs_list.length;
		console.log('active tab: ' + active_tab);

	}
}
var preview = {
	width: (fileBarIsOpen) ? (winWidth - fileBar.width) / 2 : winWidth / 2,
	update: function(language) {
		if (language == 'markdown') {
			$('.live-preview-paper').html(marked(editor.getValue()));
		}/* else if (language == 'html') {
			$('.live-preview-paper').html(editor.getValue());
		}*/
	},
	toggle: function() {
		if (livePreviewIsOpen) {
			editors.hidePreview();
		} else {
			editors.showPreview();
		}
		livePreviewIsOpen = !livePreviewIsOpen;
	}
}
/*var Tree = function(id) {
	this.root = id;
	this.files = [id];
	this.last = this.files[this.files.length - 1];
}*/
var files = {
	init: function() {
		this.loadFolderJSON('root');
	},
	numFoldersLoaded: 0,
	/*trees: [],
	startTree: function(id) {
		this.trees.push(new Tree(id));
	},
	treeExists: function(id) {
		if (this.trees.length == 0) return false;
		for (i = 0; i < this.trees.length; i++) {
			if (this.trees[i].root == id) {
				return true;
			}
		}
		return false;
	},
	modifyTree: function(parent, idToAdd) {
		for (i = 0; i < this.trees.length; i++) {
			if (this.trees[i].last == parent) {
				this.trees.files.push(idToAdd);
				break;
			}
		}
	},
	getTreeDepth: function(id) {
		for (i = 0; i < this.trees.length; i++) {
			if (this.trees[i].last == id) return i;
		}
	},*/
	loadFolderJSON: function(id) {
		//var prevIcon = $('li[file-id='+id+'] i').text();
		$('li[file-id='+id+'] i').html('<img src="img/spinner.svg" height="16px" width="16px">');
		$.post('query.php',
		{
			get_folder_contents: id
		},
		function(result) {
			files.openFolder(id, result/*, prevIcon*/);
		});
	},
	openFolder: function(id, result, icon) {
		//var json = $.parseJSON(this.loadJSON(id));
		var json = JSON.parse(result);
		//var arr = [];
		var file_template = _.template($('#template_file').html());
		var folder_template = _.template($('#template_folder').html());
		var html = '';
		for (i = 0; i < json.length; i++) {
			var obj = {
				name: json[i].title,
				mime: json[i].mimeType,
				ext: json[i].fileExtension || json[i].mimeType.split('.')[2],
				id: json[i].id,
				icon: files.getIcon(json[i].mimeType),
				disabled: (!json[i].mimeType.includes('vnd.google-apps.folder') 
							&& json[i].mimeType.includes('google-apps')
							|| json[i].mimeType.includes('jpeg')
							|| json[i].mimeType.includes('png')
							|| json[i].mimeType.includes('gif')
							|| json[i].mimeType.includes('webm')
							|| json[i].mimeType.includes('swf')
							|| json[i].mimeType.includes('mp3')
							|| json[i].mimeType.includes('mp4')) //use regex eventually
							? 'disabled'
							: ''
			}
			html += file_template(obj);
			if (obj.mime == 'application/vnd.google-apps.folder') {
				obj.level = this.getLevelFromRoot(id) || 0;
				html += folder_template(obj);;
			}
		}
		this.numFoldersLoaded++;
		this.appendTo(id, html, json.length);
		//$('style#injected').append('.nav-filemanager .filemanager-sub[level="'+ this.numFoldersLoaded +'"] {text-indent:' + (this.numFoldersLoaded * 8) + 'px;}');
	},
	appendTo: function(id, content, elemCount) {
		$('li[file-id='+id+']').addClass('loaded');
		$('li[file-id='+id+'] i').text('folder_open');
		$('ul[folder-id='+id+']').append(content);
		var depth = $('ul[folder-id='+id+']').parents('ul').length;
    	$('ul[folder-id='+id+']').attr('level', depth);
		$('li[folder-id='+id+']').css({
			// 'height': elemCount * 24
			// 'height': 'auto'
			// 'display': 'block'
		});
	},
	expand: function(id) {
		//var elemCount = $('li[folder-id='+id+']').children('li').length;
		//console.log('restoring height of ' + elemCount);
		$('li[file-id='+id+'] i').text('folder_open');
		$('li[folder-id='+id+']').css({
			'height': 'auto'
		});
	},
	closeFolder: function(id) {
		var del = 0;
		$('li[folder-id='+id+']').css({
			'height': 0
			// 'display': 'none'
		}); 
		$('li[file-id='+id+'] i').text('folder');
		/*setTimeout(function() {
			$('ul[folder-id='+id+']').empty();
		}, del);*/
	},
	loadFile: function(id, elem) {
		var prevIcon = $('li[file-id='+id+'] i').text();
		$('li[file-id='+id+'] i').html('<img src="img/spinner.svg" height="16px" width="16px">');
		$.post('query.php',
		{
			get_file_contents: id
		},
		function(result) {
			$('li[file-id='+id+']').addClass('loaded');
			
			var ind = $(elem).attr('file-index');
			if (ind == '' || ind == null) ind = tabs_list.length;
			editors.recordCurrentValue();
			//console.log('set active to ' + ind);
			var name = $(elem).find('#file-name').text();
			var fileId = $(elem).attr('file-id');
			$(elem).attr('file-index', ind);
			console.log(name + " " + ind);

			tabs_list.push(new Tab(name, ind, fileId));
			editors_list.push(new Editor(ind, fileId));

			editors.setValue(result, $(elem).attr('mime'));
			$('li[file-id='+id+'] i').text(prevIcon);
			editors.reassignIds();
			$('.file-btn').removeClass('file-active');
			$(elem).addClass('file-active');
		});
	},
	getIcon: function(mime) {
		if (mime.includes('vnd.google-apps.folder')) {
			return 'folder';
		} else if (mime.includes('java') || mime.includes('html')) { //javascript, java
			return 'code';
		} else if (mime.includes('image')) {
			return 'image';
		} else if (mime.includes('css')) {
			return 'style';
		} else if (mime.includes('markdown')) {
			return 'vertical_align_bottom';
		} else if (mime.includes('document')) {
			return 'description';
		} else if (mime.includes('text')) {
			return 'format_align_left';
		} else if (mime.includes('pdf')) {
			return 'picture_as_pdf';
		} else if (mime.includes('audio')) {
			return 'audiotrack';
		} else if (mime.includes('spreadsheet')) {
			return 'view_module';
		} else if (mime.includes('No Files Found')) {
			return 'warning';	
		} else {
			return 'insert_drive_file';
		}
	},
	getLevelFromRoot: function(id) {
		return null;
	}
}
function Menu(x, y) {
	this.x = x;
	this.y = y;
	this.width = 200;
	this.itemsCount = 0;
	this.create = function() {
		if (menu != null) menu.destroy();
		var menuTemplate = _.template($('#contextmenu').html());
		$('body').append(menuTemplate());
		$('.clickmenu').css({
			'top': this.y,
			'left': this.x
		});
	}
	this.destroy = function() {
		$('.clickmenu').remove();
		menu = null;
	}
	this.append = function(item) {
		$('.clickmenu ul').append(item);
	}
	this.appendDivider = function() {
		$('.clickmenu ul').append('<li class=\"divider\"></li>');
	}
	this.create();
}
function MenuItem(parent, content, icon, fn) {
	this.itemTemplate = _.template($('#menuitem').html());
	this.get = function() {
		return this.itemTemplate({id: parent.itemsCount++, content: content, icon: icon, fn: fn});
	}
}
//click on tab to switch
$(document).on("click", ".editor-tabs-container .tab:not(.tab-active)", function(e) {
	if (!$(e.target).hasClass('btn-close')) {
		editors.recordCurrentValue();
		console.log('set active to ' + $(this).attr('id'));
		editors.reassignIds();
		tabs_list[$(this).attr('id')].setActive();
	}
});
//click on button to close
$(document).on("click", ".editor-tabs-container .tab .btn-close", function(e) {
	console.log('closing ' + $(this).parent().attr('id'));
	//tabs_list[$(this).attr('id')].destroy();
	if (editors.close($(this).parent().attr('id'))) {
		if (active_tab > -1) tabs_list[active_tab].setActive();
		else editor.setValue("");
	}
});
//middle click on tab to close
$(document).on("mouseup", ".editor-tabs-container .tab", function(e) {
	if (e.which == 2) {
		console.log('closing ' + $(this).attr('id'));
		//tabs_list[$(this).attr('id')].destroy();
		if (editors.close($(this).attr('id'))) {
			if (active_tab > -1) tabs_list[active_tab].setActive();
			else editor.setValue("");
		}
	}
});
//click on file menu to switch or open
$(document).on("click", ".nav-filemanager .file-btn:not([type='folder']):not(.disabled)", function(e) {
	if ($(this).hasClass('loaded')) {
		var ind = $(this).attr('file-index');
		editors.recordCurrentValue();
		tabs_list[ind].setActive();
	} else {
		files.loadFile($(this).attr('file-id'), this);
	}
});
$(document).on("click", ".file-btn.folder-closed[type='folder']", function(e) {
	if ($(this).hasClass('loaded')) {
		files.expand($(this).attr('file-id'));
	} else {
		console.info("loading folder: " + $(this).attr('file-id'));
		files.loadFolderJSON($(this).attr('file-id'));
	}
	$(this).addClass('folder-open').removeClass('folder-closed');
});
$(document).on("click", ".file-btn.folder-open[type='folder']", function(e) {
	console.info("closing folder: " + $(this).attr('file-id'));
	files.closeFolder($(this).attr('file-id'));
	$(this).removeClass('folder-open').addClass('folder-closed');
});
$(document).on("mousedown", ".editors", function(e) {
	switch (e.which) {
		case 1: 
			btnStatus.m1 = true;
			break;
		case 2:
			btnStatus.m3 = true;
			break;
		case 3:
			btnStatus.m2 = true;
			break;
		default:

	}
});
$(document).on("mouseup", ".editors", function(e) {
	switch (e.which) {
		case 1: 
			btnStatus.m1 = false;
			break;
		case 2:
			btnStatus.m3 = false;
			break;
		case 3:
			btnStatus.m2 = false;
			if (btnStatus.scrollingTabs) setTimeout(function() {btnStatus.scrollingTabs = false;}, 100);
			break;
		default:

	}
});
$(document).on("keydown", function(e) {
	if (e.which == 16) {
		btnStatus.shift = true;
	}
});
$(document).on("keyup", function(e) {
	if (e.which == 16) {
		btnStatus.shift = false;
	}
});
$(window).bind('mousewheel DOMMouseScroll', function(e){
    if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
        //scrollable tab switching
        if (btnStatus.m2) {
        	e.preventDefault();
        	btnStatus.scrollingTabs = true;
	        if (active_tab == 0) {
        		var newInd = tabs_list.length - 1;
	        } else {
	        	var newInd = active_tab - 1;
	        }
        	editors.recordCurrentValue();
			console.log('set active to ' + newInd);
			editors.reassignIds();
			tabs_list[newInd].setActive();
		}
    } else {
        if (btnStatus.m2) {
        	e.preventDefault();
        	btnStatus.scrollingTabs = true;
	        if (active_tab == tabs_list.length - 1) {
	        	var newInd = 0;
	        } else {
        		var newInd = active_tab + 1;
	        }
        	editors.recordCurrentValue();
			console.log('set active to ' + newInd);
			editors.reassignIds();
			tabs_list[newInd].setActive();
		}
    }
});
$(document).on("contextmenu", function(e) {
	if (!btnStatus.shift) {
		console.log($(e.target).attr('class'));
		//e.preventDefault();
		if (!btnStatus.scrollingTabs) {
			/*if ($(e.target).hasClass('cm-string') || $(e.target).hasClass('CodeMirror-scroll') || $(e.target).parents('.CodeMirror-lines').length) {
				//clicked on editor
				//e.preventDefault();
				menu = new Menu(e.pageX, e.pageY);
				menu.append(new MenuItem(menu, "Copy", "content_copy", "document.execCommand('copy')").get());
				menu.append(new MenuItem(menu, "Cut", "content_cut", "document.execCommand('cut')").get());
				menu.append(new MenuItem(menu, "Paste", "content_paste", "document.execCommand('paste')").get());
				menu.appendDivider();
				menu.append(new MenuItem(menu, "Select All", "add_circle_outline", "fn3").get());
			} else */
			if ($(e.target).attr('id') == 'file-list') {
				e.preventDefault();
				console.log('fileid: ' + 'root');
				menu = new Menu(e.pageX, e.pageY);
				menu.append(new MenuItem(menu, "New File", "insert_drive_file", "fn2").get());
				menu.append(new MenuItem(menu, "New Folder", "folder", "fn2").get());
			} else if ($(e.target).parents('.file-btn').length
					|| $(e.target).hasClass('file-btn')) {
				//clicked on file bar
				e.preventDefault();
				id = $(e.target).parents('.file-btn').attr('file-id') || $(e.target).attr('file-id');
				console.log('fileid: ' + id);
				menu = new Menu(e.pageX, e.pageY);
				if ($(e.target).parents('.file-btn').attr('type') == 'folder' || $(e.target).attr('type') == 'folder') {
					menu.append(new MenuItem(menu, "New File", "insert_drive_file", "fn2").get());
					menu.append(new MenuItem(menu, "New Folder", "folder", "fn2").get());
				}
				menu.append(new MenuItem(menu, "Rename", "autorenew", "fn3").get());
				menu.append(new MenuItem(menu, "Delete", "delete", "fn1").get());
				//menu.append(new MenuItem(menu, "Move", "content_cut", "fn2").get());
				menu.appendDivider();
				menu.append(new MenuItem(menu, "Share", "send", "fn3").get());
				menu.append(new MenuItem(menu, "Download", "file_download", "fn4").get());
			} else if ($(e.target).parents('.tab').length
					|| $(e.target).hasClass('tab')) {
				//clicked on tab
				e.preventDefault();
				id = $(e.target).parents('.tab').attr('id') || $(e.target).attr('id');
				console.log('fileid: ' + id);
				menu = new Menu(e.pageX, e.pageY);
				menu.append(new MenuItem(menu, "Close", "remove", "fn1").get());
				menu.append(new MenuItem(menu, "Close Other Tabs", "remove_circle_outline", "fn2").get());
				menu.appendDivider();
				menu.append(new MenuItem(menu, "New File", "insert_drive_file", "fn3").get());
				menu.append(new MenuItem(menu, "Open File", "create", "fn4").get());
			}
		} else {
			e.preventDefault();
		}
	}
});
$('.editor-ribbon li').on('mouseup', function(e) {
	if (e.which == 1) {
		menuRibbonIsActive = true;
		var id = $(this).attr('id').split("_")[1];
		ribbonMenu(this, id);
	}
});
$('.editor-ribbon li').on('mouseover', function(e) {
	if (menuRibbonIsActive) {
		var id = $(this).attr('id').split("_")[1];
		ribbonMenu(this, id);
	}
});
function ribbonMenu(elem, id) {
	menu = new Menu($(elem).offset().left, ($(elem).offset().top - $(window).scrollTop()) + parseInt($(elem).css('height')));
	switch(id) {
		case 'file':
			menu.append(new MenuItem(menu, "New File", "insert_drive_file", "fn2").get());
			menu.append(new MenuItem(menu, "Open File", "create", "fn4").get());
			menu.append(new MenuItem(menu, "Save", "save", "editors.recordCurrentValue();editors_list[active_tab].save();").get());
			menu.append(new MenuItem(menu, "Save As", "bla", "fn6").get());
			menu.append(new MenuItem(menu, "Save All", "bla", "fn5").get());
			menu.appendDivider();
			menu.append(new MenuItem(menu, "Rename", "autorenew", "fn5").get());
			//menu.append(new MenuItem(menu, "Move to Folder", "folder", "fn7").get());
			menu.append(new MenuItem(menu, "Move to Trash", "delete", "fn8").get());
			menu.appendDivider();
			menu.append(new MenuItem(menu, "Share", "share", "fn1").get());
			menu.append(new MenuItem(menu, "Download", "file_download", "fn4").get());
			break;
		case 'edit':
			menu.append(new MenuItem(menu, "Copy", "content_copy", "fn1").get());
			menu.append(new MenuItem(menu, "Cut", "content_cut", "fn2").get());
			menu.append(new MenuItem(menu, "Paste", "content_paste", "fn4").get());
			menu.appendDivider();
			menu.append(new MenuItem(menu, "Undo", "undo", "fn5").get());
			menu.append(new MenuItem(menu, "Redo", "redo", "fn6").get());
			break;
		case 'view':
			menu.append(new MenuItem(menu, "Side Bar", "menu", "fileBar.toggle()").get());
			menu.append(new MenuItem(menu, "Preview", "remove_red_eye", "preview.toggle()").get());
			menu.append(new MenuItem(menu, "Fullscreen", "fullscreen", "fn2").get());
			menu.appendDivider();
			menu.append(new MenuItem(menu, "Word Wrap", "wrap_text", "fn5").get());
			menu.append(new MenuItem(menu, "Syntax", "text_format", "fn6").get());
			menu.append(new MenuItem(menu, "Indentation", "format_indent_increase", "fn6").get());
			break;
		case 'insert':

			break;
		case 'tools':

			break;
		case 'help':
			menu.append(new MenuItem(menu, "Kibbyte Help", "help_outline", "fn2").get());
			menu.append(new MenuItem(menu, "Report a Problem", "error_outline", "fn1").get());
			menu.appendDivider();
			menu.append(new MenuItem(menu, "Keyboard Shortcuts", "keyboard", "fn4").get());
			break;
	}
}
function listTabs() {
	//loop through tabs_list and build menu
	menu = new Menu(e.pageX, e.pageY);
	menu.append(new MenuItem(menu, "Close", "remove", "fn1").get());
}
$(document).on('mousedown', function(e) {
	if (e.which != 3) {
		if (menu != null) {
			setTimeout(function() {
				menu.destroy();
				menuRibbonIsActive = false;
			},100)
		}
	}
});
var test = {
	tabs: function() {

		//load some test tabs (the first 3)

		tabs_list.push(new Tab("README.md", 0, 12131));
		editors_list.push(new Editor(0, 12131));

		tabs_list.push(new Tab("CodeMirror.js", 1, 234331));
		editors_list.push(new Editor(1, 234331));

		tabs_list.push(new Tab("kibbyte.js", 2, 1246451));
		editors_list.push(new Editor(2, 1246451));
	},
	editors: function() {
		editor.setValue("'https://www.google.com/design/spec/components/dialogs.html#dialogs-confirmation-dialogs'");
	}
}