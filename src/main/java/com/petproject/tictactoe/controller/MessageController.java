package com.petproject.tictactoe.controller;

import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;

import javax.enterprise.context.ApplicationScoped;
import javax.json.Json;
import javax.json.JsonObject;

import com.petproject.tictactoe.model.Game;
import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;
import com.petproject.tictactoe.model.Game.State;
import com.petproject.tictactoe.model.Message.MessageAction;
import com.petproject.tictactoe.model.Message.MessageType;

import org.slf4j.Logger;

@ApplicationScoped
public class MessageController {

    Logger logger;

    public MessageController(Logger logger) {
        this.logger = logger;
    }

    public Message parseMessage(String rawMessageString) {
        Message message = new Message();
        JsonObject json = Json.createReader(new StringReader(rawMessageString)).readObject();
        message.setType(MessageType.valueOf(json.getString("type")));
        
        switch(message.getType()) {
            case CREATE: 
                message.setRoom(json.getInt("room"));
                message.setPlayerId(json.getString("playerId"));
                break;
            case CONNECT:
                message.setRoom(json.getInt("room"));
                message.setPlayerId(json.getString("playerId"));
                break;
            case TURN:
                message.setRoom(json.getInt("room"));
                message.setPlayerId(json.getString("playerId"));
                message.setCell(json.getInt("cell"));
                break;
            case CLOSE:
                message.setPlayerId(json.getString("playerId"));
                break;
        }
        return message;
    }

    public Map<Player, Message> onOpenResponse(Player player) {
        Message message = new Message();
        message.setPlayerId(player.getId());
        Map<Player, Message> map = new HashMap<>();
        map.put(player, message);
        return map;
    }

    public Map<Player, Message> onCreateResponse(Game game) {
        Message message = new Message();
        message.setMessage(MessageAction.WAIT.getMessageAction());
        Map<Player, Message> map = new HashMap<>();
        map.put(game.getPlayerX(), message);
        return map;
    }

    public Map<Player, Message> onConnectResponse(Game game) {
        Map<Player, Message> map = new HashMap<>();

        Message messageTurn = new Message();
        messageTurn.setMessage(MessageAction.TURN.getMessageAction());

        Message messageWait = new Message();
        messageWait.setMessage(MessageAction.WAIT.getMessageAction());
        
        map.put(game.getPlayerX(), messageTurn);
        map.put(game.getPlayerO(), messageWait);

        return map;
    }

    public Map<Player, Message> onTurnResponse(Game game) {
        Map<Player, Message> map = new HashMap<>();

        Message messageTurn = new Message();
        messageTurn.setMessage(MessageAction.TURN.getMessageAction());
        messageTurn.setField(game.getField());

        Message messageWait = new Message();
        messageWait.setMessage(MessageAction.WAIT.getMessageAction());
        messageWait.setField(game.getField());
        
        if (game.getState().equals(State.O_TURN)) {
            map.put(game.getPlayerO(), messageTurn);
            map.put(game.getPlayerX(), messageWait);
        } else {
            map.put(game.getPlayerO(), messageWait);
            map.put(game.getPlayerX(), messageTurn);
        }

        return map;
    }

}