package com.petproject.tictactoe;

import java.util.Map;
import java.util.Objects;

import javax.inject.Inject;
import javax.websocket.Session;

import com.petproject.tictactoe.controller.EventController;
import com.petproject.tictactoe.controller.MessageController;
import com.petproject.tictactoe.model.Game;
import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;
import com.petproject.tictactoe.model.Shape;
import com.petproject.tictactoe.model.Game.State;
import com.petproject.tictactoe.model.Message.MessageType;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
public class EventControllerTest {

    @Inject
    MessageController messageController;
    @Inject
    EventController eventController;

    @Test
    public void registeredFlow() {

        Session session = Mockito.mock(Session.class);

        Map<Player, Message> actual = eventController.onOpen(session, "Test user");
        Player player = actual.keySet().stream().findFirst().get();
        Message message = actual.values().stream().findFirst().get();
        Map<Player, Message> expected = messageController.onOpenResponse(player);

        Assertions.assertEquals(expected, actual);
        /** Assert that player.id is equals message.playerId */
        Assertions.assertEquals(player.getId(), message.getPlayerId());
        /** Assert that player exist in List<Players> */
        Assertions.assertEquals(eventController.getPlayerById(player.getId()), player);
    }

    @Test
    public void roomCreateWithExistentPlayer() {

        Session session = Mockito.mock(Session.class);

        Map<Player, Message> init = eventController.onOpen(session, "Test user");
        Player player = init.keySet().stream().findFirst().get();

        /** Assert that free Player has EMPTY shape */
        Assertions.assertEquals(player.getShape(), Shape.EMPTY);

        Message message = new Message();
        message.setType(MessageType.ROOM_CREATE);
        message.setPlayerId(player.getId());
        message.setRoomName("");

        long currentRoomId = eventController.getCurrentRoomIdCounter();

        Map<Player, Message> actual = eventController.onMessage(message.toString(), session);
        Player samePlayer = actual.keySet().stream().findFirst().get();
        Message m = actual.values().stream().findFirst().get();

        /** Assert that Player exist in List<Players> */
        Assertions.assertTrue(eventController.getPlayers().contains(player));
        /** Assert thath proccessMessage return right Player */
        Assertions.assertEquals(player, samePlayer);
        /** Assert that Player has X shape */
        Assertions.assertEquals(player.getShape(), Shape.X);

        Game game = eventController.getGameByRoomId(m.getRoomId());
        /** Assert that Game exist in List<Game> */
        Assertions.assertTrue(eventController.getGames().contains(game));
        /** Assert that getGameByRoom return the same as getGameByPLayer */
        Assertions.assertEquals(eventController.getGameByPlayer(player),
                eventController.getGameByRoomId(m.getRoomId()));
        /** Assert that Game has state CREATED */
        Assertions.assertEquals(game.getState(), State.CREATED);
        /** Assert that PlayerX equals Player */
        Assertions.assertEquals(game.getPlayerX(), player);
        /** Assert that PlayerO equals null */
        Assertions.assertTrue(Objects.isNull(game.getPlayerO()));

        /** Assert that message is ROOM_CREATE */
        Assertions.assertEquals(m.getType(), MessageType.ROOM_CREATE);
        /** Assert that right roomId returned */
        Assertions.assertEquals(m.getRoomId(), currentRoomId);
        /** Assert that roomName returned */
        Assertions.assertTrue(!m.getRoomName().isBlank());

        /** Assert that roomIdCounter will be incremented on next getFreeRoomId */
        Assertions.assertEquals(eventController.getFreeRoomId(), currentRoomId + 1);
        /**
         * Assert that roomIdCounter will not be incremented on second call
         * getFreeRoomId
         */
        Assertions.assertEquals(eventController.getFreeRoomId(), currentRoomId + 1);
    }

    @Test
    public void roomCreateWithNonexistentPlayer() {

        Session session = Mockito.mock(Session.class);

        Message message = new Message();
        message.setType(MessageType.ROOM_CREATE);
        message.setPlayerId("randomstring");
        message.setRoomName("Good room");


        // FIXIT
            /** Tests is asynchronous? freeIdCounter fails when connectToRoom Test run with that Test  */ 
        // long freeIdCounter = eventController.getCurrentRoomIdCounter();
        Map<Player, Message> actual = eventController.onMessage(message.toString(), session);
        Message m = actual.values().stream().findFirst().get();
        Player player = actual.keySet().stream().findFirst().get();

        Assertions.assertEquals(m, messageController.error());
        /** Assert that player doesnt exist in List */
        Assertions.assertTrue(eventController.getPlayers().stream().noneMatch(p -> p.equals(player)));
        /** Assert that Game with given roomName is not exist */
        Assertions.assertTrue(eventController.getGames().stream()
                .noneMatch(g -> g.getRoom().getRoomName().equals(message.getRoomName())));
        // /** Assert that free id counter is not changed */
        // Assertions.assertTrue(freeIdCounter == eventController.getFreeRoomId());
    }

    @Test
    public void roomCloseWithExistentPlayer() {

        /** Register Player */
        Session session = Mockito.mock(Session.class);

        Map<Player, Message> init = eventController.onOpen(session, "Test user");
        Player player = init.keySet().stream().findFirst().get();

        /** Assert that free Player has EMPTY shape */
        Assertions.assertEquals(player.getShape(), Shape.EMPTY);
        /** Assert that Player exist */
        Assertions.assertEquals(eventController.getPlayerById(player.getId()), player);

        /** Create room with given player */
        Message createMessage = new Message();
        createMessage.setType(MessageType.ROOM_CREATE);
        createMessage.setPlayerId(player.getId());
        createMessage.setRoomName("");
        eventController.onMessage(createMessage.toString(), session);

        Game createdGame = eventController.getGameByPlayer(player);
        /** Close room Message */
        Message closeMessage = new Message();
        closeMessage.setType(MessageType.ROOM_CLOSE);
        closeMessage.setPlayerId(player.getId());
        closeMessage.setRoomId(createdGame.getRoom().getId());

        Map<Player, Message> closeResponse = eventController.onMessage(closeMessage.toString(), session);
        Player returnedPlayer = closeResponse.keySet().stream().findFirst().get();
        Message returnedMessage = closeResponse.values().stream().findFirst().get();

        /** Assert that Room not exist */
        Assertions.assertTrue(eventController.getGames().stream()
                .noneMatch(g -> g.getRoom().getId() == createdGame.getRoom().getId()));
        /** Assert that closer is Player X */
        Assertions.assertTrue(returnedPlayer.getShape().equals(Shape.X));
        /** Assert that Game is in CREATED State */
        Assertions.assertTrue(createdGame.getState().equals(State.CREATED));
        /** Assert that Player O is null */
        Assertions.assertTrue(Objects.isNull(createdGame.getPlayerO()));
        /** Assert that Game doesnt exist in List after close */
        Assertions.assertTrue(eventController.getGames().stream().noneMatch(g -> g.equals(createdGame)));

        /** Assert that returned Message equals close Message */
        Assertions.assertEquals(returnedMessage, messageController.roomClose());
    }

    @Test
    public void roomCloseWithNonexistentPlayer() {

        Session session = Mockito.mock(Session.class);

        /** Create Message with a nonexistent PlayerId and roomId */
        Message wrongCloseMessage = new Message();
        wrongCloseMessage.setType(MessageType.ROOM_CLOSE);
        wrongCloseMessage.setPlayerId("randomstring");
        wrongCloseMessage.setRoomId(-941);
        Map<Player, Message> errorResponse = eventController.onMessage(wrongCloseMessage.toString(), session);
        Message returnedMessage = errorResponse.values().stream().findFirst().get();

        /** Assert that returned Message equals error Message */
        Assertions.assertEquals(returnedMessage, messageController.error());

    }

    @Test
    public void roomConnectToExistentGame() {

        /** Register Player */
        Session session = Mockito.mock(Session.class);

        Map<Player, Message> registerCreator = eventController.onOpen(session, "Player X");
        Player creator = registerCreator.keySet().stream().findFirst().get();
        Map<Player, Message> registerConnected = eventController.onOpen(session, "Player O");
        Player connected = registerConnected.keySet().stream().findFirst().get();

        /** Assert that free Player has EMPTY shape */
        Assertions.assertEquals(creator.getShape(), Shape.EMPTY);
        /** Assert that Player exist */
        Assertions.assertEquals(eventController.getPlayerById(creator.getId()), creator);
        /** Assert that free Player has EMPTY shape */
        Assertions.assertEquals(connected.getShape(), Shape.EMPTY);
        /** Assert that Player exist */
        Assertions.assertEquals(eventController.getPlayerById(connected.getId()), connected);

        /** Create room with given player */
        Message createMessage = new Message();
        createMessage.setType(MessageType.ROOM_CREATE);
        createMessage.setPlayerId(creator.getId());
        createMessage.setRoomName("");
        eventController.onMessage(createMessage.toString(), creator.getSession());

        Game createdGame = eventController.getGameByPlayer(creator);

        Message connectMessage = new Message();
        connectMessage.setType(MessageType.ROOM_CONNECT);
        connectMessage.setPlayerId(connected.getId());
        connectMessage.setRoomId(createdGame.getRoom().getId());
        Map<Player, Message> connectResponse = eventController.onMessage(connectMessage.toString(),
                connected.getSession());
        Message returnedMessageX = connectResponse.values().stream()
                .filter(m -> m.getFirstPlayerId().equals(creator.getId())).findFirst().get();
        Message returnedMessageO = connectResponse.values().stream()
                .filter(m -> m.getSecondPlayerId().equals(connected.getId())).findFirst().get();
        Game connectedGame = eventController.getGameByPlayer(connected);

        /** Assert that returned Messages are equals */
        Assertions.assertEquals(returnedMessageX, returnedMessageO);

        /** Assert that createdGame and connectedGame is the same */
        Assertions.assertEquals(createdGame, connectedGame);
        /** Assert that PlayerX and PlayerO is Creator and Connected players */
        Assertions.assertEquals(creator, connectedGame.getPlayerX());
        Assertions.assertEquals(connected, connectedGame.getPlayerO());
        /** Assert that Game State is X_TURN */
        Assertions.assertEquals(connectedGame.getState(), State.X_TURN);

        Message gameStartMessage = messageController.gameStart(connectedGame.getPlayerX().getId(),
                connectedGame.getPlayerO().getId());

        /** Assert that returnedMessage equals GAME_START message */
        Assertions.assertEquals(returnedMessageX, gameStartMessage);

    }

}