/* COPYRIGHT (C) 2014 Hoegh Autoliners AS. All Rights Reserved. */
$(document)
	.ready(function() {

		$(".filterBox")
			.keypress(function(event) {
				code = (event.keyCode ? event.keyCode : event.which);
				if (code === 13) {
					$(this)
						.parent()
						.children()
						.find(".filterIcon")
						.trigger("click");
				}
			});

		$(document)
			.on('keydown', function(event) {
				if (((event.keyCode ? event.keyCode : event.which) === 37) && event.shiftKey) {
					$(".ui-button.previous")
						.trigger("click");
				}

				if (((event.keyCode ? event.keyCode : event.which) === 39) && event.shiftKey) {
					$(".ui-button.next")
						.trigger("click");
				}

				if (((event.keyCode ? event.keyCode : event.which) === 70) && event.shiftKey) {
					$(".ui-button.first")
						.trigger("click");
				}

				if (((event.keyCode ? event.keyCode : event.which) === 76) && event.shiftKey) {
					$(".ui-button.last")
						.trigger("click");
				}
			});
	});