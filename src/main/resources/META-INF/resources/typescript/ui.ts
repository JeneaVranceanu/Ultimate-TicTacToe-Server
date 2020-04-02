declare var $;

class MainScreen {
  private gameBoardController: GameBoardController;
  private socketConnectionManager: SocketConnectionManager;

  // Assigned by the user before connecting to the serve
  private playerName: string = "";
  private roomName: number = 0;
  private roomId: number;

  private winAudio = new Audio("../assets/audio/you_won.mp3");
  private loseAudio = new Audio("../assets/audio/you_lost_short.mp3");

  // Assigned by the server when successfully connected.
  private playerId: string;

  constructor() {
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

  private onConnectButtonClicked() {
    if (!$("#room").val()) {
      $("#room").addClass("required");
    } else {
      $("#connect").hide();
      $("#close").show();
      $("#create-button").show();
      $("#create-button").prop("disabled", false);
      $("#connect-to-button").show();
      $("#connect-to-button").prop("disabled", false);
      this.inializeConnection();
    }
  }

  private onCloseButtonClicked() {
    this.closePreviousConnection();
    this.detachPreviousGameBoardController();
    this.viewRoomsList();
  }
  
  private onCreateButtonClicked() {
    $("#create-button").prop("disabled", true);
    $("#connect-to-button").prop("disabled", true);
    this.socketConnectionManager.send(
      `{"type":"CREATE", "room":${this.roomName},"playerId":"${this.playerId}"}`
    );
  }

  private onConnectToRoomButtonClicked() {
    $("#create-button").prop("disabled", true);
    $("#connect-to-button").prop("disabled", true);
    this.socketConnectionManager.send(
      `{"type":"CONNECT", "room":${this.roomName},"playerId":"${this.playerId}"}`
    );
  }

  private onEnterButtonClicked() {
    this.winAudio.play();
    this.loseAudio.play();
    this.viewEnterToMain();
  }

  private viewEnterToMain() {
    if (!$("#name").val()) {
      $("#name").addClass("required");
    } else {
      $("#name-label").text(`Player: ${$("#name").val()}`);
      $("#start-screen").hide();
      $("#main-screen").show();
    }
  }

  private onMenuButtonClicked() {
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
  private createGameBoardController(isFirstPlayer: boolean) {
    this.detachPreviousGameBoardController();
    this.gameBoardController = new GameBoardController(
      isFirstPlayer ? Shape.X : Shape.O
    );

    let _this = this;
    this.gameBoardController.setCellClickListener((cellIndex: number) => {
      _this.gameBoardController.enableGameBoard(false);
      _this.onCellSelected(cellIndex);
    });
  }
  /**
   * Invoked when
   * @param cellIndex index from 0 to 8
   */
  private onCellSelected(cellIndex: number) {
    let msg = `{"type":"TURN","room":${this.roomName},
              "playerId":"${this.playerId}","cell":${cellIndex}}`;
    this.socketConnectionManager.send(msg);
  }

  /**
   * Detaches existing game board controller from UI.
   * Deletes reference to the game board controller.
   */
  private detachPreviousGameBoardController() {
    if (
      this.gameBoardController != null &&
      this.gameBoardController !== undefined
    ) {
      this.gameBoardController.detach();
    }

    delete this.gameBoardController;
  }

  /**
   * Initializes socket connection.
   */
  private inializeConnection() {
    this.playerName = $("#name").val();
    // Auto casting to 'number'?
    this.roomName = $("#room").val();
    this.connect(this.roomName, this.playerName);
  }

  private connect(room: number, username: string) {
    this.closePreviousConnection();

    this.socketConnectionManager = new SocketConnectionManager();
    this.socketConnectionManager.connect(room.toString(), username);
    this.socketConnectionManager.setMessageListener(event =>
      this.onMessageEvent(event)
    );
  }

  private onMessageEvent(messageEvent: MessageEvent) {
    this.viewPrintToChat(`${messageEvent.data as string}`);

    let json = JSON.parse(messageEvent.data as string);

    if (json.type == RegisteredReceivedMessage.getType()) {
      let message = json as RegisteredReceivedMessage;
      this.playerId = message.playerId;
    } else if (json.type == RoomCreateReceiveMessage.getType()) {
      this.roomCreated(json as RoomCreateReceiveMessage);
    } else if (json.type == GameStartedReceiveMessage.getType()) {
      this.startGame(json as GameStartedReceiveMessage);
    } else if (json.type == GameEndedReceiveMessage.getType()) {
      this.endGame(json as GameEndedReceiveMessage);
    } else if (json.type == TurnReceiveMessage.getType()) {
      this.updateGameBoard(json as TurnReceiveMessage);
    } else if (json.type == RoomListReceiveMessage.getType()) {
      this.updateRoomsList(json as RoomListReceiveMessage);
    }
  }

  // TODO: implement UI for the list of rooms
  private updateRoomsList(arg0: RoomListReceiveMessage) {
    this.viewPrintToChat(JSON.stringify(arg0));
  }

  private updateGameBoard(msg: TurnReceiveMessage) {
    this.gameBoardController.opponentPlacedShape(msg.cellOccupied.x, msg.cellOccupied.y);
  }

  private endGame(msg: GameEndedReceiveMessage) {
    if (msg.winnerPlayerId == null || msg.boardState == null) {
      alert(`Game ended unexpectedly: ${JSON.stringify(msg)}`);
      return;
    }

    let didPlayerWinner = msg.winnerPlayerId == this.playerId;

    if (didPlayerWinner) {
      this.winAudio.volume = 1;
      this.winAudio.play();
    } else {
      this.loseAudio.volume = 1;
      this.loseAudio.play();
    }

    this.gameBoardController.endGame(didPlayerWinner, msg.boardState);

    this.roomId = null;
    this.roomName = null;
    this.detachPreviousGameBoardController();
  }

  private roomCreated(msg: RoomCreateReceiveMessage) {
    this.roomId = msg.roomId;
  }

  private startGame(msg: GameStartedReceiveMessage) {
    this.viewStartGame();
    this.createGameBoardController(msg.firstPlayerId == this.playerId);
  }

  private viewStartGame() {
    $("#main-screen").hide();
    $("#game-screen").show();
    $("#menu-button").show();
  }

  private viewStopGame() {
    $("#main-screen").show();
    $("#game-screen").hide();
    $("#menu-button").hide();
  }

  private viewRoomsList() {
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
  private closePreviousConnection() {
    if (this.socketConnectionManager) {
      this.socketConnectionManager.disconnect();
      delete this.socketConnectionManager;
    }
  }

  // Debug function
  private viewPrintToChat(message: string) {
    $("#chat").val(($("#chat").val() + "\n" + message).trim());
  }
}

$(document).ready(() => {
  new MainScreen();
});
