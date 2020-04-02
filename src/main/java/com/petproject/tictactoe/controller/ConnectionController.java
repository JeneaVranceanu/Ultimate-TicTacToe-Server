package com.petproject.tictactoe.controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicLong;

import javax.enterprise.context.ApplicationScoped;
import javax.websocket.Session;

import org.slf4j.Logger;

import com.petproject.tictactoe.model.Game;
import com.petproject.tictactoe.model.Shape;
import com.petproject.tictactoe.model.Message;
import com.petproject.tictactoe.model.Player;
import com.petproject.tictactoe.service.BroadcastService;

@ApplicationScoped
public class ConnectionController {

    Logger logger;
    MessageController mController;
    BroadcastService bService;

    List<Player> players = Collections.synchronizedList(new ArrayList<Player>());
    List<Game> games = Collections.synchronizedList(new ArrayList<Game>());
    private AtomicLong roomId = new AtomicLong(0L);

    public ConnectionController(Logger logger, MessageController mController, BroadcastService bService) {
        this.logger = logger;
        this.mController = mController;
        this.bService = bService;
    }

    public void onOpen(Session session, String username) {
        Player player = new Player(username, Shape.EMPTY, session);
        players.add(player);
        bService.broadcast(mController.onOpenResponse(player));
    }

    public void onMessage(String rawMessage) {
        /** Get message type */
        Message message = mController.parseMessage(rawMessage);
        logger.info("{}", proccessMessage(message).info());

    }

    public void onClose(String session, String username) {
        /** Get message type */
        // Message message = mController.parseMessage(rawMessage);
        // proccessMessage(message);
    }

    public void onError(String session, String username, Throwable throwable) {
        /** Get message type */
        // Message message = mController.parseMessage(rawMessage);
        // proccessMessage(message);
    }

    private Game proccessMessage(Message message) throws NoSuchElementException {
        Game game = null;
        switch (message.getType()) {
            case ROOM_CREATE:
                game = new Game();
                Player playerX = getPlayerById(message.getPlayerId());
                if (!Objects.isNull(playerX)) {
                    game.createGame(playerX, getRoomId(), message.getRoomName());
                }
                games.add(game);
                bService.broadcast(mController.onCreateResponse(game));
                break;
            case ROOM_CONNECT:
                game = getGameByRoom(message.getRoomId());
                Player playerO = getPlayerById(message.getPlayerId());
                game.connectToGame(playerO);
                bService.broadcast(mController.onConnectResponse(game));
                break;
            case ROOM_CLOSE:
                game = getGameByRoom(message.getRoomId());
                Player closingPlayer = getPlayerById(message.getPlayerId());
                // connectedToGame.connectToGame(playerO);
                // this.closeGame(Game);
                // bService.broadcast(mController.onCloseResponse(closingGame));
                // logger.info("Game closed: {} Reason: ", connectedToGame.info());
                break;
            case TURN:
                game = getGameByRoom(message.getRoomId());
                Player player = getPlayerById(message.getPlayerId());
                game.updateFieldState(message.getCellOccupied());
                // game.checkWinCondition
                bService.broadcast(mController.onTurnResponse(game));
                break;
            default:
                // Room list
        }
        return game;
    }

    public void closeGame(Game game, boolean isEnded) {
        /** Send close message to Players that exist */

        /** Then remove game from list */
        logger.info("Close Game: {}, {}", game.getRoom(), game.info());
    }

    private Player getPlayerById(String playerId) {
        return players.stream().filter(p -> p.getId().equals(playerId)).findFirst().orElseThrow();
    }

    private Game getGameByRoom(long room) {
        return games.stream().filter(g -> g.getRoom().getRoomId() == room).findFirst().orElseThrow();
    }

    private Game getGameByPlayer(Player player) {
        return games.stream().filter(g -> g.playerExist(player)).findFirst().orElseThrow();
    }

    public void removeGame(Game game) {
        games.removeIf(g -> g.equals(game));
    }

    public void removePlayer(Player player) {
        players.removeIf(p -> p.equals(player));
        getGameByPlayer(player).removePlayer(player);
    }

    public void removeUnavailablePlayer(Player player) {
        Game game = getGameByPlayer(player);
        removePlayer(player);
        closeGame(game, false);
        logger.info("Remove unavailable Player: {} and close the Game room: {}", player.getName());
    }

    private long getRoomId() {
        while(games.stream().anyMatch(g -> g.getRoom().getRoomId() == roomId.get())) {
            roomId.incrementAndGet();
        }
        return roomId.get();
    }

}