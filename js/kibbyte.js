var fileBarIsOpen = true,
	livePreviewIsOpen = false;
var winWidth = $(document).width();
var res;
var netState = true;
var editor;
var active_tab = 0;
var editors_list = [];
var editor_amt = 0;
var tabs_list = [];
var tab_amt = 0;
var btnStatus = {
	m1: false,
	m2: false,
	m3: false,
	shift: false
}

$('a[data-toggle]').on('click', function() {
	if ($(this).attr('data-toggle') == 'file-bar') {
		if (fileBarIsOpen) {
			fileBar.close();
		} else {
			fileBar.open();
		}
		fileBarIsOpen = !fileBarIsOpen;
	}
	if ($(this).attr('data-toggle') == 'live-preview') {
		if (livePreviewIsOpen) {
			editors.hidePreview();
		} else {
			editors.showPreview();
		}
		livePreviewIsOpen = !livePreviewIsOpen;
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
	    editors.updateSize();
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
		$('.file-btn[file-index='+this.tabId+']').removeClass('file-active')
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
	this.setValue = function(value) {
		this.value = value;
		return this;
	}
	this.setLoadedValue = function() {
		console.warn("LOAD FILE HERE");
		editors.setLanguage('javascript');
		$.get("js/codemirror.js", function (data) {
	        this.value = data;
	    }).fail(function(data) {
			this.value = data;
		});
	}
	this.getValue = function() {
		return this.value;
	}
	this.setActive = function() {
		//clear editor and replace content with this.value
		editor.setValue(this.value);
	}
	this.create = function() {
		tab_amt++;
	}
	this.destroy = function() {
		editors_list = _.without(editors_list, this);
		//editors_list[this.editorId] = null;
		delete this.value; //delete everything else too

		//editors.reassignIds();
	}
	this.record = function() {
		editors_list[this.editorId].setValue(editor.getValue());
	}
	this.save = function() {
		console.log(this.value);
	}
	this.create();
	this.setLoadedValue();
	this.setActive();
}

var editors = {
	width: "50%",
	maxWidth: winWidth - 240,
	maxMaxWidth: winWidth,
	updateSize: function() {
		this.maxWidth = winWidth - 240;
		if (!livePreviewIsOpen) $('.editors').css({'width': this.maxWidth});
	},
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
		} else {
			tabs_list[id].destroy();
		}
	},
	init: function() {
		 editor = CodeMirror.fromTextArea($('#editor-1')[0], {
			lineNumbers: true,
			lineWrapping: false,
			theme: 'kibbyte-mint',
			indentUnit: 4,
			indentWithTabs: true,
			tabSize: 4,
			readOnly: false,
			keyMap: 'sublime',
		    foldGutter: true,
		    styleLineActive: true,
		    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		    extraKeys: {
    			"Ctrl-S": function(instance) {
    				editors.recordCurrentValue();
    				editors_list[active_tab].save();
    				tabs_list[active_tab].saved = true;
    				$('#'+active_tab+'.tab .editor-tab-status').text('clear');
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
		});
		editor.on('keydown', function(instance, event) {
			//editor.showHint(instance);
			tabs_list[active_tab].saved = false;
			$('#'+active_tab+'.tab .editor-tab-status').text('save');
		});
		editor.on('cursorActivity', function(instance) {
			var object = instance.getCursor();
			$('.info .line-number #value').text(object.line + 1);
			$('.info .column-number #value').text(object.ch + 1);
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
	},
	setLanguage: function(language) {
		//maybe detect language from filename
		editor.setOption("mode", language);
	},
	setValue: function(data) {
		editor.setValue(data);
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

}
$(document).on("click", ".editor-tabs-container .tab:not(.tab-active)", function(e) {
	if (!$(e.target).hasClass('btn-close')) {
		editors.recordCurrentValue();
		console.log('set active to ' + $(this).attr('id'));
		editors.reassignIds();
		tabs_list[$(this).attr('id')].setActive();
	}
});
$(document).on("click", ".editor-tabs-container .tab .btn-close", function(e) {
	console.log('closing ' + $(this).parent().attr('id'));
	//tabs_list[$(this).attr('id')].destroy();
	editors.close($(this).parent().attr('id'));
	if (active_tab > -1) tabs_list[active_tab].setActive();
	else editor.setValue("");
});
$(document).on("click", ".nav-filemanager .file-btn", function(e) {
	var ind = $(this).attr('file-index');
	if (ind == '' || ind == null) ind = active_tab + 1;
	editors.recordCurrentValue();
	console.log('set active to ' + ind);
	if (tabs_list[ind] != null) {
		console.log(ind + ' is already open');
		tabs_list[ind].setActive();
	} else {
		var name = $(this).find('#file-name').text();
		var fileId = $(this).attr('file-id');
		$(this).attr('file-index', ind);
		console.log(name + " " + ind);

		tabs_list.push(new Tab(name, ind, fileId));
		editors_list.push(new Editor(ind, fileId));
	}
	editors.reassignIds();
	$('.file-btn').removeClass('file-active');
	$(this).addClass('file-active');
});
$(document).on("mousedown", ".editors", function(e) {
	if (e.which == 3) {
		btnStatus.m2 = true;
		console.log('m2'+btnStatus.m2);
	}
});
$(document).on("mouseup", ".editors", function(e) {
	if (e.which == 3) {
		btnStatus.m2 = false;
		console.log('m2'+btnStatus.m2);
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
        console.log("scrollup");
        //scrollable tab switching
        if (btnStatus.m2) {
        	e.preventDefault();
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
        console.log("scrolldown");
        if (btnStatus.m2) {
        	e.preventDefault();
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
	if (!btnStatus.shift) e.preventDefault();
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