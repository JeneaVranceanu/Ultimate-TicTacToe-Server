var Shape;
(function (Shape) {
    Shape[Shape["X"] = 1] = "X";
    Shape[Shape["O"] = 2] = "O";
})(Shape || (Shape = {}));
/**
 * <p>GameBoardController class is responsible for drawing a game board,
 * drawing shapes on the game board, receiving and processing user events like
 * "mousedown". <br/>
 * <p>It holds the state of each game board cell and does not allow
 * to place a shape on the occupied cell. Board is disabled and does not receive any
 * user events while waiting for opponent's turn to be made.
 */
var GameBoardController = /** @class */ (function () {
    function GameBoardController(playerShape) {
        var _this = this;
        // false - cell is empty
        // true - cell is occupied
        // if (boardCellsStatus[1][1]) { cell is occupied. must not allow drawing here. } 
        this.boardCellsStatus = [[false, false, false],
            [false, false, false],
            [false, false, false]];
        this.audioSrcs = [
            // "../assets/audio/balloon_snap.mp3",
            // "../assets/audio/opponent_move_2.mp3",
            // "../assets/audio/opponent_move.mp3",
            "../assets/audio/player_move.mp3"
        ];
        this.markO = new Image();
        this.markX = new Image();
        this.pressEventHandler = function (e) {
            var mouseX = e.changedTouches ?
                e.changedTouches[0].pageX :
                e.pageX;
            var mouseY = e.changedTouches ?
                e.changedTouches[0].pageY :
                e.pageY;
            mouseX -= _this.canvas.offsetLeft;
            mouseY -= _this.canvas.offsetTop;
            _this.boardClicked(mouseX, mouseY);
        };
        this.playerShape = playerShape;
        this.markO.src = '../assets/o_mark_95.png';
        this.markX.src = '../assets/x_mark_95.png';
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.rowHeight = this.canvas.height / 3;
        this.columnWidth = this.canvas.width / 3;
    }
    GameBoardController.prototype.detach = function () {
        this.setUserEventsEnabled(false);
        delete this.canvas;
        delete this.context;
        delete this.markO;
        delete this.markX;
    };
    // @ts-ignore
    GameBoardController.prototype.drawPlayedShape = function (shape, xPosition, yPosition) {
        console.log("Plyaing " + (shape == Shape.X ? "X" : "O") + " on " + xPosition + "," + yPosition);
        var image = shape == Shape.X ? this.markX : this.markO;
        if (this.boardCellsStatus[yPosition - 1][xPosition - 1]) {
            return;
        }
        this.boardCellsStatus[yPosition - 1][xPosition - 1] = true;
        this.context.save();
        var y = this.rowHeight * (yPosition - 1)
            + Math.abs(this.rowHeight - image.height) / 2;
        var x = this.columnWidth * (xPosition - 1)
            + Math.abs(this.columnWidth - image.width) / 2;
        this.context.translate(x, y);
        this.context.drawImage(image, 0, 0, image.width, image.height);
        this.context.restore();
        // TODO: remove into separate file
        // new Audio(this.audioSrcs[Math.floor(Math.random() * 100) % this.audioSrcs.length]).play();
        new Audio(this.audioSrcs[0]).play();
    };
    GameBoardController.prototype.setUserEventsEnabled = function (enable) {
        if (enable) {
            this.canvas.addEventListener("mouseup", this.pressEventHandler);
        }
        else {
            this.canvas.removeEventListener("mouseup", this.pressEventHandler);
        }
    };
    GameBoardController.prototype.boardClicked = function (x, y) {
        var indexOfX = 1;
        var indexOfY = 1;
        if (x > this.columnWidth && x <= this.columnWidth * 2) {
            indexOfX = 2;
        }
        else if (x > this.columnWidth * 2) {
            indexOfX = 3;
        }
        if (y > this.rowHeight && y <= this.rowHeight * 2) {
            indexOfY = 2;
        }
        else if (y > this.rowHeight * 2) {
            indexOfY = 3;
        }
        this.drawPlayedShape(this.playerShape, indexOfX, indexOfY);
    };
    GameBoardController.prototype.opponentPlacedShape = function (indexOfX, indexOfY) {
        var opponentShape = this.playerShape == Shape.O ? Shape.X : Shape.O;
        this.drawPlayedShape(opponentShape, indexOfX, indexOfY);
    };
    return GameBoardController;
}());
var SocketConnectionManager = /** @class */ (function () {
    function SocketConnectionManager() {
        this.connected = false;
    }
    /** Interfaces */
    SocketConnectionManager.prototype.connect = function (room, name) {
        var _this = this;
        if (!this.connected) {
            console.log('Init ws connection');
            console.log("Room#: " + room);
            console.log("Name: " + name);
            var param = room + "&" + name;
            this.socket = new WebSocket("ws://" + location.hostname + ":8080/chat/" + param);
            this.socket.onopen = function () {
                _this.connected = true;
                console.log("Connected to the web socket");
            };
            /** Parse message 3 types - start, player turn, player win */
            // this.socket.onmessage = wsOnMessageListener;
            this.socket.onclose = function (ev) {
                console.log("Socket closed because: " + ev.reason);
            };
        }
    };
    SocketConnectionManager.prototype.disconnect = function () {
        this.connected = false;
        if (this.socket) {
            this.socket.close();
            delete this.socket;
        }
    };
    /**
     * Sets message listener. If socket is null | undefined
     * this method has no effect.
     */
    SocketConnectionManager.prototype.setMessageListener = function (listener) {
        if (this.socket) {
            this.socket.onmessage = listener;
        }
    };
    return SocketConnectionManager;
}());
var MainScreen = /** @class */ (function () {
    /** Assign Event listeners */
    function MainScreen() {
        var _this = this;
        $('#enter').click(function () { return _this.onEnterButtonClicked(); });
        $('#connect').click(function () { return _this.onConnectButtonClicked(); });
        $('#close').click(function () { return _this.onCloseButtonClicked(); });
        $('#menu-button').click(function () { return _this.onMenuButtonClicked(); });
        $('#name, #room').click(function () {
            $('#name, #room').removeClass("required");
        });
        $('#name, #room').keypress(function () {
            $('#name, #room').removeClass("required");
        });
        /** Validate room input */
        $('#room').on('input', function () {
            var digitsOnly = $('#room').val().replace(/(?![0-9])./, '');
            $('#room').val(digitsOnly);
        });
        $('#game-screen').hide();
        $('#main-screen').hide();
        $('#menu-button').hide();
        $('#close').hide();
    }
    MainScreen.prototype.onConnectButtonClicked = function () {
        if (!$('#room').val()) {
            $('#room').addClass("required");
        }
        else {
            $('#connect').hide();
            $('#close').show();
            this.inializeConnection();
            this.viewStartGame();
        }
    };
    MainScreen.prototype.onCloseButtonClicked = function () {
        this.closePreviousConnection();
        this.detachPreviousGameBoardController();
        this.viewRoomsList();
    };
    MainScreen.prototype.onEnterButtonClicked = function () {
        this.viewEnterToMain();
    };
    MainScreen.prototype.viewEnterToMain = function () {
        if (!$('#name').val()) {
            $('#name').addClass("required");
        }
        else {
            $('#name-label').text("Player: " + $('#name').val());
            $('#start-screen').hide();
            $('#main-screen').show();
        }
    };
    MainScreen.prototype.onMenuButtonClicked = function () {
        // Should we detach it?
        this.detachPreviousGameBoardController();
        this.viewStopGame();
    };
    /**
     * Creates game board controller for the canvas element
     * where the game play is happening.
     *
     * @param isGameCreator boolean argument based on which playing shape is selected
     */
    MainScreen.prototype.createGameBoardController = function (isGameCreator) {
        this.detachPreviousGameBoardController();
        this.gameBoardController = new GameBoardController(isGameCreator ? Shape.X : Shape.O);
    };
    /**
     * Detaches existing game board controller from UI.
     * Deletes reference to the game board controller.
     */
    MainScreen.prototype.detachPreviousGameBoardController = function () {
        if (this.gameBoardController != null && this.gameBoardController !== undefined) {
            this.gameBoardController.detach();
        }
        delete this.gameBoardController;
    };
    /**
     * Initializes socket connection.
     */
    MainScreen.prototype.inializeConnection = function () {
        this.connect($('#room').val(), $('#name').val());
    };
    MainScreen.prototype.connect = function (room, username) {
        var _this = this;
        this.closePreviousConnection();
        this.socketConnectionManager = new SocketConnectionManager();
        this.socketConnectionManager.connect(room, username);
        this.socketConnectionManager.setMessageListener(function (event) { return _this.onMessageEvent(event); });
    };
    MainScreen.prototype.onMessageEvent = function (messageEvent) {
        //TODO: update implementation
        this.viewPrintToChat("" + messageEvent);
        //this.createGameBoardController(true|false)
    };
    MainScreen.prototype.viewStartGame = function () {
        $('#main-screen').hide();
        $('#game-screen').show();
        $('#menu-button').show();
    };
    MainScreen.prototype.viewStopGame = function () {
        $('#main-screen').show();
        $('#game-screen').hide();
        $('#menu-button').hide();
    };
    MainScreen.prototype.viewRoomsList = function () {
        $('#room').val('');
        // Commented out to keep game play history
        //$('#chat').val('');
        $('#connect').show();
        $('#close').hide();
    };
    MainScreen.prototype.closePreviousConnection = function () {
        if (this.socketConnectionManager) {
            this.socketConnectionManager.disconnect();
            delete this.socketConnectionManager;
        }
    };
    MainScreen.prototype.viewPrintToChat = function (message) {
        $('#chat').val(message);
    };
    return MainScreen;
}());
$(document).ready(function () {
    new MainScreen();
    console.log("main screen init");
});
function viewEnterToMain() {
    console.log("wow");
}
//# sourceMappingURL=ts_main.js.map