import { Turn } from './socket_messages'

export enum Shape {
  X = 'X',
  O = 'O'
}

/**
 * <p>GameBoardController class is responsible for drawing a game board,
 * drawing shapes on the game board, receiving and processing user events like
 * 'mousedown'. <br/>
 * <p>It holds the state of each game board cell and does not allow
 * to place a shape on the occupied cell. Board is disabled and does not receive any
 * user events while waiting for opponent's turn to be made.
 *
 * GAME BOARD CONTROLLER IS DISABLED BY DEFAULT TO PREVENT ACCIDENTAL USER ACTIONS!
 * CONTROLLER IS WAITING TO BE ACTIVATED WHEN THE GAME STARTS.
 */
export default class GameBoardController {

  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D

  private rowHeight: number
  private columnWidth: number

  // null - cell is empty
  // Shape.X || Shape.O - cell is occupied
  // if (boardCellsStatus[1][1] != null) { cell is occupied. must not allow drawing here. }
  private boardCellsStatus: Array<Array<Shape | null>> = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ]

  public static playerClickedSounds = [
    new Audio('../assets/audio/balloon_snap.mp3'),
    new Audio('../assets/audio/player_move.mp3')
  ]
  public static opponentClickedSounds = [
    new Audio('../assets/audio/opponent_move_2.mp3'),
    new Audio('../assets/audio/opponent_move.mp3')
  ]

  private markO = new Image()
  private markX = new Image()
  private playerShape: Shape
  private cellClickListener: ((cellOccupied: Turn) => any) | null = null

  constructor(playerShape: Shape) {
    this.playerShape = playerShape
    this.markO.src = '../assets/o_mark_95.png'
    this.markX.src = '../assets/x_mark_95.png'

    this.canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.context = this.canvas.getContext('2d')!
    this.context!.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.rowHeight = this.canvas.height / 3
    this.columnWidth = this.canvas.width / 3
  }
  
  public endGame(didPlayerWin: boolean, gameStory: Turn[]) {
    const interestedShape = didPlayerWin ? this.playerShape : (this.playerShape == Shape.X ? Shape.O : Shape.X)
    const interestedShapeString = interestedShape == Shape.O ? 'O' : 'X'
    let filteredStory = gameStory.filter((value: Turn) => {
       return value.shape.toUpperCase() == interestedShapeString
    })

    const winnerPath = new Array<Turn>()
    // The last element of filtered game story
    // is automatically part of the winner path
    const lastTurn = filteredStory.pop()
    if (lastTurn instanceof Turn) {
        winnerPath[0] = lastTurn
    }
    
    filteredStory = filteredStory.sort((a: Turn, b: Turn) => {
      if (a.y == b.y) {
        return a.x - b.x
      }
      return a.y > b.y ? 1 : -1
    })

    let currentTurn = winnerPath[0]
    //Not the most efficient way to find a path
    for (let i = 0; i < filteredStory.length && winnerPath.length < 3; i++) {
      const nextTurn = filteredStory[i]
			const isOnTheSameLine = [nextTurn.x - 1, nextTurn.x + 1].includes(currentTurn.x)
			const isOnTheSameColumn = [nextTurn.y - 1, nextTurn.y + 1].includes(currentTurn.y)
      if (isOnTheSameLine || isOnTheSameColumn || this.areTurnsOnTheSameDiagonal(nextTurn, currentTurn)) {
        winnerPath.push(nextTurn)
        currentTurn = nextTurn
      }
    }

    const image = new Image()
    image.src = didPlayerWin ? '../assets/gold_crown.png' : '../assets/crossed_swords.png'
    if (this.isImageLoaded(image)) {
      winnerPath.forEach((value) => this.drawImage(image, value.x, value.y))
    } else {
      this.triggerLoadingOfImageIfNotLoaded(image)
      image.onload = () => winnerPath.forEach((value) => this.drawImage(image, value.x, value.y))
    }
  }

  private isImageLoaded(image: HTMLImageElement): boolean {
    return image.complete && image.naturalHeight != 0
  }

  private triggerLoadingOfImageIfNotLoaded(image: HTMLImageElement) {
    this.context.save()
    this.context.drawImage(image, 0, 0, image.width, image.height)
    this.context.restore()
  }

  private areTurnsOnTheSameDiagonal(pivot: Turn, nextPoint: Turn): boolean {
    const nonDiagonalPoints = [0,2]
  
    const isNextPointOnDiagonal = !(nextPoint.x == 1 && nonDiagonalPoints.includes(nextPoint.y) 
    || nonDiagonalPoints.includes(nextPoint.x) && nextPoint.y == 1)
  
    if (!isNextPointOnDiagonal) {
      return false
    }
  
    if (pivot.x == 1 && pivot.y == 1) {
      // Pivot is in the middle. And nextPoint is also in the middle.
      return true
    } else if (pivot.x == 1 && nonDiagonalPoints.includes(pivot.y) 
    || nonDiagonalPoints.includes(pivot.x) && pivot.y == 1) {
      // Pivot is not on the diagonal
      return false
    } else {
      //Pivot is somewhere in the corner.
      return nextPoint.x != pivot.x || nextPoint.y != pivot.y
    }
  }

  public detach() {
    this.setUserEventsEnabled(false)
    this.cellClickListener = null
    delete this.cellClickListener
    delete this.canvas
    delete this.context
    delete this.markO
    delete this.markX
  }

  private drawPlayedShape(shape: Shape, xPosition: number, yPosition: number) {
    const image = shape == Shape.X ? this.markX : this.markO
  
    if (this.isCellOccupied(xPosition, yPosition)) {
      return
    }

    this.setCellOccupied(xPosition, yPosition, shape)

    this.drawImage(image, xPosition, yPosition)
  }
  
  private drawImage(image: HTMLImageElement, xPosition: number, yPosition: number) {
    image.onload = null
    if (!this.isImageLoaded(image)) {
      image.onload = () => this.drawImage(image, xPosition, yPosition)
      return
    }

    this.context.save()
    const y =
      this.rowHeight * yPosition + Math.abs(this.rowHeight - image.height) / 2

    const x =
      this.columnWidth * xPosition +
      Math.abs(this.columnWidth - image.width) / 2

    this.context.translate(x, y)
    this.context.drawImage(image, 0, 0, image.width, image.height)
    this.context.restore()
  }

  private setCellOccupied(xPosition: number, yPosition: number, shape: Shape) {
    this.boardCellsStatus[yPosition][xPosition] = shape
  }
  /**
   *
   * @param xPosition horizontal position of a cell [0,2]
   * @param yPosition vertical postition of a cell [0,2]
   */
  private isCellOccupied(xPosition: number, yPosition: number): boolean {
    return this.boardCellsStatus[yPosition][xPosition] != null
  }

  public enableGameBoard(enable: boolean) {
    this.setUserEventsEnabled(enable)
    // This is a place to make board visually disable
    // to let the user know about the board state
  }

  public setCellClickListener(listner: (cellOccupied: Turn) => any) {
    this.cellClickListener = listner
  }

  private setUserEventsEnabled(enable: boolean) {
    if (enable) {
      this.canvas.addEventListener('mouseup', this.pressEventHandler)
    } else {
      this.canvas.removeEventListener('mouseup', this.pressEventHandler)
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
    let cellXIndex = 0
    let cellYIndex = 0

    if (x > this.columnWidth && x <= this.columnWidth * 2) {
      cellXIndex = 1
    } else if (x > this.columnWidth * 2) {
      cellXIndex = 2
    }

    if (y > this.rowHeight && y <= this.rowHeight * 2) {
      cellYIndex = 1
    } else if (y > this.rowHeight * 2) {
      cellYIndex = 2
    }

    if (
      this.cellClickListener != null &&
      !this.isCellOccupied(cellXIndex, cellYIndex)
    ) {
      this.cellClickListener(new Turn(cellXIndex, cellYIndex, this.playerShape))
    }

    this.makeASound(GameBoardController.playerClickedSounds)

    this.drawPlayedShape(this.playerShape, cellXIndex, cellYIndex)
  }

  /**
   * Picks random assets from a list and plays it
   * @param sounds a list of sound assets
   */
  private makeASound(sounds: HTMLAudioElement[]) {
    if (sounds.length == 0) {
      return
    }
    const audio = sounds[Math.floor(Math.random() * 100) % sounds.length]
    audio.volume = 1.0
    audio.play()
    //new Audio(sounds[Math.floor(Math.random() * 100) % sounds.length]).play()
  }

  public opponentPlacedShape(x: number, y: number) {
    if (x > 2 || x < 0 || y < 0 || y > 2) {
      console.log(
        `Cell number is invalid: opponentPlacedShape(x: ${x}, y: ${y})`
      )
      return
    }

    if (this.isCellOccupied(x, y)) {
      return
    }

    try {
      this.makeASound(GameBoardController.opponentClickedSounds)
    } catch {
      // No sound :O     sad :(
    }
    this.drawPlayedShape(this.getOpponentsShape(), x, y)
  }
  private getOpponentsShape(): Shape {
    return this.playerShape == Shape.O ? Shape.X : Shape.O
  }

  private pressEventHandler = (e: MouseEvent | TouchEvent) => {
    let mouseX = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageX
      : (e as MouseEvent).pageX
    let mouseY = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageY
      : (e as MouseEvent).pageY
    mouseX -= this.canvas.offsetLeft
    mouseY -= this.canvas.offsetTop

    this.boardClicked(mouseX, mouseY)
  }
}