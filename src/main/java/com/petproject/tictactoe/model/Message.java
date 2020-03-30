package com.petproject.tictactoe.model;

import javax.json.Json;
import javax.json.JsonObjectBuilder;

public class Message {

    private MessageType type;
    private String playerId;
    private Integer room;
    private Integer cell;
    private String message;
    private Field field;

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

    public void setRoom(int room) {
        this.room = room;
    }

    public int getRoom() {
        return room;
    }

    public void setCell(int cell) {
        this.cell = cell;
    }

    public int getCell() {
        return cell;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setField(Field field) {
        this.field = field;
    }

    public Field getField() {
        return field;
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

        if (room != null) {
            json.add("room", room);
        }

        if (message != null) {
            json.add("message", message);
        }

        if (cell != null) {
            json.add("cell", cell);
        }

        if (field != null) {
            json.add("field", field.toString());
        }

        return json.build().toString();
    }

    public enum MessageType {

        ON_OPEN("ON_OPEN"), CREATE("CREATE"), CONNECT("CONNECT"), TURN("TURN"), CLOSE("CLOSE");

        private String messageType;

        MessageType(String messageType) {
            this.messageType = messageType;
        }

        public String getMessageType() {
            return messageType;
        }

    }

    public enum MessageAction {

        WAIT("WAIT"), TURN("TURN");

        private String action;

        MessageAction(String action) {
            this.action = action;
        }

        public String getMessageAction() {
            return action;
        }

    }

}