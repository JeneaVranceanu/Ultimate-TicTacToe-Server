var Shape;
(function (Shape) {
    Shape[Shape["X"] = 1] = "X";
    Shape[Shape["O"] = 2] = "O";
})(Shape || (Shape = {}));
class GameBoardController {
    constructor(playerShape) {
        // false - cell is empty
        // true - cell is occupied
        // if (boardCellsStatus[1][1]) { cell is occupied. must not allow drawing here. } 
        this.boardCellsStatus = [[false, false, false],
            [false, false, false],
            [false, false, false]];
        this.audioSrcs = [
            "../assets/audio/balloon_snap.mp3",
            "../assets/audio/opponent_move_2.mp3",
            "../assets/audio/opponent_move.mp3",
            "../assets/audio/player_move.mp3"
        ];
        this.markO = new Image();
        this.markX = new Image();
        this.pressEventHandler = (e) => {
            let mouseX = e.changedTouches ?
                e.changedTouches[0].pageX :
                e.pageX;
            let mouseY = e.changedTouches ?
                e.changedTouches[0].pageY :
                e.pageY;
            mouseX -= this.canvas.offsetLeft;
            mouseY -= this.canvas.offsetTop;
            this.boardClicked(mouseX, mouseY);
        };
        this.playerShape = playerShape;
        this.markO.src = '../assets/o_mark_95.png';
        this.markX.src = '../assets/x_mark_95.png';
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.rowHeight = this.canvas.height / 3;
        this.columnWidth = this.canvas.width / 3;
        this.createUserEvents();
    }
    detach() {
        this.canvas.removeEventListener("mouseup", this.pressEventHandler);
        delete this.canvas;
        delete this.context;
    }
    // @ts-ignore
    drawPlayedShape(shape, xPosition, yPosition) {
        console.log(`Plyaing ${shape == Shape.X ? `X` : `O`} on ${xPosition},${yPosition}`);
        let image = shape == Shape.X ? this.markX : this.markO;
        if (this.boardCellsStatus[yPosition - 1][xPosition - 1]) {
            return;
        }
        this.boardCellsStatus[yPosition - 1][xPosition - 1] = true;
        this.context.save();
        let y = this.rowHeight * (yPosition - 1)
            + Math.abs(this.rowHeight - image.height) / 2;
        let x = this.columnWidth * (xPosition - 1)
            + Math.abs(this.columnWidth - image.width) / 2;
        this.context.translate(x, y);
        this.context.drawImage(image, 0, 0, image.width, image.height);
        this.context.restore();
        // TODO: remove into separate file
        new Audio(this.audioSrcs[Math.floor(Math.random() * 100) % this.audioSrcs.length]).play();
    }
    createUserEvents() {
        let canvas = this.canvas;
        canvas.addEventListener("mouseup", this.pressEventHandler);
    }
    boardClicked(x, y) {
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
    }
    opponentPlacedShape(indexOfX, indexOfY) {
        let opponentShape = this.playerShape == Shape.O ? Shape.X : Shape.O;
        this.drawPlayedShape(opponentShape, indexOfX, indexOfY);
    }
}
//# sourceMappingURL=game_board.js.map