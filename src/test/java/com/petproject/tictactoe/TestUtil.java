package com.petproject.tictactoe;

import static org.mockito.Mockito.mock;

import javax.websocket.Session;

import com.petproject.tictactoe.controller.EventController;
import com.petproject.tictactoe.model.Cell;
import com.petproject.tictactoe.model.Game;
import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;
import com.petproject.tictactoe.model.Message.MessageType;

public class TestUtil {

    private TestUtil() {
    }

    public static Player createPlayer(EventController eventController, String playerName) {
        Session session = mock(Session.class);
        return eventController.onOpen(session, playerName).keySet().stream().findFirst().get();
    }

    public static Game createGame(EventController eventController, Player playerX) {
        eventController.onMessage(roomCreateRequest(playerX, "Some room name").toString(), playerX.getSession());
        return eventController.getGameByPlayer(playerX);
    }

    public static Game createAndConnectTo(EventController eventController) {
        Session session = mock(Session.class);

        Player playerX = eventController.onOpen(session, "Player X").keySet().stream().findFirst().get();
        Player playerO = eventController.onOpen(session, "Player O").keySet().stream().findFirst().get();

        eventController.onMessage(roomCreateRequest(playerX, "").toString(), playerX.getSession());
        Game game = eventController.getGameByPlayer(playerX);
        eventController.onMessage(roomConnectRequest(
                game.getRoom().getId(), playerO).toString(), playerO.getSession());
        return game;
    }

    public static Message roomCreateRequest(Player player, String roomName) {
        Message message = new Message();
        message.setType(MessageType.ROOM_CREATE);
        message.setPlayerId(player.getId());
        message.setRoomName(roomName);
        return message;
    }

    public static Message roomCloseRequest(long roomId, Player player) {
        Message message = new Message();
        message.setType(MessageType.ROOM_CLOSE);
        message.setRoomId(roomId);
        message.setPlayerId(player.getId());
        return message;
    }

    public static Message roomConnectRequest(long roomId, Player player) {
        Message message = new Message();
        message.setType(MessageType.ROOM_CONNECT);
        message.setRoomId(roomId);
        message.setPlayerId(player.getId());
        return message;
    }

    public static Message turnRequest(long roomId, Player player, Cell cellOccupied) {
        Message message = new Message();
        message.setType(MessageType.TURN);
        message.setRoomId(roomId);
        message.setPlayerId(player.getId());
        message.setCellOccupied(cellOccupied);
        return message;
    }

    public static Message roomListRequest(Player player) {
        Message message = new Message();
        message.setType(MessageType.ROOM_LIST);
        message.setPlayerId(player.getId());
        return message;
    }

}
