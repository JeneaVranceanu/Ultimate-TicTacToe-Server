package com.petproject.tictactoe;

import java.util.Map;

import javax.inject.Inject;

import com.petproject.tictactoe.controller.EventController;
import com.petproject.tictactoe.controller.MessageController;
import com.petproject.tictactoe.model.Cell;
import com.petproject.tictactoe.model.Game;
import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;
import com.petproject.tictactoe.model.Shape;
import com.petproject.tictactoe.model.Message.MessageType;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
public class MessageControllerTest {

    @Inject
    MessageController messageController;
    @Inject
    EventController eventController;

    @Test
    public void registeredResponseTest() {
        Player player = TestUtil.createPlayer(eventController, "test");
        Message responseMessage = messageController.onOpenResponse(player).values().stream().findFirst().get();
        Message expected = messageController.registered(player.getId());

        /** responseMessage equals registeredMessage */
        Assertions.assertEquals(expected, responseMessage);
        /** responseMessage type is MessageType.REGISTERED */
        Assertions.assertEquals(MessageType.REGISTERED, responseMessage.getType());
        /** responseMessage contain right playerId */
        Assertions.assertEquals(player.getId(), responseMessage.getPlayerId());
    }

    @ParameterizedTest
    @ValueSource(strings = { "Some room name", "", "  ", "          " })
    public void roomCreateResponseTest(String roomName) {
        Player playerX = TestUtil.createPlayer(eventController, "Player X");

        Message response = eventController
                .onMessage(TestUtil.roomCreateRequest(playerX, roomName).toString(), playerX.getSession()).values()
                .stream().findFirst().get();
        Game game = eventController.getGameByPlayer(playerX);

        Message expected = messageController.roomCreate(game.getRoom().getId(), game.getRoom().getRoomName());

        Assertions.assertEquals(expected, response);
        Assertions.assertEquals(MessageType.ROOM_CREATE, response.getType());
        Assertions.assertEquals(game.getRoom().getId(), response.getRoomId());
        Assertions.assertEquals(game.getRoom().getRoomName(), response.getRoomName());
        Assertions.assertTrue(response.getRoomName().equals("Some room name") || !response.getRoomName().isBlank());
    }

    @Test
    public void roomCloseResponseTest() {
        Player playerX = TestUtil.createPlayer(eventController, "Player X");
        Game game = TestUtil.createGame(eventController, playerX);

        eventController.onMessage(TestUtil.roomCreateRequest(playerX, "Test").toString(), playerX.getSession()).values()
                .stream().findFirst().get();
        Player nonexistentPlayer = new Player("asd", null);

        Message responseError = eventController
                .onMessage(TestUtil.roomCloseRequest(-5L, nonexistentPlayer).toString(), nonexistentPlayer.getSession())
                .values().stream().findFirst().get();

        Assertions.assertEquals(responseError, messageController.error());

        Message response = eventController
                .onMessage(TestUtil.roomCloseRequest(game.getRoom().getId(), playerX).toString(), playerX.getSession())
                .values().stream().findFirst().get();

        Assertions.assertEquals(messageController.roomClose(), response);
    }

    @Test
    public void gameStartResponseTest() {
        Player playerX = TestUtil.createPlayer(eventController, "Player X");
        Player playerO = TestUtil.createPlayer(eventController, "Player O");
        Game game = TestUtil.createGame(eventController, playerX);

        Message response = eventController
                .onMessage(TestUtil.roomConnectRequest(game.getRoom().getId(), playerO).toString(),
                        playerO.getSession())
                .values().stream().findFirst().get();
        Message expected = messageController.gameStart(playerX.getId(), playerO.getId());

        Assertions.assertEquals(expected, response);
        Assertions.assertEquals(MessageType.GAME_START, response.getType());
        Assertions.assertEquals(playerX.getId(), response.getFirstPlayerId());
        Assertions.assertEquals(playerO.getId(), response.getSecondPlayerId());
    }

    // TODO implement after win/lose logic
    @Test
    public void gameEndResponseTest() {

    }

    @Test
    public void turnResponseTest() {
        Game game = TestUtil.createAndConnectTo(eventController);
        Player playerX = game.getPlayerX();
        Player playerO = game.getPlayerO();
        Cell cell = new Cell(0, 0, Shape.X);
        /** Try to make turn with Player O should return null */
        Assertions.assertNull(makeTurn(game, playerO, cell));

        /** Make turn with Player X */
        Map<Player, Message> responseMap = makeTurn(game, playerX, cell);
        /** Response should returned only for Player O */
        Message responseO = responseMap.get(playerO);

        Assertions.assertNull(responseMap.get(playerX));
        Assertions.assertEquals(MessageType.TURN, responseO.getType());
        Assertions.assertEquals(responseO.getBoardState().toString(), game.getField().toString());
        Assertions.assertEquals(responseO.getCellOccupied(), cell);
        /** Try to make turn with Player O should return null */
        Assertions.assertNull(makeTurn(game, playerX, cell));

        /** Make turn with Player O with the same cell*/
        Map<Player, Message> sameCellResponse = makeTurn(game, playerO, cell);
        Message responseX = sameCellResponse.get(playerX);

        /** This cell is already been occupied */
        /** So response returned again for Player O */
        Assertions.assertNull(responseMap.get(playerX));
        Assertions.assertEquals(MessageType.TURN, responseO.getType());
        Assertions.assertEquals(responseO.getBoardState().toString(), game.getField().toString());
        Assertions.assertEquals(responseO.getCellOccupied(), cell);

        System.out.println(makeTurn(game, playerO, new Cell(0, 1, Shape.O)));
        System.out.println(makeTurn(game, playerX, new Cell(0, 2, Shape.X)));
        System.out.println(makeTurn(game, playerO, new Cell(1, 0, Shape.O)));
        System.out.println(makeTurn(game, playerX, new Cell(1, 1, Shape.X)));
        System.out.println(makeTurn(game, playerO, new Cell(1, 2, Shape.O)));
        System.out.println(makeTurn(game, playerX, new Cell(2, 0, Shape.X)));
        System.out.println(makeTurn(game, playerO, new Cell(2, 1, Shape.O)));
        System.out.println(makeTurn(game, playerX, new Cell(2, 2, Shape.X)));
        System.out.println("-------------------------------");
        System.out.println(makeTurn(game, playerO, new Cell(2, 2, Shape.O)));
        System.out.println(makeTurn(game, playerX, new Cell(2, 2, Shape.X)));
    }

    public Map<Player, Message> makeTurn(Game game, Player player, Cell cell) {
        return eventController.onMessage(
                TestUtil.turnRequest(game.getRoom().getId(), player, cell).toString(), player.getSession());
    }

    @Test
    public void roomListResponseTest() {

    }

}
