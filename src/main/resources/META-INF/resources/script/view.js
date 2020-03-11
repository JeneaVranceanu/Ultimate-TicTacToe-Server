var controllerOnConnect;

$(document).ready(() => {

	/** Assign Event listeners */

	$('#connect').click(viewConnect);

	$('#connect').keypress((event) => {
		if (event.keyCode == 13 || event.which == 13) {
			viewConnect();
		}
	});

	$(document).keypress((event) => {
		if (event.keyCode == 13 || event.which == 13) {
			viewConnect();
		}
	});

	$('#name, #room').click(() => {
		$('#name, #room').removeClass("required");
	});

	$('#name, #room').keypress(() => {
		$('#name, #room').removeClass("required");
	});

	/** Validate room input */

	$('#room').on('input', () => {
		$('#room').val($('#room').val().replace(/(?![0-9])./, ''));
	});

	$('#menu-button').click(() => {
		viewStopGame();
	})


});

var viewStartGame = () => {
	$('#main-screen').hide();
	$('#game-screen').show();
	$('#menu-button').show();
}

var viewStopGame = () => {
	$('#main-screen').show();
	$('#game-screen').hide();
	$('#menu-button').hide();
}

var viewConnect = () => {
	var valid = true;
	if (!$('#name').val()) {
		$('#name').addClass("required");
		valid = false;
	}
	if (!$('#room').val()) {
		$('#room').addClass("required");
		valid = false;
	}

	if (valid) {
		controllerOnConnect($('#room').val(), $('#name').val());
	}
}

var scrollToBottom = () => {
	$('#chat').scrollTop($('#chat')[0].scrollHeight);
};

var setViewOnConnectListener = (funOnConnectClick) => {
	controllerOnConnect = funOnConnectClick;
}
