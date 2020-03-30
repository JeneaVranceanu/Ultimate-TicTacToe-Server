enum Shape {
    X = 1,
    O,
}

/**
 * <p>GameBoardController class is responsible for drawing a game board,
 * drawing shapes on the game board, receiving and processing user events like
 * "mousedown". <br/>
 * <p>It holds the state of each game board cell and does not allow
 * to place a shape on the occupied cell. Board is disabled and does not receive any
 * user events while waiting for opponent's turn to be made.
 */
class GameBoardController {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    private rowHeight: number;
    private columnWidth: number;

    // false - cell is empty
    // true - cell is occupied
    // if (boardCellsStatus[1][1]) { cell is occupied. must not allow drawing here. } 
    private boardCellsStatus = [[false, false, false], 
                                [false, false, false], 
                                [false, false, false]];

    private audioSrcs = [
        // "../assets/audio/balloon_snap.mp3",
        // "../assets/audio/opponent_move_2.mp3",
        // "../assets/audio/opponent_move.mp3",
        "../assets/audio/player_move.mp3"
    ];

    private markO = new Image();
    private markX = new Image();
    private playerShape: Shape;
    
    constructor(playerShape: Shape) {
        this.playerShape = playerShape;
        this.markO.src = '../assets/o_mark_95.png';
        this.markX.src = '../assets/x_mark_95.png';

        this.canvas = document.getElementById('canvas') as
                     HTMLCanvasElement;
        this.context = this.canvas.getContext("2d");
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.rowHeight = this.canvas.height / 3;
        this.columnWidth = this.canvas.width / 3;
    }

    public detach() {
        this.setUserEventsEnabled(false);
        delete this.canvas;
        delete this.context;
        delete this.markO;
        delete this.markX;
    }

    // @ts-ignore
    private drawPlayedShape(shape: Shape, xPosition: number, yPosition: number) {
        
        console.log(`Plyaing ${shape == Shape.X ? `X` : `O`} on ${xPosition},${yPosition}`);

        let image = shape == Shape.X ? this.markX : this.markO;

        if (this.boardCellsStatus[yPosition - 1][xPosition - 1]) {
            return;
        }
        this.boardCellsStatus[yPosition - 1][xPosition - 1] = true;

        this.context.save();
        let y = this.rowHeight * (yPosition - 1)
                            + Math.abs(this.rowHeight - image.height) / 2 

        let x = this.columnWidth * (xPosition - 1)
                            + Math.abs(this.columnWidth - image.width) / 2 

        this.context.translate(x,y);
        this.context.drawImage(image, 0, 0, image.width, image.height);
        this.context.restore();

        // TODO: remove into separate file
        // new Audio(this.audioSrcs[Math.floor(Math.random() * 100) % this.audioSrcs.length]).play();
        new Audio(this.audioSrcs[0]).play();
    }

    private setUserEventsEnabled(enable: boolean) {
        if (enable) {
            this.canvas.addEventListener("mouseup", this.pressEventHandler);
        } else {
            this.canvas.removeEventListener("mouseup", this.pressEventHandler);
        }
    }

    private boardClicked(x: number, y: number) {
        var indexOfX = 1;
        var indexOfY = 1;

        if (x > this.columnWidth && x <= this.columnWidth * 2) {
            indexOfX = 2;
        } else if (x > this.columnWidth * 2) {
            indexOfX = 3;
        }

        if (y > this.rowHeight && y <= this.rowHeight * 2) {
            indexOfY = 2;
        } else if (y > this.rowHeight * 2) {
            indexOfY = 3;
        }

        this.drawPlayedShape(this.playerShape, indexOfX, indexOfY);
    }

    public opponentPlacedShape(indexOfX: number, indexOfY: number) {
        let opponentShape = this.playerShape == Shape.O ? Shape.X : Shape.O;
        this.drawPlayedShape(opponentShape, indexOfX, indexOfY);
    }
    
    private pressEventHandler = (e: MouseEvent | TouchEvent) => {
        let mouseX = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageX :
                     (e as MouseEvent).pageX;
        let mouseY = (e as TouchEvent).changedTouches ?
                     (e as TouchEvent).changedTouches[0].pageY :
                     (e as MouseEvent).pageY;
        mouseX -= this.canvas.offsetLeft;
        mouseY -= this.canvas.offsetTop;
    
        this.boardClicked(mouseX, mouseY);
    }
}