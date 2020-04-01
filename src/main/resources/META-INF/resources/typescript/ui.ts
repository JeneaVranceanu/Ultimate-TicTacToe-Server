declare var $;

class MainScreen {
  private onCreateButtonClicked() {
    $("#create-button").prop("disabled", true);
    $("#connect-to-button").prop("disabled", true);
    this.socketConnectionManager.send(
      `{"type":"CREATE", "room":${this.roomNumber},"playerId":"${this.playerId}"}`
    );
  }

  private onConnectToRoomButtonClicked() {
    $("#create-button").prop("disabled", true);
    $("#connect-to-button").prop("disabled", true);
    this.socketConnectionManager.send(
      `{"type":"CONNECT", "room":${this.roomNumber},"playerId":"${this.playerId}"}`
    );
  }

  private gameBoardController: GameBoardController;
  private socketConnectionManager: SocketConnectionManager;

  // Assigned by the user before connecting to the serve
  private playerName: string = "";
  private roomNumber: number = 0;
  private isRoomOwner: boolean = null;

  // Assigned by the server when successfully connected.
  private playerId: string;

  constructor() {
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

    this.isRoomOwner = null;
    this.roomNumber = null;
  }

  private onEnterButtonClicked() {
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

    this.isRoomOwner = null;
    this.roomNumber = null;
  }

  /**
   * Creates game board controller for the canvas element
   * where the game play is happening.
   *
   * @param isGameCreator boolean argument based on which playing shape is selected
   */
  private createGameBoardController(isGameCreator: boolean) {
    this.detachPreviousGameBoardController();
    this.gameBoardController = new GameBoardController(
      isGameCreator ? Shape.X : Shape.O
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
    let msg = `{"type":"TURN","room":${this.roomNumber},
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
    this.roomNumber = $("#room").val();
    this.connect(this.roomNumber, this.playerName);
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
    let json = JSON.parse(messageEvent.data as string);
    if (this.playerId == null || this.playerId === undefined) {
      this.playerId = json["playerId"];
    }

    this.viewPrintToChat(`${messageEvent.data as string}`);

    let message = json["message"] as string;
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
          if (
            this.isRoomOwner == null &&
            (json.field == undefined || json.field == null)
          ) {
            this.isRoomOwner = true;
          } else if (this.isRoomOwner == null || !this.isRoomOwner) {
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
            this.gameBoardController.updateBoardState(boardState);
          }
          //this.gameBoardController.opponentPlacedShapeInCell(x,y);
        }
        break;
    }
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
