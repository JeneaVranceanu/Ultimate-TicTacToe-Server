declare var $;


class MainScreen {
    private gameBoardController: GameBoardController;
    private socketConnectionManager: SocketConnectionManager;
    /** Assign Event listeners */

    constructor() {
        $('#enter').click(() => this.onEnterButtonClicked());
        $('#connect').click(() => this.onConnectButtonClicked());
        $('#close').click(() => this.onCloseButtonClicked());
        $('#menu-button').click(() => this.onMenuButtonClicked());

        $('#name, #room').click(() => {
            $('#name, #room').removeClass("required");
        });

        $('#name, #room').keypress(() => {
            $('#name, #room').removeClass("required");
        });

        /** Validate room input */

        $('#room').on('input', () => {
            let digitsOnly = $('#room').val().replace(/(?![0-9])./, '');
            $('#room').val(digitsOnly);
        });

        $('#game-screen').hide();
        $('#main-screen').hide();
        $('#menu-button').hide();
        $('#close').hide();
    }

    private onConnectButtonClicked() {
        if (!$('#room').val()) {
            $('#room').addClass("required");
        } else {
            $('#connect').hide();
            $('#close').show();
            this.inializeConnection();
            this.viewStartGame();
        }
    }

    private onCloseButtonClicked() {
        this.closePreviousConnection();
        this.detachPreviousGameBoardController();
        this.viewRoomsList()
    }
    
    private onEnterButtonClicked() {
        this.viewEnterToMain();
    }

    private viewEnterToMain() {
        if (!$('#name').val()) {
            $('#name').addClass("required");
        } else {
            $('#name-label').text(`Player: ${$('#name').val()}`);
            $('#start-screen').hide();
            $('#main-screen').show();
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
     * @param isGameCreator boolean argument based on which playing shape is selected
     */
    private createGameBoardController(isGameCreator: boolean) {
        this.detachPreviousGameBoardController();
        this.gameBoardController = new GameBoardController(isGameCreator ? Shape.X : Shape.O);
    }

    /**
     * Detaches existing game board controller from UI.
     * Deletes reference to the game board controller.
     */
    private detachPreviousGameBoardController() {
        if (this.gameBoardController != null && this.gameBoardController !== undefined) {
            this.gameBoardController.detach();
        }

        delete this.gameBoardController;
    }

    /**
     * Initializes socket connection.
     */
    private inializeConnection() {
        this.connect($('#room').val(), $('#name').val());
    }

    private connect(room: string, username: string) {
        this.closePreviousConnection()

        this.socketConnectionManager = new SocketConnectionManager();
        this.socketConnectionManager.connect(room, username);
        this.socketConnectionManager.setMessageListener((event) => this.onMessageEvent(event));
    }

    private onMessageEvent(messageEvent: MessageEvent) {
        //TODO: update implementation
        this.viewPrintToChat(`${messageEvent}`)
 
        //this.createGameBoardController(true|false)
    }

    private viewStartGame() {
        $('#main-screen').hide();
        $('#game-screen').show();
        $('#menu-button').show();
    }

    private viewStopGame() {
        $('#main-screen').show();
        $('#game-screen').hide();
        $('#menu-button').hide();
    }

    private viewRoomsList() {
        $('#room').val('');
        // Commented out to keep game play history
        //$('#chat').val('');
        $('#connect').show();
        $('#close').hide();
    }

    private closePreviousConnection() {
        if (this.socketConnectionManager) {
            this.socketConnectionManager.disconnect();
            delete this.socketConnectionManager;
        }
    }

    private viewPrintToChat(message: string) {
        $('#chat').val(message);
    }
}

$(document).ready(() => {
    new MainScreen();
    console.log("main screen init");
});

function viewEnterToMain() {
    console.log("wow");
}