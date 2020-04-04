package com.petproject.tictactoe.controller;

import java.io.StringReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.enterprise.context.ApplicationScoped;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.websocket.Session;

import com.petproject.tictactoe.model.Cell;
import com.petproject.tictactoe.model.Field;
import com.petproject.tictactoe.model.Game;
import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;
import com.petproject.tictactoe.model.Room;
import com.petproject.tictactoe.model.Shape;
import com.petproject.tictactoe.model.Message.MessageType;

import org.slf4j.Logger;

@ApplicationScoped
public class MessageController {

    @Inject
    Logger logger;

    public Map<Player, Message> onOpenResponse(Player player) {
        Message message = registered(player.getId());
        Map<Player, Message> map = new HashMap<>();
        map.put(player, message);
        return map;
    }

    public Map<Player, Message> onCreateResponse(Game game) {
        Map<Player, Message> map = new HashMap<>();
        map.put(game.getPlayerX(), roomCreate(game.getRoom().getId(), game.getRoom().getRoomName()));
        return map;
    }

    public Map<Player, Message> onConnectResponse(Game game) {
        Map<Player, Message> map = new HashMap<>();
        Message message = gameStart(game.getPlayerX().getId(), game.getPlayerO().getId());
        map.put(game.getPlayerX(), message);
        map.put(game.getPlayerO(), message);
        return map;
    }

    public Map<Player, Message> onTurnResponse(Game game) {
        Map<Player, Message> map = new HashMap<>();
        Message message = turn(game.getField(), game.getField().lastModifiedCell());
        map.put(game.getNextTurnPlayer(), message);
        return map;
    }

    public Map<Player, Message> onCloseResponse(Game game) {
        Map<Player, Message> map = new HashMap<>();
        Message message = roomClose();
        map.put(game.getPlayerX(), message);
        return map;
    }

    // TODO
    public Map<Player, Message> roomList(Game game) {
        return new HashMap<>();
    }

    // TODO
    public Map<Player, Message> onErrorResponse(Session session) {
        Player player = new Player("", Shape.EMPTY, session);
        Message message = error();
        Map<Player, Message> map = new HashMap<>();
        map.put(player, message);
        return map;
    }

    public Message registered(String playerId) {
        Message m = new Message();
        m.setType(MessageType.REGISTERED);
        m.setPlayerId(playerId);
        return m;
    }

    public Message roomCreate(long roomId, String roomName) {
        Message m = new Message();
        m.setType(MessageType.ROOM_CREATE);
        m.setRoomId(roomId);
        m.setRoomName(roomName);
        return m;
    }

    public Message roomClose() {
        Message m = new Message();
        m.setType(MessageType.ROOM_CLOSE);
        return m;
    }

    public Message gameStart(String firstPlayerId, String secondPlayerId) {
        Message m = new Message();
        m.setType(MessageType.GAME_START);
        m.setFirstPlayerId(firstPlayerId);
        m.setSecondPlayerId(secondPlayerId);
        return m;
    }

    public Message gameEnd(String winnerPlayerId) {
        Message m = new Message();
        m.setType(MessageType.GAME_END);
        m.setWinnerPlayerId(winnerPlayerId);
        return m;
    }

    public Message turn(Field boardState, Cell cellOccupied) {
        Message m = new Message();
        m.setType(MessageType.TURN);
        m.setBoardState(boardState);
        m.setCellOccupied(cellOccupied);
        return m;
    }

    public Message roomList(List<Room> rooms) {
        Message m = new Message();
        m.setType(MessageType.ROOM_LIST);
        m.setRooms(rooms);
        return m;
    }

    public Message error() {
        Message m = new Message();
        m.setType(MessageType.ERROR);
        return m;
    }

    public Message parseMessage(String rawMessage) {
        Message message = new Message();
        JsonObject json = Json.createReader(new StringReader(rawMessage)).readObject();
        message.setType(MessageType.valueOf(json.getString("type")));

        switch (message.getType()) {
            case ROOM_CREATE:
                message.setPlayerId(json.getString("playerId"));
                message.setRoomName(json.getString("roomName"));
                break;
            case ROOM_CLOSE:
                message.setPlayerId(json.getString("playerId"));
                message.setRoomId(json.getInt("roomId"));
                break;
            case ROOM_CONNECT:
                message.setPlayerId(json.getString("playerId"));
                message.setRoomId(json.getInt("roomId"));
                break;
            case TURN:
                message.setRoomId(json.getInt("roomId"));
                message.setPlayerId(json.getString("playerId"));
                JsonObject jsonCell = json.getJsonObject("cellOccupied");
                message.setCellOccupied(new Cell(jsonCell.getInt("x"), jsonCell.getInt("y"),
                        Shape.valueOf(jsonCell.getString("shape"))));
            default:
                /** Default as ROOM_LIST */
                break;
        }
        return message;
    }

}