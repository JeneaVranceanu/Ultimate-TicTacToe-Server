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
 *
 * GAME BOARD CONTROLLER IS DISABLED BY DEFAULT TO PREVENT ACCIDENTAL USER ACTIONS!
 * CONTROLLER IS WAITING TO BE ACTIVATED WHEN THE GAME STARTS.
 */
class GameBoardController {
    constructor(playerShape) {
        // false - cell is empty
        // true - cell is occupied
        // if (boardCellsStatus[1][1]) { cell is occupied. must not allow drawing here. }
        this.boardCellsStatus = [
            [false, false, false],
            [false, false, false],
            [false, false, false]
        ];
        this.playerClickedSounds = [
            new Audio("../assets/audio/balloon_snap.mp3"),
            new Audio("../assets/audio/player_move.mp3")
        ];
        this.opponentClickedSounds = [
            new Audio("../assets/audio/opponent_move_2.mp3"),
            new Audio("../assets/audio/opponent_move.mp3")
        ];
        this.markO = new Image();
        this.markX = new Image();
        this.cellClickListener = null;
        this.pressEventHandler = (e) => {
            let mouseX = e.changedTouches
                ? e.changedTouches[0].pageX
                : e.pageX;
            let mouseY = e.changedTouches
                ? e.changedTouches[0].pageY
                : e.pageY;
            mouseX -= this.canvas.offsetLeft;
            mouseY -= this.canvas.offsetTop;
            this.boardClicked(mouseX, mouseY);
        };
        let allSounds = [
            ...this.playerClickedSounds,
            ...this.opponentClickedSounds
        ];
        allSounds.forEach(value => {
            value.volume = 0.0;
            value.play();
        });
        this.playerShape = playerShape;
        this.markO.src = "../assets/o_mark_95.png";
        this.markX.src = "../assets/x_mark_95.png";
        this.markX.onload = () => {
            console.log("this.markX is loaded!");
        };
        this.markO.onload = () => {
            console.log("this.markO is loaded!");
        };
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.rowHeight = this.canvas.height / 3;
        this.columnWidth = this.canvas.width / 3;
    }
    updateBoardState(boardState) {
        // Coordinates of changed cell
        let x = 0, y = 0;
        for (let i = 0; i < boardState.length; i++) {
            for (let j = 0; j < boardState[i].length; j++) {
                if (this.boardCellsStatus[i][j] != boardState[i][j]) {
                    y = i;
                    x = j;
                    this.opponentPlacedShape(x, y);
                    return;
                }
            }
        }
    }
    detach() {
        this.setUserEventsEnabled(false);
        this.cellClickListener = null;
        delete this.cellClickListener;
        delete this.canvas;
        delete this.context;
        delete this.markO;
        delete this.markX;
    }
    // @ts-ignore
    drawPlayedShape(shape, xPosition, yPosition) {
        let image = shape == Shape.X ? this.markX : this.markO;
        if (this.isCellOccupied(xPosition, yPosition)) {
            return;
        }
        console.log("drawPlayedShape " + shape);
        this.setCellOccupied(xPosition, yPosition);
        this.context.save();
        let y = this.rowHeight * yPosition + Math.abs(this.rowHeight - image.height) / 2;
        let x = this.columnWidth * xPosition +
            Math.abs(this.columnWidth - image.width) / 2;
        this.draw(image, x, y);
    }
    draw(image, x, y) {
        image.onload = null;
        if (!image.complete || image.naturalHeight == 0) {
            image.onload = () => this.draw(image, x, y);
        }
        else {
            this.context.translate(x, y);
            this.context.fillStyle = (Math.random() * 100) % 2 == 0 ? "#FF0000" : "#00FF00";
            this.context.fillRect(0, 0, this.columnWidth, this.columnWidth);
            this.context.drawImage(image, 0, 0, image.width, image.height);
            this.context.restore();
        }
    }
    setCellOccupied(xPosition, yPosition) {
        this.boardCellsStatus[yPosition][xPosition] = true;
    }
    /**
     *
     * @param xPosition horizontal position of a cell [0,2]
     * @param yPosition vertical postition of a cell [0,2]
     */
    isCellOccupied(xPosition, yPosition) {
        return this.boardCellsStatus[yPosition][xPosition];
    }
    enableGameBoard(enable) {
        this.setUserEventsEnabled(enable);
        // This is a place to make board visually disable
        // to let the user know about the board state
    }
    setCellClickListener(listner) {
        this.cellClickListener = listner;
    }
    setUserEventsEnabled(enable) {
        if (enable) {
            this.canvas.addEventListener("mouseup", this.pressEventHandler);
        }
        else {
            this.canvas.removeEventListener("mouseup", this.pressEventHandler);
        }
    }
    /**
     * Transforms pixel coordinates into cell index, makes a sound
     * of a click and attempts to draw {@link GameBoardController#playerShape} on screen.
     * Cell index is a pair of two integers, e.g. (0,0), or (1,2).
     * @param x horizontal pixel coordinates on a board
     * @param y vertical pixel coordinates on a board
     */
    boardClicked(x, y) {
        var cellXIndex = 0;
        var cellYIndex = 0;
        if (x > this.columnWidth && x <= this.columnWidth * 2) {
            cellXIndex = 1;
        }
        else if (x > this.columnWidth * 2) {
            cellXIndex = 2;
        }
        if (y > this.rowHeight && y <= this.rowHeight * 2) {
            cellYIndex = 1;
        }
        else if (y > this.rowHeight * 2) {
            cellYIndex = 2;
        }
        let cellNumber = this.twoDimensionalIndicesToOneDimenstion(cellXIndex, cellYIndex);
        if (this.cellClickListener != null &&
            !this.isCellOccupied(cellXIndex, cellYIndex)) {
            this.cellClickListener(cellNumber);
        }
        this.makeASound(this.playerClickedSounds);
        this.drawPlayedShape(this.playerShape, cellXIndex, cellYIndex);
    }
    twoDimensionalIndicesToOneDimenstion(x, y) {
        return 3 * y + x;
    }
    /**
     * Picks random assets from a list and plays it
     * @param sounds a list of sound assets
     */
    makeASound(sounds) {
        if (sounds.length == 0) {
            return;
        }
        let audio = sounds[Math.floor(Math.random() * 100) % sounds.length];
        audio.volume = 1.0;
        audio.play();
        //new Audio(sounds[Math.floor(Math.random() * 100) % sounds.length]).play();
    }
    /**
     * Places a shape on a board according to opponent's move.
     * @param cellNumber a number from set [0,8]
     */
    opponentPlacedShapeInCell(cellNumber) {
        if (cellNumber > 8 || cellNumber < 0) {
            console.log(`Cell number is invalid: opponentPlacedShapeInCell(cellNumber: ${cellNumber})`);
            return;
        }
        let x = Math.max(0, cellNumber);
        let y = 0;
        if (cellNumber > 2 || cellNumber <= 5) {
            x = cellNumber - 3;
            y = 1;
        }
        else if (cellNumber > 5) {
            x = cellNumber - 6;
            y = 2;
        }
        if (this.isCellOccupied(x, y)) {
            return;
        }
        this.makeASound(this.opponentClickedSounds);
        this.drawPlayedShape(this.getOpponentsShape(), x, y);
    }
    opponentPlacedShape(x, y) {
        console.log("x > 2 || x < 0 || y < 0 || y > 2");
        if (x > 2 || x < 0 || y < 0 || y > 2) {
            console.log(`Cell number is invalid: opponentPlacedShapeInCell(x: ${x}, y: ${y})`);
            return;
        }
        console.log("this.isCellOccupied(x, y)");
        if (this.isCellOccupied(x, y)) {
            return;
        }
        console.log("this.makeASound(this.opponentClickedSounds);");
        try {
            this.makeASound(this.opponentClickedSounds);
        }
        catch (_a) {
            // No sound :O
        }
        this.drawPlayedShape(this.getOpponentsShape(), x, y);
    }
    getOpponentsShape() {
        return this.playerShape == Shape.O ? Shape.X : Shape.O;
    }
}
class SocketConnectionManager {
    constructor() {
        this.connected = false;
    }
    /** Interfaces */
    connect(room, name) {
        if (!this.connected) {
            console.log('Init ws connection');
            console.log("Room#: " + room);
            console.log("Name: " + name);
            var param = `${room}&${name}`;
            this.socket = new WebSocket(`ws://${location.hostname}:8080/chat/${param}`);
            this.socket.onopen = () => {
                this.connected = true;
                console.log("Connected to the web socket");
            };
            /** Parse message 3 types - start, player turn, player win */
            // this.socket.onmessage = wsOnMessageListener;
            this.socket.onclose = (ev) => {
                console.log(`Socket closed because: ${ev.reason}`);
            };
        }
    }
    disconnect() {
        this.connected = false;
        if (this.socket) {
            this.socket.close();
            delete this.socket;
        }
    }
    /**
     * Sets message listener. If socket is null | undefined
     * this method has no effect.
     */
    setMessageListener(listener) {
        if (this.socket) {
            this.socket.onmessage = listener;
        }
    }
    send(message) {
        if (this.connected) {
            this.socket.send(message);
        }
    }
}
class MainScreen {
    constructor() {
        // Assigned by the user before connecting to the serve
        this.playerName = "";
        this.roomNumber = 0;
        this.isRoomOwner = null;
        $("#enter").click(() => this.onEnterButtonClicked());
        $("#connect").click(() => this.onConnectButtonClicked());
        $("#close").click(() => this.onCloseButtonClicked());
        $("#menu-button").click(() => this.onMenuButtonClicked());
        $("#create-button").click(() => this.onCreateButtonClicked());
        $("#connect-to-button").click(() => this.onConnectToRoomButtonClicked());
        $("#name, #room").click(() => {
            $("#name, #room").removeClass("required");
        });
        $("#name, #room").keypress(() => {
            $("#name, #room").removeClass("required");
        });
        /** Validate room input */
        $("#room").on("input", () => {
            let digitsOnly = $("#room")
                .val()
                .replace(/(?![0-9])./, "");
            $("#room").val(digitsOnly);
        });
        $("#game-screen").hide();
        $("#main-screen").hide();
        $("#menu-button").hide();
        $("#close").hide();
    }
    onCreateButtonClicked() {
        $("#create-button").prop("disabled", true);
        $("#connect-to-button").prop("disabled", true);
        this.socketConnectionManager.send(`{"type":"CREATE", "room":${this.roomNumber},"playerId":"${this.playerId}"}`);
    }
    onConnectToRoomButtonClicked() {
        $("#create-button").prop("disabled", true);
        $("#connect-to-button").prop("disabled", true);
        this.socketConnectionManager.send(`{"type":"CONNECT", "room":${this.roomNumber},"playerId":"${this.playerId}"}`);
    }
    onConnectButtonClicked() {
        if (!$("#room").val()) {
            $("#room").addClass("required");
        }
        else {
            $("#connect").hide();
            $("#close").show();
            $("#create-button").show();
            $("#create-button").prop("disabled", false);
            $("#connect-to-button").show();
            $("#connect-to-button").prop("disabled", false);
            this.inializeConnection();
        }
    }
    onCloseButtonClicked() {
        this.closePreviousConnection();
        this.detachPreviousGameBoardController();
        this.viewRoomsList();
        this.isRoomOwner = null;
        this.roomNumber = null;
    }
    onEnterButtonClicked() {
        this.viewEnterToMain();
    }
    viewEnterToMain() {
        if (!$("#name").val()) {
            $("#name").addClass("required");
        }
        else {
            $("#name-label").text(`Player: ${$("#name").val()}`);
            $("#start-screen").hide();
            $("#main-screen").show();
        }
    }
    onMenuButtonClicked() {
        // Should we detach it?
        this.detachPreviousGameBoardController();
        this.viewStopGame();
        this.isRoomOwner = null;
        this.roomNumber = null;
    }
    /**
     * Creates game board controller for the canvas element
     * where the game play is happening.
     *
     * @param isGameCreator boolean argument based on which playing shape is selected
     */
    createGameBoardController(isGameCreator) {
        this.detachPreviousGameBoardController();
        this.gameBoardController = new GameBoardController(isGameCreator ? Shape.X : Shape.O);
        let _this = this;
        this.gameBoardController.setCellClickListener((cellIndex) => {
            _this.gameBoardController.enableGameBoard(false);
            _this.onCellSelected(cellIndex);
        });
    }
    /**
     * Invoked when
     * @param cellIndex index from 0 to 8
     */
    onCellSelected(cellIndex) {
        let msg = `{"type":"TURN","room":${this.roomNumber},
              "playerId":"${this.playerId}","cell":${cellIndex}}`;
        this.socketConnectionManager.send(msg);
    }
    /**
     * Detaches existing game board controller from UI.
     * Deletes reference to the game board controller.
     */
    detachPreviousGameBoardController() {
        if (this.gameBoardController != null &&
            this.gameBoardController !== undefined) {
            this.gameBoardController.detach();
        }
        delete this.gameBoardController;
    }
    /**
     * Initializes socket connection.
     */
    inializeConnection() {
        this.playerName = $("#name").val();
        // Auto casting to 'number'?
        this.roomNumber = $("#room").val();
        this.connect(this.roomNumber, this.playerName);
    }
    connect(room, username) {
        this.closePreviousConnection();
        this.socketConnectionManager = new SocketConnectionManager();
        this.socketConnectionManager.connect(room.toString(), username);
        this.socketConnectionManager.setMessageListener(event => this.onMessageEvent(event));
    }
    onMessageEvent(messageEvent) {
        let json = JSON.parse(messageEvent.data);
        if (this.playerId == null || this.playerId === undefined) {
            this.playerId = json["playerId"];
        }
        this.viewPrintToChat(`${messageEvent.data}`);
        let message = json["message"];
        if (message == null || message === undefined) {
            return;
        }
        switch (message.toLowerCase()) {
            case "wait":
                {
                    if (this.isRoomOwner == null) {
                        this.viewStartGame();
                    }
                }
                break;
            case "turn":
                {
                    if (this.isRoomOwner == null) {
                        this.viewStartGame();
                    }
                    let wasUndefined = this.isRoomOwner == null;
                    if (this.isRoomOwner == null &&
                        (json.field == undefined || json.field == null)) {
                        this.isRoomOwner = true;
                    }
                    else if (this.isRoomOwner == null || !this.isRoomOwner) {
                        this.isRoomOwner = false;
                    }
                    if (wasUndefined && this.isRoomOwner != null) {
                        this.createGameBoardController(this.isRoomOwner);
                    }
                    this.gameBoardController.enableGameBoard(true);
                    if (json.field != null && json.field != undefined) {
                        let boardState = [
                            [false, false, false],
                            [false, false, false],
                            [false, false, false]
                        ];
                        for (var i = 0; i < boardState.length; i++) {
                            for (var j = 0; j < boardState[i].length; j++) {
                                boardState[i][j] = json.field[3 * i + j] != "EMPTY";
                            }
                        }
                        // for (var i = 0, j = 0; i < json.field.length; i++) {
                        //   let newI = Math.floor(i / 3);
                        //   boardState[newI][j] = json.field[i] != "EMPTY";
                        //   if (newI % 3 == 2) {
                        //     j++;
                        //   }
                        // }
                        this.gameBoardController.updateBoardState(boardState);
                    }
                    //this.gameBoardController.opponentPlacedShapeInCell(x,y);
                }
                break;
        }
    }
    viewStartGame() {
        $("#main-screen").hide();
        $("#game-screen").show();
        $("#menu-button").show();
    }
    viewStopGame() {
        $("#main-screen").show();
        $("#game-screen").hide();
        $("#menu-button").hide();
    }
    viewRoomsList() {
        $("#room").val("");
        // Commented out to keep game play history
        //$('#chat').val('');
        $("#connect").show();
        $("#close").hide();
        $("#create-button").hide();
        $("#connect-to-button").hide();
    }
    // TODO: remove this function!
    // One connection could be enough to
    // conduct several games.
    // Probably requires a bit of changes on the server side.
    closePreviousConnection() {
        if (this.socketConnectionManager) {
            this.socketConnectionManager.disconnect();
            delete this.socketConnectionManager;
        }
    }
    // Debug function
    viewPrintToChat(message) {
        $("#chat").val(($("#chat").val() + "\n" + message).trim());
    }
}
$(document).ready(() => {
    new MainScreen();
});
//# sourceMappingURL=ts_main.js.map