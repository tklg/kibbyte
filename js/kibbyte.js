var fileBarIsOpen = true;
$('a[data-toggle="file-bar"]').on('click', function() {
	if (fileBarIsOpen) {
		fileBar.close();
	} else {
		fileBar.open();
	}
	fileBarIsOpen = !fileBarIsOpen;
});
var fileBar = {
	open: function() {
		$('.nav-filemanager').css({
			'left': 0
		});
		$('.content-main').css({
			'left': '240px',
			'width': 'calc(100% - 240px)'
		});
	},
	close: function() {
		$('.nav-filemanager').css({
			'left': '-240px'
		});
		$('.content-main').css({
			'left': 0,
			'width': '100%'
		});
	}
}
var cmEditor_list = [];
var cmEditors = {
	create: function() {

	},
	destroy: function() {
		
	}
}