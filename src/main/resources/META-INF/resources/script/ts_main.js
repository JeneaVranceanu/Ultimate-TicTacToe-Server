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
        // null - cell is empty
        // Shape.X || Shape.O - cell is occupied
        // if (boardCellsStatus[1][1] != null) { cell is occupied. must not allow drawing here. }
        this.boardCellsStatus = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
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
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.rowHeight = this.canvas.height / 3;
        this.columnWidth = this.canvas.width / 3;
    }
    endGame(didPlayerWin, gameStory) {
        let interestedShape = didPlayerWin ? this.playerShape : (this.playerShape == Shape.X ? Shape.O : Shape.X);
        let interestedShapeString = interestedShape == Shape.O ? "O" : "X";
        let filteredStory = gameStory.filter((value) => {
            return value.shape.toUpperCase() == interestedShapeString;
        });
        let winnerPath = new Array();
        // The last element of filtered game story
        // is automatically part of the winner path
        winnerPath[0] = filteredStory.pop();
        filteredStory = filteredStory.sort((a, b) => {
            if (a.y == b.y) {
                return a.x - b.x;
            }
            return a.y > b.y ? 1 : -1;
        });
        let currentTurn = winnerPath[0];
        //Not the most efficient way to find a path
        for (let i = 0; i < filteredStory.length && winnerPath.length < 3; i++) {
            let nextTurn = filteredStory[i];
            let isOnTheSameLine = [nextTurn.x - 1, nextTurn.x + 1].includes(currentTurn.x);
            let isOnTheSameColumn = [nextTurn.y - 1, nextTurn.y + 1].includes(currentTurn.y);
            if (isOnTheSameLine || isOnTheSameColumn || this.areTurnsOnTheSameDiagonal(nextTurn, currentTurn)) {
                winnerPath.push(nextTurn);
                currentTurn = nextTurn;
            }
        }
        let image = new Image();
        image.src = didPlayerWin ? "../assets/gold_crown.png" : "../assets/crossed_swords.png";
        if (this.isImageLoaded(image)) {
            winnerPath.forEach((value) => this.drawImage(image, value.x, value.y));
        }
        else {
            this.triggerLoadingOfImageIfNotLoaded(image);
            image.onload = () => winnerPath.forEach((value) => this.drawImage(image, value.x, value.y));
        }
    }
    isImageLoaded(image) {
        return image.complete && image.naturalHeight != 0;
    }
    triggerLoadingOfImageIfNotLoaded(image) {
        this.context.save();
        this.context.drawImage(image, 0, 0, image.width, image.height);
        this.context.restore();
    }
    areTurnsOnTheSameDiagonal(pivot, nextPoint) {
        let nonDiagonalPoints = [0, 2];
        let isNextPointOnDiagonal = !(nextPoint.x == 1 && nonDiagonalPoints.includes(nextPoint.y)
            || nonDiagonalPoints.includes(nextPoint.x) && nextPoint.y == 1);
        if (!isNextPointOnDiagonal) {
            return false;
        }
        if (pivot.x == 1 && pivot.y == 1) {
            // Pivot is in the middle. And nextPoint is also in the middle.
            return true;
        }
        else if (pivot.x == 1 && nonDiagonalPoints.includes(pivot.y)
            || nonDiagonalPoints.includes(pivot.x) && pivot.y == 1) {
            // Pivot is not on the diagonal
            return false;
        }
        else {
            //Pivot is somewhere in the corner.
            return nextPoint.x != pivot.x || nextPoint.y != pivot.y;
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
        this.setCellOccupied(xPosition, yPosition, shape);
        this.drawImage(image, xPosition, yPosition);
    }
    drawImage(image, xPosition, yPosition) {
        image.onload = null;
        if (!this.isImageLoaded(image)) {
            image.onload = () => this.drawImage(image, xPosition, yPosition);
            return;
        }
        this.context.save();
        let y = this.rowHeight * yPosition + Math.abs(this.rowHeight - image.height) / 2;
        let x = this.columnWidth * xPosition +
            Math.abs(this.columnWidth - image.width) / 2;
        this.context.translate(x, y);
        this.context.drawImage(image, 0, 0, image.width, image.height);
        this.context.restore();
    }
    setCellOccupied(xPosition, yPosition, shape) {
        this.boardCellsStatus[yPosition][xPosition] = shape;
    }
    /**
     *
     * @param xPosition horizontal position of a cell [0,2]
     * @param yPosition vertical postition of a cell [0,2]
     */
    isCellOccupied(xPosition, yPosition) {
        return this.boardCellsStatus[yPosition][xPosition] != null;
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
/**
 * Received on successful socket connection
 */
class RegisteredReceivedMessage {
    static getType() { return "REGISTERED"; }
}
/**
 * Emits a request to open a room with given name.
 */
class RoomCreateEmitMessage {
    constructor() {
        this.type = "ROOM_CREATE";
    }
}
/**
 * Room successfully created. Player waits for GAME_START.
 */
class RoomCreateReceiveMessage {
    static getType() { return "ROOM_CREATE"; }
}
/**
 * Emits a request to close a room.
 * PlayerId must match with the owner ID of the room.
 * Impossible if the game started - interpreted as leaving/losing.
 */
class RoomCloseEmitMessage {
    constructor() {
        this.type = "ROOM_CLOSE";
    }
}
/**
 * Emits a request to connect to open room.
 * Now waiting for GAME_START.
 */
class RoomConnectEmitMessage {
    constructor() {
        this.type = "ROOM_CONNECT";
    }
}
/**
 * "Received when game starts.
 * Player ID with ""firstPlayerId"" makes the first move."
 */
class GameStartedReceiveMessage {
    static getType() { return "GAME_START"; }
}
/**
 * Received when game ends.
 */
class GameEndedReceiveMessage {
    static getType() { return "GAME_END"; }
}
/**
 * Received when an opponent has completed its turn.
 */
class TurnReceiveMessage {
    static getType() { return "TURN"; }
}
class Turn {
    constructor(xx, yy, ss) {
        this.x = xx;
        this.y = yy;
        this.shape = ss;
    }
}
/**
 * Emits a message after making a turn.
 * Identifies occupied cell and by whom it was occupied.
 */
class TurnEmitMessage {
    static getType() { return "TURN"; }
}
/**
 * Emits a message requesting list of all rooms
 */
class RoomListEmitMessage {
    constructor() {
        this.type = "ROOM_LIST";
    }
}
/**
 * Received as a response for {@link RoomListEmitMessage} emit message.
 * Contains a list of all rooms available.
 *
 * Also is returned when new room is created or closed
 */
class RoomListReceiveMessage {
    static getType() { return "ROOM_LIST"; }
}
class Room {
}
class MainScreen {
    constructor() {
        // Assigned by the user before connecting to the serve
        this.playerName = "";
        this.roomName = 0;
        this.winAudio = new Audio("../assets/audio/you_won.mp3");
        this.loseAudio = new Audio("../assets/audio/you_lost_short.mp3");
        this.winAudio.volume = 0.0;
        this.loseAudio.volume = 0.0;
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
        $("#game-screen").hide();
        $("#main-screen").hide();
        $("#menu-button").hide();
        $("#close").hide();
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
    }
    onCreateButtonClicked() {
        $("#create-button").prop("disabled", true);
        $("#connect-to-button").prop("disabled", true);
        this.socketConnectionManager.send(`{"type":"CREATE", "room":${this.roomName},"playerId":"${this.playerId}"}`);
    }
    onConnectToRoomButtonClicked() {
        $("#create-button").prop("disabled", true);
        $("#connect-to-button").prop("disabled", true);
        this.socketConnectionManager.send(`{"type":"CONNECT", "room":${this.roomName},"playerId":"${this.playerId}"}`);
    }
    onEnterButtonClicked() {
        this.winAudio.play();
        this.loseAudio.play();
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
    }
    /**
     * Creates game board controller for the canvas element
     * where the game play is happening.
     *
     * @param isFirstPlayer boolean argument based on which playing shape is selected
     */
    createGameBoardController(isFirstPlayer) {
        this.detachPreviousGameBoardController();
        this.gameBoardController = new GameBoardController(isFirstPlayer ? Shape.X : Shape.O);
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
        let msg = `{"type":"TURN","room":${this.roomName},
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
        this.roomName = $("#room").val();
        this.connect(this.roomName, this.playerName);
    }
    connect(room, username) {
        this.closePreviousConnection();
        this.socketConnectionManager = new SocketConnectionManager();
        this.socketConnectionManager.connect(room.toString(), username);
        this.socketConnectionManager.setMessageListener(event => this.onMessageEvent(event));
    }
    onMessageEvent(messageEvent) {
        this.viewPrintToChat(`${messageEvent.data}`);
        let json = JSON.parse(messageEvent.data);
        if (json.type == RegisteredReceivedMessage.getType()) {
            let message = json;
            this.playerId = message.playerId;
        }
        else if (json.type == RoomCreateReceiveMessage.getType()) {
            this.roomCreated(json);
        }
        else if (json.type == GameStartedReceiveMessage.getType()) {
            this.startGame(json);
        }
        else if (json.type == GameEndedReceiveMessage.getType()) {
            this.endGame(json);
        }
        else if (json.type == TurnReceiveMessage.getType()) {
            this.updateGameBoard(json);
        }
        else if (json.type == RoomListReceiveMessage.getType()) {
            this.updateRoomsList(json);
        }
    }
    // TODO: implement UI for the list of rooms
    updateRoomsList(arg0) {
        this.viewPrintToChat(JSON.stringify(arg0));
    }
    updateGameBoard(msg) {
        this.gameBoardController.opponentPlacedShape(msg.cellOccupied.x, msg.cellOccupied.y);
    }
    endGame(msg) {
        if (msg.winnerPlayerId == null || msg.boardState == null) {
            alert(`Game ended unexpectedly: ${JSON.stringify(msg)}`);
            return;
        }
        let didPlayerWinner = msg.winnerPlayerId == this.playerId;
        if (didPlayerWinner) {
            this.winAudio.volume = 1;
            this.winAudio.play();
        }
        else {
            this.loseAudio.volume = 1;
            this.loseAudio.play();
        }
        this.gameBoardController.endGame(didPlayerWinner, msg.boardState);
        this.roomId = null;
        this.roomName = null;
        this.detachPreviousGameBoardController();
    }
    roomCreated(msg) {
        this.roomId = msg.roomId;
    }
    startGame(msg) {
        this.viewStartGame();
        this.createGameBoardController(msg.firstPlayerId == this.playerId);
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