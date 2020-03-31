enum Shape {
  X = 1,
  O
}

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
  public updateBoardState(boardState: boolean[][]) {
    // Coordinates of changed cell
    let x = 0,
      y = 0;
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
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private rowHeight: number;
  private columnWidth: number;

  // false - cell is empty
  // true - cell is occupied
  // if (boardCellsStatus[1][1]) { cell is occupied. must not allow drawing here. }
  private boardCellsStatus = [
    [false, false, false],
    [false, false, false],
    [false, false, false]
  ];

  private playerClickedSounds = [
    new Audio("../assets/audio/balloon_snap.mp3"),
    new Audio("../assets/audio/player_move.mp3")
  ];
  private opponentClickedSounds = [
    new Audio("../assets/audio/opponent_move_2.mp3"),
    new Audio("../assets/audio/opponent_move.mp3")
  ];

  private markO = new Image();
  private markX = new Image();
  private playerShape: Shape;
  private cellClickListener: (index: number) => any = null;

  constructor(playerShape: Shape) {
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

    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d");
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.rowHeight = this.canvas.height / 3;
    this.columnWidth = this.canvas.width / 3;
  }

  public detach() {
    this.setUserEventsEnabled(false);
    this.cellClickListener = null;
    delete this.cellClickListener;
    delete this.canvas;
    delete this.context;
    delete this.markO;
    delete this.markX;
  }

  // @ts-ignore
  private drawPlayedShape(shape: Shape, xPosition: number, yPosition: number) {
    let image = shape == Shape.X ? this.markX : this.markO;

    if (this.isCellOccupied(xPosition, yPosition)) {
      return;
    }
    console.log("drawPlayedShape " + shape);
    this.setCellOccupied(xPosition, yPosition);

    this.context.save();
    let y =
      this.rowHeight * yPosition + Math.abs(this.rowHeight - image.height) / 2;

    let x =
      this.columnWidth * xPosition +
      Math.abs(this.columnWidth - image.width) / 2;

    this.draw(image, x, y);
  }

  private draw(image: HTMLImageElement, x: number, y: number) {
    image.onload = null;
    if (!image.complete || image.naturalHeight == 0) {
      image.onload = () => this.draw(image, x, y);
    } else {
      this.context.translate(x, y);
      this.context.fillStyle = (Math.random() * 100) % 2 == 0 ? "#FF0000" : "#00FF00";
      this.context.fillRect(0,0, this.columnWidth, this.columnWidth);
      this.context.drawImage(image, 0, 0, image.width, image.height);
      this.context.restore();
    }
  }

  private setCellOccupied(xPosition: number, yPosition: number) {
    this.boardCellsStatus[yPosition][xPosition] = true;
  }
  /**
   *
   * @param xPosition horizontal position of a cell [0,2]
   * @param yPosition vertical postition of a cell [0,2]
   */
  private isCellOccupied(xPosition: number, yPosition: number): boolean {
    return this.boardCellsStatus[yPosition][xPosition];
  }

  public enableGameBoard(enable: boolean) {
    this.setUserEventsEnabled(enable);
    // This is a place to make board visually disable
    // to let the user know about the board state
  }

  public setCellClickListener(listner: (index: number) => any) {
    this.cellClickListener = listner;
  }

  private setUserEventsEnabled(enable: boolean) {
    if (enable) {
      this.canvas.addEventListener("mouseup", this.pressEventHandler);
    } else {
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
  private boardClicked(x: number, y: number) {
    var cellXIndex = 0;
    var cellYIndex = 0;

    if (x > this.columnWidth && x <= this.columnWidth * 2) {
      cellXIndex = 1;
    } else if (x > this.columnWidth * 2) {
      cellXIndex = 2;
    }

    if (y > this.rowHeight && y <= this.rowHeight * 2) {
      cellYIndex = 1;
    } else if (y > this.rowHeight * 2) {
      cellYIndex = 2;
    }

    let cellNumber = this.twoDimensionalIndicesToOneDimenstion(
      cellXIndex,
      cellYIndex
    );
    if (
      this.cellClickListener != null &&
      !this.isCellOccupied(cellXIndex, cellYIndex)
    ) {
      this.cellClickListener(cellNumber);
    }

    this.makeASound(this.playerClickedSounds);

    this.drawPlayedShape(this.playerShape, cellXIndex, cellYIndex);
  }

  private twoDimensionalIndicesToOneDimenstion(x: number, y: number): number {
    return 3 * y + x;
  }

  /**
   * Picks random assets from a list and plays it
   * @param sounds a list of sound assets
   */
  private makeASound(sounds: HTMLAudioElement[]) {
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
  public opponentPlacedShapeInCell(cellNumber: number) {
    if (cellNumber > 8 || cellNumber < 0) {
      console.log(
        `Cell number is invalid: opponentPlacedShapeInCell(cellNumber: ${cellNumber})`
      );
      return;
    }

    let x = Math.max(0, cellNumber);
    let y = 0;

    if (cellNumber > 2 || cellNumber <= 5) {
      x = cellNumber - 3;
      y = 1;
    } else if (cellNumber > 5) {
      x = cellNumber - 6;
      y = 2;
    }

    if (this.isCellOccupied(x, y)) {
      return;
    }

    this.makeASound(this.opponentClickedSounds);
    this.drawPlayedShape(this.getOpponentsShape(), x, y);
  }

  public opponentPlacedShape(x: number, y: number) {
    console.log("x > 2 || x < 0 || y < 0 || y > 2");
    if (x > 2 || x < 0 || y < 0 || y > 2) {
      console.log(
        `Cell number is invalid: opponentPlacedShapeInCell(x: ${x}, y: ${y})`
      );
      return;
    }

    console.log("this.isCellOccupied(x, y)");
    if (this.isCellOccupied(x, y)) {
      return;
    }

    console.log("this.makeASound(this.opponentClickedSounds);");
    try {
      this.makeASound(this.opponentClickedSounds);
    } catch {
      // No sound :O
    }
    this.drawPlayedShape(this.getOpponentsShape(), x, y);
  }
  private getOpponentsShape(): Shape {
    return this.playerShape == Shape.O ? Shape.X : Shape.O;
  }

  private pressEventHandler = (e: MouseEvent | TouchEvent) => {
    let mouseX = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageX
      : (e as MouseEvent).pageX;
    let mouseY = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageY
      : (e as MouseEvent).pageY;
    mouseX -= this.canvas.offsetLeft;
    mouseY -= this.canvas.offsetTop;

    this.boardClicked(mouseX, mouseY);
  };
}
