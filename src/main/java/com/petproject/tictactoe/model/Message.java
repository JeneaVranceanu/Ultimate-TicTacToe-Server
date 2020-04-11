package com.petproject.tictactoe.model;

import java.util.List;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;

public class Message {

    private MessageType type;
    private String playerId;
    private String firstPlayerId;
    private String secondPlayerId;
    private String winnerPlayerId;
    private Long roomId;
    private String roomName;
    private Field boardState;
    private Cell cellOccupied;
    private List<Room> rooms;

    public void setType(MessageType type) {
        this.type = type;
    }

    public MessageType getType() {
        return type;
    }

    public void setPlayerId(String playerId) {
        this.playerId = playerId;
    }

    public String getPlayerId() {
        return playerId;
    }

    public void setFirstPlayerId(String firstPlayerId) {
        this.firstPlayerId = firstPlayerId;
    }

    public String getFirstPlayerId() {
        return firstPlayerId;
    }

    public void setSecondPlayerId(String secondPlayerId) {
        this.secondPlayerId = secondPlayerId;
    }

    public String getSecondPlayerId() {
        return secondPlayerId;
    }

    public void setWinnerPlayerId(String winnerPlayerId) {
        this.winnerPlayerId = winnerPlayerId;
    }

    public String getWinnerPlayerId() {
        return winnerPlayerId;
    }

    public void setRoomId(long roomId) {
        this.roomId = roomId;
    }

    public long getRoomId() {
        return roomId;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setBoardState(Field boardState) {
        this.boardState = boardState;
    }

    public Field getBoardState() {
        return boardState;
    }

    public void setCellOccupied(Cell cellOccupied) {
        this.cellOccupied = cellOccupied;
    }

    public Cell getCellOccupied() {
        return cellOccupied;
    }

    public List<Room> getRooms() {
        return rooms;
    }

    public void setRooms(List<Room> rooms) {
        this.rooms = rooms;
    }

    public JsonArray getRoomArray() {
        JsonArrayBuilder json = Json.createArrayBuilder();
        rooms.forEach(r -> json.add(r.toJson()));
        return json.build();
    }

    public void setRoomArray(List<Room> rooms) {
        this.rooms = rooms;
    }

    @Override
    public String toString() {
        JsonObjectBuilder json = Json.createObjectBuilder();

        if (type != null) {
            json.add("type", type.getMessageType());
        }

        if (playerId != null) {
            json.add("playerId", playerId);
        }
        
        if (firstPlayerId != null) {
            json.add("firstPlayerId", firstPlayerId);
        }

        if (secondPlayerId != null) {
            json.add("secondPlayerId", secondPlayerId);
        }

        if (roomId != null) {
            json.add("roomId", roomId);
        }

        if (roomName != null) {
            json.add("roomName", roomName);
        }

        if (boardState != null) {
            json.add("boardState", boardState.toJson());
        }

        if (cellOccupied != null) {
            json.add("cellOccupied", cellOccupied.toJson());
        }

        if (rooms != null) {
            json.add("rooms", getRoomArray());
        }

        return json.build().toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Message m = (Message) o;

        return this.toString().equals(m.toString());
    }

    public enum MessageType {

        REGISTERED("REGISTERED"), ROOM_CREATE("ROOM_CREATE"), 
        ROOM_CLOSE("ROOM_CLOSE"), ROOM_CONNECT("ROOM_CONNECT"),
        GAME_START("GAME_START"), GAME_END("GAME_END"),
        TURN("TURN"), ROOM_LIST("ROOM_LIST"), ERROR("ERROR");

        private String messageType;

        MessageType(String messageType) {
            this.messageType = messageType;
        }

        public String getMessageType() {
            return messageType;
        }

    }

}