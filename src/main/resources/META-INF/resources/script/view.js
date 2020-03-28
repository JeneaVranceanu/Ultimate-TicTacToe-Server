var controllerOnConnect;
var controllerOnClose;
var gameBoardController;

$(document).ready(() => {

	/** Assign Event listeners */

	$('#enter').click(viewEnterToMain);

	$('#connect').click(viewConnect);

	$('#close').click(viewClose);

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

	$('#game-screen').hide();
	$('#main-screen').hide();
	$('#menu-button').hide();
	$('#close').hide();

});

/** Interfaces */

var viewEnterToMain = () => {

	var valid = true;
	if (!$('#name').val()) {
		$('#name').addClass("required");
		valid = false;
	}

	if (valid) {
		$('#name-label').text(`Player: ${$('#name').val()}`);
		$('#start-screen').hide();
		$('#main-screen').show();
	}
}

var viewStartGame = () => {
	if (gameBoardController != null && gameBoardController !== undefined) {
		gameBoardController.detach();
	}
	delete gameBoardController;
	gameBoardController = new GameBoardController(Math.floor(Math.random() * 100) % 2 == 0 ? Shape.O : Shape.X);
	
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
	if (!$('#room').val()) {
		$('#room').addClass("required");
		valid = false;
	}

	if (valid) {
		controllerOnConnect($('#room').val(), $('#name').val());
		$('#connect').hide();
		$('#close').show();
	}

	viewStartGame();
}

var viewClose = () => {
	controllerOnClose();
	$('#room').val('');
	$('#chat').val('');
	$('#connect').show();
	$('#close').hide();
}

var viewPrintToChat = (message) => {
	$('#chat').val(message);
}

/** Dependencies */

var setViewOnConnectListener = (funOnConnectClick) => {
	controllerOnConnect = funOnConnectClick;
}

var setViewOnCloseListener = (funOnCloseClick) => {
	controllerOnClose = funOnCloseClick;
}
