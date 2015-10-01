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
function Tab(filename) {
	this.fileId = tab_amt;
	this.fileName = filename;
	this.saved = true;
	this.active = false;
	this.template = _.template($("#template_tab").html());
	this.setValue = function(value) {
		$('.editor-tabs-container #'+this.fileId+' .filename').text(value);
	}
	this.getValue = function() {
		this.value = $('.editor-tabs-container #'+this.fileId+' .filename').text();
		return this.value;
	}
	this.setActive = function() {
		for (i = 0; i < tabs_list.length; i++) {
			tabs_list[i].setInactive();
		}
		this.active = true;
		$('#'+this.fileId+'.tab').addClass('tab-active');
		active_tab = this.fileId;
		if (editors_list[this.fileId] != null) {
			editors_list[this.fileId].setActive();
		}
	}
	this.setInactive = function() {
		this.active = false;
		$('#'+this.fileId+'.tab').removeClass('tab-active');
	}
	this.create = function() {
		var fI = this.fileId;
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
		editors_list[this.fileId].destroy();
		$('.editor-tabs-container #'+this.fileId).remove();
		//tabs_list[tabs_list.length - 1].setActive();
		delete this.fileId; //delete all
	}
	this.save = function() {
		editors_list[this.fileId].save();
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
function Editor() {
	this.fileId = tab_amt;
	this.fileName = tabs_list[tab_amt].getValue();
	this.value = '';
	this.setValue = function(value) {
		this.value = value;
		return this;
	}
	this.setLoadedValue = function() {
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
		delete this.value; //delete everything else too
	}
	this.record = function() {
		editors_list[this.fileId].setValue(editor.getValue());
		return this;
	}
	this.save = function() {

		return this;
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
		editors_list[active_tab].record();
	},
	close: function(id) {

		tabs_list[id].save().destroy();
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
    			"Ctrl-S": function(instance) {/* codemir.savecontent(instance.getValue());*/ }
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
			// if (codemir.saved) {
			// 	codemir.saved = false;
			// 	$('.cm-save-status i').attr('class', 'fa fa-save');
			// }
		});
		/*editor.on('keyup', function(instance, event) {
			editor.showHint(instance);
		});*/
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
	}
}
var preview = {

}
$(document).on("click", ".tab:not(.btn-close)", function() {
	editors.recordCurrentValue();
	tabs_list[$(this).attr('id')].setActive();
});
var test = {
	tabs: function() {
		tabs_list.push(new Tab("README.md"));
		editors_list.push(new Editor());

		tabs_list.push(new Tab("CodeMirror.js"));
		editors_list.push(new Editor());

		tabs_list.push(new Tab("kibbyte.js"));
		editors_list.push(new Editor());
	},
	editors: function() {
		
	}
}