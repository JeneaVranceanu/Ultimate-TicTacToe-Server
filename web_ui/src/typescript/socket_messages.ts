export class Turn {
    public x: number
    public y: number 
    public shape: string

    constructor(x: number, y: number, shape: string) {
        this.x = x
        this.y = y
        this.shape = shape
    }
}

/**
 * Received on successful socket connection
 */
export class RegisteredReceivedMessage {
    public static getType() { return 'REGISTERED' }
    public playerId!: string
}

/**
 * Emits a request to open a room with given name.
 */
export class RoomCreateEmitMessage {
    private type = 'ROOM_CREATE'
    public playerId: string
    public roomName: string

    constructor(playerId: string, roomName: string) {
        this.playerId = playerId
        this.roomName = roomName
    }
    
}

/**
 * Room successfully created. Player waits for GAME_START.
 */
export class RoomCreateReceiveMessage {
    public static getType() { return 'ROOM_CREATE' }
    public roomId!: number
    
}

/**
 * Emits a request to close a room. 
 * PlayerId must match with the owner ID of the room. 
 * Impossible if the game started - interpreted as leaving/losing.
 */
export class RoomCloseEmitMessage {
    private type = 'ROOM_CLOSE'
    public playerId: string
    public roomId: number

    constructor(playerId: string, roomId: number) {
        this.playerId = playerId
        this.roomId = roomId
    }
}

/**
 * Emits a request to connect to open room.
 * Now waiting for GAME_START.
 */
export class RoomConnectEmitMessage {
    private type = 'ROOM_CONNECT'
    public playerId: string
    public roomId: number

    constructor(playerId: string, roomId: number) {
        this.playerId = playerId
        this.roomId = roomId
    }
}

/**
 * 'Received when game starts. 
 * Player ID with ''firstPlayerId'' makes the first move.'
 */
export class GameStartedReceiveMessage {
    public static getType() { return 'GAME_START' }
    public firstPlayerId!: string
    public secondPlayerId!: string
}

/**
 * Received when game ends.
 */
export class GameEndedReceiveMessage {
    public static getType() { return 'GAME_END' }
    public winnerPlayerId!: string | null
    public boardState!: Turn[] | null
}

/**
 * Received when an opponent has completed its turn.
 */
export class TurnReceiveMessage {
    public static getType() { return 'TURN' }
    public boardState!: Turn[]
    public cellOccupied!: Turn    
}

/**
 * Emits a message after making a turn. 
 * Identifies occupied cell and by whom it was occupied.
 */
export class TurnEmitMessage {
    private type = 'TURN'
    public roomId: number
    public playerId: string
    public cellOccupied: Turn   
    
    constructor(playerId: string, roomId: number, cellOccupied: Turn) {
        this.playerId = playerId
        this.roomId = roomId
        this.cellOccupied = cellOccupied
    }
}
    
/**
 * Emits a message requesting list of all rooms
 */
export class RoomListEmitMessage {
    private type = 'ROOM_LIST'
}

export class Room {
    public roomId!: number
    public roomName!: string 
    public playersCount!: number
    //(milliseconds)
    public createdAt!: number 
}
    
/**
 * Received as a response for {@link RoomListEmitMessage} emit message. 
 * Contains a list of all rooms available. 
 * 
 * Also is returned when new room is created or closed
 */
export class RoomListReceiveMessage {
    public static getType() { return 'ROOM_LIST' }

    public rooms!: Room[]
}